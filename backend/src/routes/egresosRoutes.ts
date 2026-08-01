import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { listEgresos, createEgreso, deleteEgreso } from '../controllers/egresosController';

const router = Router();
router.use(authMiddleware as any);

router.get('/', listEgresos);
router.post('/', createEgreso);
router.delete('/:id', deleteEgreso);

export default router;
