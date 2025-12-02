import { Router } from 'express';
// Import the new updateProgress function
import { getProgress, updateProgress } from '../controllers/progressController';

const router = Router();

// GET /api/progress?studentId=5
router.get('/', getProgress);

// POST /api/progress (This route was missing)
router.post('/', updateProgress); 

export default router;