import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import catalogRoutes from './routes/catalogRoutes';
import ordenRoutes from './routes/ordenRoutes';
import egresosRoutes from './routes/egresosRoutes';
import reportesRoutes from './routes/reportesRoutes';
import recordatorioRoutes from './routes/recordatorioRoutes';
import pagosRoutes from './routes/pagosRoutes';
import usuariosRoutes from './routes/usuariosRoutes';
import configRoutes from './routes/configRoutes';
import plantillasRoutes from './routes/plantillasRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', catalogRoutes);
app.use('/api/ordenes', ordenRoutes);
app.use('/api/egresos', egresosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/recordatorios', recordatorioRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/config', configRoutes);
app.use('/api/plantillas', plantillasRoutes);

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

export default app;
