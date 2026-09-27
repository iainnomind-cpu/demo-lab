import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Estudio {
  id: string;
  codigo_interno: string | null;
  nombre: string;
  precio: number;
  tipo_muestra: string | null;
  tubo_requerido: string | null;
  requiere_ayuno: boolean;
  horas_ayuno: number | null;
  tiempo_entrega_hrs: number | null;
  area: string | null;
  instrucciones_paciente: string | null;
  meses_recordatorio: number;
}

export default function Catalogo() {
  const [items, setItems] = useState<Estudio[]>([]);
  const [form, setForm] = useState({ 
    nombre: '', precio: 0, meses_recordatorio: 12,
    codigo_interno: '', tipo_muestra: '', tubo_requerido: '', requiere_ayuno: false,
    horas_ayuno: 0, tiempo_entrega_hrs: 24, area: '', instrucciones_paciente: ''
  });
  const [editing, setEditing] = useState<string | null>(null);

  const load = () => api.get<Estudio[]>('/api/estudios').then(setItems).catch(console.error);
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await api.patch(`/api/estudios/${editing}`, form);
    else await api.post('/api/estudios', form);
    setForm({ nombre: '', precio: 0, meses_recordatorio: 12, codigo_interno: '', tipo_muestra: '', tubo_requerido: '', requiere_ayuno: false, horas_ayuno: 0, tiempo_entrega_hrs: 24, area: '', instrucciones_paciente: '' });
    setEditing(null);
    load();
  };

  const openEdit = (e: Estudio) => {
    setEditing(e.id);
    setForm({ 
      nombre: e.nombre, precio: e.precio, meses_recordatorio: e.meses_recordatorio,
      codigo_interno: e.codigo_interno || '', tipo_muestra: e.tipo_muestra || '', tubo_requerido: e.tubo_requerido || '',
      requiere_ayuno: e.requiere_ayuno || false, horas_ayuno: e.horas_ayuno || 0,
      tiempo_entrega_hrs: e.tiempo_entrega_hrs || 24, area: e.area || '', instrucciones_paciente: e.instrucciones_paciente || ''
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="page-title">Catálogo de Estudios</h1>

      <form onSubmit={submit} className="glass p-5 space-y-4">
        <h2 className="text-sm font-semibold text-ink-primary">{editing ? 'Editar estudio' : 'Nuevo estudio'}</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-gray-700">Código Interno</span>
            <input type="text" className="input" value={form.codigo_interno} onChange={e => setForm({ ...form, codigo_interno: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-gray-700">Nombre del Estudio</span>
            <input type="text" className="input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-gray-700">Área</span>
            <input type="text" className="input" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-gray-700">Tipo de Muestra</span>
            <input type="text" className="input" value={form.tipo_muestra} onChange={e => setForm({ ...form, tipo_muestra: e.target.value })} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-gray-700">Tubo Requerido</span>
            <input type="text" className="input" value={form.tubo_requerido} onChange={e => setForm({ ...form, tubo_requerido: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-gray-700">Tiempo Entrega (hrs)</span>
            <input type="number" className="input" value={form.tiempo_entrega_hrs} onChange={e => setForm({ ...form, tiempo_entrega_hrs: Number(e.target.value) })} />
          </label>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <label className="flex items-center gap-2 mt-6">
            <input type="checkbox" checked={form.requiere_ayuno} onChange={e => setForm({ ...form, requiere_ayuno: e.target.checked })} />
            <span className="text-gray-700">¿Requiere Ayuno?</span>
          </label>
          <label className="block">
            <span className="text-gray-700">Horas de Ayuno</span>
            <input type="number" className="input" value={form.horas_ayuno} onChange={e => setForm({ ...form, horas_ayuno: Number(e.target.value) })} disabled={!form.requiere_ayuno} />
          </label>
          <label className="block">
            <span className="text-gray-700">Meses Recordatorio</span>
            <input type="number" className="input" value={form.meses_recordatorio} onChange={e => setForm({ ...form, meses_recordatorio: Number(e.target.value) })} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-gray-700">Precio ($)</span>
            <input type="number" step="0.01" className="input" value={form.precio} onChange={e => setForm({ ...form, precio: Number(e.target.value) })} required />
          </label>
          <label className="block">
            <span className="text-gray-700">Instrucciones Paciente</span>
            <textarea className="input" value={form.instrucciones_paciente} onChange={e => setForm({ ...form, instrucciones_paciente: e.target.value })} rows={2} />
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />{editing ? 'Guardar' : 'Agregar'}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm({ nombre: '', precio: 0, meses_recordatorio: 12, codigo_interno: '', tipo_muestra: '', tubo_requerido: '', requiere_ayuno: false, horas_ayuno: 0, tiempo_entrega_hrs: 24, area: '', instrucciones_paciente: '' }); }}>Cancelar</button>}
        </div>
      </form>

      <div className="table-wrapper">
        <table className="w-full">
          <thead className="table-head">
            <tr>
              <th className="table-cell">Código</th>
              <th className="table-cell">Estudio</th>
              <th className="table-cell">Área / Muestra</th>
              <th className="table-cell">Ayuno</th>
              <th className="table-cell">Precio</th>
              <th className="table-cell text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(est => (
              <tr key={est.id} className="table-row">
                <td className="table-cell">{est.codigo_interno || '-'}</td>
                <td className="table-cell font-medium">{est.nombre} <span className="text-xs text-gray-400">({est.tiempo_entrega_hrs} hrs)</span></td>
                <td className="table-cell">{est.area || 'General'} / {est.tipo_muestra || '-'}</td>
                <td className="table-cell">{est.requiere_ayuno ? `${est.horas_ayuno} hrs` : 'No'}</td>
                <td className="table-cell">${est.precio.toFixed(2)}</td>
                <td className="table-cell text-right">
                  <button className="btn-ghost px-2.5 py-1.5 mr-2" onClick={() => openEdit(est)}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button className="btn-danger px-2.5 py-1.5" onClick={async () => { if (confirm('¿Dar de baja?')) { await api.delete(`/api/estudios/${est.id}`); load(); } }}>
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
