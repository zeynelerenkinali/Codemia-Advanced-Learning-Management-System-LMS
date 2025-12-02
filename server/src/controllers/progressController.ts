import { db } from '../db'; // Make sure this path is correct for your project

export const getProgress = async (req: any, res: any) => {
    try {
        const { studentId } = req.query; // It reads ?studentId=5

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