import { Router } from 'express';
import { authMiddleware, requireRol } from '../middleware/authMiddleware';
import { runMotor, listRecordatorios } from '../controllers/recordatorioController';

const router = Router();
router.use(authMiddleware as any);

router.get('/', listRecordatorios);
router.post('/motor', requireRol('admin', 'qfb') as any, runMotor);

export default router;
