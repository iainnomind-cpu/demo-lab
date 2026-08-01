import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Medico { id: string; nombre_completo: string; telefono: string; }

export default function Medicos() {
  const [items, setItems]     = useState<Medico[]>([]);
  const [form, setForm]       = useState({ nombre_completo: '', telefono: '' });
  const [editing, setEditing] = useState<string | null>(null);

  const load = () => api.get<Medico[]>('/api/medicos').then(setItems).catch(console.error);
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await api.patch(`/api/medicos/${editing}`, form);
    else await api.post('/api/medicos', form);
    setForm({ nombre_completo: '', telefono: '' });
    setEditing(null);
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="page-title">Médicos Referentes</h1>

      <form onSubmit={submit} className="glass p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/70">{editing ? 'Editar médico' : 'Nuevo médico'}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre completo</label>
            <input className="input" value={form.nombre_completo} onChange={e => setForm(f => ({ ...f, nombre_completo: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input className="input" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />{editing ? 'Guardar' : 'Agregar'}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm({ nombre_completo: '', telefono: '' }); }}>Cancelar</button>}
        </div>
      </form>

      <div className="table-wrapper">
        <table className="w-full">
          <thead className="table-head"><tr><th className="table-cell">Nombre</th><th className="table-cell">Teléfono</th><th className="table-cell text-right">Acciones</th></tr></thead>
          <tbody>
            {items.map(m => (
              <tr key={m.id} className="table-row">
                <td className="table-cell font-medium">{m.nombre_completo}</td>
                <td className="table-cell text-white/60">{m.telefono || '—'}</td>
                <td className="table-cell text-right">
                  <button className="btn-ghost px-2.5 py-1.5 mr-2" onClick={() => { setEditing(m.id); setForm({ nombre_completo: m.nombre_completo, telefono: m.telefono }); }}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button className="btn-danger px-2.5 py-1.5" onClick={async () => { if (confirm('¿Dar de baja?')) { await api.delete(`/api/medicos/${m.id}`); load(); } }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
