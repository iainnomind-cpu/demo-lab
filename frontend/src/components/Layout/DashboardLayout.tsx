import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ClipboardList, Users, BookOpen,
  Building2, UserCog, Banknote, BarChart3,
  Bell, LogOut, CreditCard, Settings, UsersRound,
  ChevronRight, Activity, FlaskConical
} from 'lucide-react';

/* ── Grupos de navegación ── */
const navGroups = [
  {
    label: 'Operativo',
    items: [
      { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/ordenes',       icon: ClipboardList,   label: 'Órdenes' },
      { to: '/pacientes',     icon: Users,           label: 'Pacientes' },
      { to: '/recordatorios', icon: Bell,            label: 'Recordatorios' },
    ],
  },
  {
    label: 'Catálogos',
    items: [
      { to: '/catalogo',   icon: BookOpen,   label: 'Estudios' },
      { to: '/medicos',    icon: UserCog,    label: 'Médicos' },
      { to: '/sucursales', icon: Building2,  label: 'Sucursales' },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { to: '/egresos',   icon: Banknote,   label: 'Egresos' },
      { to: '/pagos',     icon: CreditCard, label: 'Pagos' },
      { to: '/reportes',  icon: BarChart3,  label: 'Reportes' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/usuarios',      icon: UsersRound, label: 'Usuarios' },
      { to: '/configuracion', icon: Settings,   label: 'Configuración' },
    ],
  },
];

/* ── Helpers ── */
function getInitials(email: string) {
  return email?.slice(0, 2).toUpperCase() ?? 'US';
}

export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f0f4f8' }}>

      {/* ══ SIDEBAR ══════════════════════════════ */}
      <aside
        className="w-56 flex flex-col shrink-0 border-r border-white/[0.06]"
        style={{ background: 'linear-gradient(180deg, #060e1c 0%, #080f1e 100%)' }}
      >
        {/* Brand ──────────────────────────────── */}
        <div className="px-4 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            {/* Logo icon — átomo estilizado */}
            <div className="relative w-8 h-8 flex-shrink-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,148,136,0.3) 0%, rgba(15,118,110,0.15) 100%)',
                  border: '1px solid rgba(13,148,136,0.4)',
                  boxShadow: '0 0 12px rgba(13,148,136,0.25)',
                }}
              >
                <FlaskConical className="w-4 h-4 text-lab-400" />
              </div>
              {/* Online dot */}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                style={{ background: '#10b981', borderColor: '#060e1c', boxShadow: '0 0 6px rgba(16,185,129,0.7)' }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white leading-tight tracking-tight truncate">BioLab</p>
              <p className="text-[10px] text-lab-400 font-medium tracking-wider uppercase">Pro System</p>
            </div>
          </div>
        </div>

        {/* Nav grupos ─────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="px-2 mb-1 text-[9.5px] font-bold tracking-[0.12em] uppercase text-white/25 select-none">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[0.8125rem] font-medium transition-all duration-200 relative
                       ${isActive
                         ? 'text-white'
                         : 'text-white/45 hover:text-white/80 hover:bg-white/[0.04]'
                       }`
                    }
                    style={({ isActive }) => isActive ? {
                      background: 'linear-gradient(135deg, rgba(13,148,136,0.2) 0%, rgba(13,148,136,0.08) 100%)',
                      border: '1px solid rgba(13,148,136,0.25)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                    } : {}}
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active left bar */}
                        {isActive && (
                          <span
                            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                            style={{ background: 'linear-gradient(180deg, #2dd4bf, #0d9488)' }}
                          />
                        )}
                        <Icon
                          className={`w-[15px] h-[15px] shrink-0 transition-colors ${isActive ? 'text-lab-400' : 'text-white/35 group-hover:text-white/60'}`}
                        />
                        <span className="flex-1 truncate">{label}</span>
                        {isActive && (
                          <ChevronRight className="w-3 h-3 text-lab-500 opacity-60" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Activity indicator ─────────────────── */}
        <div className="px-3 py-2 mx-2 mb-2 rounded-xl" style={{ background: 'rgba(13,148,136,0.07)', border: '1px solid rgba(13,148,136,0.12)' }}>
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-lab-500" />
            <span className="text-[10px] text-white/40">Sistema operativo</span>
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 4px rgba(52,211,153,0.8)' }} />
          </div>
        </div>

        {/* User footer ────────────────────────── */}
        <div className="border-t border-white/[0.06] p-3">
          <div className="flex items-center gap-2.5 mb-2">
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                boxShadow: '0 0 8px rgba(13,148,136,0.3)',
              }}
            >
              {getInitials(user?.email ?? '')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] text-white/60 truncate">{user?.email}</p>
              <p className="text-[9px] text-lab-500 font-medium uppercase tracking-wider">Administrador</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs text-white/40 hover:text-red-400 transition-all duration-200 hover:bg-red-500/10"
          >
            <LogOut className="w-3 h-3" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ════════════════════════ */}
      <main className="flex-1 overflow-y-auto" style={{ background: '#f0f4f8' }}>
        {/* Top header bar */}
        <div
          className="sticky top-0 z-10 px-6 py-3 flex items-center gap-3 border-b"
          style={{
            background: 'rgba(240,244,248,0.85)',
            backdropFilter: 'blur(12px)',
            borderColor: '#e2e8f0',
          }}
        >
          <div className="h-1 w-8 rounded-full" style={{ background: 'linear-gradient(90deg, #0d9488, #2dd4bf)' }} />
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#94a3b8' }}>
            <span className="status-dot status-dot-green" />
            <span>Sistema operativo</span>
          </div>
        </div>
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>

    </div>
  );
}



