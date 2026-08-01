import { Response } from 'express';
import { supabase } from '../services/supabase';
import { AuthRequest } from '../middleware/authMiddleware';

export const getReporteIngresos = async (req: AuthRequest, res: Response) => {
  const { fechaInicio, fechaFin, sucursal_id } = req.query as Record<string, string>;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ error: 'fechaInicio y fechaFin requeridos' });
  }

  // Ingresos (órdenes)
  let ingresosQuery = supabase
    .from('ordenes')
    .select('id, costo_total, fecha_creacion, sucursal_id, sucursales(nombre)')
    .gte('fecha_creacion', fechaInicio)
    .lte('fecha_creacion', fechaFin + 'T23:59:59');

  // Egresos
  let egresosQuery = supabase
    .from('egresos')
    .select('id, monto, fecha, sucursal_id, categoria, folio_factura, sucursales(nombre)')
    .eq('activo', true)
    .gte('fecha', fechaInicio)
    .lte('fecha', fechaFin + 'T23:59:59');

  // Filtro por sucursal — si no es admin, forzar su propia sucursal
  const filtroSucursal = req.user?.rol !== 'admin'
    ? req.user?.sucursal_id
    : sucursal_id || null;

  if (filtroSucursal) {
    ingresosQuery = ingresosQuery.eq('sucursal_id', filtroSucursal);
    egresosQuery = egresosQuery.eq('sucursal_id', filtroSucursal);
  }

  const [{ data: ordenes, error: e1 }, { data: egresos, error: e2 }] = await Promise.all([
    ingresosQuery,
    egresosQuery,
  ]);

  if (e1 || e2) return res.status(500).json({ error: e1?.message || e2?.message });

  const totalIngresos = (ordenes ?? []).reduce((s, o) => s + Number(o.costo_total), 0);
  const totalEgresos  = (egresos  ?? []).reduce((s, e) => s + Number(e.monto), 0);

  res.json({
    periodo: { fechaInicio, fechaFin },
    totalIngresos,
    totalEgresos,
    utilidad: totalIngresos - totalEgresos,
    ordenes: ordenes ?? [],
    egresos: egresos ?? [],
  });
};
