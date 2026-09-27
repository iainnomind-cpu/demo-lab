import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ClipboardList, Users, TrendingUp, AlertTriangle, Clock, CheckCircle2, FlaskConical, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRIORITY_BAR: Record<string, string> = {
  stat:    'bg-red-500',
  urgente: 'bg-amber-500',
  normal:  'bg-lab-600',
};
const ESTADO_PAGO_BADGE: Record<string, string> = {
  pendiente: 'badge-pending',
  parcial:   'badge-partial',
  pagado:    'badge-paid',
  credito:   'badge-credit',
};
const ESTADO_LAB_BADGE: Record<string, string> = {
  muestra_tomada: 'badge-sample',
  procesada:      'badge-processed',
  entregada:      'badge-delivered',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [ordenes,   setOrdenes]   = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any[]>('/api/ordenes'),
      api.get<any[]>('/api/pacientes'),
    ]).then(([o, p]) => {
      setOrdenes(o);
      setPacientes(p);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const total      = ordenes.length;
  const pendientes = ordenes.filter(o => o.estado_pago !== 'pagado').length;
  const urgentes   = ordenes.filter(o => o.prioridad === 'stat' || o.prioridad === 'urgente').length;
  const entregadas = ordenes.filter(o => o.estado === 'entregada').length;

  const kpis = [
    {
      label: 'Total Órdenes',
      value: total,
      icon: ClipboardList,
      iconClass: 'icon-wrap-teal',
      valueColor: 'text-ink-primary',
      trend: '+12% este mes',
      trendUp: true,
    },
    {
      label: 'Cuentas Pendientes',
      value: pendientes,
      icon: Clock,
      iconClass: 'icon-wrap-amber',
      valueColor: 'text-amber-600',
      trend: `${Math.round((pendientes / (total || 1)) * 100)}% del total`,
      trendUp: false,
    },
    {
      label: 'Entregadas',
      value: entregadas,
      icon: CheckCircle2,
      iconClass: 'icon-wrap-green',
      valueColor: 'text-emerald-600',
      trend: `${Math.round((entregadas / (total || 1)) * 100)}% completadas`,
      trendUp: true,
    },
    {
      label: 'Pacientes Activos',
      value: pacientes.length,
      icon: Users,
      iconClass: 'icon-wrap-purple',
      valueColor: 'text-purple-600',
      trend: 'Registro total',
      trendUp: true,
    },
  ];

  const recientes = [...ordenes]
    .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
    .slice(0, 7);

  const ordenesUrgentes = ordenes.filter(o => o.prioridad === 'stat' || o.prioridad === 'urgente').slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-4 h-4 text-lab-600" />
            <span className="text-[11px] font-semibold text-lab-600 uppercase tracking-widest">BioLab Pro</span>
          </div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Resumen operativo del laboratorio</p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: '#94a3b8' }}>
          <span className="status-dot status-dot-green" />
          Sistema en línea
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {kpis.map(({ label, value, icon: Icon, iconClass, valueColor, trend, trendUp }) => (
          <div key={label} className="stat-card animate-slide-up">
            <div className="flex items-start justify-between mb-3">
              <div className={`icon-wrap ${iconClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className={`flex items-center gap-0.5 text-[10px] font-medium ${trendUp ? 'text-emerald-600' : 'text-amber-600'}`}>
                <TrendingUp className="w-3 h-3" />
              </div>
            </div>
            <span className={`stat-value ${valueColor}`}>
              {loading ? <span className="skeleton inline-block w-10 h-8 rounded" /> : value}
            </span>
            <span className="stat-label">{label}</span>
            <span className="text-[10px] text-ink-tertiary mt-0.5">{trend}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Órdenes Recientes ── */}
        <div className="lg:col-span-2 glass p-5">
          <div className="flex items-center justify-between mb-4 border-b border-subtle pb-3">
            <h2 className="text-sm font-semibold text-ink-primary">Órdenes Recientes</h2>
            <button
              onClick={() => navigate('/ordenes')}
              className="flex items-center gap-1 text-xs text-lab-600 hover:text-lab-700 transition-colors"
            >
              Ver todas <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))
            ) : recientes.length === 0 ? (
              <p className="text-ink-tertiary text-sm text-center py-8">No hay órdenes registradas</p>
            ) : (
              recientes.map(o => (
                <div
                  key={o.id}
                  onClick={() => navigate(`/ordenes/${o.id}`)}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-surface-hover"
                >
                  {/* Priority bar */}
                  <div className={`w-1 h-8 rounded-full flex-shrink-0 ${PRIORITY_BAR[o.prioridad] || 'bg-slate-200'}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink-primary truncate">
                        {o.pacientes?.nombre_completo || 'Paciente'}
                      </p>
                      {o.folio && <span className="folio">{o.folio}</span>}
                    </div>
                    <span className="text-[11px] text-ink-tertiary">
                      {new Date(o.fecha_creacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {' · '}{o.sucursales?.nombre}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge ${ESTADO_PAGO_BADGE[o.estado_pago] || 'badge-pending'}`}>
                      {o.estado_pago || 'pendiente'}
                    </span>
                    <span className={`badge ${ESTADO_LAB_BADGE[o.estado] || 'badge-blue'}`}>
                      {o.estado?.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-ink-primary w-12 text-right">${Number(o.costo_total).toFixed(0)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Panel lateral ── */}
        <div className="space-y-5">

          {/* Urgentes */}
          <div className="glass p-5">
            <div className="flex items-center gap-2 mb-4 border-b border-subtle pb-3">
              <div className="icon-wrap bg-red-50 text-red-600">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-ink-primary">Órdenes Urgentes</h3>
              {urgentes > 0 && (
                <span className="ml-auto badge badge-urgent">{urgentes}</span>
              )}
            </div>

            {ordenesUrgentes.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-ink-tertiary">Sin urgencias en el sistema</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ordenesUrgentes.map(o => (
                  <div
                    key={o.id}
                    onClick={() => navigate(`/ordenes/${o.id}`)}
                    className="p-3 rounded-xl cursor-pointer transition-all bg-red-50 hover:bg-red-100 border border-red-100"
                  >
                    <p className="text-xs font-semibold text-red-900 truncate">{o.pacientes?.nombre_completo}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-red-700 font-medium">{o.folio || 'Sin folio'}</span>
                      <span className={`badge ${o.prioridad === 'stat' ? 'badge-stat' : 'badge-urgent'} text-[9px]`}>
                        {o.prioridad?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumen rápido */}
          <div className="glass p-5 space-y-4">
            <h3 className="text-sm font-semibold text-ink-primary border-b border-subtle pb-3">Resumen del Proceso</h3>
            <div className="space-y-4 pt-1">
              {[
                { label: 'Muestra tomada', count: ordenes.filter(o => o.estado === 'muestra_tomada').length, color: 'bg-amber-500' },
                { label: 'En proceso',     count: ordenes.filter(o => o.estado === 'procesada').length,      color: 'bg-lab-500' },
                { label: 'Entregadas',     count: ordenes.filter(o => o.estado === 'entregada').length,      color: 'bg-emerald-500' },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-ink-secondary font-medium">{row.label}</span>
                    <span className="font-semibold text-ink-primary">{row.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-subtle overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.color} transition-all duration-700`}
                      style={{ width: `${total ? (row.count / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}



