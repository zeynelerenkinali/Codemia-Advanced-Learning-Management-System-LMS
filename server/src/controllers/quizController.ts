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

// 1. Submit Quiz (Save Score)
export const submitQuizResult = async (req: any, res: any) => {
    const { studentId, quizId, score } = req.body;

    try {
        const query = `
            INSERT INTO quiz_results (student_id, quiz_id, score)
            VALUES ($1, $2, $3)
            ON CONFLICT (student_id, quiz_id) 
            DO UPDATE SET score = $3, completed_at = NOW()
            RETURNING *;
        `;
        const result = await db.query(query, [studentId, quizId, score]);
        
        // Also mark the lesson as completed in lesson_progress!
        // (You might need to fetch lesson_id from quiz_id first, but let's assume this is handled separately or purely for score)
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Submit Quiz Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// 2. Check Previous Result
export const getQuizResult = async (req: any, res: any) => {
    const { quizId, studentId } = req.params; // or query params depending on your route

    try {
        const result = await db.query(
            'SELECT * FROM quiz_results WHERE quiz_id = $1 AND student_id = $2',
            [quizId, studentId]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]); // Returns { score: 80, ... }
        } else {
            res.json(null); // No previous attempt
        }
    } catch (error) {
        console.error("Get Quiz Result Error:", error);
        res.status(500).json({ message: "Server error" });
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
        
        if (result.rows.length === 0) {  return res.status(200).json(null); }
        
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
    try {
        const { id } = req.params;
        const result = await db.query(
            'SELECT quiz_id as id, * FROM quizzes WHERE quiz_id = $1', 
            [id]
        );
        
        if (result.rows.length === 0) {  return res.status(200).json(null); }
    
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
