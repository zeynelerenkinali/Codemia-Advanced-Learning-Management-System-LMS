
import React, { useState, useEffect } from 'react';
import { Lesson, Quiz } from '../types';
import { Database } from '../services/Database';
import { progressSubject } from '../services/observers/ProgressObserver';
import { FileText, Video, Paperclip, ExternalLink, Play } from 'lucide-react';

interface Props {
  lessonId: number;
  currentUserId: number;
  onBack: () => void;
  onStartQuiz: (quizId: number) => void;
}

export const LessonView: React.FC<Props> = ({ lessonId, currentUserId, onBack, onStartQuiz }) => {
  const db = Database.getInstance();
  const lesson = db.lessons.find(l => l.id === lessonId);
  const quiz = db.quizzes.find(q => q.lesson_id === lessonId);

  useEffect(() => {
    // Mark as completed immediately on view (simulating tracking)
    // OBSERVER PATTERN TRIGGER
    const existing = db.progress.find(p => p.student_id === currentUserId && p.lesson_id === lessonId);
    if (!existing) {
      db.progress.push({
        student_id: currentUserId,
        lesson_id: lessonId,
        completed: true,
        last_accessed: new Date().toISOString()
      });
      progressSubject.notify(currentUserId, lessonId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, currentUserId]);

  const getYouTubeEmbedId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (!lesson) return <div>Lesson not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button onClick={onBack} className="text-indigo-600 hover:underline mb-4 block">&larr; Back to Course</button>
      
      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 ${
                lesson.type === 'video' ? 'bg-red-100 text-red-700' :
                lesson.type === 'quiz' ? 'bg-purple-100 text-purple-700' :
                'bg-blue-100 text-blue-700'
            }`}>
                {lesson.type === 'video' ? <Video size={12}/> : <FileText size={12}/>} 
                {lesson.type}
            </span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-6">{lesson.title}</h1>
        
        {/* VIDEO PLAYER SECTION */}
        {lesson.type === 'video' ? (
           <div className="mb-8 bg-black rounded-xl overflow-hidden shadow-2xl aspect-video relative flex items-center justify-center">
             {getYouTubeEmbedId(lesson.content) ? (
                <iframe 
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${getYouTubeEmbedId(lesson.content)}`}
                  title={lesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
             ) : (
                // Fallback for direct MP4 or invalid links
                lesson.content.endsWith('.mp4') ? (
                    <video controls className="w-full h-full">
                        <source src={lesson.content} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <div className="text-center text-white p-6">
                        <Play size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="font-bold">External Video Content</p>
                        <a href={lesson.content} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline break-all mt-2 block">
                            {lesson.content}
                        </a>
                        <p className="text-xs text-gray-400 mt-2">(Enter a valid YouTube URL in the Instructor Editor to see the embed player)</p>
                    </div>
                )
             )}
           </div>
        ) : (
            <div className="prose prose-slate max-w-none mb-8">
                <p className="text-lg leading-relaxed whitespace-pre-line">{lesson.content}</p>
            </div>
        )}

        {/* Attachments Section */}
        {lesson.attachment_urls && lesson.attachment_urls.length > 0 && (
            <div className="mb-8 pt-6 border-t border-slate-100">
                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Paperclip size={16} /> Resources & Downloads
                </h4>
                <div className="grid gap-2">
                    {lesson.attachment_urls.map((url, i) => (
                        <a 
                            key={i} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-indigo-600 hover:underline bg-slate-50 p-3 rounded border border-slate-100 hover:bg-slate-100 transition-colors"
                        >
                            <ExternalLink size={14} />
                            {url}
                        </a>
                    ))}
                </div>
            </div>
        )}

        {quiz && (
          <div className="border-t pt-6 mt-6">
            <h3 className="text-xl font-bold mb-4">Lesson Assessment</h3>
            <div className="flex items-center justify-between p-6 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm">
              <div>
                <h4 className="font-bold text-lg text-indigo-900 mb-1">{quiz.title}</h4>
                <p className="text-sm text-indigo-700">Pass score required: <span className="font-bold">{quiz.passing_score}%</span></p>
              </div>
              <button 
                onClick={() => onStartQuiz(quiz.id)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                Start Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
