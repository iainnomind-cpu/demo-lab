import { Router } from 'express';
import { authMiddleware, requireMatriz } from '../middleware/authMiddleware';
import { createOrden, listOrdenes, updateEstadoOrden } from '../controllers/ordenController';

const router = Router();
router.use(authMiddleware as any);

router.get('/', listOrdenes);
router.post('/', createOrden);
router.patch('/:id/estado', requireMatriz as any, updateEstadoOrden);

export default router;
