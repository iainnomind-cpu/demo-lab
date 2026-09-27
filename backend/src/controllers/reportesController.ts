import { Response, Request } from 'express';
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

export const getEstudiosTop = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('ordenes_estudios').select('estudio_id, estudios_catalogo(nombre)');
  if (error) return res.status(500).json({ error: error.message });
  
  const counts: Record<string, { nombre: string, count: number }> = {};
  data.forEach((row: any) => {
    const name = row.estudios_catalogo?.nombre || 'Desconocido';
    if (!counts[row.estudio_id]) counts[row.estudio_id] = { nombre: name, count: 0 };
    counts[row.estudio_id].count++;
  });
  
  const top = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 10);
  res.json(top);
};

export const getMedicosProductividad = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('ordenes').select('medico_id, costo_total, medicos_referentes(nombre_completo)').not('medico_id', 'is', null);
  if (error) return res.status(500).json({ error: error.message });

  const stats: Record<string, { nombre: string, ordenes: number, total_ingresos: number }> = {};
  data.forEach((row: any) => {
    const name = row.medicos_referentes?.nombre_completo || 'Desconocido';
    if (!stats[row.medico_id]) stats[row.medico_id] = { nombre: name, ordenes: 0, total_ingresos: 0 };
    stats[row.medico_id].ordenes++;
    stats[row.medico_id].total_ingresos += Number(row.costo_total);
  });
  
  res.json(Object.values(stats).sort((a, b) => b.ordenes - a.ordenes));
};

export const getCuentasCobrar = async (req: AuthRequest, res: Response) => {
  let query = supabase.from('ordenes')
    .select('id, folio, costo_total, estado_pago, fecha_creacion, pacientes(nombre_completo)')
    .in('estado_pago', ['pendiente', 'parcial', 'credito'])
    .order('fecha_creacion', { ascending: false });
    
  if (req.user?.rol !== 'admin' && req.user?.sucursal_id) {
    query = query.eq('sucursal_id', req.user.sucursal_id);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  
  res.json(data);
};
