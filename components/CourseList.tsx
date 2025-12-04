import React, { useEffect, useState } from 'react';
import { Course } from '../types';
import { BookOpen, User, Tag, CheckCircle, Star, Clock, Loader2 } from 'lucide-react';
import { getCourseById } from '@/server/src/controllers/courseController';

interface Props {
  onSelectCourse: (id: number) => void;
  currentUserId: number;
}

const API_URL = 'http://localhost:5000/api';

export const CourseList: React.FC<Props> = ({ onSelectCourse, currentUserId }) => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  
  // İlişkisel verileri tutmak için state'ler
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);

useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        };

        // 1. Fetch Courses (Now includes avg_rating!)
        const coursesRes = await fetch(`${API_URL}/courses`, { headers });
        
        // 2. Fetch My Enrollments (Now includes progress!)
        const enrollmentsRes = await fetch(`${API_URL}/courses/student/${currentUserId}`, { headers });

        if (coursesRes.ok) {
            const coursesData = await coursesRes.json();
            
            if (enrollmentsRes.ok) {
                const myEnrollments = await enrollmentsRes.json();
                setMyEnrollments(myEnrollments);

                // --- CRITICAL MERGE STEP ---
                // We need to match the "Progress" from Enrollments into the "All Courses" list
                // so the Browse page shows your green bars too.
                const mergedCourses = coursesData.map((course: any) => {
                    const myEnrollment = myEnrollments.find((e: any) => e.course_id === course.course_id);
                    return {
                        ...course,
                        // If I am enrolled, use that progress. If not, 0.
                        progress: myEnrollment ? myEnrollment.progress : 0,
                        isEnrolled: !!myEnrollment
                    };
                });
                
                setCourses(mergedCourses);
            } else {
                // If fetching enrollments failed (or user not logged in), just show courses
                setCourses(coursesData);
            }
        }

      } catch (error) {
        console.error("Veriler yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUserId]);

  // Yardımcı Fonksiyonlar
  const getTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
      return <div className="flex h-64 items-center justify-center text-indigo-600"><Loader2 className="animate-spin mr-2"/> Kurslar Listeleniyor...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-800 border-b pb-4">Available Courses</h2>
      
      {courses.length === 0 ? (
          <div className="text-center py-10 text-slate-500">Henüz hiç kurs eklenmemiş.</div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
    // ✅ 1. USE THE MERGED DATA DIRECTLY
    // We trust the backend & useEffect logic now. No more manual finding!
    const isEnrolled = course.isEnrolled;
    const progress = course.progress || 0;
    
    // Backend sends these fields now:
    const avgRating = course.avg_rating || 0;
    const reviewCount = course.review_count || 0;

    const actualId = course.course_id || course.id;

    return (
    <div key={actualId} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col group">
        <div className="h-32 bg-indigo-600 flex items-center justify-center relative">
        <BookOpen className="text-white w-12 h-12 opacity-80" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-400"></div>
        {isEnrolled && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <CheckCircle size={12} /> Enrolled
            </div>
        )}
        </div>
        <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex-1">{course.title}</h3>
            
            {/* ✅ 2. USE BACKEND RATING */}
            {Number(avgRating) > 0 && (
                <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-700">
                    <Star size={12} fill="currentColor" /> {avgRating}
                </div>
            )}
        </div>
        
        <p className="text-slate-600 mb-4 line-clamp-2 flex-1 text-sm">{course.description}</p>
        
        <div className="flex items-center justify-between text-sm text-slate-500 mb-6">
            <div className="flex items-center gap-1">
            <User size={16} />
            <span>ID: {course.instructor_name || course.instructor_id}</span>
            </div>
            <div className="flex gap-2">
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                    {/* ✅ 3. USE BACKEND REVIEW COUNT */}
                    {reviewCount} reviews
                </div>
                <div className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                <Tag size={14} />
                <span>
                    {(Number(course.price) === 0 || course.price === null) 
                        ? 'Free' 
                        : `$${course.price}`
                    }
                </span>
                </div>
            </div>
        </div>

        {isEnrolled && (
            <div className="mb-4">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                <span>Progress</span>
                <span>{progress === 100 ? 'Completed' : `${progress}%`}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
                ></div>
            </div>
            {/* Note: 'last_accessed' might need to be passed from backend if you really need it, otherwise remove this check */}
            </div>
        )}

        <button 
            onClick={() => onSelectCourse(actualId)}
            className={`w-full py-2 rounded-lg font-medium transition-colors ${
            isEnrolled 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
        >
            {isEnrolled ? 'Continue Learning' : 'View Course'}
        </button>
        </div>
    </div>
    );
})}
          </div>
      )}
    </div>
  );
};  