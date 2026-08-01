import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Bell, Play, CheckCircle2, XCircle, Clock } from 'lucide-react';

const ESTADO_ICON: Record<string, any> = {
  pendiente: { icon: Clock,         cls: 'text-amber-400'  },
  enviado:   { icon: CheckCircle2,  cls: 'text-emerald-400' },
  fallido:   { icon: XCircle,       cls: 'text-red-400'    },
};

export default function Recordatorios() {
  const [items, setItems]   = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const load = () => api.get<any[]>('/api/recordatorios').then(setItems).catch(console.error);
  useEffect(() => { load(); }, []);

  const runMotor = async () => {
    setRunning(true);
    try {
      const r = await api.post<any>('/api/recordatorios/motor', {});
      setResult(r);
      load();
    } catch (err: any) { alert(err.message); }
    finally { setRunning(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Recordatorios</h1><p className="page-sub">Motor de retención de pacientes</p></div>
        <button className="btn-primary flex items-center gap-2" onClick={runMotor} disabled={running}>
          <Play className="w-4 h-4" />{running ? 'Ejecutando…' : 'Ejecutar motor'}
        </button>
      </div>

      {result && (
        <div className="glass-sm p-4 flex gap-6 animate-slide-up">
          <div className="flex items-center gap-2 text-emerald-300"><CheckCircle2 className="w-5 h-5" /><span className="font-semibold">{result.enviados}</span><span className="text-white/60 text-sm">enviados</span></div>
          <div className="flex items-center gap-2 text-red-300"><XCircle className="w-5 h-5" /><span className="font-semibold">{result.errores}</span><span className="text-white/60 text-sm">errores</span></div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="w-full">
          <thead className="table-head"><tr><th className="table-cell">Fecha</th><th className="table-cell">Paciente</th><th className="table-cell">Estudio</th><th className="table-cell">Estado</th></tr></thead>
          <tbody>
            {items.map(r => {
              const { icon: Icon, cls } = ESTADO_ICON[r.estado] || ESTADO_ICON.pendiente;
              return (
                <tr key={r.id} className="table-row">
                  <td className="table-cell text-white/60">{new Date(r.fecha_generacion).toLocaleDateString('es-MX')}</td>
                  <td className="table-cell font-medium">{r.pacientes?.nombre_completo}</td>
                  <td className="table-cell text-white/60">{r.estudios_catalogo?.nombre}</td>
                  <td className="table-cell"><span className={`flex items-center gap-1.5 text-sm font-medium ${cls}`}><Icon className="w-4 h-4" />{r.estado}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
