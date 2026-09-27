import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import * as c from '../controllers/reportesController';

const router = Router();
router.use(authMiddleware as any);

router.get('/ingresos', c.getReporteIngresos);
router.get('/estudios-top', c.getEstudiosTop);
router.get('/medicos-productividad', c.getMedicosProductividad);
router.get('/cuentas-cobrar', c.getCuentasCobrar);

export default router;
