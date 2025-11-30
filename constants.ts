

export const APP_NAME = "Codemia";

export const SQL_SCHEMA = `
-- POSTGRESQL SCHEMA GENERATION FOR CODEMIA
-- IMPLEMENTING TABLE-PER-SUBCLASS PATTERN (ISA HIERARCHIES)

-- 1. USERS (Superclass)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Address Fields
    country VARCHAR(100),
    city VARCHAR(100),
    postal_code VARCHAR(20)
);

-- 2. STUDENTS (Subclass of Users)
CREATE TABLE students (
    user_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    total_credits INT DEFAULT 0,
    gpa DECIMAL(3, 2) DEFAULT 0.00
);

-- 3. INSTRUCTORS (Subclass of Users)
-- Stores specialized attributes for instructors
CREATE TABLE instructors (
    instructor_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    bio TEXT,
    expertise_area VARCHAR(100)
);

-- 4. ADMINS (Subclass of Users)
CREATE TABLE admins (
    user_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    privilege_level INT DEFAULT 1 CHECK (privilege_level BETWEEN 1 AND 5)
);

-- 5. COURSES
CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    instructor_id INT NOT NULL REFERENCES instructors(instructor_id),
    price DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. ENROLLMENTS (M-N Relationship: Students <-> Courses)
CREATE TABLE enrollments (
    student_id INT REFERENCES students(user_id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    PRIMARY KEY (student_id, course_id)
);

-- 7. LESSONS
CREATE TABLE lessons (
    lesson_id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    order_index INT NOT NULL,
    type VARCHAR(50) DEFAULT 'article' CHECK (type IN ('article', 'video', 'quiz')),
    attachment_urls TEXT[], -- Postgres Array for resources
    UNIQUE(course_id, order_index)
);

-- 8. LESSON_PROGRESS (Weak Entity)
CREATE TABLE lesson_progress (
    student_id INT REFERENCES students(user_id) ON DELETE CASCADE,
    lesson_id INT REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, lesson_id)
);

-- 9. QUIZZES
CREATE TABLE quizzes (
    quiz_id SERIAL PRIMARY KEY,
    lesson_id INT UNIQUE REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    title VARCHAR(200),
    passing_score INT DEFAULT 70
);

-- 10. QUESTIONS (Superclass)
CREATE TABLE questions (
    question_id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    points INT DEFAULT 10,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer'))
);

-- 11. MULTIPLE_CHOICE_QUESTIONS (Subclass)
CREATE TABLE multiple_choice_questions (
    question_id INT PRIMARY KEY REFERENCES questions(question_id) ON DELETE CASCADE,
    options TEXT[] NOT NULL, -- Array of strings for options [A, B, C, D]
    correct_answer TEXT NOT NULL
);

-- 12. TRUE_FALSE_QUESTIONS (Subclass)
CREATE TABLE true_false_questions (
    question_id INT PRIMARY KEY REFERENCES questions(question_id) ON DELETE CASCADE,
    correct_answer VARCHAR(5) CHECK (correct_answer IN ('True', 'False'))
);

-- 13. SHORT_ANSWER_QUESTIONS (Subclass)
CREATE TABLE short_answer_questions (
    question_id INT PRIMARY KEY REFERENCES questions(question_id) ON DELETE CASCADE,
    correct_answer TEXT NOT NULL,
    lookup_table TEXT[] -- Array of acceptable answer variations for auto-grading
);

-- 14. REVIEWS
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    student_id INT REFERENCES students(user_id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT one_review_per_course UNIQUE (course_id, student_id)
);

-- DATA INSERTION EXAMPLES
/*
-- Create User with Address
INSERT INTO users (name, email, password_hash, role, country, city, postal_code) 
VALUES ('Jane Doe', 'jane@example.com', 'hashedpw', 'instructor', 'USA', 'New York', '10001');

-- Add to Instructor Subclass
INSERT INTO instructors (instructor_id, bio, expertise_area) 
VALUES ((SELECT user_id FROM users WHERE email='jane@example.com'), 'PhD in AI', 'Machine Learning');

-- Update Address
UPDATE users SET city='San Francisco', postal_code='94105' WHERE email='jane@example.com';
*/
`;