import { Router } from 'express';
import { createQuiz, deleteQuiz, getQuizByLesson } from '../controllers/quizController';

const router = Router();

// POST /api/quizzes
router.post('/', createQuiz); 

// DELETE /api/quizzes/:id
router.delete('/:id', deleteQuiz);

export default router;