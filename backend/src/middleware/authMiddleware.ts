import { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/supabase';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    rol: string;
    sucursal_id: string | null;
    sucursal_tipo: string | null;
  };
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  // Validar token directamente contra Supabase Auth (no necesita JWT_SECRET manual)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Token inválido o expirado' });

  // Buscar perfil en public.usuarios con service_role (bypasea RLS)
  const { data: usuario, error: dbError } = await supabase
    .from('usuarios')
    .select('id, rol, sucursal_id, sucursales(tipo)')
    .eq('id', user.id)
    .single();

  if (dbError || !usuario) {
    // Si el usuario no tiene perfil aún, le damos acceso básico de admin para demo
    req.user = { id: user.id, rol: 'admin', sucursal_id: null, sucursal_tipo: null };
    return next();
  }

  req.user = {
    id: usuario.id,
    rol: usuario.rol,
    sucursal_id: usuario.sucursal_id,
    sucursal_tipo: (usuario as any).sucursales?.tipo ?? null,
  };

  next();
}

export function requireRol(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
}

export function requireMatriz(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.sucursal_tipo !== 'matriz' && req.user?.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo la sede matriz puede realizar esta acción' });
  }
  next();
}
