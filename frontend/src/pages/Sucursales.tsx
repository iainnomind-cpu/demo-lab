import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Sucursal { id: string; nombre: string; tipo: string; activo: boolean; }

export default function Sucursales() {
  const [items, setItems]   = useState<Sucursal[]>([]);
  const [form, setForm]     = useState({ nombre: '', tipo: 'toma_muestra' });
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError]   = useState('');

  const load = () => api.get<Sucursal[]>('/api/sucursales').then(setItems).catch(console.error);
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.patch(`/api/sucursales/${editing}`, form);
      } else {
        await api.post('/api/sucursales', form);
      }
      setForm({ nombre: '', tipo: 'toma_muestra' });
      setEditing(null);
      load();
    } catch (err: any) { setError(err.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('¿Dar de baja esta sucursal?')) return;
    await api.delete(`/api/sucursales/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="page-title">Sucursales</h1>

      {/* Form */}
      <form onSubmit={submit} className="glass p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/70">{editing ? 'Editar sucursal' : 'Nueva sucursal'}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre</label>
            <input className="input" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select className="input" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
              <option value="toma_muestra">Toma de muestra</option>
              <option value="matriz">Matriz</option>
            </select>
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />{editing ? 'Guardar' : 'Agregar'}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm({ nombre: '', tipo: 'toma_muestra' }); }}>Cancelar</button>}
        </div>
      </form>

      {/* Table */}
      <div className="table-wrapper">
        <table className="w-full">
          <thead className="table-head">
            <tr><th className="table-cell">Nombre</th><th className="table-cell">Tipo</th><th className="table-cell text-right">Acciones</th></tr>
          </thead>
          <tbody>
            {items.map(s => (
              <tr key={s.id} className="table-row">
                <td className="table-cell font-medium">{s.nombre}</td>
                <td className="table-cell">
                  <span className={`badge ${s.tipo === 'matriz' ? 'badge-blue' : 'badge-amber'}`}>{s.tipo}</span>
                </td>
                <td className="table-cell text-right">
                  <button className="btn-ghost px-2.5 py-1.5 mr-2" onClick={() => { setEditing(s.id); setForm({ nombre: s.nombre, tipo: s.tipo }); }}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button className="btn-danger px-2.5 py-1.5" onClick={() => remove(s.id)}>
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
