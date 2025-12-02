import { Router } from 'express';
import { getProgress } from '../controllers/progressController';

const router = Router();

// GET /api/progress?studentId=5
router.get('/', getProgress);

export default router;