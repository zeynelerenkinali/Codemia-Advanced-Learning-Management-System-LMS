// src/routes/auth.ts

import { Router } from 'express';
import type { Request, Response } from 'express'; // Tipleri güvenli import et

// HATA ÇÖZÜMÜ: Süslü parantez olmadan ve .js uzantısı ile import et
import pool from '../db.js'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

// Örnek Register Rotası (Bunu kendi mantığına göre genişletebilirsin)
router.post('/register', async (req: Request, res: Response) => {
    // ... kayıt kodları ...
    res.send('Register route');
});

// Örnek Login Rotası
router.post('/login', async (req: Request, res: Response) => {
    // ... giriş kodları ...
    res.send('Login route');
});

export default router;