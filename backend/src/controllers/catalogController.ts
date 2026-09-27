import { Request, Response } from 'express';
import { supabase } from '../services/supabase';

// =========== SUCURSALES ===========
export const listSucursales = async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from('sucursales').select('*').eq('activo', true).order('nombre');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const createSucursal = async (req: Request, res: Response) => {
  const { nombre, tipo } = req.body;
  if (!nombre || !tipo) return res.status(400).json({ error: 'nombre y tipo requeridos' });
  const { data, error } = await supabase.from('sucursales').insert({ nombre, tipo }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const updateSucursal = async (req: Request, res: Response) => {
  const { nombre, tipo } = req.body;
  const { data, error } = await supabase.from('sucursales').update({ nombre, tipo }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const deleteSucursal = async (req: Request, res: Response) => {
  const { error } = await supabase.from('sucursales').update({ activo: false }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
};

// =========== MÉDICOS ===========
export const listMedicos = async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from('medicos_referentes').select('*').eq('activo', true).order('nombre_completo');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const createMedico = async (req: Request, res: Response) => {
  const { nombre_completo, telefono, especialidad, cedula_profesional, email } = req.body;
  if (!nombre_completo) return res.status(400).json({ error: 'nombre_completo requerido' });
  const { data, error } = await supabase.from('medicos_referentes').insert({ nombre_completo, telefono, especialidad, cedula_profesional, email }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const updateMedico = async (req: Request, res: Response) => {
  const { nombre_completo, telefono, especialidad, cedula_profesional, email } = req.body;
  const { data, error } = await supabase.from('medicos_referentes').update({ nombre_completo, telefono, especialidad, cedula_profesional, email }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const deleteMedico = async (req: Request, res: Response) => {
  const { error } = await supabase.from('medicos_referentes').update({ activo: false }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
};

// =========== ESTUDIOS ===========
export const listEstudios = async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from('estudios_catalogo').select('*').eq('activo', true).order('nombre');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const createEstudio = async (req: Request, res: Response) => {
  const { nombre, precio, meses_recordatorio, codigo_interno, tipo_muestra, tubo_requerido, requiere_ayuno, horas_ayuno, tiempo_entrega_hrs, area, instrucciones_paciente } = req.body;
  if (!nombre || precio == null) return res.status(400).json({ error: 'nombre y precio requeridos' });
  
  const payload = { nombre, precio, meses_recordatorio: meses_recordatorio ?? 12, codigo_interno, tipo_muestra, tubo_requerido, requiere_ayuno: !!requiere_ayuno, horas_ayuno, tiempo_entrega_hrs, area, instrucciones_paciente };
  
  const { data, error } = await supabase.from('estudios_catalogo').insert(payload).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const updateEstudio = async (req: Request, res: Response) => {
  const { nombre, precio, meses_recordatorio, codigo_interno, tipo_muestra, tubo_requerido, requiere_ayuno, horas_ayuno, tiempo_entrega_hrs, area, instrucciones_paciente } = req.body;
  
  const payload = { nombre, precio, meses_recordatorio, codigo_interno, tipo_muestra, tubo_requerido, requiere_ayuno: !!requiere_ayuno, horas_ayuno, tiempo_entrega_hrs, area, instrucciones_paciente };
  
  const { data, error } = await supabase.from('estudios_catalogo').update(payload).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const deleteEstudio = async (req: Request, res: Response) => {
  const { error } = await supabase.from('estudios_catalogo').update({ activo: false }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
};

// =========== PACIENTES ===========
export const listPacientes = async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from('pacientes').select('*').eq('activo', true).order('nombre_completo');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getPaciente = async (req: Request, res: Response) => {
  const { data: paciente, error } = await supabase.from('pacientes').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Paciente no encontrado' });

  const { data: ordenes } = await supabase
    .from('ordenes')
    .select('*, ordenes_estudios(*, estudios_catalogo(nombre)), sucursales(nombre), medicos_referentes(nombre_completo)')
    .eq('paciente_id', req.params.id)
    .order('fecha_creacion', { ascending: false });

  res.json({ ...paciente, historial: ordenes ?? [] });
};

export const createPaciente = async (req: Request, res: Response) => {
  const { nombre_completo, fecha_nacimiento, sexo, curp, numero_expediente, aseguradora, no_poliza, email, whatsapp } = req.body;
  if (!nombre_completo) return res.status(400).json({ error: 'nombre_completo requerido' });
  const payload = { nombre_completo, fecha_nacimiento, sexo, curp, numero_expediente, aseguradora, no_poliza, email, whatsapp };
  const { data, error } = await supabase.from('pacientes').insert(payload).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const updatePaciente = async (req: Request, res: Response) => {
  const { nombre_completo, fecha_nacimiento, sexo, curp, numero_expediente, aseguradora, no_poliza, email, whatsapp } = req.body;
  const payload = { nombre_completo, fecha_nacimiento, sexo, curp, numero_expediente, aseguradora, no_poliza, email, whatsapp };
  const { data, error } = await supabase.from('pacientes').update(payload).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const deletePaciente = async (req: Request, res: Response) => {
  const { error } = await supabase.from('pacientes').update({ activo: false }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
};
