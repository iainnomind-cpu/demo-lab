import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Activity, Users, AlertCircle } from 'lucide-react';

export default function Reportes() {
  const [activeTab, setActiveTab] = useState<'financiero' | 'estudios' | 'medicos' | 'cuentas'>('financiero');
  
  // Financiero
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin]       = useState('');
  const [reporte, setReporte]         = useState<any>(null);
  const [loading, setLoading]         = useState(false);

  // Otros reportes
  const [estudiosTop, setEstudiosTop] = useState<any[]>([]);
  const [medicosStats, setMedicosStats] = useState<any[]>([]);
  const [cuentas, setCuentas] = useState<any[]>([]);

  const buscarFinanciero = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.get<any>(`/api/reportes/ingresos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
      setReporte(data);
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  const loadOtrosReportes = async () => {
    try {
      if (activeTab === 'estudios' && estudiosTop.length === 0) {
        setEstudiosTop(await api.get<any[]>('/api/reportes/estudios-top'));
      } else if (activeTab === 'medicos' && medicosStats.length === 0) {
        setMedicosStats(await api.get<any[]>('/api/reportes/medicos-productividad'));
      } else if (activeTab === 'cuentas') {
        setCuentas(await api.get<any[]>('/api/reportes/cuentas-cobrar'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOtrosReportes();
  }, [activeTab]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Reportes y Estadísticas</h1>
        <p className="page-sub">Indicadores clave de rendimiento y finanzas</p>
      </div>

      <div className="flex gap-4 border-b border-subtle pb-4">
        <button className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'financiero' ? 'bg-lab-600 text-white shadow-teal-sm' : 'text-ink-secondary hover:bg-surface-hover'}`} onClick={() => setActiveTab('financiero')}>
          <DollarSign className="w-4 h-4" /> Financiero
        </button>
        <button className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'estudios' ? 'bg-lab-600 text-white shadow-teal-sm' : 'text-ink-secondary hover:bg-surface-hover'}`} onClick={() => setActiveTab('estudios')}>
          <Activity className="w-4 h-4" /> Top Estudios
        </button>
        <button className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'medicos' ? 'bg-lab-600 text-white shadow-teal-sm' : 'text-ink-secondary hover:bg-surface-hover'}`} onClick={() => setActiveTab('medicos')}>
          <Users className="w-4 h-4" /> Prod. Médicos
        </button>
        <button className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'cuentas' ? 'bg-lab-600 text-white shadow-teal-sm' : 'text-ink-secondary hover:bg-surface-hover'}`} onClick={() => setActiveTab('cuentas')}>
          <AlertCircle className="w-4 h-4" /> Cuentas por Cobrar
        </button>
      </div>

      {activeTab === 'financiero' && (
        <div className="space-y-6 animate-slide-up">
          <form onSubmit={buscarFinanciero} className="glass p-5">
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
                <BarChart3 className="w-4 h-4" />{loading ? 'Generando…' : 'Generar Reporte'}
              </button>
            </div>
          </form>

          {reporte && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="stat-card">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-2 border border-emerald-100">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="stat-value text-emerald-600">${Number(reporte.totalIngresos).toFixed(2)}</span>
                  <span className="stat-label">Total Ingresos</span>
                </div>
                <div className="stat-card">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-2 border border-red-100">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="stat-value text-red-600">${Number(reporte.totalEgresos).toFixed(2)}</span>
                  <span className="stat-label">Total Egresos</span>
                </div>
                <div className="stat-card">
                  <div className="w-10 h-10 bg-lab-50 rounded-xl flex items-center justify-center mb-2 border border-lab-100">
                    <DollarSign className="w-5 h-5 text-lab-600" />
                  </div>
                  <span className={`stat-value ${reporte.utilidad >= 0 ? 'text-lab-700' : 'text-red-600'}`}>${Number(reporte.utilidad).toFixed(2)}</span>
                  <span className="stat-label">Utilidad</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'estudios' && (
        <div className="glass p-6 animate-slide-up">
          <h2 className="text-base font-semibold text-ink-primary mb-4">Top 10 Estudios Más Solicitados</h2>
          <div className="space-y-3">
            {estudiosTop.map((est, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle border border-subtle">
                <div className="flex items-center gap-3">
                  <span className="text-lab-600 font-bold w-6">{i + 1}.</span>
                  <span className="text-ink-primary font-medium">{est.nombre}</span>
                </div>
                <span className="badge badge-blue">{est.count} solicitudes</span>
              </div>
            ))}
            {estudiosTop.length === 0 && <p className="text-ink-tertiary text-sm">No hay datos suficientes.</p>}
          </div>
        </div>
      )}

      {activeTab === 'medicos' && (
        <div className="glass p-6 animate-slide-up">
          <h2 className="text-base font-semibold text-ink-primary mb-4">Productividad de Médicos Referentes</h2>
          <div className="table-wrapper">
            <table className="w-full text-left">
              <thead className="table-head">
                <tr>
                  <th className="table-cell">Médico</th>
                  <th className="table-cell text-center">Total Órdenes</th>
                  <th className="table-cell text-right">Ingresos Generados</th>
                </tr>
              </thead>
              <tbody>
                {medicosStats.map((m, i) => (
                  <tr key={i} className="table-row">
                    <td className="table-cell font-medium text-ink-primary">{m.nombre}</td>
                    <td className="table-cell text-center text-ink-secondary">{m.ordenes}</td>
                    <td className="table-cell text-right text-emerald-600 font-semibold">${Number(m.total_ingresos).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {medicosStats.length === 0 && <p className="p-4 text-ink-tertiary text-sm">No hay datos suficientes.</p>}
          </div>
        </div>
      )}

      {activeTab === 'cuentas' && (
        <div className="glass p-6 animate-slide-up">
          <h2 className="text-base font-semibold text-ink-primary mb-4">Cuentas por Cobrar (Saldos Pendientes)</h2>
          <div className="table-wrapper">
            <table className="w-full text-left">
              <thead className="table-head">
                <tr>
                  <th className="table-cell">Folio / Fecha</th>
                  <th className="table-cell">Paciente</th>
                  <th className="table-cell">Total Venta</th>
                  <th className="table-cell text-right">Estado Pago</th>
                </tr>
              </thead>
              <tbody>
                {cuentas.map((c: any) => (
                  <tr key={c.id} className="table-row">
                    <td className="table-cell">
                      <div className="font-semibold text-ink-primary">{c.folio || '-'}</div>
                      <div className="text-xs text-ink-tertiary">{new Date(c.fecha_creacion).toLocaleDateString('es-MX')}</div>
                    </td>
                    <td className="table-cell font-medium text-ink-primary">{c.pacientes?.nombre_completo}</td>
                    <td className="table-cell font-semibold text-ink-primary">${Number(c.costo_total).toFixed(2)}</td>
                    <td className="table-cell text-right">
                      <span className="badge badge-pending">
                        {c.estado_pago || 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cuentas.length === 0 && <p className="p-4 text-ink-tertiary text-center text-sm">No hay cuentas por cobrar pendientes. ¡Excelente!</p>}
          </div>
        </div>
      )}
    </div>
  );
}
