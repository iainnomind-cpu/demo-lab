import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Plus, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ESTADO_COLOR: Record<string, string> = {
  muestra_tomada: 'badge-amber',
  procesada:      'badge-blue',
  entregada:      'badge-green',
};

export default function Ordenes() {
  const [ordenes, setOrdenes]     = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [medicos, setMedicos]     = useState<any[]>([]);
  const [estudios, setEstudios]   = useState<any[]>([]);
  const [showForm, setShowForm]   = useState(false);
  const [search, setSearch]       = useState('');
  const [form, setForm] = useState({ paciente_id: '', sucursal_id: '', medico_id: '', estudios: [] as string[] });
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
      setForm({ paciente_id: '', sucursal_id: '', medico_id: '', estudios: [] });
      setShowForm(false);
      loadAll();
    } catch (err: any) { setError(err.message); }
  };

  const filtered = ordenes.filter(o =>
    o.pacientes?.nombre_completo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Órdenes</h1><p className="page-sub">{ordenes.length} órdenes registradas</p></div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />Nueva orden
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="glass p-6 space-y-5 animate-slide-up">
          <h2 className="font-semibold text-white/70 text-sm">Registrar visita</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Paciente</label>
              <select className="input" value={form.paciente_id} onChange={e => setForm(f => ({ ...f, paciente_id: e.target.value }))} required>
                <option value="">Seleccionar…</option>
                {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre_completo}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Sucursal</label>
              <select className="input" value={form.sucursal_id} onChange={e => setForm(f => ({ ...f, sucursal_id: e.target.value }))} required>
                <option value="">Seleccionar…</option>
                {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre} ({s.tipo})</option>)}
              </select>
            </div>
            <div>
              <label className="label">Médico referente (opcional)</label>
              <select className="input" value={form.medico_id} onChange={e => setForm(f => ({ ...f, medico_id: e.target.value }))}>
                <option value="">Sin médico</option>
                {medicos.map(m => <option key={m.id} value={m.id}>{m.nombre_completo}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Estudios (selecciona uno o más)</label>
            <div className="grid grid-cols-2 gap-2">
              {estudios.map(e => (
                <label key={e.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${form.estudios.includes(e.id) ? 'bg-brand-500/20 border-brand-400/50' : 'bg-white/[0.04] border-white/10 hover:border-white/20'}`}>
                  <input type="checkbox" className="hidden" checked={form.estudios.includes(e.id)} onChange={() => toggleEstudio(e.id)} />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${form.estudios.includes(e.id) ? 'bg-brand-500 border-brand-400' : 'border-white/30'}`}>
                    {form.estudios.includes(e.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{e.nombre}</p>
                    <p className="text-xs text-white/50">${Number(e.precio).toFixed(2)}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Costo estimado */}
          {form.estudios.length > 0 && (
            <div className="bg-brand-500/10 border border-brand-400/30 rounded-xl px-4 py-3">
              <p className="text-sm text-white/70">Costo total estimado (calculado por el servidor):</p>
              <p className="text-2xl font-bold text-brand-300">
                ${estudios.filter(e => form.estudios.includes(e.id)).reduce((s, e) => s + Number(e.precio), 0).toFixed(2)}
              </p>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Registrar orden</button>
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input className="input pl-10" placeholder="Buscar por paciente…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-wrapper">
        <table className="w-full">
          <thead className="table-head">
            <tr><th className="table-cell">Fecha</th><th className="table-cell">Paciente</th><th className="table-cell">Sucursal</th><th className="table-cell">Total</th><th className="table-cell">Estado</th><th className="table-cell text-right">Ver</th></tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="table-row cursor-pointer" onClick={() => navigate(`/ordenes/${o.id}`)}>
                <td className="table-cell text-white/60">{new Date(o.fecha_creacion).toLocaleDateString('es-MX')}</td>
                <td className="table-cell font-medium">{o.pacientes?.nombre_completo}</td>
                <td className="table-cell text-white/60">{o.sucursales?.nombre}</td>
                <td className="table-cell font-semibold">${Number(o.costo_total).toFixed(2)}</td>
                <td className="table-cell"><span className={`badge ${ESTADO_COLOR[o.estado] || 'badge-blue'}`}>{o.estado}</span></td>
                <td className="table-cell text-right"><ChevronRight className="w-4 h-4 ml-auto text-white/40" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
