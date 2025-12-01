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