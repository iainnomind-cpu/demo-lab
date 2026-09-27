import { Request, Response } from 'express';
import { supabase } from '../services/supabase';

export const listUsuarios = async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*, sucursales(nombre)')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const updateUsuario = async (req: Request, res: Response) => {
  const { rol, sucursal_id } = req.body;
  const { data, error } = await supabase
    .from('usuarios')
    .update({ rol, sucursal_id: sucursal_id || null })
    .eq('id', req.params.id)
    .select('*, sucursales(nombre)')
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const deleteUsuario = async (req: Request, res: Response) => {
  // Solo borramos de public.usuarios para quitarle el acceso al sistema
  // No borramos de auth.users directamente por seguridad
  const { error } = await supabase.from('usuarios').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
};
