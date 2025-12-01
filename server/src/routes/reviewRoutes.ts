import express from 'express';
import { getReviews } from '../controllers/reviewController';

const router = express.Router();

// GET /api/reviews
router.get('/', getReviews);

export default router;