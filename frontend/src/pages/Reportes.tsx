import { useState } from 'react';
import { api } from '../../services/api';
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function Reportes() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin]       = useState('');
  const [reporte, setReporte]         = useState<any>(null);
  const [loading, setLoading]         = useState(false);

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.get<any>(`/api/reportes/ingresos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
      setReporte(data);
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="page-title">Reportes de Ingresos</h1><p className="page-sub">Filtra por período y sucursal</p></div>

      <form onSubmit={buscar} className="glass p-5">
        <div className="flex gap-4 items-end">
          <div>
            <label className="label">Desde</label>
            <input type="date" className="input w-44" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required />
          </div>
          <div>
            <label className="label">Hasta</label>
            <input type="date" className="input w-44" value={fechaFin} onChange={e => setFechaFin(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            <BarChart3 className="w-4 h-4" />{loading ? 'Generando…' : 'Generar'}
          </button>
        </div>
      </form>

      {reporte && (
        <div className="space-y-6 animate-slide-up">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="stat-value text-emerald-300">${Number(reporte.totalIngresos).toFixed(2)}</span>
              <span className="stat-label">Total Ingresos</span>
            </div>
            <div className="stat-card">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center mb-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <span className="stat-value text-red-300">${Number(reporte.totalEgresos).toFixed(2)}</span>
              <span className="stat-label">Total Egresos</span>
            </div>
            <div className="stat-card">
              <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center mb-2">
                <DollarSign className="w-5 h-5 text-brand-400" />
              </div>
              <span className={`stat-value ${reporte.utilidad >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>${Number(reporte.utilidad).toFixed(2)}</span>
              <span className="stat-label">Utilidad</span>
            </div>
          </div>

          {/* Órdenes en período */}
          <div>
            <h2 className="text-base font-semibold text-white mb-3">Órdenes en el período ({reporte.ordenes.length})</h2>
            <div className="table-wrapper">
              <table className="w-full">
                <thead className="table-head"><tr><th className="table-cell">Fecha</th><th className="table-cell">Sucursal</th><th className="table-cell">Total</th></tr></thead>
                <tbody>
                  {reporte.ordenes.map((o: any) => (
                    <tr key={o.id} className="table-row">
                      <td className="table-cell">{new Date(o.fecha_creacion).toLocaleDateString('es-MX')}</td>
                      <td className="table-cell">{o.sucursales?.nombre}</td>
                      <td className="table-cell font-semibold text-emerald-300">${Number(o.costo_total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
