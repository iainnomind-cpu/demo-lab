import { Request, Response } from 'express';
import { supabase } from '../services/supabase';
import { AuthRequest } from '../middleware/authMiddleware';

export const listEgresos = async (req: AuthRequest, res: Response) => {
  let query = supabase.from('egresos').select('*, sucursales(nombre)').eq('activo', true).order('fecha', { ascending: false });
  if (req.user?.rol !== 'admin' && req.user?.sucursal_id) {
    query = query.eq('sucursal_id', req.user.sucursal_id);
  }
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const createEgreso = async (req: AuthRequest, res: Response) => {
  const { sucursal_id, monto, categoria, folio_factura, fecha } = req.body;
  if (!sucursal_id || !monto) return res.status(400).json({ error: 'sucursal_id y monto requeridos' });
  const { data, error } = await supabase
    .from('egresos')
    .insert({ sucursal_id, monto, categoria: categoria || 'insumos', folio_factura, fecha: fecha || new Date().toISOString() })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const deleteEgreso = async (req: Request, res: Response) => {
  const { error } = await supabase.from('egresos').update({ activo: false }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
};
