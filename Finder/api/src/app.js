import express from 'express';
import prisma from './prisma.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import chambresRoutes from './routes/chambres.js';
import hotelsRoutes from './routes/hotel.js';
import reservationsRoutes from './routes/reservations.js';
import authRoutes from './routes/auth.js';

const app = express();

app.use(express.json());
app.use('/chambres', chambresRoutes);
app.use('/hotels', hotelsRoutes);
app.use('/reservations', reservationsRoutes);
app.use('/auth', authRoutes);

const spec = swaggerJsdoc({
 definition: {
 openapi: '3.0.0',
 info: { title: 'API Finder', version: '1.0.0' },
 components: { securitySchemes: { bearerAuth: { type: 'http', scheme:
'bearer', bearerFormat: 'JWT' } } },
 },
    apis: ['./src/**/*.js', './src/server.js', './server.js'],
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

export default app;
export { prisma };