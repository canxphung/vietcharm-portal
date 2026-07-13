import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { app } from './api/_lib/app';
import { connectDB } from './api/_lib/db';

dotenv.config();

const PORT = Number(process.env.PORT || 4301);

const distPath = path.join(process.cwd(), 'dist', 'vietcharm-angular', 'browser');
app.use(express.static(distPath));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`VietCharm server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB, server not started:', error);
    process.exit(1);
  });
