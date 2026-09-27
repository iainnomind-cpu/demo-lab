import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Play, CheckCircle2, XCircle, Clock, Plus, MessageCircle, Mail, Trash2, Send } from 'lucide-react';

const ESTADO_ICON: Record<string, any> = {
  pendiente: { icon: Clock,         cls: 'text-amber-500'  },
  enviado:   { icon: CheckCircle2,  cls: 'text-emerald-500' },
  fallido:   { icon: XCircle,       cls: 'text-red-500'    },
};

const META_STATUS_COLORS: Record<string, string> = {
  borrador: 'badge-gray',
  en_revision: 'badge-amber',
  aprobada: 'badge-green',
  rechazada: 'badge-red'
};

export default function Marketing() {
  const [tab, setTab] = useState<'plantillas' | 'historial'>('plantillas');
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [historial, setHistorial] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nombre: '', canal: 'whatsapp', tipo_notificacion: 'marketing', contenido: '' });

  const loadPlantillas = () => api.get<any[]>('/api/plantillas').then(setPlantillas).catch(console.error);
  const loadHistorial = () => api.get<any[]>('/api/recordatorios').then(setHistorial).catch(console.error);

  useEffect(() => { 
    if (tab === 'plantillas') loadPlantillas();
    else loadHistorial();
  }, [tab]);

  const runMotor = async () => {
    setRunning(true);
    try {
      const r = await api.post<any>('/api/recordatorios/motor', {});
      setResult(r);
      loadHistorial();
    } catch (err: any) { alert(err.message); }
    finally { setRunning(false); }
  };

  const handleSavePlantilla = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/plantillas', form);
      setShowModal(false);
      setForm({ nombre: '', canal: 'whatsapp', tipo_notificacion: 'marketing', contenido: '' });
      loadPlantillas();
    } catch (err: any) { alert(err.message); }
  };

  const enviarARevision = async (id: string) => {
    try {
      await api.patch(`/api/plantillas/${id}/enviar-revision`, {});
      loadPlantillas();
      // Simular aprobación automática de Meta después de 3 segundos
      setTimeout(async () => {
        await api.patch(`/api/plantillas/${id}/aprobar`, {});
        loadPlantillas();
      }, 3000);
    } catch (err: any) { alert(err.message); }
  };

  const deletePlantilla = async (id: string) => {
    if(!confirm('¿Eliminar plantilla?')) return;
    try {
      await api.delete(`/api/plantillas/${id}`);
      loadPlantillas();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Marketing & Notificaciones</h1>
          <p className="page-sub">Gestión de plantillas Meta y retención de pacientes</p>
        </div>
        
        <div className="flex bg-surface-card p-1 rounded-lg border border-subtle w-max">
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'plantillas' ? 'bg-lab-50 text-lab-700 shadow-sm' : 'text-ink-secondary hover:text-ink-primary'}`}
            onClick={() => setTab('plantillas')}
          >
            Gestor de Plantillas
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'historial' ? 'bg-lab-50 text-lab-700 shadow-sm' : 'text-ink-secondary hover:text-ink-primary'}`}
            onClick={() => setTab('historial')}
          >
            Historial y Recordatorios
          </button>
        </div>
      </div>

      {tab === 'plantillas' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex justify-end">
            <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4" /> Nueva Plantilla
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {plantillas.map(p => (
              <div key={p.id} className="glass p-5 space-y-4 relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-ink-primary truncate max-w-[200px]">{p.nombre}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {p.canal === 'whatsapp' ? <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" /> : <Mail className="w-3.5 h-3.5 text-indigo-500" />}
                      <span className="text-xs text-ink-secondary capitalize">{p.canal} - {p.tipo_notificacion}</span>
                    </div>
                  </div>
                  <span className={`badge ${META_STATUS_COLORS[p.estado_meta] || 'badge-gray'}`}>
                    {p.estado_meta.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="bg-surface-subtle p-3 rounded-lg text-sm text-ink-secondary whitespace-pre-wrap font-mono border border-subtle">
                  {p.contenido}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-subtle">
                  <div className="flex gap-2">
                    <button className="p-1.5 text-ink-tertiary hover:text-lab-600 transition-colors" onClick={() => deletePlantilla(p.id)} title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  {p.estado_meta === 'borrador' && (
                    <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5" onClick={() => enviarARevision(p.id)}>
                      <Send className="w-3.5 h-3.5" /> Enviar a Meta
                    </button>
                  )}
                  {p.estado_meta === 'en_revision' && (
                    <span className="text-xs text-amber-600 flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> En revisión...</span>
                  )}
                </div>
              </div>
            ))}
            {plantillas.length === 0 && (
              <div className="col-span-full py-12 text-center text-ink-tertiary">No hay plantillas creadas. Crea una para empezar.</div>
            )}
          </div>
        </div>
      )}

      {tab === 'historial' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex justify-end">
            <button className="btn-primary flex items-center gap-2" onClick={runMotor} disabled={running}>
              <Play className="w-4 h-4" />{running ? 'Ejecutando motor…' : 'Ejecutar Motor de Retención'}
            </button>
          </div>

          {result && (
            <div className="glass p-4 flex gap-6">
              <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-5 h-5" /><span className="font-semibold">{result.enviados}</span><span className="text-ink-secondary text-sm">enviados</span></div>
              <div className="flex items-center gap-2 text-red-600"><XCircle className="w-5 h-5" /><span className="font-semibold">{result.errores}</span><span className="text-ink-secondary text-sm">errores</span></div>
            </div>
          )}

          <div className="table-wrapper">
            <table className="w-full">
              <thead className="table-head"><tr><th className="table-cell">Fecha</th><th className="table-cell">Paciente</th><th className="table-cell">Estudio (Motivo)</th><th className="table-cell">Estado</th></tr></thead>
              <tbody>
                {historial.map(r => {
                  const { icon: Icon, cls } = ESTADO_ICON[r.estado] || ESTADO_ICON.pendiente;
                  return (
                    <tr key={r.id} className="table-row">
                      <td className="table-cell text-ink-secondary">{new Date(r.fecha_generacion).toLocaleDateString('es-MX')}</td>
                      <td className="table-cell font-medium text-ink-primary">{r.pacientes?.nombre_completo}</td>
                      <td className="table-cell text-ink-secondary">{r.estudios_catalogo?.nombre}</td>
                      <td className="table-cell"><span className={`flex items-center gap-1.5 text-sm font-medium ${cls}`}><Icon className="w-4 h-4" />{r.estado}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nueva Plantilla */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-primary/20 backdrop-blur-sm animate-fade-in p-4">
          <div className="glass max-w-lg w-full p-6 animate-slide-up shadow-xl border border-subtle">
            <h2 className="text-xl font-bold text-ink-primary mb-4">Nueva Plantilla Meta</h2>
            <form onSubmit={handleSavePlantilla} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-secondary mb-1">Nombre (identificador interno)</label>
                <input type="text" required className="input" placeholder="ej. promo_verano_2026" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-secondary mb-1">Canal</label>
                  <select className="input" value={form.canal} onChange={e => setForm({...form, canal: e.target.value})}>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-secondary mb-1">Categoría Meta</label>
                  <select className="input" value={form.tipo_notificacion} onChange={e => setForm({...form, tipo_notificacion: e.target.value})}>
                    <option value="marketing">Marketing</option>
                    <option value="utilidad">Utilidad / Servicio</option>
                    <option value="autenticacion">Autenticación</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-secondary mb-1">Mensaje (usa {'{{1}}'} para variables)</label>
                <textarea required rows={4} className="input" placeholder="Hola {{1}}, te esperamos..." value={form.contenido} onChange={e => setForm({...form, contenido: e.target.value})} />
                <p className="text-xs text-ink-tertiary mt-2">
                  La plantilla se creará en "Borrador" y deberás enviarla a revisión. El proceso de Meta demora usualmente menos de 24 horas.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-subtle mt-6">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Borrador</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
