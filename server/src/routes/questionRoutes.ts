import { Router } from 'express';
import { createQuestion, updateQuestion, deleteQuestion } from '../controllers/questionController';

const router = Router();

// POST /api/questions
router.post('/', createQuestion);

// PUT /api/questions/:id
router.put('/:id', updateQuestion);

// DELETE /api/questions/:id
router.delete('/:id', deleteQuestion);

export default router;