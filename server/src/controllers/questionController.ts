import { db } from '../db';

// 1. Create new question
export const createQuestion = async (req: any, res: any) => {
    const { quiz_id, text, type, options, correct_answer, points } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO questions (quiz_id, text, type, options, correct_answer, points) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [quiz_id, text, type, options, correct_answer, points]
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Update question
export const updateQuestion = async (req: any, res: any) => {
    const { id } = req.params;
    const { text, type, options, correct_answer, points } = req.body;
    try {
        const result = await db.query(
            'UPDATE questions SET text=$1, type=$2, options=$3, correct_answer=$4, points=$5 WHERE id=$6 RETURNING *',
            [text, type, options, correct_answer, points, id]
        );
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Delete question
export const deleteQuestion = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM questions WHERE id = $1', [id]);
        res.json({ message: 'Question deleted' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Get the questions that belongs to a quiz 
export const getQuestionsByQuiz = async (req: any, res: any) => {
    const { quizId } = req.params;
    try {
        const result = await db.query('SELECT * FROM questions WHERE quiz_id = $1 ORDER BY id ASC', [quizId]);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};