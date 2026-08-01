import { Request, Response } from 'express';
import { supabase } from '../services/supabase';
import { AuthRequest } from '../middleware/authMiddleware';

// Principio II: transición de estado restringida a sede matriz
const ESTADO_VALIDO = ['muestra_tomada', 'procesada', 'entregada'];

export const listOrdenes = async (req: AuthRequest, res: Response) => {
  let query = supabase
    .from('ordenes')
    .select('*, pacientes(nombre_completo), sucursales(nombre, tipo), medicos_referentes(nombre_completo), ordenes_estudios(precio_al_momento, estudios_catalogo(nombre))')
    .order('fecha_creacion', { ascending: false });

  if (req.user?.rol !== 'admin' && req.user?.sucursal_id) {
    query = query.eq('sucursal_id', req.user.sucursal_id);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const createOrden = async (req: AuthRequest, res: Response) => {
  const { paciente_id, sucursal_id, medico_id, estudios } = req.body as {
    paciente_id: string;
    sucursal_id: string;
    medico_id?: string;
    estudios: string[]; // array de estudio_id
  };

  if (!paciente_id || !sucursal_id || !estudios?.length) {
    return res.status(400).json({ error: 'paciente_id, sucursal_id y estudios son requeridos' });
  }

  // Obtener precios actuales del catálogo (se congelan — Principio I)
  const { data: catalogItems, error: catalogError } = await supabase
    .from('estudios_catalogo')
    .select('id, precio')
    .in('id', estudios)
    .eq('activo', true);

  if (catalogError || !catalogItems?.length) {
    return res.status(400).json({ error: 'Estudios no encontrados o inactivos' });
  }

  // Calcular costo_total en backend (Principio IV) — el frontend nunca lo envía
  const costo_total = catalogItems.reduce((sum, e) => sum + Number(e.precio), 0);

  const { data: orden, error: ordenError } = await supabase
    .from('ordenes')
    .insert({ paciente_id, sucursal_id, medico_id: medico_id || null, costo_total })
    .select()
    .single();

  if (ordenError) return res.status(500).json({ error: ordenError.message });

  const detalles = catalogItems.map(e => ({
    orden_id: orden.id,
    estudio_id: e.id,
    precio_al_momento: e.precio,
  }));

  const { error: detalleError } = await supabase.from('ordenes_estudios').insert(detalles);
  if (detalleError) return res.status(500).json({ error: detalleError.message });

  res.status(201).json({ ...orden, ordenes_estudios: detalles });
};

export const updateEstadoOrden = async (req: Request, res: Response) => {
  const { estado } = req.body;
  if (!ESTADO_VALIDO.includes(estado)) {
    return res.status(400).json({ error: `estado inválido. Válidos: ${ESTADO_VALIDO.join(', ')}` });
  }

  const { data, error } = await supabase
    .from('ordenes')
    .update({ estado })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
