import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FlaskConical, LayoutDashboard, Users, ClipboardList,
  BookOpen, Building2, UserCog, Banknote, BarChart3,
  Bell, LogOut, ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/ordenes',      icon: ClipboardList,   label: 'Órdenes' },
  { to: '/pacientes',    icon: Users,           label: 'Pacientes' },
  { to: '/catalogo',     icon: BookOpen,        label: 'Catálogo' },
  { to: '/sucursales',   icon: Building2,       label: 'Sucursales' },
  { to: '/medicos',      icon: UserCog,         label: 'Médicos' },
  { to: '/egresos',      icon: Banknote,        label: 'Egresos' },
  { to: '/reportes',     icon: BarChart3,       label: 'Reportes' },
  { to: '/recordatorios',icon: Bell,            label: 'Recordatorios' },
];

export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex flex-col border-r border-white/10 bg-white/[0.04] backdrop-blur-xl shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-brand-500/25 border border-brand-400/40 rounded-xl flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">Laboratorio</p>
            <p className="text-xs text-white/40">Sistema de Gestión</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                 ${isActive
                   ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                   : 'text-white/60 hover:text-white hover:bg-white/[0.07]'}`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
              <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/10 p-4">
          <p className="text-xs text-white/40 truncate mb-2">{user?.email}</p>
          <button onClick={handleSignOut} className="btn-ghost w-full flex items-center gap-2 text-sm justify-center">
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
