import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, ChevronRight, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ESTADO_COLOR: Record<string, string> = {
  muestra_tomada: 'badge-sample',
  procesada:      'badge-processed',
  entregada:      'badge-delivered',
};

const PAGO_COLOR: Record<string, string> = {
  pendiente: 'badge-pending',
  parcial:   'badge-partial',
  pagado:    'badge-paid',
  credito:   'badge-credit',
};

export default function Ordenes() {
  const [ordenes, setOrdenes]     = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [medicos, setMedicos]     = useState<any[]>([]);
  const [estudios, setEstudios]   = useState<any[]>([]);
  const [showForm, setShowForm]   = useState(false);
  const [search, setSearch]       = useState('');
  const [form, setForm] = useState({ 
    paciente_id: '', sucursal_id: '', medico_id: '', estudios: [] as string[],
    prioridad: 'normal', descuento_monto: 0, ayuno_confirmado: false, observaciones_clinicas: '', nota_interna: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadAll = async () => {
    const [o, p, s, m, e] = await Promise.all([
      api.get<any[]>('/api/ordenes'),
      api.get<any[]>('/api/pacientes'),
      api.get<any[]>('/api/sucursales'),
      api.get<any[]>('/api/medicos'),
      api.get<any[]>('/api/estudios'),
    ]);
    setOrdenes(o); setPacientes(p); setSucursales(s); setMedicos(m); setEstudios(e);
  };

  useEffect(() => { loadAll(); }, []);

  const toggleEstudio = (id: string) => {
    setForm(f => ({
      ...f,
      estudios: f.estudios.includes(id) ? f.estudios.filter(x => x !== id) : [...f.estudios, id],
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.estudios.length) { setError('Selecciona al menos un estudio'); return; }
    try {
      await api.post('/api/ordenes', { ...form, medico_id: form.medico_id || undefined });
      setForm({ paciente_id: '', sucursal_id: '', medico_id: '', estudios: [], prioridad: 'normal', descuento_monto: 0, ayuno_confirmado: false, observaciones_clinicas: '', nota_interna: '' });
      setShowForm(false);
      loadAll();
    } catch (err: any) { setError(err.message); }
  };

  const filtered = ordenes.filter(o =>
    o.pacientes?.nombre_completo?.toLowerCase().includes(search.toLowerCase()) ||
    o.folio?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Registro de Órdenes</h1>
          <p className="page-sub">Gestiona y da seguimiento a todas las órdenes del laboratorio ({ordenes.length} total)</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Cancelar registro' : 'Nueva orden'}
        </button>
      </div>

      {/* Formulario de creación (Glass Panel) */}
      {showForm && (
        <form onSubmit={submit} className="glass p-6 sm:p-8 space-y-6 animate-slide-up">
          <div className="flex items-center gap-2 border-b border-subtle pb-4">
            <div className="w-8 h-8 rounded-full bg-lab-50 flex items-center justify-center text-lab-600">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-ink-primary text-lg">Nueva Visita y Orden</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="label">Paciente</label>
              <select className="input" value={form.paciente_id} onChange={e => setForm(f => ({ ...f, paciente_id: e.target.value }))} required>
                <option value="">Seleccionar paciente…</option>
                {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre_completo}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Sucursal de atención</label>
              <select className="input" value={form.sucursal_id} onChange={e => setForm(f => ({ ...f, sucursal_id: e.target.value }))} required>
                <option value="">Seleccionar sucursal…</option>
                {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre} ({s.tipo})</option>)}
              </select>
            </div>
            <div>
              <label className="label">Médico referente (opcional)</label>
              <select className="input" value={form.medico_id} onChange={e => setForm(f => ({ ...f, medico_id: e.target.value }))}>
                <option value="">Sin médico (directo)</option>
                {medicos.map(m => <option key={m.id} value={m.id}>{m.nombre_completo}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Prioridad</label>
              <select className="input" value={form.prioridad} onChange={e => setForm(f => ({ ...f, prioridad: e.target.value }))}>
                <option value="normal">Normal</option>
                <option value="urgente">Urgente</option>
                <option value="stat">STAT (Emergencia)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">Observaciones Clínicas</label>
              <textarea className="input" placeholder="Ej. Paciente refiere dolor abdominal..." value={form.observaciones_clinicas} onChange={e => setForm(f => ({ ...f, observaciones_clinicas: e.target.value }))} rows={2} />
            </div>
            <div>
              <label className="label">Nota Interna (Sólo Lab)</label>
              <textarea className="input" placeholder="Ej. Muestra un poco hemolizada..." value={form.nota_interna} onChange={e => setForm(f => ({ ...f, nota_interna: e.target.value }))} rows={2} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
            <label className="flex items-center gap-3 p-3 border border-subtle rounded-xl bg-surface-subtle cursor-pointer hover:bg-white transition-colors">
              <input type="checkbox" className="w-4 h-4 text-lab-600 rounded border-gray-300 focus:ring-lab-500" checked={form.ayuno_confirmado} onChange={e => setForm(f => ({ ...f, ayuno_confirmado: e.target.checked }))} />
              <span className="text-sm font-medium text-ink-primary">Confirmar Ayuno del Paciente (12h)</span>
            </label>
            <div>
              <label className="label">Descuento aplicado ($)</label>
              <input type="number" min="0" step="0.01" className="input" value={form.descuento_monto} onChange={e => setForm(f => ({ ...f, descuento_monto: Number(e.target.value) }))} />
            </div>
          </div>

          <div className="pt-2">
            <label className="label mb-3">Estudios Solicitados</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {estudios.map(e => {
                const isSelected = form.estudios.includes(e.id);
                return (
                  <label key={e.id} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-lab-50 border-lab-400 shadow-teal-sm' : 'bg-surface-card border-subtle hover:border-gray-300 shadow-glass-sm'}`}>
                    <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleEstudio(e.id)} />
                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-lab-500 border-lab-500' : 'bg-white border-gray-300'}`}>
                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isSelected ? 'text-lab-900' : 'text-ink-primary'}`}>{e.nombre}</p>
                      <p className="text-xs text-ink-tertiary mt-0.5">${Number(e.precio).toFixed(2)}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Costo estimado */}
          {form.estudios.length > 0 && (
            <div className="bg-lab-50 border border-lab-200 rounded-xl p-5 flex justify-between items-center shadow-inner mt-4">
              <div>
                <p className="text-xs font-semibold text-lab-700 uppercase tracking-wider mb-1">Total a cobrar</p>
                <p className="text-3xl font-bold text-lab-800">
                  ${Math.max(0, estudios.filter(e => form.estudios.includes(e.id)).reduce((s, e) => s + Number(e.precio), 0) - form.descuento_monto).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-lab-700 mb-0.5">Subtotal: ${estudios.filter(e => form.estudios.includes(e.id)).reduce((s, e) => s + Number(e.precio), 0).toFixed(2)}</p>
                {form.descuento_monto > 0 && (
                  <p className="text-sm font-medium text-red-500">- Descuento: ${form.descuento_monto.toFixed(2)}</p>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}
          
          <div className="flex gap-3 justify-end pt-4 border-t border-subtle">
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Crear orden de laboratorio</button>
          </div>
        </form>
      )}

      {/* Barra de herramientas */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
          <input className="input pl-10" placeholder="Buscar por paciente o folio..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Tabla */}
      <div className="table-wrapper animate-slide-up" style={{ animationDelay: '100ms' }}>
        <table className="w-full text-left">
          <thead className="table-head">
            <tr>
              <th className="table-cell">Folio / Fecha</th>
              <th className="table-cell">Paciente</th>
              <th className="table-cell">Sucursal</th>
              <th className="table-cell">Total</th>
              <th className="table-cell">Pago</th>
              <th className="table-cell">Est. Lab</th>
              <th className="table-cell text-right"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-ink-secondary text-sm">
                  No se encontraron órdenes
                </td>
              </tr>
            ) : (
              filtered.map(o => (
                <tr key={o.id} className="table-row cursor-pointer" onClick={() => navigate(`/ordenes/${o.id}`)}>
                  <td className="table-cell">
                    <div className="font-semibold text-ink-primary flex items-center gap-2">
                      {o.folio ? <span className="folio">{o.folio}</span> : '-'}
                      {o.prioridad === 'stat' && <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_4px_#ef4444]" title="STAT" />}
                    </div>
                    <div className="text-xs text-ink-tertiary mt-1">
                      {new Date(o.fecha_creacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="table-cell font-medium text-ink-primary">{o.pacientes?.nombre_completo}</td>
                  <td className="table-cell text-ink-secondary">{o.sucursales?.nombre}</td>
                  <td className="table-cell font-semibold text-ink-primary">${Number(o.costo_total).toFixed(2)}</td>
                  <td className="table-cell">
                    <span className={`badge ${PAGO_COLOR[o.estado_pago] || 'badge-normal'}`}>
                      {o.estado_pago || 'pendiente'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${ESTADO_COLOR[o.estado] || 'badge-normal'}`}>
                      {o.estado?.replace('_', ' ') || 'pendiente'}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-hover text-ink-tertiary transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
