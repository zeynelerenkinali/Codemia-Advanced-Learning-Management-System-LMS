import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../db.js";

const router = Router();

// TÜM KURSLARI GETİR (View Kullanarak)
router.get("/", async (req: Request, res: Response) => {
  try {
    // course_summary view'inden çekiyoruz. 
    // Instructor adını almak için users ile joinleyebiliriz.
    const result = await pool.query(`
      SELECT cs.*, u.name as instructor_name 
      FROM course_summary cs
      JOIN users u ON cs.instructor_id = u.user_id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// TEK KURS DETAYI
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // UUID formatı kontrolü (Postgres otomatik hata verir ama biz yakalayalım)
    const courseRes = await pool.query(`
        SELECT c.*, u.name as instructor_name 
        FROM courses c 
        JOIN users u ON c.instructor_id = u.user_id 
        WHERE c.course_id = $1
    `, [id]);
    
    if (courseRes.rows.length === 0) return res.status(404).json({ error: "Course not found" });

    // Dersleri çek
    const lessonsRes = await pool.query("SELECT * FROM lessons WHERE course_id = $1 ORDER BY created_at ASC", [id]);
    
    res.json({ ...courseRes.rows[0], lessons: lessonsRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// KURS EKLE
router.post("/", async (req: Request, res: Response) => {
  // instructor_id'yi frontend göndermeli veya token'dan almalıyız.
  // Şimdilik body'den geldiğini varsayalım.
  const { title, description, price, instructor_id } = req.body;
  
  try {
    const result = await pool.query(
      "INSERT INTO courses (title, description, price, instructor_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description, price || 0, instructor_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Create error" });
  }
});

export default router;