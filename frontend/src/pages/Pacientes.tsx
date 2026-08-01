import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Plus, Search, ChevronRight } from 'lucide-react';

interface Paciente { id: string; nombre_completo: string; email: string; whatsapp: string; }

export default function Pacientes() {
  const [items, setItems]   = useState<Paciente[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm]     = useState({ nombre_completo: '', fecha_nacimiento: '', email: '', whatsapp: '' });
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const load = () => api.get<Paciente[]>('/api/pacientes').then(setItems).catch(console.error);
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/api/pacientes', form);
    setForm({ nombre_completo: '', fecha_nacimiento: '', email: '', whatsapp: '' });
    setShowForm(false);
    load();
  };

  const filtered = items.filter(p =>
    p.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Pacientes</h1><p className="page-sub">{items.length} registrados</p></div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />Nuevo paciente
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="glass p-5 space-y-4 animate-slide-up">
          <h2 className="text-sm font-semibold text-white/70">Registrar paciente</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Nombre completo</label><input className="input" value={form.nombre_completo} onChange={e => setForm(f => ({ ...f, nombre_completo: e.target.value }))} required /></div>
            <div><label className="label">Fecha de nacimiento</label><input type="date" className="input" value={form.fecha_nacimiento} onChange={e => setForm(f => ({ ...f, fecha_nacimiento: e.target.value }))} /></div>
            <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><label className="label">WhatsApp</label><input className="input" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} /></div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Guardar</button>
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input className="input pl-10" placeholder="Buscar paciente…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-wrapper">
        <table className="w-full">
          <thead className="table-head"><tr><th className="table-cell">Nombre</th><th className="table-cell">Email</th><th className="table-cell">WhatsApp</th><th className="table-cell text-right">Historial</th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="table-row cursor-pointer" onClick={() => navigate(`/pacientes/${p.id}`)}>
                <td className="table-cell font-medium">{p.nombre_completo}</td>
                <td className="table-cell text-white/60">{p.email || '—'}</td>
                <td className="table-cell text-white/60">{p.whatsapp || '—'}</td>
                <td className="table-cell text-right"><ChevronRight className="w-4 h-4 ml-auto text-white/40" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
