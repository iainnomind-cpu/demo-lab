import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import * as c from '../controllers/pagosController';

const router = Router();
router.use(authMiddleware as any);

router.post('/', c.registrarPago);
router.get('/orden/:orden_id', c.getPagosOrden);

export default router;
