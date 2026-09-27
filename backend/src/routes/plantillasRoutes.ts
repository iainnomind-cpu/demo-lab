import { Router } from 'express';
import * as c from '../controllers/plantillasController';

const router = Router();

router.get('/', c.listPlantillas);
router.post('/', c.createPlantilla);
router.patch('/:id', c.updatePlantilla);
router.patch('/:id/enviar-revision', c.sendToReview);
router.patch('/:id/aprobar', c.approveTemplate); // Solo para simulación
router.delete('/:id', c.deletePlantilla);

export default router;
