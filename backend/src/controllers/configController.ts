import { Request, Response } from 'express';
import { supabase } from '../services/supabase';

export const getConfig = async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from('config_laboratorio').select('*');
  if (error) return res.status(500).json({ error: error.message });
  
  // Convertir array [{clave: 'x', valor: 'y'}] a objeto { x: 'y' }
  const config = data.reduce((acc, curr) => {
    acc[curr.clave] = curr.valor;
    return acc;
  }, {} as Record<string, string>);
  
  res.json(config);
};

export const updateConfig = async (req: Request, res: Response) => {
  const payload = req.body; // objeto { clave: valor, clave2: valor2 }
  const keys = Object.keys(payload);
  
  if (keys.length === 0) return res.status(400).json({ error: 'Payload vacío' });

  // Supabase no soporta upsert masivo fácilmente con objetos dinámicos si las claves no coinciden,
  // lo hacemos clave por clave. Como son pocas, está bien.
  for (const clave of keys) {
    await supabase.from('config_laboratorio').upsert({ clave, valor: String(payload[clave]) });
  }

  res.json({ ok: true });
};
