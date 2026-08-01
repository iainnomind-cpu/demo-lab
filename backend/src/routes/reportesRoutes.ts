import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getReporteIngresos } from '../controllers/reportesController';

const router = Router();
router.use(authMiddleware as any);
router.get('/ingresos', getReporteIngresos);

export default router;
