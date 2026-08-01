import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ClipboardList, CheckCircle2, Clock, Package } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ ordenes: 0, procesadas: 0, pendientes: 0, pacientes: 0 });

  useEffect(() => {
    Promise.all([
      api.get<any[]>('/api/ordenes'),
      api.get<any[]>('/api/pacientes'),
    ]).then(([ordenes, pacientes]) => {
      setStats({
        ordenes:    ordenes.length,
        procesadas: ordenes.filter(o => o.estado === 'procesada').length,
        pendientes: ordenes.filter(o => o.estado === 'muestra_tomada').length,
        pacientes:  pacientes.length,
      });
    }).catch(console.error);
  }, []);

  const cards = [
    { label: 'Total Órdenes',    value: stats.ordenes,    icon: ClipboardList, color: 'text-brand-400',   bg: 'bg-brand-500/10'   },
    { label: 'Pendientes',       value: stats.pendientes, icon: Clock,         color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
    { label: 'Procesadas',       value: stats.procesadas, icon: CheckCircle2,  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Pacientes',        value: stats.pacientes,  icon: Package,       color: 'text-purple-400',  bg: 'bg-purple-500/10'  },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Resumen general del laboratorio</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-2`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
