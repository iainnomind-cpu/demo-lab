import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Save, Settings } from 'lucide-react';

interface Configuracion {
  id: string;
  nombre_laboratorio: string;
  direccion: string;
  telefono: string;
  email_contacto: string;
  logotipo_url: string;
  mensaje_ticket: string;
  whatsapp_notificaciones: string;
}

export default function Configuracion() {
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get<Configuracion>('/api/configuracion');
      setConfig(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    try {
      await api.patch('/api/configuracion', config);
      alert('Configuración guardada exitosamente');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-ink-secondary p-6">Cargando configuración…</div>;
  if (!config) return <div className="text-ink-secondary p-6">Error al cargar la configuración.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Configuración del Sistema</h1>
        <p className="page-sub">Ajustes globales del laboratorio BioLab Pro</p>
      </div>

      <form onSubmit={save} className="glass p-6 sm:p-8 space-y-6 animate-slide-up">
        <div className="flex items-center gap-2 border-b border-subtle pb-4">
          <div className="w-8 h-8 rounded-full bg-lab-50 flex items-center justify-center text-lab-600">
            <Settings className="w-4 h-4" />
          </div>
          <h2 className="font-semibold text-ink-primary text-lg">Datos Generales</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="label">Nombre del Laboratorio</label>
            <input className="input" value={config.nombre_laboratorio || ''} onChange={e => setConfig({ ...config, nombre_laboratorio: e.target.value })} required />
          </div>
          <div>
            <label className="label">Teléfono Principal</label>
            <input className="input" value={config.telefono || ''} onChange={e => setConfig({ ...config, telefono: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Dirección Fiscal / Física</label>
            <input className="input" value={config.direccion || ''} onChange={e => setConfig({ ...config, direccion: e.target.value })} />
          </div>
          <div>
            <label className="label">Email de Contacto</label>
            <input type="email" className="input" value={config.email_contacto || ''} onChange={e => setConfig({ ...config, email_contacto: e.target.value })} />
          </div>
          <div>
            <label className="label">URL del Logotipo</label>
            <input className="input" value={config.logotipo_url || ''} onChange={e => setConfig({ ...config, logotipo_url: e.target.value })} placeholder="https://..." />
          </div>
          <div className="md:col-span-2">
            <label className="label">Mensaje en el Ticket de Venta</label>
            <textarea className="input" value={config.mensaje_ticket || ''} onChange={e => setConfig({ ...config, mensaje_ticket: e.target.value })} rows={2} />
          </div>
          <div className="md:col-span-2">
            <label className="label">WhatsApp para Notificaciones de Sistema</label>
            <input className="input" value={config.whatsapp_notificaciones || ''} onChange={e => setConfig({ ...config, whatsapp_notificaciones: e.target.value })} placeholder="+52..." />
          </div>
        </div>

        <div className="pt-6 border-t border-subtle flex justify-end">
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? 'Guardando cambios…' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  );
}
