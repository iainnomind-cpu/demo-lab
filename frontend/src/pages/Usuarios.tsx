import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';

interface Usuario {
  id: string;
  email: string;
  role: string;
  nombre_completo?: string;
  sucursal_id?: string;
}

interface Sucursal {
  id: string;
  nombre: string;
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [form, setForm] = useState({ email: '', password: '', role: 'quimico', nombre_completo: '', sucursal_id: '' });
  const [editing, setEditing] = useState<string | null>(null);

  const load = async () => {
    try {
      const [u, s] = await Promise.all([
        api.get<Usuario[]>('/api/usuarios'),
        api.get<Sucursal[]>('/api/sucursales')
      ]);
      setUsuarios(u);
      setSucursales(s);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.patch(`/api/usuarios/${editing}`, { ...form, password: form.password || undefined });
      } else {
        await api.post('/api/usuarios', form);
      }
      setForm({ email: '', password: '', role: 'quimico', nombre_completo: '', sucursal_id: '' });
      setEditing(null);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Gestión de Usuarios</h1>
        <p className="page-sub">Administración de accesos y personal</p>
      </div>

      <form onSubmit={submit} className="glass p-6 sm:p-8 space-y-6 animate-slide-up">
        <div className="flex items-center gap-2 border-b border-subtle pb-4">
          <div className="w-8 h-8 rounded-full bg-lab-50 flex items-center justify-center text-lab-600">
            <Users className="w-4 h-4" />
          </div>
          <h2 className="font-semibold text-ink-primary text-lg">{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="label">Nombre Completo</label>
            <input className="input" value={form.nombre_completo} onChange={e => setForm(f => ({ ...f, nombre_completo: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Contraseña <span className="text-xs font-normal text-ink-tertiary">{editing && '(Dejar en blanco para no cambiar)'}</span></label>
            <input type="password" className="input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required={!editing} />
          </div>
          <div>
            <label className="label">Rol de Sistema</label>
            <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="admin">Administrador</option>
              <option value="quimico">Químico (Resultados)</option>
              <option value="recepcionista">Recepcionista (Caja/Órdenes)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Sucursal Asignada</label>
            <select className="input" value={form.sucursal_id} onChange={e => setForm(f => ({ ...f, sucursal_id: e.target.value }))}>
              <option value="">Todas (Matriz / Global)</option>
              {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-subtle">
          {editing && (
            <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm({ email: '', password: '', role: 'quimico', nombre_completo: '', sucursal_id: '' }); }}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn-primary flex items-center gap-2">
            {editing ? 'Guardar Cambios' : <><Plus className="w-4 h-4" /> Crear Usuario</>}
          </button>
        </div>
      </form>

      <div className="table-wrapper animate-slide-up" style={{ animationDelay: '100ms' }}>
        <table className="w-full text-left">
          <thead className="table-head">
            <tr>
              <th className="table-cell">Nombre</th>
              <th className="table-cell">Email</th>
              <th className="table-cell">Rol</th>
              <th className="table-cell">Sucursal</th>
              <th className="table-cell text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-ink-secondary text-sm">
                  Cargando usuarios...
                </td>
              </tr>
            ) : (
              usuarios.map(u => (
                <tr key={u.id} className="table-row">
                  <td className="table-cell font-medium text-ink-primary">{u.nombre_completo || '-'}</td>
                  <td className="table-cell text-ink-secondary">{u.email}</td>
                  <td className="table-cell">
                    <span className={`badge ${u.role === 'admin' ? 'bg-red-50 text-red-600' : u.role === 'quimico' ? 'badge-blue' : 'bg-surface-subtle text-ink-secondary'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="table-cell text-ink-secondary">{sucursales.find(s => s.id === u.sucursal_id)?.nombre || 'Todas'}</td>
                  <td className="table-cell text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-2 rounded-lg text-ink-tertiary hover:text-lab-600 hover:bg-lab-50 transition-colors" onClick={() => { 
                        setEditing(u.id); 
                        setForm({ email: u.email, password: '', role: u.role, nombre_completo: u.nombre_completo || '', sucursal_id: u.sucursal_id || '' }); 
                      }}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg text-ink-tertiary hover:text-red-600 hover:bg-red-50 transition-colors" onClick={async () => { if (confirm('¿Eliminar usuario de forma permanente?')) { await api.delete(`/api/usuarios/${u.id}`); load(); } }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
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
