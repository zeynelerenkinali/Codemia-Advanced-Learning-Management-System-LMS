import { db } from '../db';

export const login = async (req: any, res: any) => {
  const { email, password } = req.body;
  try {
    // Not: Gerçek bir uygulamada şifreleri bcrypt ile hashleyerek karşılaştırın.
    const query = `
      SELECT u.*, 
             CASE 
                WHEN s.user_id IS NOT NULL THEN 'student'
                WHEN i.instructor_id IS NOT NULL THEN 'instructor'
                WHEN a.user_id IS NOT NULL THEN 'admin'
             END as verified_role
      FROM users u
      LEFT JOIN students s ON u.user_id = s.user_id
      LEFT JOIN instructors i ON u.user_id = i.instructor_id
      LEFT JOIN admins a ON u.user_id = a.user_id
      WHERE u.email = $1 AND u.password_hash = $2
    `;
    const result = await db.query(query, [email, password]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    // Frontend uyumluluğu için user_id'yi id olarak değiştiriyoruz
    user.id = user.user_id;
    delete user.user_id;
    
    // DÜZELTME: Veriyi { token, user } yapısında gönderiyoruz.
    // Şimdilik token dummy (sahte) olarak oluşturuluyor.
    res.json({
      token: 'mock-jwt-token-12345', 
      user: user
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const register = async (req: any, res: any) => {
  const { name, email, password, role, country, city, postal_code } = req.body;
  
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Üst sınıfa (Users) ekle
    const userQuery = `
      INSERT INTO users (name, email, password_hash, role, country, city, postal_code) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;
    const userResult = await client.query(userQuery, [name, email, password, role, country, city, postal_code]);
    const newUser = userResult.rows[0];

    // 2. Alt sınıfa ekle (Rol tablosu)
    if (role === 'student') {
      await client.query('INSERT INTO students (user_id) VALUES ($1)', [newUser.user_id]);
    } else if (role === 'instructor') {
      await client.query('INSERT INTO instructors (instructor_id) VALUES ($1)', [newUser.user_id]);
    } else if (role === 'admin') {
      await client.query('INSERT INTO admins (user_id) VALUES ($1)', [newUser.user_id]);
    }

    await client.query('COMMIT');
    
    newUser.id = newUser.user_id;
    delete newUser.user_id;
    
    // DÜZELTME: Kayıttan sonra da { token, user } yapısında yanıt dönüyoruz
    // böylece frontend otomatik giriş yapabilir.
    res.status(201).json({
      token: 'mock-jwt-token-12345',
      user: newUser
    });

  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error(err);
    if (err.constraint === 'users_email_key') {
        return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};