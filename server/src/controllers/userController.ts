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

export const getAllUsers = async (req: any, res: any) => {
    try {
        // Fetch all users, but exclude sensitive data like password_hash!
        const result = await db.query(
            'SELECT user_id as id, name, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({ message: "Server error fetching users" });
    }
};

export const getUserById = async (req: any, res: any) => {
    console.log("👉 Request received for User ID:", req.params.id);
    try {
        const { id } = req.params;
        
        const result = await db.query('SELECT user_id, name, role FROM users WHERE user_id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
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
        // ON DELETE CASCADE in SQL schema handles everything
        await db.query('DELETE FROM users WHERE user_id = $1', [id]);
        res.json({ message: 'Account deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// --- EKLENEN KISIM ---
export const getUserEnrollments = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                c.course_id as id,
                c.title,
                c.description,
                c.thumbnail,
                c.level,
                c.instructor_id,
                e.enrollment_date,
                e.progress
            FROM enrollments e
            JOIN courses c ON e.course_id = c.course_id
            WHERE e.student_id = $1
        `;
        const result = await db.query(query, [id]);
        res.json(result.rows);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};