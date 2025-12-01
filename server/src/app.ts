import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import userRoutes from './routes/userRoutes';
import lessonRoutes from './routes/lessonRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const API_URL = 'http://localhost:5000/api';

// Middleware
app.use(cors());
app.use(express.json());

// --- ROUTES DÜZELTME ---
// Frontend /api/login ve /api/register diye istek atıyor.
// Bu yüzden burayı '/api/auth' yerine '/api' yapıyoruz.
app.use('/api', authRoutes); 

// Diğerleri aynen kalabilir, çünkü onlar muhtemelen /api/courses/1 gibi çalışıyor.
app.use(`${API_URL}/courses`, courseRoutes);
app.use(`${API_URL}/users`, userRoutes);
app.use(`${API_URL}/lessons`, lessonRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('Codemia API is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});