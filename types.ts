
// 1. User Entity (Superclass for Student, Instructor, Admin)
export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  password_hash: string; // Simulated
  // Address Fields
  country?: string;
  city?: string;
  postal_code?: string;
}

// Subclass Entity for Instructor (Table-per-subclass pattern)
export interface InstructorProfile {
  user_id: number; // PK and FK to User
  bio: string;
  expertise_area: string;
}

// 2. Course Entity
export interface Course {
  id: number;
  title: string;
  description: string;
  instructor_id: number;
  created_at: string;
  price: number;
}

// 3. Lesson Entity
export type LessonType = 'article' | 'video' | 'quiz';

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  content: string; // Text content for demo
  order_index: number;
  type: LessonType; // New field
  attachment_urls: string[]; // New field
}

// 4. Quiz Entity
export interface Quiz {
  id: number;
  lesson_id: number;
  title: string;
  passing_score: number;
}

// 5. Question Entity (used in Factory Pattern)
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer'
}

export interface Question {
  id: number;
  quiz_id: number;
  text: string;
  type: QuestionType;
  options?: string[]; // For MC
  correct_answer: string;
  points: number;
}

// 6. Enrollment (M-N Relationship between Student and Course)
export interface Enrollment {
  student_id: number;
  course_id: number;
  enrolled_at: string;
}

// 7. LessonProgress (Weak Entity, tracks student progress)
export interface LessonProgress {
  student_id: number;
  lesson_id: number;
  completed: boolean;
  last_accessed: string;
}

// 8. Review (Extra entity)
export interface Review {
  id: number;
  course_id: number;
  student_id: number;
  rating: number;
  comment: string;
  created_at: string;
}

// View Types
export type ViewState = 'home' | 'courses' | 'course_detail' | 'lesson' | 'quiz' | 'admin' | 'instructor_panel' | 'become_instructor' | 'profile_settings' | 'sql_spec' | 'patterns';
