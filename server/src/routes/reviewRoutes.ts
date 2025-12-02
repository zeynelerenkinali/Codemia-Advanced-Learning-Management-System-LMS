import { Router } from 'express';
import { getReviews } from '../controllers/reviewController';

const router = Router();

// GET /api/reviews
router.get('/', getReviews);

export default router;