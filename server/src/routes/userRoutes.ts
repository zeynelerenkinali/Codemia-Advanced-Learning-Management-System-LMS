import { Router } from 'express';
import { 
    updateUser, 
    deleteAccount, 
    becomeInstructor, 
    getInstructorProfile,
    updateInstructorProfile
} from '../controllers/userController';

const router = Router();

router.put('/:id', updateUser);
router.delete('/:id', deleteAccount);

// Instructor Logic
router.post('/:id/become-instructor', becomeInstructor);
router.get('/:id/instructor-profile', getInstructorProfile);
router.put('/:id/instructor-profile', updateInstructorProfile);

export default router;