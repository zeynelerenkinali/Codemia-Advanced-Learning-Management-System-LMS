
import { db } from '../db';

export const getLessonsByCourse = async (req: any, res: any) => {
    const { courseId } = req.params;
    try {
        const result = await db.query(
            'SELECT lesson_id as id, * FROM lessons WHERE course_id = $1 ORDER BY order_index ASC', 
            [courseId]
        );
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const createLesson = async (req: any, res: any) => {
    const { course_id, title, content, type, order_index, attachment_urls } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO lessons (course_id, title, content, type, order_index, attachment_urls) VALUES ($1, $2, $3, $4, $5, $6) RETURNING lesson_id as id, *',
            [course_id, title, content, type, order_index, attachment_urls]
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateLesson = async (req: any, res: any) => {
    const { id } = req.params;
    const { title, content, type, attachment_urls } = req.body;
    try {
        const result = await db.query(
            'UPDATE lessons SET title=$1, content=$2, type=$3, attachment_urls=$4 WHERE lesson_id=$5 RETURNING lesson_id as id, *',
            [title, content, type, attachment_urls, id]
        );
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteLesson = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM lessons WHERE lesson_id = $1', [id]);
        res.json({ message: 'Lesson deleted' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getLessonById = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        // Fetch specific lesson by lesson_id
        const result = await db.query(
            'SELECT lesson_id as id, * FROM lessons WHERE lesson_id = $1', 
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};