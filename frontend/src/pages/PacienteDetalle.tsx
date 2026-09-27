import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, MessageCircle, Mail, Clock, TrendingUp, AlertCircle, CheckCircle2, UserCircle2 } from 'lucide-react';

const ESTADO_COLOR: Record<string, string> = {
  muestra_tomada: 'badge-amber',
  procesada:      'badge-blue',
  entregada:      'badge-green',
};

export default function PacienteDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get<any>(`/api/pacientes/${id}`).then(setData).catch(console.error);
  }, [id]);

  if (!data) return <div className="text-ink-secondary text-center py-20">Cargando…</div>;

  const historial = data.historial ?? [];
  const totalVisitas = historial.length;
  const totalInvertido = historial.reduce((sum: number, o: any) => sum + Number(o.costo_total || 0), 0);
  const ticketPromedio = totalVisitas > 0 ? totalInvertido / totalVisitas : 0;
  
  let ultimaVisitaDate: Date | null = null;
  let diasDesdeUltimaVisita = 0;
  let riesgo = { label: 'Nuevo', color: 'text-ink-tertiary', bg: 'bg-surface-subtle', icon: UserCircle2 };

  if (totalVisitas > 0) {
    ultimaVisitaDate = new Date(historial[0].fecha_creacion);
    const msDiff = Date.now() - ultimaVisitaDate.getTime();
    diasDesdeUltimaVisita = Math.floor(msDiff / (1000 * 60 * 60 * 24));
    
    // Riesgo de abandono
    if (diasDesdeUltimaVisita < 90) {
      riesgo = { label: 'Activo', color: 'text-emerald-700', bg: 'bg-emerald-50 border border-emerald-200', icon: CheckCircle2 };
    } else if (diasDesdeUltimaVisita < 180) {
      riesgo = { label: 'En Riesgo', color: 'text-amber-700', bg: 'bg-amber-50 border border-amber-200', icon: Clock };
    } else {
      riesgo = { label: 'Abandono', color: 'text-red-700', bg: 'bg-red-50 border border-red-200', icon: AlertCircle };
    }
  }

  const RiesgoIcon = riesgo.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      <button className="flex items-center gap-2 text-ink-tertiary hover:text-ink-primary transition-colors" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4" />Volver al listado
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Perfil y Marketing */}
        <div className="space-y-6">
          <div className="glass p-6 text-center">
            <div className="w-20 h-20 bg-lab-100 rounded-full text-lab-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              {data.nombre_completo.substring(0, 2).toUpperCase()}
            </div>
            <h1 className="text-xl font-bold text-ink-primary">{data.nombre_completo}</h1>
            <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${riesgo.bg} ${riesgo.color}`}>
              <RiesgoIcon className="w-3.5 h-3.5" /> {riesgo.label} {diasDesdeUltimaVisita > 0 && `(hace ${diasDesdeUltimaVisita} días)`}
            </div>

            <div className="mt-6 space-y-3 text-left">
              <div className="flex justify-between border-b border-subtle pb-2">
                <span className="text-sm text-ink-tertiary">Email</span>
                <span className="text-sm font-medium text-ink-secondary">{data.email || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-subtle pb-2">
                <span className="text-sm text-ink-tertiary">WhatsApp</span>
                <span className="text-sm font-medium text-ink-secondary">{data.whatsapp || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-subtle pb-2">
                <span className="text-sm text-ink-tertiary">Edad / Sexo</span>
                <span className="text-sm font-medium text-ink-secondary">
                  {data.fecha_nacimiento ? `${Math.floor((Date.now() - new Date(data.fecha_nacimiento).getTime()) / 31557600000)} años` : '—'} / {data.sexo || '—'}
                </span>
              </div>
              <div className="flex justify-between border-b border-subtle pb-2">
                <span className="text-sm text-ink-tertiary">Expediente</span>
                <span className="text-sm font-medium text-ink-secondary">{data.numero_expediente || '—'}</span>
              </div>
            </div>
          </div>

          <div className="glass p-5">
            <h3 className="text-sm font-semibold text-ink-primary mb-3">Acciones de Marketing</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#075E54] hover:bg-[#25D366]/20 py-2.5 rounded-lg transition-colors font-medium text-sm border border-[#25D366]/20">
                <MessageCircle className="w-4 h-4" /> Enviar Promoción WhatsApp
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-surface-subtle text-ink-secondary hover:bg-surface-hover py-2.5 rounded-lg transition-colors font-medium text-sm">
                <Mail className="w-4 h-4" /> Enviar Correo
              </button>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Inteligencia e Historial */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-3 gap-4">
            <div className="glass p-5 animate-slide-up" style={{ animationDelay: '50ms' }}>
              <div className="flex items-center gap-2 text-lab-600 mb-1.5"><TrendingUp className="w-4 h-4" /></div>
              <div className="text-2xl font-bold text-ink-primary">${totalInvertido.toFixed(2)}</div>
              <div className="text-xs text-ink-tertiary mt-1">Valor Total (LTV)</div>
            </div>
            <div className="glass p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-2 text-indigo-500 mb-1.5"><TrendingUp className="w-4 h-4" /></div>
              <div className="text-2xl font-bold text-ink-primary">${ticketPromedio.toFixed(2)}</div>
              <div className="text-xs text-ink-tertiary mt-1">Ticket Promedio</div>
            </div>
            <div className="glass p-5 animate-slide-up" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center gap-2 text-emerald-500 mb-1.5"><TrendingUp className="w-4 h-4" /></div>
              <div className="text-2xl font-bold text-ink-primary">{totalVisitas}</div>
              <div className="text-xs text-ink-tertiary mt-1">Visitas Históricas</div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold text-ink-primary mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Historial de Órdenes
            </h2>
            <div className="table-wrapper animate-slide-up" style={{ animationDelay: '200ms' }}>
              <table className="w-full text-left">
                <thead className="table-head">
                  <tr>
                    <th className="table-cell">Fecha</th>
                    <th className="table-cell">Sucursal</th>
                    <th className="table-cell">Estudios</th>
                    <th className="table-cell">Total</th>
                    <th className="table-cell">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-ink-tertiary text-sm">
                        No hay historial de órdenes
                      </td>
                    </tr>
                  ) : (
                    historial.map((o: any) => (
                      <tr key={o.id} className="table-row">
                        <td className="table-cell font-medium text-ink-primary cursor-pointer hover:text-lab-600" onClick={() => navigate(`/ordenes/${o.id}`)}>
                          {new Date(o.fecha_creacion).toLocaleDateString('es-MX')}
                        </td>
                        <td className="table-cell text-ink-secondary">{o.sucursales?.nombre}</td>
                        <td className="table-cell text-ink-secondary text-xs truncate max-w-[200px]" title={(o.ordenes_estudios ?? []).map((oe: any) => oe.estudios_catalogo?.nombre).join(', ')}>
                          {(o.ordenes_estudios ?? []).map((oe: any) => oe.estudios_catalogo?.nombre).join(', ')}
                        </td>
                        <td className="table-cell font-semibold text-ink-primary">${Number(o.costo_total).toFixed(2)}</td>
                        <td className="table-cell">
                          <span className={`badge ${ESTADO_COLOR[o.estado] || 'badge-blue'}`}>{o.estado?.replace('_', ' ')}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
