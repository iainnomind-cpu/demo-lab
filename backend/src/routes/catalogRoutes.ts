import { Router } from 'express';
import { authMiddleware, requireRol } from '../middleware/authMiddleware';
import * as c from '../controllers/catalogController';

const router = Router();
router.use(authMiddleware as any);

// ---- Sucursales ----
router.get('/sucursales', c.listSucursales);
router.post('/sucursales', requireRol('admin') as any, c.createSucursal);
router.patch('/sucursales/:id', requireRol('admin') as any, c.updateSucursal);
router.delete('/sucursales/:id', requireRol('admin') as any, c.deleteSucursal);

// ---- Médicos ----
router.get('/medicos', c.listMedicos);
router.post('/medicos', requireRol('admin', 'recepcionista') as any, c.createMedico);
router.patch('/medicos/:id', requireRol('admin') as any, c.updateMedico);
router.delete('/medicos/:id', requireRol('admin') as any, c.deleteMedico);

// ---- Estudios catálogo ----
router.get('/estudios', c.listEstudios);
router.post('/estudios', requireRol('admin') as any, c.createEstudio);
router.patch('/estudios/:id', requireRol('admin') as any, c.updateEstudio);
router.delete('/estudios/:id', requireRol('admin') as any, c.deleteEstudio);

// ---- Pacientes ----
router.get('/pacientes', c.listPacientes);
router.get('/pacientes/:id', c.getPaciente);
router.post('/pacientes', c.createPaciente);
router.patch('/pacientes/:id', c.updatePaciente);
router.delete('/pacientes/:id', requireRol('admin') as any, c.deletePaciente);

export default router;
