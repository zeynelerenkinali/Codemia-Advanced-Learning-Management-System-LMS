
import { db } from '../db';

export const updateUser = async (req: any, res: any) => {
    const { id } = req.params;
    const { name, email, country, city, postal_code } = req.body;
    
    try {
        const result = await db.query(
            'UPDATE users SET name=$1, email=$2, country=$3, city=$4, postal_code=$5 WHERE user_id=$6 RETURNING user_id as id, *',
            [name, email, country, city, postal_code, id]
        );
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const becomeInstructor = async (req: any, res: any) => {
    const { id } = req.params; // User ID
    const { bio, expertise_area } = req.body;

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 1. Update User Role
        await client.query("UPDATE users SET role='instructor' WHERE user_id=$1", [id]);

        // 2. Insert into Instructors Table (Subclass)
        await client.query(
            "INSERT INTO instructors (instructor_id, bio, expertise_area) VALUES ($1, $2, $3)",
            [id, bio, expertise_area]
        );

        const result = await client.query('SELECT user_id as id, * FROM users WHERE user_id=$1', [id]);
        
        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (err: any) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

export const getInstructorProfile = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM instructors WHERE instructor_id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Instructor profile not found' });
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateInstructorProfile = async (req: any, res: any) => {
    const { id } = req.params;
    const { bio, expertise_area } = req.body;
    try {
        const result = await db.query(
            'UPDATE instructors SET bio=$1, expertise_area=$2 WHERE instructor_id=$3 RETURNING *',
            [bio, expertise_area, id]
        );
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteAccount = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        // ON DELETE CASCADE in SQL schema handles everything:
        // - Removes entry from users table
        // - Removes entry from students/instructors/admins tables
        // - Removes owned courses (if instructor) via courses.instructor_id CASCADE
        // - Removes enrollments, reviews, progress (if student)
        await db.query('DELETE FROM users WHERE user_id = $1', [id]);
        res.json({ message: 'Account deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};