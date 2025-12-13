import { Router } from 'express';
import { recalculateGPA } from '../controllers/adminController'; 

const router = Router();

// Define the route here
router.post('/recalculate-gpa', recalculateGPA);

export default router;