import { Router } from 'express';
// Import getQuizById
import { createQuiz, deleteQuiz, getQuizByLesson, getQuizById } from '../controllers/quizController';
import { getQuestionsByQuiz } from '../controllers/questionController';

const router = Router();

// POST /api/quizzes
router.post('/', createQuiz); 

// DELETE /api/quizzes/:id
router.delete('/:id', deleteQuiz);

// GET /api/quizzes/:id (NEW ROUTE - This fixes your error)
router.get('/:id', getQuizById);

// GET /api/quizzes/:quizId/questions
router.get('/:quizId/questions', getQuestionsByQuiz);

export default router;