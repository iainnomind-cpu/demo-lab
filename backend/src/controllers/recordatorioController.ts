import { Request, Response } from 'express';
import { supabase } from '../services/supabase';
import { runRecordatorioMotor } from '../services/recordatorioMotor';

export const runMotor = async (_req: Request, res: Response) => {
  try {
    const result = await runRecordatorioMotor();
    res.json({ ok: true, ...result });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const listRecordatorios = async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('recordatorios')
    .select('*, pacientes(nombre_completo, email), estudios_catalogo(nombre)')
    .order('fecha_generacion', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
