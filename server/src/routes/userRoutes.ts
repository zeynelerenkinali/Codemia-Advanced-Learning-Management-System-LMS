import { Router } from 'express';
import { 
    getAllUsers,
    updateUser, 
    deleteAccount, 
    becomeInstructor, 
    getInstructorProfile,
    updateInstructorProfile,
    getUserById,
    getInstructorCourses
} from '../controllers/userController';

const router = Router();

router.get('/', getAllUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteAccount);
// --- 2. ADD THIS NEW ROUTE ---
router.get('/:id', getUserById);

// Instructor Logic
router.post('/:id/become-instructor', becomeInstructor);
router.get('/:id/instructor-profile', getInstructorProfile);
router.put('/:id/instructor-profile', updateInstructorProfile);
router.get('/instructor/:id', getInstructorCourses);

export default router;