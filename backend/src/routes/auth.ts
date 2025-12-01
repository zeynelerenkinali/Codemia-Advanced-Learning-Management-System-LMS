import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = Router();

// --- REGISTER (KAYIT OL) ---
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password, role, bio, expertise_area } = req.body; // bio ve expertise_area sadece instructor için

  const client = await pool.connect(); // Transaction için client al

  try {
    await client.query('BEGIN'); // İşlemi başlat

    // 1. E-posta kontrolü
    const userCheck = await client.query("SELECT user_id FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Bu e-posta adresi zaten kayıtlı." });
    }

    // 2. Şifreleme
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Ana Users tablosuna ekle (UUID otomatik oluşur)
    // Rol varsayılan olarak 'student' gelir, biz gelen veriyi kullanalım
    const userRes = await client.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING user_id, name, email, role, created_at`,
      [name, email, hashedPassword, role || 'student']
    );

    const newUser = userRes.rows[0];

    // 4. Alt tablolara ekleme (ISA İlişkisi)
    if (role === 'instructor') {
      await client.query(
        "INSERT INTO instructors (user_id, bio, expertise_area) VALUES ($1, $2, $3)",
        [newUser.user_id, bio || '', expertise_area || '']
      );
    } else if (role === 'admin') {
       await client.query("INSERT INTO admins (user_id) VALUES ($1)", [newUser.user_id]); 
    } else {
      // Varsayılan Student
      await client.query("INSERT INTO students (user_id) VALUES ($1)", [newUser.user_id]);
    }

    await client.query('COMMIT'); // Hata yoksa onayla

    // 5. Token oluştur
    const token = jwt.sign(
      { id: newUser.user_id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'gizli_anahtar',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: "Kullanıcı başarıyla oluşturuldu.",
      user: newUser,
      token
    });

  } catch (err) {
    await client.query('ROLLBACK'); // Hata varsa her şeyi iptal et
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  } finally {
    client.release(); // Client'ı havuza bırak
  }
});

// --- LOGIN (GİRİŞ YAP) ---
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Users tablosundan çekiyoruz (UUID olduğu için id: user_id)
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Geçersiz e-posta veya şifre." });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Geçersiz e-posta veya şifre." });
    }

    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'gizli_anahtar',
      { expiresIn: '1h' }
    );

    res.json({
      message: "Giriş başarılı.",
      user: { 
          id: user.user_id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
      },
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

export default router;