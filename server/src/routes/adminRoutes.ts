import { Router } from 'express';
import { recalculateGPA, getCourseStats} from '../controllers/adminController'; 

const router = Router();

// Define the route here
router.post('/recalculate-gpa', recalculateGPA);

router.get('/reports/stats', getCourseStats);

export default router;