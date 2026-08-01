import { supabase } from './supabase';
import { sendRecordatorio } from './emailService';

/**
 * Motor de recordatorios (Principio VI):
 * - Detecta pacientes cuyo último estudio superó meses_recordatorio
 * - Nunca genera duplicado si hay uno pendiente en ventana de 30 días
 */
export async function runRecordatorioMotor(): Promise<{ enviados: number; errores: number }> {
  // Obtener todos los estudios activos con meses_recordatorio
  const { data: estudios } = await supabase
    .from('estudios_catalogo')
    .select('id, nombre, meses_recordatorio')
    .eq('activo', true);

  if (!estudios?.length) return { enviados: 0, errores: 0 };

  let enviados = 0;
  let errores  = 0;

  for (const estudio of estudios) {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - estudio.meses_recordatorio);

    // Pacientes que tuvieron este estudio antes del cutoff
    const { data: ordenesVencidas } = await supabase
      .from('ordenes_estudios')
      .select('orden_id, ordenes!inner(paciente_id, fecha_creacion, pacientes(nombre_completo, email))')
      .eq('estudio_id', estudio.id)
      .lte('ordenes.fecha_creacion', cutoff.toISOString());

    if (!ordenesVencidas?.length) continue;

    for (const item of ordenesVencidas) {
      const orden = (item as any).ordenes;
      const pacienteId = orden?.paciente_id;
      const email      = orden?.pacientes?.email;
      const nombre     = orden?.pacientes?.nombre_completo;

      if (!pacienteId || !email) continue;

      // Ventana de 30 días — Principio VI: sin duplicados
      const hace30 = new Date();
      hace30.setDate(hace30.getDate() - 30);

      const { data: existente } = await supabase
        .from('recordatorios')
        .select('id')
        .eq('paciente_id', pacienteId)
        .eq('estudio_id', estudio.id)
        .in('estado', ['pendiente', 'enviado'])
        .gte('fecha_generacion', hace30.toISOString())
        .maybeSingle();

      if (existente) continue; // ya tiene recordatorio reciente

      // Crear registro pendiente
      const { data: rec, error: recErr } = await supabase
        .from('recordatorios')
        .insert({ paciente_id: pacienteId, estudio_id: estudio.id, estado: 'pendiente' })
        .select()
        .single();

      if (recErr) { errores++; continue; }

      try {
        await sendRecordatorio(email, nombre, [estudio.nombre]);
        await supabase.from('recordatorios').update({ estado: 'enviado' }).eq('id', rec.id);
        enviados++;
      } catch (e) {
        await supabase.from('recordatorios').update({ estado: 'fallido' }).eq('id', rec.id);
        errores++;
      }
    }
  }

  return { enviados, errores };
}
