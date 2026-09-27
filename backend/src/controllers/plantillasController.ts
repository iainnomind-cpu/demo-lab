import { Request, Response } from 'express';
import { supabase } from '../services/supabase';

// =========== PLANTILLAS ===========
export const listPlantillas = async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from('plantillas_mensajes').select('*').eq('activo', true).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const createPlantilla = async (req: Request, res: Response) => {
  const { nombre, canal, tipo_notificacion, contenido } = req.body;
  if (!nombre || !contenido) return res.status(400).json({ error: 'nombre y contenido requeridos' });
  
  const { data, error } = await supabase.from('plantillas_mensajes').insert({ 
    nombre, 
    canal: canal || 'whatsapp', 
    tipo_notificacion: tipo_notificacion || 'marketing', 
    contenido,
    estado_meta: 'borrador'
  }).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const updatePlantilla = async (req: Request, res: Response) => {
  const { nombre, canal, tipo_notificacion, contenido, estado_meta } = req.body;
  
  const { data, error } = await supabase.from('plantillas_mensajes').update({ 
    nombre, canal, tipo_notificacion, contenido, estado_meta 
  }).eq('id', req.params.id).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const sendToReview = async (req: Request, res: Response) => {
  // Simula el envío a la API de Meta y cambia el estado
  const { data, error } = await supabase.from('plantillas_mensajes').update({ 
    estado_meta: 'en_revision' 
  }).eq('id', req.params.id).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const approveTemplate = async (req: Request, res: Response) => {
  // Simula la aprobación desde la API de Meta (Webhooks)
  const { data, error } = await supabase.from('plantillas_mensajes').update({ 
    estado_meta: 'aprobada' 
  }).eq('id', req.params.id).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const deletePlantilla = async (req: Request, res: Response) => {
  const { error } = await supabase.from('plantillas_mensajes').update({ activo: false }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
};
