import { Router } from 'express';
import { 
    getLessonsByCourse, 
    createLesson, 
    updateLesson, 
    deleteLesson,
    getLessonById // <--- Import the new function
} from '../controllers/lessonController';
import { getQuizByLesson } from '../controllers/quizController';

const router = Router();

// GET /api/lessons/course/:courseId  (Get all lessons for a course)
router.get('/course/:courseId', getLessonsByCourse);

// GET /api/lessons/:id  (Get ONE specific lesson) <--- THIS WAS MISSING
router.get('/:id', getLessonById);

// GET /api/lessons/:lessonId/quiz
router.get('/:lessonId/quiz', getQuizByLesson);

// POST /api/lessons
router.post('/', createLesson);

// PUT /api/lessons/:id
router.put('/:id', updateLesson);

// DELETE /api/lessons/:id
router.delete('/:id', deleteLesson);


export default router;