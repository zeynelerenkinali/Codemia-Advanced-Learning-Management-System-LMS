

import { Database } from '../Database';
import { Course, Lesson, Review, Quiz, Question } from '../../types';

/**
 * PATTERN 2: REPOSITORY
 * 
 * Why: Decouples the business logic (React components) from the data access layer (Database class).
 */
export class CourseRepository {
  private db = Database.getInstance();

  getAll(): Course[] {
    return this.db.courses;
  }

  getById(id: number): Course | undefined {
    return this.db.courses.find(c => c.id === id);
  }

  getByInstructor(instructorId: number): Course[] {
    return this.db.courses.filter(c => c.instructor_id === instructorId);
  }

  getLessonsByCourseId(courseId: number): Lesson[] {
    return this.db.lessons
      .filter(l => l.course_id === courseId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  getQuizByLessonId(lessonId: number): Quiz | undefined {
    return this.db.quizzes.find(q => q.lesson_id === lessonId);
  }

  getQuestionsByQuizId(quizId: number): Question[] {
      return this.db.questions.filter(q => q.quiz_id === quizId);
  }

  // Course CRUD
  create(course: Omit<Course, 'id'>): Course {
    return this.db.addCourse(course);
  }
  
  update(id: number, updates: Partial<Course>): Course {
    return this.db.updateCourse(id, updates);
  }

  delete(id: number): void {
    this.db.deleteCourse(id);
  }

  // Lesson CRUD
  createLesson(lesson: Omit<Lesson, 'id'>): Lesson {
    return this.db.addLesson(lesson);
  }

  updateLesson(id: number, updates: Partial<Lesson>): Lesson {
    return this.db.updateLesson(id, updates);
  }

  deleteLesson(id: number): void {
    this.db.deleteLesson(id);
  }

  // Quiz CRUD
  createQuiz(quiz: Omit<Quiz, 'id'>): Quiz {
    return this.db.addQuiz(quiz);
  }
  
  deleteQuiz(id: number): void {
    this.db.deleteQuiz(id);
  }

  // Question CRUD
  createQuestion(question: Omit<Question, 'id'>): Question {
    return this.db.addQuestion(question);
  }

  updateQuestion(id: number, updates: Partial<Question>): Question {
    return this.db.updateQuestion(id, updates);
  }

  deleteQuestion(id: number): void {
      this.db.deleteQuestion(id);
  }

  // Enrollment Logic
  isEnrolled(studentId: number, courseId: number): boolean {
    return this.db.enrollments.some(e => e.student_id === studentId && e.course_id === courseId);
  }

  enroll(studentId: number, courseId: number): void {
    this.db.enrollStudent(studentId, courseId);
  }

  // Progress Logic
  getProgress(studentId: number, courseId: number): number {
    const lessons = this.getLessonsByCourseId(courseId);
    if (lessons.length === 0) return 0;

    const lessonIds = lessons.map(l => l.id);
    const completedCount = this.db.progress.filter(p => 
      p.student_id === studentId && 
      lessonIds.includes(p.lesson_id) && 
      p.completed
    ).length;

    return Math.round((completedCount / lessons.length) * 100);
  }

  // Review Logic
  getReviews(courseId: number): Review[] {
    return this.db.reviews.filter(r => r.course_id === courseId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getAverageRating(courseId: number): number {
    const reviews = this.getReviews(courseId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    // Return average rounded to 1 decimal place
    return parseFloat((sum / reviews.length).toFixed(1));
  }

  addReview(courseId: number, studentId: number, rating: number, comment: string): Review {
    if (!this.isEnrolled(studentId, courseId)) {
      throw new Error("Only enrolled students can write a review.");
    }
    
    // Check if already reviewed (Constraint: One review per student per course)
    const existing = this.db.reviews.find(r => r.course_id === courseId && r.student_id === studentId);
    if (existing) {
      throw new Error("You have already reviewed this course.");
    }

    return this.db.addReview({
      course_id: courseId,
      student_id: studentId,
      rating,
      comment,
      created_at: new Date().toISOString()
    });
  }
}
