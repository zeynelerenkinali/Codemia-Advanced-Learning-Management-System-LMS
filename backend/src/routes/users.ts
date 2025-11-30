// src/routes/users.ts

import { Router } from 'express';
// HATA ÇÖZÜMÜ 1: Tip olanları 'import type' ile ayırıyoruz
import type { Request, Response } from 'express'; 

// HATA ÇÖZÜMÜ 2: '../db' yerine '../db.js' yazıyoruz.
// HATA ÇÖZÜMÜ 3: 'import { pool }' yerine direkt 'import pool' (default import) yapıyoruz.
import pool from '../db.js';

const router = Router();

// Tüm kullanıcıları getir
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// ID'ye göre kullanıcı getir
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

export default router;