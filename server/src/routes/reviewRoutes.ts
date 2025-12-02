import { Router } from 'express';
import { getReviews, createReview } from '../controllers/reviewController';

const router = Router();

// GET /api/reviews - Retrieve list of reviews
router.get('/', getReviews);

// POST /api/reviews - Submit a new review
router.post('/', createReview);

export default router;