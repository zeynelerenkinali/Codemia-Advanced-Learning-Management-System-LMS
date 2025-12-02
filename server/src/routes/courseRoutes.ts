import { Router } from 'express';
import { 
    getAllCourses, 
    createCourse, 
    updateCourse, 
    deleteCourse, 
    getCoursesByInstructor, 
    enrollStudent,
    checkEnrollment,
    getEnrolledCourses
} from '../controllers/courseController';
import { getLessonsByCourse } from '../controllers/lessonController';

const router = Router();

router.get('/', getAllCourses);
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);
    
// Special Filters
router.get('/instructor/:instructorId', getCoursesByInstructor);
router.get('/student/:studentId', getEnrolledCourses);

// Sub-resources
router.get('/:courseId/lessons', getLessonsByCourse);

// Enrollment
router.post('/:courseId/enroll', enrollStudent);
router.get('/:courseId/check-enrollment/:studentId', checkEnrollment);

export default router;