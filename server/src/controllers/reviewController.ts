import { db } from '../db';

export const getReviews = async (req: any, res: any) => {
  try {
    const query = `
      SELECT 
        r.review_id as id,
        r.rating,
        r.comment,
        r.created_at,
        u.name as user_name,
        c.title as course_title
      FROM reviews r
      JOIN users u ON r.student_id = u.user_id
      JOIN courses c ON r.course_id = c.course_id
      ORDER BY r.created_at DESC
      LIMIT 10
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Review fetch error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createReview = async (req: any, res: any) => {
  // The data comes from the Frontend (should come inside the body)
  const { student_id, course_id, rating, comment } = req.body;

  try {
    const query = `
      INSERT INTO reviews (student_id, course_id, rating, comment, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;
    
    const values = [student_id, course_id, rating, comment];
    
    const result = await db.query(query, values);
    
    // Başarılı olursa 201 Created kodu ve yeni yorumu döndür
    res.status(201).json(result.rows[0]);

  } catch (error: any) {
        // 1. Check for the specific "Unique Violation" error code (23505)
        if (error.code === '23505') {
            return res.status(400).json({ message: "You have already reviewed this course." });
        }

        console.error("Review Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};