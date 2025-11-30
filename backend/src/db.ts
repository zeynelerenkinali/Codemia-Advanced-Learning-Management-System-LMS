import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Veritabanı bağlantı havuzu oluşturuyoruz
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Bağlantıyı test edelim (Opsiyonel ama önerilir)
pool.on('connect', () => {
  console.log('Veritabanına başarıyla bağlanıldı.');
});

pool.on('error', (err) => {
  console.error('Veritabanı bağlantı hatası:', err);
  process.exit(-1);
});

export default pool;