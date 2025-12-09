import React, { useState, useEffect } from 'react';
import { ViewState, User, UserRole } from './types';
// import { Database } satırı silindi, çünkü artık Backend kullanıyoruz.
import { AuthPage } from './components/AuthPage';
import { CourseList } from './components/CourseList';
import { StudentMyCourses } from './components/StudentMyCourses';
import { CourseDetail } from './components/CourseDetail';
import { LessonView } from './components/LessonView';
import { QuizView } from './components/QuizView';
import { AdminPanel } from './components/AdminPanel';
import { InstructorPanel } from './components/InstructorPanel';
import { BecomeInstructor } from './components/BecomeInstructor';
import { ProfileSettings } from './components/ProfileSettings';
import { SQLViewer } from './components/SQLViewer';
import { PatternsInfo } from './components/PatternsInfo';
import { GraduationCap, Database as DbIcon, Code, Settings, BookOpen, Loader2, LogOut, PenTool, UserPlus, User as UserIcon, Library } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [view, setView] = useState<ViewState>('home');
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
  const [previousView, setPreviousView] = useState<string>('courses');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      
      // --- ESKİ MOCK DB KODLARI TEMİZLENDİ ---
      // Artık veritabanını backend yönetiyor.
      // Uygulama açılışta çökmesin diye kullanıcı oturumunu temizleyip
      // Login ekranına yönlendiriyoruz.
      localStorage.removeItem('codemia_user_id'); 
      
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = (user: User, remember: boolean) => {
    setCurrentUser(user);
    if (remember) {
      localStorage.setItem('codemia_user_id', user.id.toString());
    } else {
      localStorage.removeItem('codemia_user_id');
    }

    // Role-based redirection logic
    if (user.role === UserRole.INSTRUCTOR) {
        setView('instructor_panel');
    } else if (user.role === UserRole.ADMIN) {
        setView('admin');
    } else {
        setView('home');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('codemia_user_id');
    setView('home'); 
  };

  const handleDeleteAccount = () => {
    setCurrentUser(null);
    localStorage.removeItem('codemia_user_id');
    setView('home');
    alert("Your account has been deleted.");
  };

  const handleNav = (v: ViewState) => {
    setView(v);
    setActiveCourseId(null);
    setActiveLessonId(null);
    setActiveQuizId(null);
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/30">
            <GraduationCap size={48} className="text-white" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Codemia
          </h1>
          <p className="text-slate-400 text-lg mb-8 font-light tracking-wide">
            E-Learning Platform
          </p>
          
          <div className="flex flex-col items-center gap-3">
             <div className="flex items-center gap-2 text-indigo-400 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
              <Loader2 className="animate-spin w-4 h-4" />
              <span className="text-xs font-mono tracking-wider">INITIALIZING SYSTEM...</span>
            </div>
            <p className="text-xs text-slate-600 mt-2">DBMS Term Project Demo</p>
          </div>
        </div>
      </div>
    );
  }

  // If not logged in, show Auth Page
  if (!currentUser) {
    return <AuthPage onLogin={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <GraduationCap className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Codemia</span>
        </div>
        
        <nav className="p-4 space-y-2 flex-1">
          {/* HIDE COURSES LINK FOR INSTRUCTORS */}
          {currentUser.role !== UserRole.INSTRUCTOR && (
            <>
              <button 
                onClick={() => handleNav('home')} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'home' || view === 'courses' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'hover:bg-slate-800'}`}
              >
                <BookOpen size={20} />
                <span className="font-medium">Browse All</span>
              </button>

              {/* Student "My Courses" Link */}
              {currentUser.role === UserRole.STUDENT && (
                <button 
                  onClick={() => handleNav('student_courses')} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'student_courses' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
                >
                  <Library size={20} />
                  <span className="font-medium">My Courses</span>
                </button>
              )}
            </>
          )}

          {/* Role Based Navigation */}
          {currentUser.role === UserRole.ADMIN && (
            <button 
                onClick={() => handleNav('admin')} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'admin' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
            >
                <Settings size={20} />
                <span className="font-medium">Admin Panel</span>
            </button>
          )}

          {currentUser.role === UserRole.INSTRUCTOR && (
            <button 
                onClick={() => handleNav('instructor_panel')} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'instructor_panel' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
            >
                <PenTool size={20} />
                <span className="font-medium">My Dashboard</span>
            </button>
          )}

          {/* Become Instructor Logic */}
          {currentUser.role === UserRole.STUDENT && (
            <button 
                onClick={() => setView('become_instructor' as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${(view as any) === 'become_instructor' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-indigo-400'}`}
            >
                <UserPlus size={20} />
                <span className="font-medium">Become Instructor</span>
            </button>
          )}

          <div className="pt-6 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Project Artifacts</div>

          <button 
            onClick={() => handleNav('sql_spec')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'sql_spec' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <DbIcon size={20} />
            <span className="font-medium">SQL Schema</span>
          </button>

          <button 
            onClick={() => handleNav('patterns')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'patterns' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <Code size={20} />
            <span className="font-medium">Design Patterns</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
           <div 
             className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-slate-800 p-2 rounded transition-colors"
             onClick={() => setView('profile_settings' as any)}
           >
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                {currentUser.name.charAt(0)}
             </div>
             <div className="overflow-hidden">
               <p className="text-white font-medium truncate">{currentUser.name}</p>
               <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">{currentUser.role}</p>
             </div>
             <Settings size={14} className="text-slate-500 ml-auto" />
           </div>
           
           <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 py-2 rounded-lg transition-all text-sm font-medium"
           >
             <LogOut size={16} />
             Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex justify-between items-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">
                {view === 'home' && 'All Courses Catalog'}
                {view === 'student_courses' && 'My Learning Dashboard'}
                {view === 'admin' && 'Administration'}
                {view === 'instructor_panel' && 'Instructor Dashboard'}
                {(view as any) === 'become_instructor' && 'Join Our Faculty'}
                {(view as any) === 'profile_settings' && 'Account Settings and Information'}
                {view === 'sql_spec' && 'Database Specification'}
                {view === 'patterns' && 'Architecture Overview'}
                {(view === 'course_detail' || view === 'lesson' || view === 'quiz') && 'Classroom'}
            </h2>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
        {view === 'home' && (
              <CourseList 
                currentUserId={currentUser.id}
                onSelectCourse={(id) => {
                  setPreviousView('home'); 
                  setActiveCourseId(id);
                  setView('course_detail');
                }} 
              />
          )}

          {view === 'student_courses' && (
              <StudentMyCourses 
                  currentUserId={currentUser.id}
                  onSelectCourse={(id) => {
                      setPreviousView('student_courses');
                      setActiveCourseId(id);
                      setView('course_detail');
                  }}
              />
          )}

          {view === 'course_detail' && activeCourseId && (
            <CourseDetail 
              courseId={activeCourseId} 
              currentUser={currentUser}
              onBack={() => setView(previousView)} 
              onSelectLesson={(id) => {
                setActiveLessonId(id);
                setView('lesson');
              }}
            />
          )}

          {view === 'lesson' && activeLessonId && (
            <LessonView 
              lessonId={activeLessonId} 
              currentUserId={currentUser.id}
              onBack={() => setView('course_detail')}
              onStartQuiz={(id) => {
                setActiveQuizId(id);
                setView('quiz');
              }}
            />
          )}

          {view === 'quiz' && activeQuizId && (
            <QuizView 
              quizId={activeQuizId}
              currentUserId={currentUser.id}
              onBack={() => setView('lesson')}
            />
          )}

          {view === 'admin' && <AdminPanel />}
          {view === 'instructor_panel' && (
            <InstructorPanel 
                currentUserId={currentUser.id} 
                onViewCourse={(id) => {
                    setActiveCourseId(id);
                    setView('course_detail');
                }}
            />
          )}
          
          {(view as any) === 'become_instructor' && (
            <BecomeInstructor 
                currentUser={currentUser} 
                onSuccess={(u) => {
                    setCurrentUser(u);
                    setView('instructor_panel');
                }}
            />
          )}

          {(view as any) === 'profile_settings' && (
            <ProfileSettings 
                currentUser={currentUser}
                onUpdate={setCurrentUser}
                onDeleteAccount={handleDeleteAccount}
            />
          )}

          {view === 'sql_spec' && <SQLViewer />}
          {view === 'patterns' && <PatternsInfo />}
        </div>
      </main>
    </div>
  );
}