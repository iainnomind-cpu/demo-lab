import { Router } from 'express';
import { supabase } from '../services/supabase';

const router = Router();

// Registrar usuario en tabla `usuarios` tras signup de Supabase Auth
router.post('/register-profile', async (req, res) => {
  const { id, rol, sucursal_id, nombre } = req.body;
  if (!id || !rol) return res.status(400).json({ error: 'id y rol requeridos' });

  const { error } = await supabase
    .from('usuarios')
    .upsert({ id, rol, sucursal_id: sucursal_id || null, nombre: nombre || null });

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ ok: true });
});

export default router;
