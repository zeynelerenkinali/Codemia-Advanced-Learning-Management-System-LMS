import { db } from '../db';

export const recalculateGPA = async (req: any, res: any) => {
    try {
        await db.query('CALL recalculate_all_gpas()');
        
        res.json({ message: "Batch GPA Recalculation Complete!" });
    } catch (error) {
        console.error("GPA Calc Error:", error);
        res.status(500).json({ message: "Failed to recalculate GPAs." });
    }
};

export const getCourseStats = async (req: any, res: any) => {
    try {
        // REPORT QUERY: Joins Courses, Instructors, and Enrollments
        const query = `
            SELECT 
                c.title as "Course Title",
                u.name as "Instructor Name",
                COUNT(e.student_id) as "Total Students",
                COALESCE(ROUND(AVG(e.progress), 1), 0) as "Avg Progress %"
            FROM courses c
            JOIN instructors i ON c.instructor_id = i.instructor_id
            JOIN users u ON i.instructor_id = u.user_id
            LEFT JOIN enrollments e ON c.course_id = e.course_id
            GROUP BY c.course_id, c.title, u.name
            ORDER BY "Total Students" DESC;
        `;
        
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Report generation failed" });
    }
};