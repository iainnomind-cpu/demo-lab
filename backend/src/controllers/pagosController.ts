import { Request, Response } from 'express';
import { supabase } from '../services/supabase';
import { AuthRequest } from '../middleware/authMiddleware';

export const registrarPago = async (req: AuthRequest, res: Response) => {
  const { orden_id, monto, metodo, referencia } = req.body;
  if (!orden_id || !monto || !metodo) {
    return res.status(400).json({ error: 'orden_id, monto y metodo son requeridos' });
  }

  // 1. Obtener la orden y los pagos actuales para saber si se pagó completa
  const { data: orden, error: errOrden } = await supabase.from('ordenes').select('costo_total').eq('id', orden_id).single();
  if (errOrden || !orden) return res.status(404).json({ error: 'Orden no encontrada' });

  const { data: pagosExistentes } = await supabase.from('pagos').select('monto').eq('orden_id', orden_id);
  const totalPagado = (pagosExistentes || []).reduce((sum, p) => sum + Number(p.monto), 0);
  
  const nuevoTotal = totalPagado + Number(monto);
  const costoTotal = Number(orden.costo_total);

  if (nuevoTotal > costoTotal + 0.01) { // margen de error por decimales
    return res.status(400).json({ error: 'El monto excede el costo total de la orden' });
  }

  // 2. Insertar el pago
  const { data: pago, error: errPago } = await supabase.from('pagos').insert({
    orden_id,
    monto,
    metodo,
    referencia,
    registrado_por: req.user?.id
  }).select().single();

  if (errPago) return res.status(500).json({ error: errPago.message });

  // 3. Actualizar estado_pago de la orden
  let estado_pago = 'pendiente';
  if (nuevoTotal >= costoTotal) estado_pago = 'pagado';
  else if (nuevoTotal > 0) estado_pago = 'parcial';

  await supabase.from('ordenes').update({ estado_pago }).eq('id', orden_id);

  res.status(201).json(pago);
};

export const getPagosOrden = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('pagos').select('*, usuarios(nombre)').eq('orden_id', req.params.orden_id).order('fecha', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
