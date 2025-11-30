
import React, { useEffect, useState } from 'react';
import { Course } from '../types';
import { CourseRepository } from '../services/repositories/CourseRepository';
import { BookOpen, User, Tag, CheckCircle } from 'lucide-react';

interface Props {
  onSelectCourse: (id: number) => void;
  currentUserId: number;
}

export const CourseList: React.FC<Props> = ({ onSelectCourse, currentUserId }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const repo = new CourseRepository();

  useEffect(() => {
    setCourses(repo.getAll());
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800 border-b pb-4">Available Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => {
          const isEnrolled = repo.isEnrolled(currentUserId, course.id);
          const progress = isEnrolled ? repo.getProgress(currentUserId, course.id) : 0;

          return (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col group">
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
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                <p className="text-slate-600 mb-4 line-clamp-2 flex-1">{course.description}</p>
                
                <div className="flex items-center justify-between text-sm text-slate-500 mb-6">
                  <div className="flex items-center gap-1">
                    <User size={16} />
                    <span>ID: {course.instructor_id}</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                    <Tag size={14} />
                    <span>Free</span>
                  </div>
                </div>

                {isEnrolled && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => onSelectCourse(course.id)}
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
    </div>
  );
};
