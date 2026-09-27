import { Router } from 'express';
import { authMiddleware, requireRol } from '../middleware/authMiddleware';
import * as c from '../controllers/usuariosController';

const router = Router();
router.use(authMiddleware as any);

router.get('/', requireRol('admin') as any, c.listUsuarios);
router.patch('/:id', requireRol('admin') as any, c.updateUsuario);
router.delete('/:id', requireRol('admin') as any, c.deleteUsuario);

export default router;
