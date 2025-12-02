import React, { useEffect, useState } from 'react';
import { Course } from '../types';
import { BookOpen, User, CheckCircle, Clock, PlayCircle, Loader2 } from 'lucide-react';

interface Props {
  onSelectCourse: (id: number) => void;
  currentUserId: number;
}

// API'den gelen verinin yapısı (Enrollment ile Course birleşmiş hali)
interface EnrolledCourseData extends Course {
  progress?: number;
  last_accessed?: string;
  enrollment_date?: string;
}

const API_URL = 'http://localhost:5000/api';

export const StudentMyCourses: React.FC<Props> = ({ onSelectCourse, currentUserId }) => {
  const [courses, setCourses] = useState<EnrolledCourseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };

        // Backend'de bu kullanıcının kayıtlı olduğu kursları ve ilerleme durumunu çeken endpoint
        // (Backend'de /users/:id/enrollments endpoint'i olduğunu varsayıyoruz)
        const response = await fetch(`${API_URL}/courses/student/${currentUserId}`, { headers });
        
        if (response.ok) {
            const data = await response.json();
            // Backend veriyi { course: {...}, progress: 50, last_accessed: ... } şeklinde dönebilir.
            // Onu düzleştirmemiz gerekebilir veya backend direkt düz liste dönüyordur.
            // Biz burada backend'in şu formatta döndüğünü varsayıp işliyoruz:
            // [{ ...courseFields, progress: 50, last_accessed: '...' }]
            
            // Eğer backend JOIN yapısı farklıysa burayı maplemek gerekebilir.
            // Örn: data.map((item: any) => ({ ...item.course, progress: item.progress, last_accessed: item.last_accessed }))
            
            // Şimdilik direkt atıyoruz (Backend uyumluysa)
            setCourses(data); 
        } else {
            console.error("Kayıtlı kurslar çekilemedi.");
        }
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [currentUserId]);

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
      return <div className="flex h-64 items-center justify-center text-indigo-600"><Loader2 className="animate-spin mr-2"/> Kurslarınız Yükleniyor...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">My Learning</h2>
            <p className="text-slate-500 mt-1">
                You are enrolled in <span className="font-bold text-indigo-600">{courses.length}</span> courses.
            </p>
        </div>
        <div className="bg-indigo-50 p-3 rounded-full">
            <BookOpen className="text-indigo-600" size={24} />
        </div>
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-slate-400" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No courses yet</h3>
            <p className="text-slate-500 mb-6">Browse the catalog to start your learning journey.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
            const progress = course.progress || 0; // Backend'den gelen progress
            
            return (
                <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
                <div className="h-32 bg-indigo-600 flex items-center justify-center relative">
                    <BookOpen className="text-white w-12 h-12 opacity-80" />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-400"></div>
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <CheckCircle size={12} /> Active
                    </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">{course.title}</h3>
                    
                    <div className="flex items-center gap-1 text-slate-500 text-xs mb-4">
                        <User size={14} />
                        <span>Instructor ID: {course.instructor_id}</span>
                    </div>

                    <div className="mb-6 flex-1">
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                        <span>Progress</span>
                        <span className={progress === 100 ? 'text-green-600' : 'text-indigo-600'}>
                            {progress === 100 ? 'Completed' : `${progress}%`}
                        </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                        <div 
                            className={`h-2 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-indigo-600'}`} 
                            style={{ width: `${progress}%` }}
                        ></div>
                        </div>
                        {course.last_accessed && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <Clock size={10} /> 
                                <span>Last studied: {getTimeAgo(course.last_accessed)}</span>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => onSelectCourse(course.id)}
                        className="w-full py-2.5 rounded-lg font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                       <PlayCircle size={16} /> Continue
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