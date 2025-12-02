
import { db } from '../db';

export const getAllCourses = async (req: any, res: any) => {
  try {
    // Derived attribute calculation via JOINs
    const query = `
      SELECT c.course_id as id, c.title, c.description, c.instructor_id, c.price, c.created_at,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(r.review_id) as review_count
      FROM courses c
      LEFT JOIN reviews r ON c.course_id = r.course_id
      GROUP BY c.course_id
      ORDER BY c.created_at DESC
    `;
    const result = await db.query(query);
    res.json(result.rows.map(row => ({
        ...row,
        avg_rating: parseFloat(row.avg_rating).toFixed(1)
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCoursesByInstructor = async (req: any, res: any) => {
    const { instructorId } = req.params;
    try {
        const query = `SELECT course_id as id, * FROM courses WHERE instructor_id = $1 ORDER BY created_at DESC`;
        const result = await db.query(query, [instructorId]);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

//Added
export const getCourseById = async (req: any, res: any) => {
    console.log("👉 Request received for Course ID:", req.params.id);
    try {
        const { id } = req.params;
        
        const result = await db.query('SELECT * FROM courses WHERE course_id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getEnrolledCourses = async (req: any, res: any) => {
    const { studentId } = req.params;
    try {
        const query = `
            SELECT c.course_id as id, c.title, c.description, c.instructor_id
            FROM courses c
            JOIN enrollments e ON c.course_id = e.course_id
            WHERE e.student_id = $1
        `;
        const result = await db.query(query, [studentId]);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const createCourse = async (req: any, res: any) => {
  const { title, description, instructor_id, price } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO courses (title, description, instructor_id, price) VALUES ($1, $2, $3, $4) RETURNING course_id as id, *',
      [title, description, instructor_id, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCourse = async (req: any, res: any) => {
    const { id } = req.params;
    const { title, description } = req.body;
    try {
        const result = await db.query(
            'UPDATE courses SET title=$1, description=$2 WHERE course_id=$3 RETURNING course_id as id, *',
            [title, description, id]
        );
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteCourse = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    // ON DELETE CASCADE takes care of lessons, quizzes, questions, enrollments, reviews
    await db.query('DELETE FROM courses WHERE course_id = $1', [id]);
    res.json({ message: 'Course deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const enrollStudent = async (req: any, res: any) => {
    const { courseId } = req.params;
    const { studentId } = req.body;
    try {
        await db.query(
            'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [studentId, courseId]
        );
        res.json({ message: 'Enrolled successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const checkEnrollment = async (req: any, res: any) => {
    const { courseId, studentId } = req.params;
    try {
        const result = await db.query(
            'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
            [studentId, courseId]
        );
        res.json({ isEnrolled: result.rows.length > 0, enrollment: result.rows[0] });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};