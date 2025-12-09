import { db } from '../db';
import { Request, Response } from "express";
import { pool } from "../db"; // adjust path to your db.ts

// --- USER OPERATIONS ---

export const updateUser = async (req: any, res: any) => {
    const { id } = req.params;
    const { name, email, country, city, postal_code, role } = req.body;
    
    try {
        const result = await db.query(
            'UPDATE users SET name=$1, email=$2, country=$3, city=$4, postal_code=$5, role=$6 WHERE user_id=$7 RETURNING user_id as id, *',
            [name, email, country, city, postal_code, role, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (err: any) {
        console.error("Update User Error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const getAllUsers = async (req: any, res: any) => {
    try {
        // Fetch all users, excluding sensitive data like password_hash
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
            return res.status(404).json({ message: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteAccount = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        // ON DELETE CASCADE in SQL schema handles everything (deleting user deletes related instructor/student data)
        await db.query('DELETE FROM users WHERE user_id = $1', [id]);
        res.json({ message: 'Account deleted successfully' });
    } catch (err: any) {
        console.error("Delete Account Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// --- INSTRUCTOR OPERATIONS ---

export const becomeInstructor = async (req: any, res: any) => {
    const { id } = req.params; // User ID
    const { bio, expertise_area } = req.body;

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 1. Update User Role in users table
        await client.query("UPDATE users SET role='instructor' WHERE user_id=$1", [id]);

        // 2. Insert into Instructors Table
        // We use ON CONFLICT DO UPDATE to handle cases where user might already have a record
        const insertQuery = `
            INSERT INTO instructors (instructor_id, bio, expertise_area) 
            VALUES ($1, $2, $3)
            ON CONFLICT (instructor_id) 
            DO UPDATE SET bio = $2, expertise_area = $3
        `;
        await client.query(insertQuery, [id, bio, expertise_area]);

        const result = await client.query('SELECT user_id as id, * FROM users WHERE user_id=$1', [id]);
        
        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (err: any) {
        await client.query('ROLLBACK');
        console.error("Become Instructor Error:", err);
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
        console.error("Get Instructor Profile Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// *** THIS IS THE FUNCTION YOU NEEDED FIXED ***
export const updateInstructorProfile = async (req: any, res: any) => {
    const { id } = req.params;
    const { bio, expertise_area } = req.body;
    
    try {
        // This query updates only the 'instructors' table.
        // It does NOT touch the 'users' table, preventing the "null role" error.
        const result = await db.query(
            'UPDATE instructors SET bio=$1, expertise_area=$2 WHERE instructor_id=$3 RETURNING *',
            [bio, expertise_area, id]
        );

        // Check if the update actually happened
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Instructor record not found. Make sure the user is an instructor.' });
        }

        res.json({
            message: "Profile updated successfully",
            data: result.rows[0]
        });
    } catch (err: any) {
        console.error("Update Instructor Profile Error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const getInstructorCourses = async (req: any, res: any) => {
    const { id } = req.params; // instructor_id
    try {
        const result = await db.query(
            'SELECT * FROM courses WHERE instructor_id = $1 ORDER BY created_at DESC',
            [id]
        );
        res.json(result.rows);
    } catch (err: any) {
        console.error("Get Instructor Courses Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// --- STUDENT/ENROLLMENT OPERATIONS ---

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
        console.error("Get Enrollments Error:", err);
        res.status(500).json({ error: err.message });
    }
};


// GPA calculation

export const getStudentProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // quiz_results tablosundan bu öğrencinin (id) not ortalamasını alıyoruz.
    // COALESCE: Eğer hiç sınav çözmediyse NULL yerine 0 döndürür.
    const query = `
      SELECT COALESCE(AVG(score), 0) as gpa 
      FROM quiz_results 
      WHERE student_id = $1
    `;
    
    // pool nesneni nasıl import ettiysen öyle kullan (genelde pool veya db)
    const result = await pool.query(query, [id]);

    // Frontend'e { gpa: 85.50 } formatında döner
    res.json({ 
      gpa: parseFloat(result.rows[0].gpa) 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error getting student profile" });
  }
};