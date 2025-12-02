import { db } from '../db';

// Create a new quiz
export const createQuiz = async (req: any, res: any) => {
    const { lesson_id, title, passing_score } = req.body;
    try {
        // Check if quiz already exists for this lesson? (Optional logic)
        
        const result = await db.query(
            'INSERT INTO quizzes (lesson_id, title, passing_score) VALUES ($1, $2, $3) RETURNING *',
            [lesson_id, title, passing_score]
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Get quiz by lesson ID
export const getQuizByLesson = async (req: any, res: any) => {
    const { lessonId } = req.params;
    try {
        const result = await db.query('SELECT * FROM quizzes WHERE lesson_id = $1', [lessonId]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'No quiz found' });
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Delete quiz
export const deleteQuiz = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM quizzes WHERE id = $1', [id]); // Check if your DB column is 'id' or 'quiz_id'
        res.json({ message: 'Quiz deleted' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};