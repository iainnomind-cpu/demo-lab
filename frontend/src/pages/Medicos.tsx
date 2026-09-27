import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Medico { id: string; nombre_completo: string; telefono: string; especialidad?: string; cedula_profesional?: string; email?: string; }

export default function Medicos() {
  const [items, setItems]     = useState<Medico[]>([]);
  const [form, setForm]       = useState({ nombre_completo: '', telefono: '', especialidad: '', cedula_profesional: '', email: '' });
  const [editing, setEditing] = useState<string | null>(null);

  const load = () => api.get<Medico[]>('/api/medicos').then(setItems).catch(console.error);
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await api.patch(`/api/medicos/${editing}`, form);
    else await api.post('/api/medicos', form);
    setForm({ nombre_completo: '', telefono: '', especialidad: '', cedula_profesional: '', email: '' });
    setEditing(null);
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="page-title">Médicos Referentes</h1>

      <form onSubmit={submit} className="glass p-5 space-y-4">
        <h2 className="text-sm font-semibold text-ink-primary">{editing ? 'Editar médico' : 'Nuevo médico'}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre completo</label>
            <input className="input" value={form.nombre_completo} onChange={e => setForm(f => ({ ...f, nombre_completo: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Especialidad</label>
            <input className="input" value={form.especialidad} onChange={e => setForm(f => ({ ...f, especialidad: e.target.value }))} />
          </div>
          <div>
            <label className="label">Cédula Profesional</label>
            <input className="input" value={form.cedula_profesional} onChange={e => setForm(f => ({ ...f, cedula_profesional: e.target.value }))} />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input className="input" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />{editing ? 'Guardar' : 'Agregar'}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm({ nombre_completo: '', telefono: '', especialidad: '', cedula_profesional: '', email: '' }); }}>Cancelar</button>}
        </div>
      </form>

      <div className="table-wrapper">
        <table className="w-full">
          <thead className="table-head"><tr><th className="table-cell">Nombre</th><th className="table-cell">Especialidad</th><th className="table-cell">Cédula</th><th className="table-cell">Contacto</th><th className="table-cell text-right">Acciones</th></tr></thead>
          <tbody>
            {items.map(m => (
              <tr key={m.id} className="table-row">
                <td className="table-cell font-medium">{m.nombre_completo}</td>
                <td className="table-cell text-ink-secondary">{m.especialidad || '—'}</td>
                <td className="table-cell text-ink-secondary">{m.cedula_profesional || '—'}</td>
                <td className="table-cell text-ink-secondary">
                  <div>{m.telefono}</div>
                  <div className="text-xs">{m.email}</div>
                </td>
                <td className="table-cell text-right">
                  <button className="btn-ghost px-2.5 py-1.5 mr-2" onClick={() => { setEditing(m.id); setForm({ nombre_completo: m.nombre_completo, telefono: m.telefono || '', especialidad: m.especialidad || '', cedula_profesional: m.cedula_profesional || '', email: m.email || '' }); }}>
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
