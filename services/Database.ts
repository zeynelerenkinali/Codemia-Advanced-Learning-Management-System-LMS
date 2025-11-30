
import { User, Course, Lesson, Quiz, Question, Enrollment, LessonProgress, Review, UserRole, QuestionType, InstructorProfile } from '../types';

/**
 * PATTERN 1: SINGLETON
 * 
 * Why: Ensures we have exactly one instance of our data source managing the state 
 * across the entire application, similar to a connection pool in a real DB driver.
 */
export class Database {
  private static instance: Database;

  public users: User[] = [];
  public instructorProfiles: InstructorProfile[] = []; // Subclass table simulation
  public courses: Course[] = [];
  public lessons: Lesson[] = [];
  public quizzes: Quiz[] = [];
  public questions: Question[] = [];
  public enrollments: Enrollment[] = [];
  public progress: LessonProgress[] = [];
  public reviews: Review[] = [];

  // ID Counters simulating SERIAL
  private ids = {
    users: 1,
    courses: 1,
    lessons: 1,
    quizzes: 1,
    questions: 1,
    reviews: 1,
  };

  private constructor() {
    this.seed();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private seed() {
    // Users
    this.addUser({ name: 'Alice Admin', email: 'admin@codemia.edu', role: UserRole.ADMIN, password_hash: 'pw', country: 'USA', city: 'Seattle', postal_code: '98101' });
    
    // Instructor 1
    const instructor = this.addUser({ name: 'Bob Instructor', email: 'inst@codemia.edu', role: UserRole.INSTRUCTOR, password_hash: 'pw', country: 'Canada', city: 'Toronto', postal_code: 'M5H 2N2' });
    this.addInstructorProfile({ user_id: instructor.id, bio: 'PhD in Computer Science', expertise_area: 'Database Systems' });
    
    // Instructor 2
    const instructor2 = this.addUser({ name: 'Sarah Dev', email: 'sarah@codemia.edu', role: UserRole.INSTRUCTOR, password_hash: 'pw', country: 'UK', city: 'London', postal_code: 'SW1A 1AA' });
    this.addInstructorProfile({ user_id: instructor2.id, bio: 'Ex-Google Engineer', expertise_area: 'Full Stack Development' });

    const student = this.addUser({ name: 'Charlie Student', email: 'student@codemia.edu', role: UserRole.STUDENT, password_hash: 'pw', country: 'USA', city: 'Boston', postal_code: '02108' });

    // --- COURSES ---

    // 1. DBMS (Bob)
    const dbCourse = this.addCourse({ title: 'Database Management Systems', description: 'Master SQL, Normalization, and Database Design patterns.', instructor_id: instructor.id, price: 0, created_at: new Date().toISOString() });
    
    // 2. React (Sarah)
    const reactCourse = this.addCourse({ title: 'Advanced React Patterns', description: 'Deep dive into Hooks, Context API, and Performance Optimization.', instructor_id: instructor2.id, price: 0, created_at: new Date().toISOString() });

    // 3. Python (Sarah)
    const pythonCourse = this.addCourse({ title: 'Python Zero to Hero', description: 'Learn Python from scratch. Covers loops, functions, OOP, and file handling.', instructor_id: instructor2.id, price: 0, created_at: new Date().toISOString() });

    // 4. Algorithms (Bob)
    const algoCourse = this.addCourse({ title: 'Algorithms & Data Structures', description: 'Master Big O notation, Sorting algorithms, Trees, and Graphs.', instructor_id: instructor.id, price: 0, created_at: new Date().toISOString() });


    // --- ENROLLMENTS ---
    this.enrollStudent(student.id, dbCourse.id);


    // --- REVIEWS ---
    this.addReview({ course_id: dbCourse.id, student_id: student.id, rating: 5, comment: 'Great course! learned a lot about normalization.', created_at: new Date().toISOString() });


    // --- LESSONS & QUIZZES ---

    // 1. DBMS Lessons
    const l1 = this.addLesson({ course_id: dbCourse.id, title: 'Introduction to Relational Model', content: 'The relational model is based on predicate logic and set theory.', order_index: 1, type: 'article', attachment_urls: ['https://example.com/slide1.pdf'] });
    // Updated video URL to 'SQL in 100 Seconds' (Fireship) which is highly embed-friendly
    const l2 = this.addLesson({ course_id: dbCourse.id, title: 'SQL Basics', content: 'https://www.youtube.com/watch?v=ExXhW9FNi20', order_index: 2, type: 'video', attachment_urls: [] });
    
    const q1 = this.addQuiz({ lesson_id: l1.id, title: 'Relational Model Quiz', passing_score: 50 });
    this.addQuestion({ quiz_id: q1.id, text: 'What is a Primary Key?', type: QuestionType.MULTIPLE_CHOICE, correct_answer: 'Unique ID', points: 10, options: ['Unique ID', 'Foreign Link', 'Just a number'] });
    this.addQuestion({ quiz_id: q1.id, text: 'SQL is case sensitive?', type: QuestionType.TRUE_FALSE, correct_answer: 'False', points: 5, options: ['True', 'False'] });

    // 2. React Lessons
    const r1 = this.addLesson({ course_id: reactCourse.id, title: 'Understanding Hooks', content: 'Hooks allow you to use state and other React features without writing a class. useState and useEffect are the most common.', order_index: 1, type: 'article', attachment_urls: [] });
    this.addLesson({ course_id: reactCourse.id, title: 'Custom Hooks', content: 'Building your own hooks lets you extract component logic into reusable functions.', order_index: 2, type: 'article', attachment_urls: [] });
    
    const qr1 = this.addQuiz({ lesson_id: r1.id, title: 'Hooks Knowledge Check', passing_score: 70 });
    // CHANGED TO SHORT ANSWER FOR DEMO
    this.addQuestion({ quiz_id: qr1.id, text: 'Can you use hooks inside loops?', type: QuestionType.SHORT_ANSWER, correct_answer: 'No', points: 10, options: ['nope', 'no'] });

    // 3. Python Lessons
    const py1 = this.addLesson({ course_id: pythonCourse.id, title: 'Python Syntax & Variables', content: 'Python uses indentation for blocks instead of curly braces. Variables are dynamically typed.', order_index: 1, type: 'article', attachment_urls: ['https://python.org/doc/styleguide.pdf'] });
    this.addLesson({ course_id: pythonCourse.id, title: 'Functions and Modules', content: 'Functions are defined using the "def" keyword. Modules allow code reuse.', order_index: 2, type: 'article', attachment_urls: [] });

    const qPy1 = this.addQuiz({ lesson_id: py1.id, title: 'Syntax Check', passing_score: 80 });
    this.addQuestion({ quiz_id: qPy1.id, text: 'Which keyword defines a function in Python?', type: QuestionType.MULTIPLE_CHOICE, correct_answer: 'def', points: 10, options: ['func', 'def', 'function', 'define'] });

    // 4. Algo Lessons
    this.addLesson({ course_id: algoCourse.id, title: 'Big O Notation', content: 'Big O describes the worst-case scenario for execution time or space used.', order_index: 1, type: 'article', attachment_urls: [] });

    // --- PROGRESS ---
    this.progress.push({ student_id: student.id, lesson_id: l1.id, completed: true, last_accessed: new Date().toISOString() });
  }

  // Generic Helpers
  public addUser(u: Omit<User, 'id'>): User { const n = { ...u, id: this.ids.users++ }; this.users.push(n); return n; }
  public addInstructorProfile(p: InstructorProfile): void { this.instructorProfiles.push(p); }
  public addCourse(c: Omit<Course, 'id'>): Course { const n = { ...c, id: this.ids.courses++ }; this.courses.push(n); return n; }
  public addLesson(l: Omit<Lesson, 'id'>): Lesson { const n = { ...l, id: this.ids.lessons++ }; this.lessons.push(n); return n; }
  public addQuiz(q: Omit<Quiz, 'id'>): Quiz { const n = { ...q, id: this.ids.quizzes++ }; this.quizzes.push(n); return n; }
  public addQuestion(q: Omit<Question, 'id'>): Question { const n = { ...q, id: this.ids.questions++ }; this.questions.push(n); return n; }
  
  public addReview(r: Omit<Review, 'id'>): Review {
    const n = { ...r, id: this.ids.reviews++ };
    this.reviews.push(n);
    return n;
  }

  public enrollStudent(studentId: number, courseId: number) {
    if (!this.enrollments.some(e => e.student_id === studentId && e.course_id === courseId)) {
        this.enrollments.push({
            student_id: studentId,
            course_id: courseId,
            enrolled_at: new Date().toISOString()
        });
    }
  }

  // Transaction: Become Instructor
  public promoteUser(userId: number, bio: string, expertise: string): User {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");

    // 1. Update User Role
    this.users[userIndex].role = UserRole.INSTRUCTOR;
    
    // 2. Add to Instructors Table
    this.instructorProfiles.push({
        user_id: userId,
        bio,
        expertise_area: expertise
    });

    return this.users[userIndex];
  }

  // User Profile Updates
  public updateUser(userId: number, updates: Partial<User>): User {
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error("User not found");
    
    this.users[idx] = { ...this.users[idx], ...updates };
    return this.users[idx];
  }

  public updateInstructorProfile(userId: number, bio: string, expertise: string): void {
    const idx = this.instructorProfiles.findIndex(p => p.user_id === userId);
    if (idx !== -1) {
        this.instructorProfiles[idx].bio = bio;
        this.instructorProfiles[idx].expertise_area = expertise;
    }
  }

  // Update Course
  public updateCourse(id: number, updates: Partial<Course>): Course {
    const idx = this.courses.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("Course not found");
    this.courses[idx] = { ...this.courses[idx], ...updates };
    return this.courses[idx];
  }

  // Delete Course (Cascading Delete)
  public deleteCourse(id: number): void {
    // 1. Cascade: Enrollments & Reviews (Immutable filtering)
    this.enrollments = this.enrollments.filter(e => e.course_id !== id);
    this.reviews = this.reviews.filter(r => r.course_id !== id);

    // 2. Find and Delete Lessons (which will cascade to Quizzes/Questions)
    const lessonIds = this.lessons.filter(l => l.course_id === id).map(l => l.id);
    
    // We execute deletion sequentially to ensure state stability
    lessonIds.forEach(lId => this.deleteLesson(lId));

    // 3. Remove Course
    this.courses = this.courses.filter(c => c.id !== id);
    console.log(`[Database] Deleted Course ${id}`);
  }

  // Lesson CRUD
  public updateLesson(id: number, updates: Partial<Lesson>): Lesson {
    const idx = this.lessons.findIndex(l => l.id === id);
    if (idx === -1) throw new Error("Lesson not found");
    this.lessons[idx] = { ...this.lessons[idx], ...updates };
    return this.lessons[idx];
  }

  // Delete Lesson (Cascading Delete)
  public deleteLesson(id: number): void {
    // 1. Cascade: Progress
    this.progress = this.progress.filter(p => p.lesson_id !== id);

    // 2. Cascade: Quiz
    const quiz = this.quizzes.find(q => q.lesson_id === id);
    if (quiz) {
        this.deleteQuiz(quiz.id);
    }

    // 3. Remove Lesson (Immutable reassignment)
    this.lessons = this.lessons.filter(l => l.id !== id);
    console.log(`[Database] Deleted Lesson ${id}`);
  }

  // Quiz CRUD
  // Delete Quiz (Cascading Delete)
  public deleteQuiz(id: number): void {
    // 1. Cascade: Delete Questions (FK: quiz_id)
    this.questions = this.questions.filter(q => q.quiz_id !== id);
        
    // 2. Remove Quiz (Immutable reassignment)
    this.quizzes = this.quizzes.filter(q => q.id !== id);
    console.log(`[Database] Deleted Quiz ${id} and its questions`);
  }

  // Question CRUD
  public updateQuestion(id: number, updates: Partial<Question>): Question {
    const idx = this.questions.findIndex(q => q.id === id);
    if (idx === -1) throw new Error("Question not found");
    this.questions[idx] = { ...this.questions[idx], ...updates };
    return this.questions[idx];
  }

  public deleteQuestion(id: number): void {
    // Immutable reassignment
    this.questions = this.questions.filter(q => q.id !== id);
    console.log(`[Database] Deleted Question ${id}`);
  }
}
