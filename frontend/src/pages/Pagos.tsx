import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Search, DollarSign, X } from 'lucide-react';

interface Pago {
  id: string;
  orden_id: string;
  monto: number;
  metodo_pago: string;
  fecha_pago: string;
  referencia: string;
}

interface Orden {
  id: string;
  folio: string;
  costo_total: number;
  estado_pago: string;
  pacientes: { nombre_completo: string };
}

export default function Pagos() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [ordenesPendientes, setOrdenesPendientes] = useState<Orden[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ orden_id: '', monto: 0, metodo_pago: 'efectivo', referencia: '' });
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const p = await api.get<Pago[]>('/api/pagos');
      setPagos(p);
      
      const o = await api.get<Orden[]>('/api/ordenes');
      setOrdenesPendientes(o.filter(x => x.estado_pago !== 'pagado'));
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/pagos/orden/${form.orden_id}`, {
        monto: form.monto,
        metodo_pago: form.metodo_pago,
        referencia: form.referencia
      });
      setForm({ orden_id: '', monto: 0, metodo_pago: 'efectivo', referencia: '' });
      setShowForm(false);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredPagos = pagos.filter(p => 
    p.referencia?.toLowerCase().includes(search.toLowerCase()) || 
    p.metodo_pago.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Historial de Pagos</h1>
          <p className="page-sub">Gestión de abonos y cuentas por cobrar</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Registrar Pago'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="glass p-6 sm:p-8 space-y-6 animate-slide-up">
          <div className="flex items-center gap-2 border-b border-subtle pb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-ink-primary text-lg">Registrar Nuevo Abono</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="label">Orden Pendiente</label>
              <select className="input" value={form.orden_id} onChange={e => setForm(f => ({ ...f, orden_id: e.target.value }))} required>
                <option value="">Seleccionar orden…</option>
                {ordenesPendientes.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.folio || 'Sin folio'} - {o.pacientes?.nombre_completo} (Total: ${o.costo_total})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Monto a abonar ($)</label>
              <input type="number" min="0.01" step="0.01" className="input font-semibold text-lg" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: Number(e.target.value) }))} required />
            </div>
            <div>
              <label className="label">Método de Pago</label>
              <select className="input" value={form.metodo_pago} onChange={e => setForm(f => ({ ...f, metodo_pago: e.target.value }))}>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Referencia (Opcional)</label>
              <input className="input" value={form.referencia} onChange={e => setForm(f => ({ ...f, referencia: e.target.value }))} placeholder="Folio de terminal, ticket, clave de rastreo, etc." />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-subtle">
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Registrar Pago</button>
          </div>
        </form>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
          <input className="input pl-10" placeholder="Buscar pagos por referencia o método…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-wrapper animate-slide-up" style={{ animationDelay: '100ms' }}>
        <table className="w-full text-left">
          <thead className="table-head">
            <tr>
              <th className="table-cell">Fecha</th>
              <th className="table-cell">Orden ID</th>
              <th className="table-cell">Método</th>
              <th className="table-cell">Referencia</th>
              <th className="table-cell text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            {filteredPagos.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-ink-secondary text-sm">
                  No hay pagos registrados
                </td>
              </tr>
            ) : (
              filteredPagos.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="table-cell text-ink-secondary">{new Date(p.fecha_pago).toLocaleString('es-MX')}</td>
                  <td className="table-cell font-medium text-xs text-lab-600">{p.orden_id.slice(0, 8)}...</td>
                  <td className="table-cell"><span className="badge badge-blue">{p.metodo_pago}</span></td>
                  <td className="table-cell text-ink-secondary">{p.referencia || '-'}</td>
                  <td className="table-cell font-bold text-emerald-600 text-right">+${Number(p.monto).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
