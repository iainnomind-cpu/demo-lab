import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id, rol, sucursal_id, sucursales(tipo)')
      .eq('id', decoded.sub)
      .single();

    if (error || !usuario) return res.status(401).json({ error: 'Usuario no encontrado' });

    req.user = {
      id: usuario.id,
      rol: usuario.rol,
      sucursal_id: usuario.sucursal_id,
      sucursal_tipo: (usuario as any).sucursales?.tipo ?? null,
    };

    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
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
