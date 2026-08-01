import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Estudio { id: string; nombre: string; precio: number; meses_recordatorio: number; }

export default function Catalogo() {
  const [items, setItems]     = useState<Estudio[]>([]);
  const [form, setForm]       = useState({ nombre: '', precio: '', meses_recordatorio: '12' });
  const [editing, setEditing] = useState<string | null>(null);

  const load = () => api.get<Estudio[]>('/api/estudios').then(setItems).catch(console.error);
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { nombre: form.nombre, precio: parseFloat(form.precio), meses_recordatorio: parseInt(form.meses_recordatorio) };
    if (editing) await api.patch(`/api/estudios/${editing}`, body);
    else await api.post('/api/estudios', body);
    setForm({ nombre: '', precio: '', meses_recordatorio: '12' });
    setEditing(null);
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="page-title">Catálogo de Estudios</h1>

      <form onSubmit={submit} className="glass p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/70">{editing ? 'Editar estudio' : 'Nuevo estudio'}</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="label">Nombre</label>
            <input className="input" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Precio (MXN)</label>
            <input type="number" step="0.01" min="0" className="input" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Meses recordatorio</label>
            <input type="number" min="1" className="input" value={form.meses_recordatorio} onChange={e => setForm(f => ({ ...f, meses_recordatorio: e.target.value }))} required />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />{editing ? 'Guardar' : 'Agregar'}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm({ nombre: '', precio: '', meses_recordatorio: '12' }); }}>Cancelar</button>}
        </div>
      </form>

      <div className="table-wrapper">
        <table className="w-full">
          <thead className="table-head"><tr><th className="table-cell">Nombre</th><th className="table-cell">Precio</th><th className="table-cell">Recordatorio (meses)</th><th className="table-cell text-right">Acciones</th></tr></thead>
          <tbody>
            {items.map(e => (
              <tr key={e.id} className="table-row">
                <td className="table-cell font-medium">{e.nombre}</td>
                <td className="table-cell">${Number(e.precio).toFixed(2)}</td>
                <td className="table-cell"><span className="badge badge-blue">{e.meses_recordatorio} meses</span></td>
                <td className="table-cell text-right">
                  <button className="btn-ghost px-2.5 py-1.5 mr-2" onClick={() => { setEditing(e.id); setForm({ nombre: e.nombre, precio: String(e.precio), meses_recordatorio: String(e.meses_recordatorio) }); }}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button className="btn-danger px-2.5 py-1.5" onClick={async () => { if (confirm('¿Dar de baja?')) { await api.delete(`/api/estudios/${e.id}`); load(); } }}>
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
