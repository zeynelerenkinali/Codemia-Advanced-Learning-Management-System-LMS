import { Router } from 'express';
import { createLesson, updateLesson, deleteLesson } from '../controllers/lessonController';

const router = Router();

router.post('/', createLesson);
router.put('/:id', updateLesson);
router.delete('/:id', deleteLesson);

export default router;