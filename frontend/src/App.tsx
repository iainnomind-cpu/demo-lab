import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/Layout/DashboardLayout';
import Login         from './pages/Login';
import Dashboard     from './pages/Dashboard';
import Sucursales    from './pages/Sucursales';
import Medicos       from './pages/Medicos';
import Catalogo      from './pages/Catalogo';
import Pacientes     from './pages/Pacientes';
import PacienteDetalle from './pages/PacienteDetalle';
import Ordenes       from './pages/Ordenes';
import Egresos       from './pages/Egresos';
import Reportes      from './pages/Reportes';
import Recordatorios from './pages/Recordatorios';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-white/50">Cargando…</div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route path="/dashboard"     element={<Dashboard />} />
        <Route path="/sucursales"    element={<Sucursales />} />
        <Route path="/medicos"       element={<Medicos />} />
        <Route path="/catalogo"      element={<Catalogo />} />
        <Route path="/pacientes"     element={<Pacientes />} />
        <Route path="/pacientes/:id" element={<PacienteDetalle />} />
        <Route path="/ordenes"       element={<Ordenes />} />
        <Route path="/egresos"       element={<Egresos />} />
        <Route path="/reportes"      element={<Reportes />} />
        <Route path="/recordatorios" element={<Recordatorios />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
