import { db } from '../db'; // Make sure this path is correct for your project

// GET: Retrieve progress for a specific student
export const getProgress = async (req: any, res: any) => {
    try {
        const { studentId } = req.query; // Expects ?studentId=5

        if (!studentId) {
            return res.status(400).json({ message: "Student ID is required" });
        }

        const result = await db.query(
            'SELECT * FROM lesson_progress WHERE student_id = $1', 
            [studentId]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error("Progress Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// POST: Save or Update student progress (UPSERT)
// This function was missing, causing the "Cannot POST" error.
export const updateProgress = async (req: any, res: any) => {
    // Data sent from frontend (usually in camelCase)
    const { studentId, lessonId, completed } = req.body;

    try {
        // Use PostgreSQL 'ON CONFLICT' for Upsert logic:
        // If the record exists -> Update it.
        // If not -> Insert a new one.
        const query = `
            INSERT INTO lesson_progress (student_id, lesson_id, completed, last_accessed)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (student_id, lesson_id)
            DO UPDATE SET completed = $3, last_accessed = NOW()
            RETURNING *;
        `;

        const result = await db.query(query, [studentId, lessonId, completed]);
        res.json(result.rows[0]);

    } catch (err: any) {
        console.error("Update Progress Error:", err);
        res.status(500).json({ error: err.message });
    }
};