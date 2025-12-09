import { Router } from 'express';
import { 
    getAllUsers,
    updateUser, 
    deleteAccount, 
    becomeInstructor, 
    getInstructorProfile,
    updateInstructorProfile,
    getStudentProfile,
    getUserById,
    getInstructorCourses,
} from '../controllers/userController';

const router = Router();

// --- IMPORTANT: SPECIFIC ROUTES FIRST ---
// These routes must be defined BEFORE /:id because they are more specific.

// Instructor Logic
router.post('/:id/become-instructor', becomeInstructor);
router.get('/:id/instructor-profile', getInstructorProfile);

// FIX: This line will now run before updateUser, fixing the routing issue.
// This ensures requests to update instructor profile go here, not to the generic user update.
router.put('/:id/instructor-profile', updateInstructorProfile); 
router.get('/:id/student-profile', getStudentProfile);
router.get('/instructor/:id', getInstructorCourses);

// --- GENERAL USER ROUTES ---
router.get('/', getAllUsers);

// NOTE: Parameterized routes like /:id must be placed at the VERY END.
// Otherwise, Express would interpret paths like /instructor-profile as an "id".
router.get('/:id', getUserById);
router.put('/:id', updateUser); // <-- General user update
router.delete('/:id', deleteAccount);

export default router;