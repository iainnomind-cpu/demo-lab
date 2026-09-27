import { Router } from 'express';
import { authMiddleware, requireRol } from '../middleware/authMiddleware';
import * as c from '../controllers/configController';

const router = Router();
router.use(authMiddleware as any);

router.get('/', c.getConfig);
router.patch('/', requireRol('admin') as any, c.updateConfig);

export default router;
