// src/app.ts

import express from 'express';
import type { Application } from 'express'; // Application bir tiptir
import cors from 'cors';

// Rota importlarına .js eklemeyi unutma
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import lessonRoutes from './routes/lessons.js';
import quizRoutes from './routes/quizzes.js';

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);

app.get('/', (req, res) => {
  res.send('API çalışıyor!');
});

export default app;