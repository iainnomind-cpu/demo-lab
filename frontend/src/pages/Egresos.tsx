import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

export default function Egresos() {
  const [items, setItems]       = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [form, setForm]         = useState({ sucursal_id: '', monto: '', categoria: 'insumos', folio_factura: '' });
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const [e, s] = await Promise.all([api.get<any[]>('/api/egresos'), api.get<any[]>('/api/sucursales')]);
    setItems(e); setSucursales(s);
  };
  useEffect(() => { load(); }, []);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    await api.post('/api/egresos', { ...form, monto: parseFloat(form.monto) });
    setForm({ sucursal_id: '', monto: '', categoria: 'insumos', folio_factura: '' });
    setShowForm(false);
    load();
  };

  const totalHoy = items.filter(e => new Date(e.fecha).toDateString() === new Date().toDateString()).reduce((s, e) => s + Number(e.monto), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Egresos</h1><p className="page-sub">Total hoy: ${totalHoy.toFixed(2)}</p></div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />Nuevo egreso
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="glass p-5 space-y-4 animate-slide-up">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Sucursal</label>
              <select className="input" value={form.sucursal_id} onChange={e => setForm(f => ({ ...f, sucursal_id: e.target.value }))} required>
                <option value="">Seleccionar…</option>
                {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Monto (MXN)</label>
              <input type="number" step="0.01" min="0" className="input" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Categoría</label>
              <select className="input" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                <option value="insumos">Insumos</option>
                <option value="reactivos">Reactivos</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div>
              <label className="label">Folio de factura</label>
              <input className="input" value={form.folio_factura} onChange={e => setForm(f => ({ ...f, folio_factura: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Registrar</button>
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="table-wrapper">
        <table className="w-full">
          <thead className="table-head"><tr><th className="table-cell">Fecha</th><th className="table-cell">Sucursal</th><th className="table-cell">Categoría</th><th className="table-cell">Folio</th><th className="table-cell">Monto</th><th className="table-cell text-right">Acción</th></tr></thead>
          <tbody>
            {items.map(e => (
              <tr key={e.id} className="table-row">
                <td className="table-cell text-ink-secondary">{new Date(e.fecha).toLocaleDateString('es-MX')}</td>
                <td className="table-cell">{e.sucursales?.nombre}</td>
                <td className="table-cell"><span className="badge badge-amber">{e.categoria}</span></td>
                <td className="table-cell text-ink-secondary">{e.folio_factura || '—'}</td>
                <td className="table-cell font-semibold text-red-300">${Number(e.monto).toFixed(2)}</td>
                <td className="table-cell text-right">
                  <button className="btn-danger px-2.5 py-1.5" onClick={async () => { if (confirm('¿Eliminar?')) { await api.delete(`/api/egresos/${e.id}`); load(); } }}>
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
