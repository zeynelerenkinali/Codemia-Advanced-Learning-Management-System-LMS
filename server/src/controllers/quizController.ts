import { db } from '../db';

// 1. Create Quiz
export const createQuiz = async (req: any, res: any) => {
    const { lesson_id, title, passing_score } = req.body;
    try {
        // Check if quiz exists. using 'as id' for frontend compatibility
        const check = await db.query(
            'SELECT quiz_id as id, * FROM quizzes WHERE lesson_id = $1', 
            [lesson_id]
        );
        
        if (check.rows.length > 0) {
            return res.json(check.rows[0]);
        }

        // Create new quiz
        const result = await db.query(
            'INSERT INTO quizzes (lesson_id, title, passing_score) VALUES ($1, $2, $3) RETURNING quiz_id as id, *',
            [lesson_id, title, passing_score]
        );
        res.status(201).json(result.rows[0]);

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// 2. Get Quiz by Lesson
export const getQuizByLesson = async (req: any, res: any) => {
    const { lessonId } = req.params;
    try {
        // Must use 'quiz_id as id'
        const result = await db.query(
            'SELECT quiz_id as id, * FROM quizzes WHERE lesson_id = $1', 
            [lessonId]
        );
        
        if (result.rows.length === 0) return res.status(404).json({ message: 'No quiz found' });
        
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Delete Quiz
export const deleteQuiz = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        // Column name is 'quiz_id'
        await db.query('DELETE FROM quizzes WHERE quiz_id = $1', [id]); 
        res.json({ message: 'Quiz deleted' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Get Quiz By ID (NEW FUNCTION - Was Missing)
// This is needed for the GET /api/quizzes/:id request
export const getQuizById = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            'SELECT quiz_id as id, * FROM quizzes WHERE quiz_id = $1', 
            [id]
        );
        
        if (result.rows.length === 0) return res.status(404).json({ message: 'Quiz not found' });
        
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};