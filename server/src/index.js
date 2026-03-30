import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { sequelize } from './models/index.js';

import authRoutes from './routes/auth.js';
import peopleRoutes from './routes/people.js';
import classRoutes from './routes/classes.js';
import campusRoutes from './routes/campuses.js';
import syncRoutes from './routes/sync.js';
import discoveryRoutes from './routes/discovery.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/people', peopleRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/campuses', campusRoutes);
app.use('/api/v1/sync', syncRoutes);
app.use('/api/v1/discovery', discoveryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'shared-api', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5002;

async function start() {
  let retries = 0;
  const maxRetries = 10;

  while (retries < maxRetries) {
    try {
      await sequelize.authenticate();
      console.log('Shared DB connected.');
      break;
    } catch (err) {
      retries++;
      console.log(`DB connection attempt ${retries}/${maxRetries}...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  if (retries === maxRetries) {
    console.error('Could not connect to Shared DB. Exiting.');
    process.exit(1);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shared API running on port ${PORT}`);
  });
}

start();
