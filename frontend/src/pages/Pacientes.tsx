import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Plus, Search, ChevronRight, User, X } from 'lucide-react';

interface Paciente { 
  id: string; 
  nombre_completo: string; 
  fecha_nacimiento?: string;
  sexo?: string;
  curp?: string;
  numero_expediente?: string;
  aseguradora?: string;
  no_poliza?: string;
  email: string; 
  whatsapp: string; 
}

// Función auxiliar para iniciales
function getInitials(name: string) {
  if (!name) return 'PA';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function Pacientes() {
  const [items, setItems]   = useState<Paciente[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm]     = useState({ 
    nombre_completo: '', fecha_nacimiento: '', email: '', whatsapp: '',
    sexo: 'Ambos', curp: '', numero_expediente: '', aseguradora: '', no_poliza: ''
  });
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const load = () => api.get<Paciente[]>('/api/pacientes').then(setItems).catch(console.error);
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/api/pacientes', form);
    setForm({ nombre_completo: '', fecha_nacimiento: '', email: '', whatsapp: '', sexo: 'Ambos', curp: '', numero_expediente: '', aseguradora: '', no_poliza: '' });
    setShowForm(false);
    load();
  };

  const filtered = items.filter(p =>
    p.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.numero_expediente?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Directorio de Pacientes</h1>
          <p className="page-sub">Base de datos de pacientes ({items.length} registrados)</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Cancelar' : 'Nuevo paciente'}
        </button>
      </div>

      {/* Formulario (Glass Panel) */}
      {showForm && (
        <form onSubmit={submit} className="glass p-6 sm:p-8 space-y-6 animate-slide-up">
          <div className="flex items-center gap-2 border-b border-subtle pb-4">
            <div className="w-8 h-8 rounded-full bg-lab-50 flex items-center justify-center text-lab-600">
              <User className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-ink-primary text-lg">Registro de Paciente</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <label className="label">Nombre completo</label>
              <input className="input" placeholder="Nombre(s) y apellidos" value={form.nombre_completo} onChange={e => setForm(f => ({ ...f, nombre_completo: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Fecha de nacimiento</label>
              <input type="date" className="input" value={form.fecha_nacimiento} onChange={e => setForm(f => ({ ...f, fecha_nacimiento: e.target.value }))} />
            </div>
            <div>
              <label className="label">Sexo</label>
              <select className="input" value={form.sexo} onChange={e => setForm(f => ({ ...f, sexo: e.target.value }))}>
                <option value="Ambos">No especificar</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
            <div>
              <label className="label">CURP</label>
              <input className="input" placeholder="Formato oficial" value={form.curp} onChange={e => setForm(f => ({ ...f, curp: e.target.value }))} />
            </div>
            <div>
              <label className="label">No. Expediente (Opcional)</label>
              <input className="input" placeholder="Generado autom. si se omite" value={form.numero_expediente} onChange={e => setForm(f => ({ ...f, numero_expediente: e.target.value }))} />
            </div>
            <div>
              <label className="label">Aseguradora</label>
              <input className="input" placeholder="Ej. GNP, AXA..." value={form.aseguradora} onChange={e => setForm(f => ({ ...f, aseguradora: e.target.value }))} />
            </div>
            <div>
              <label className="label">No. Póliza</label>
              <input className="input" value={form.no_poliza} onChange={e => setForm(f => ({ ...f, no_poliza: e.target.value }))} />
            </div>
            <div>
              <label className="label">Email de contacto</label>
              <input type="email" className="input" placeholder="correo@ejemplo.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">WhatsApp / Teléfono</label>
              <input className="input" placeholder="+52 ..." value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-subtle">
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar paciente</button>
          </div>
        </form>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
          <input className="input pl-10" placeholder="Buscar por nombre, expediente o email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper animate-slide-up" style={{ animationDelay: '100ms' }}>
        <table className="w-full text-left">
          <thead className="table-head">
            <tr>
              <th className="table-cell">Paciente</th>
              <th className="table-cell">Expediente</th>
              <th className="table-cell">Contacto</th>
              <th className="table-cell">Aseguradora</th>
              <th className="table-cell text-right">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-ink-secondary text-sm">
                  No se encontraron pacientes registrados
                </td>
              </tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id} className="table-row cursor-pointer group" onClick={() => navigate(`/pacientes/${p.id}`)}>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-lab-100 flex items-center justify-center text-lab-700 font-bold text-xs shadow-sm">
                        {getInitials(p.nombre_completo)}
                      </div>
                      <div>
                        <p className="font-semibold text-ink-primary">{p.nombre_completo}</p>
                        {p.fecha_nacimiento && (
                          <p className="text-[11px] text-ink-tertiary">
                            Nac: {new Date(p.fecha_nacimiento).toLocaleDateString('es-MX')}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    {p.numero_expediente ? <span className="folio">{p.numero_expediente}</span> : <span className="text-ink-tertiary text-xs">-</span>}
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-ink-secondary">{p.email || <span className="text-ink-tertiary italic">Sin email</span>}</div>
                    <div className="text-xs text-ink-tertiary mt-0.5">{p.whatsapp || 'Sin teléfono'}</div>
                  </td>
                  <td className="table-cell text-ink-secondary">
                    {p.aseguradora ? (
                      <div>
                        <p className="text-sm font-medium">{p.aseguradora}</p>
                        <p className="text-[10px] text-ink-tertiary">{p.no_poliza}</p>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="table-cell text-right">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg group-hover:bg-surface-hover text-ink-tertiary transition-colors">
                      <ChevronRight className="w-4 h-4" />
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
