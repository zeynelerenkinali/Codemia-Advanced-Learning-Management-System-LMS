import React, { useState, useEffect } from 'react';
import { Course, Lesson, LessonProgress, Review, User, UserRole } from '../types';
import { PlayCircle, CheckCircle, Lock, Star, MessageSquare, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { progressSubject } from '../services/observers/ProgressObserver';

interface Props {
  courseId: number;
  currentUser: User;
  onSelectLesson: (id: number) => void;
  onBack: () => void;
}

const API_URL = 'http://localhost:5000/api';

export const CourseDetail: React.FC<Props> = ({ courseId, currentUser, onSelectLesson, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | undefined>();
  const [instructorName, setInstructorName] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<string | number>(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  
  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  const loadData = async () => {
    try {
        const token = localStorage.getItem('token');
        const headers = { 
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        };

        // 1. Kurs Detayını Çek
        const courseRes = await fetch(`${API_URL}/courses/${courseId}`, { headers });
        if (!courseRes.ok) throw new Error("Kurs bulunamadı");
        const courseData = await courseRes.json();
        setCourse(courseData);

        // 2. Eğitmen Bilgisini Çek
        if (courseData.instructor_id) {
            const userRes = await fetch(`${API_URL}/users/${courseData.instructor_id}`, { headers });
            if (userRes.ok) {
                const userData = await userRes.json();
                setInstructorName(userData.name);
            }
        }

        // 3. Dersleri Çek
        const lessonsRes = await fetch(`${API_URL}/courses/${courseId}/lessons`, { headers });
        const lessonsData = await lessonsRes.json();
        setLessons(lessonsData);

        // 4. Yorumları Çek
        const reviewsRes = await fetch(`${API_URL}/courses/${courseId}/reviews`, { headers });
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData);
        
        // Puan Hesapla
        if (reviewsData.length > 0) {
            const total = reviewsData.reduce((acc: any, r: any) => acc + r.rating, 0);
            setAvgRating((total / reviewsData.length).toFixed(1));
        } else {
            setAvgRating(0);
        }

        // 5. Kayıt ve İlerleme Durumu (Sadece Öğrenciler İçin)
        if (currentUser.role !== UserRole.INSTRUCTOR) {
            const enrollRes = await fetch(`${API_URL}/users/${currentUser.id}/enrollments`, { headers });
            if (enrollRes.ok) {
                 const enrollments = await enrollRes.json();
                 // Backend'den gelen yapıya göre kursu bul
                 const enrollment = enrollments.find((e: any) => e.id === courseId || e.course_id === courseId);
                 
                 if (enrollment) {
                     setIsEnrolled(true);
                     
                     // İlerleme yüzdesini backend hesaplamışsa al, yoksa 0
                     setProgressPercent(enrollment.progress || 0);

                     // Ders bazlı ilerleme (Checkmarklar için)
                     // Tüm progressleri çekip bu kursa ait olanları filtreliyoruz
                     const progRes = await fetch(`${API_URL}/progress?studentId=${currentUser.id}`, { headers });
                     if (progRes.ok) {
                        const allProgress = await progRes.json();
                        // Sadece bu kursun derslerine ait progressleri filtrele
                        const lessonIds = lessonsData.map((l: any) => l.id);
                        const courseProgress = allProgress.filter((p: any) => lessonIds.includes(p.lesson_id) && p.completed);
                        setProgress(courseProgress);

                        // Eğer enrollment içinde progress yoksa buradan hesapla
                        if (enrollment.progress === undefined && lessonsData.length > 0) {
                            setProgressPercent(Math.round((courseProgress.length / lessonsData.length) * 100));
                        }
                     }
                 } else {
                     setIsEnrolled(false);
                     setProgressPercent(0);
                 }
            }
        }

    } catch (error) {
        console.error("Veri yüklenemedi:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // OBSERVER PATTERN: İlerleme güncellemelerini dinle
    const unsubscribe = progressSubject.subscribe(({ studentId }) => {
      if (studentId === currentUser.id) {
        // Sadece ilgili öğrenci için veriyi tazele
        // Tüm sayfayı yenilemek yerine sadece progress'i çekmek daha performanslı olurdu
        // ama şimdilik loadData() çağırıyoruz.
        loadData();
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, currentUser.id]);

  const handleEnroll = async () => {
    if (currentUser.role === UserRole.INSTRUCTOR) return;
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/enrollments`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                studentId: currentUser.id,
                courseId: courseId
            })
        });

        if (res.ok) {
            loadData(); // Sayfayı yenile
        } else {
            alert("Kayıt işlemi başarısız.");
        }
    } catch (error) {
        console.error(error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                courseId,
                studentId: currentUser.id,
                rating: newRating,
                comment: newComment
            })
        });

        if (!res.ok) throw new Error("Yorum gönderilemedi.");
        
        setNewComment('');
        setShowReviewForm(false);
        loadData();
    } catch (err: any) {
        setReviewError(err.message);
    }
  };

  const isCompleted = (lessonId: number) => progress.some(p => p.lesson_id === lessonId && p.completed);
  
  // Backend genelde user objesini review içinde dönmezse isim bulmak zor olabilir.
  // Basitlik için backend'in review objesine 'student_name' eklediğini varsayıyoruz 
  // veya varsayılan bir isim gösteriyoruz.
  const getUserName = (review: any) => review.student_name || `User #${review.student_id}`;

  if (loading) return <div className="flex h-screen items-center justify-center text-indigo-600"><Loader2 className="animate-spin mr-2"/> Kurs Detayları Yükleniyor...</div>;
  if (!course) return <div className="p-8 text-center">Course not found</div>;

  // Role Checks
  const isInstructor = currentUser.role === UserRole.INSTRUCTOR;
  const isCreator = course.instructor_id === currentUser.id;
  // Creator can preview their own course content, even if not enrolled
  const canAccessContent = isEnrolled || isCreator; 

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <button onClick={onBack} className="text-indigo-600 hover:underline font-medium">&larr; Back to Dashboard</button>
      
      {/* Course Header with Enrollment Logic */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{course.title}</h1>
            <p className="text-slate-500 font-medium mb-4">Instructor: {instructorName}</p>
            <p className="text-slate-600 text-lg mb-6">{course.description}</p>
            <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">Free Course</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-bold">{lessons.length} Lessons</span>
                <span className="px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full text-sm font-bold flex items-center gap-1">
                    <Star size={14} fill="currentColor" className="text-yellow-500" /> 
                    {avgRating} <span className="text-yellow-600 font-normal">({reviews.length} reviews)</span>
                </span>
            </div>
            
            {/* Progress Bar for Enrolled Students */}
            {isEnrolled && (
              <div className="mt-8 max-w-lg">
                <div className="flex justify-between items-center mb-1">
                   <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <TrendingUp size={16} className="text-indigo-600"/> Your Progress
                   </div>
                   <span className="text-sm font-bold text-indigo-600">
                     {progressPercent === 100 ? 'Completed' : `${progressPercent}%`}
                   </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                    <div 
                      className="bg-indigo-600 h-3 rounded-full transition-all duration-700 shadow-sm"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
              </div>
            )}
        </div>
        
        <div className="w-full md:w-64 bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
            {isEnrolled ? (
                <div className="text-green-600 font-bold flex items-center justify-center gap-2 mb-2">
                    <CheckCircle /> Enrolled
                </div>
            ) : isInstructor ? (
                // INSTRUCTOR VIEW: cannot enroll
                <div className="text-slate-500 font-bold flex flex-col items-center justify-center gap-2 mb-2">
                    <AlertTriangle className="text-amber-500" /> 
                    <span>Instructor View</span>
                    <span className="text-xs font-normal">You cannot enroll in courses.</span>
                </div>
            ) : (
                // STUDENT VIEW: can enroll
                <button 
                    onClick={handleEnroll}
                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    Enroll Now
                </button>
            )}

            <p className="text-xs text-slate-500 mt-2">
                {isEnrolled ? 'Access all lessons below.' : isCreator ? 'You are viewing your own course as a preview.' : 'Enrollment is required to access content.'}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Col: Syllabus */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold text-slate-800 border-b pb-2">Course Syllabus</h3>
            {lessons.length === 0 ? (
            <p className="text-slate-500 italic">No lessons available yet.</p>
            ) : (
            lessons.map((lesson, idx) => {
                
                return (
                    <div 
                    key={lesson.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        canAccessContent 
                            ? 'bg-white border-slate-200 hover:border-indigo-300 cursor-pointer group hover:shadow-sm' 
                            : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => canAccessContent && onSelectLesson(lesson.id)}
                    >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted(lesson.id) 
                                ? 'bg-green-100 text-green-600' 
                                : canAccessContent ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-400'
                        }`}>
                        {isCompleted(lesson.id) ? <CheckCircle size={20} /> : <span className="font-bold">{idx + 1}</span>}
                        </div>
                        <div>
                        <h4 className={`font-medium transition-colors ${canAccessContent ? 'text-slate-900 group-hover:text-indigo-600' : 'text-slate-500'}`}>
                            {lesson.title}
                        </h4>
                        <p className="text-xs text-slate-500">Lesson {lesson.id}</p>
                        </div>
                    </div>
                    
                    {canAccessContent ? (
                        <PlayCircle className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    ) : (
                        <Lock className="text-slate-400" size={18} />
                    )}
                    </div>
                );
            })
            )}
          </div>

          {/* Right Col: Reviews */}
          <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-slate-800">Reviews</h3>
                    {Number(avgRating) > 0 && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <Star size={10} fill="currentColor" /> {avgRating}
                        </span>
                    )}
                </div>
                {/* Only Enrolled Students can write reviews */}
                {isEnrolled && !showReviewForm && (
                    <button 
                        onClick={() => setShowReviewForm(true)}
                        className="text-sm font-bold text-indigo-600 hover:underline"
                    >
                        + Write Review
                    </button>
                )}
              </div>

              {/* Add Review Form */}
              {showReviewForm && (
                  <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                      <h4 className="font-bold text-sm mb-2">Write a Review</h4>
                      <form onSubmit={handleSubmitReview} className="space-y-3">
                          {reviewError && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{reviewError}</p>}
                          <div>
                              <label className="text-xs text-slate-500 font-bold uppercase">Rating</label>
                              <div className="flex gap-2 mt-1">
                                {[1,2,3,4,5].map(num => (
                                    <button 
                                        key={num}
                                        type="button" 
                                        onClick={() => setNewRating(num)}
                                        className={`p-1 rounded ${newRating >= num ? 'text-yellow-400' : 'text-slate-300'}`}
                                    >
                                        <Star fill="currentColor" size={20} />
                                    </button>
                                ))}
                              </div>
                          </div>
                          <div>
                              <label className="text-xs text-slate-500 font-bold uppercase">Comment</label>
                              <textarea 
                                className="w-full text-sm p-2 border rounded mt-1 outline-none focus:border-indigo-500"
                                rows={3}
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Share your experience..."
                                required
                              />
                          </div>
                          <div className="flex gap-2">
                              <button type="button" onClick={() => setShowReviewForm(false)} className="flex-1 text-xs font-bold text-slate-500 py-2">Cancel</button>
                              <button type="submit" className="flex-1 text-xs font-bold bg-indigo-600 text-white py-2 rounded">Submit</button>
                          </div>
                      </form>
                  </div>
              )}

              {/* Review List */}
              <div className="space-y-4">
                  {reviews.length === 0 ? (
                      <div className="text-center py-6 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                          <MessageSquare className="mx-auto text-slate-300 mb-2" />
                          <p className="text-sm text-slate-500">No reviews yet.</p>
                      </div>
                  ) : (
                      reviews.map(r => (
                          <div key={r.id} className="bg-white p-4 rounded-lg border border-slate-200">
                              <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                        {getUserName(r).charAt(0)}
                                      </div>
                                      <span className="text-sm font-bold text-slate-800">{getUserName(r)}</span>
                                  </div>
                                  <div className="flex text-yellow-400">
                                      {Array.from({length: r.rating}).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                  </div>
                              </div>
                              <p className="text-sm text-slate-600 italic">"{r.comment}"</p>
                              <p className="text-xs text-slate-400 mt-2 text-right">{new Date(r.created_at).toLocaleDateString()}</p>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};