import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { ArrowLeft } from 'lucide-react';

const ESTADO_COLOR: Record<string, string> = {
  muestra_tomada: 'badge-amber',
  procesada:      'badge-blue',
  entregada:      'badge-green',
};

export default function PacienteDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get<any>(`/api/pacientes/${id}`).then(setData).catch(console.error);
  }, [id]);

  if (!data) return <div className="text-white/50 text-center py-20">Cargando…</div>;

  return (
    <div className="space-y-6">
      <button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4" />Volver
      </button>

      <div className="glass p-6">
        <h1 className="text-xl font-bold text-white">{data.nombre_completo}</h1>
        <div className="mt-2 flex gap-6 text-sm text-white/50">
          <span>{data.email || 'Sin email'}</span>
          <span>{data.whatsapp || 'Sin WhatsApp'}</span>
          {data.fecha_nacimiento && <span>Nac: {new Date(data.fecha_nacimiento).toLocaleDateString('es-MX')}</span>}
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-white mb-3">Historial de Órdenes</h2>
        <div className="table-wrapper">
          <table className="w-full">
            <thead className="table-head"><tr><th className="table-cell">Fecha</th><th className="table-cell">Sucursal</th><th className="table-cell">Estudios</th><th className="table-cell">Total</th><th className="table-cell">Estado</th></tr></thead>
            <tbody>
              {(data.historial ?? []).map((o: any) => (
                <tr key={o.id} className="table-row">
                  <td className="table-cell">{new Date(o.fecha_creacion).toLocaleDateString('es-MX')}</td>
                  <td className="table-cell">{o.sucursales?.nombre}</td>
                  <td className="table-cell text-white/60 text-xs">{(o.ordenes_estudios ?? []).map((oe: any) => oe.estudios_catalogo?.nombre).join(', ')}</td>
                  <td className="table-cell font-semibold">${Number(o.costo_total).toFixed(2)}</td>
                  <td className="table-cell"><span className={`badge ${ESTADO_COLOR[o.estado] || 'badge-blue'}`}>{o.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
