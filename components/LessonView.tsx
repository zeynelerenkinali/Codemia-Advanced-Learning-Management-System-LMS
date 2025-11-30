
import React, { useState, useEffect } from 'react';
import { Lesson, Quiz } from '../types';
import { Database } from '../services/Database';
import { progressSubject } from '../services/observers/ProgressObserver';
import { FileText, Video, Paperclip, ExternalLink } from 'lucide-react';

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

  if (!lesson) return <div>Lesson not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
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
        
        <div className="prose prose-slate max-w-none mb-8">
          <p className="text-lg leading-relaxed whitespace-pre-line">{lesson.content}</p>
        </div>

        {/* Attachments Section */}
        {lesson.attachment_urls && lesson.attachment_urls.length > 0 && (
            <div className="mb-8">
                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Paperclip size={16} /> Resources
                </h4>
                <div className="grid gap-2">
                    {lesson.attachment_urls.map((url, i) => (
                        <a 
                            key={i} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-indigo-600 hover:underline bg-slate-50 p-3 rounded border border-slate-100"
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
            <h3 className="text-xl font-bold mb-4">Assessment</h3>
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div>
                <h4 className="font-bold text-indigo-900">{quiz.title}</h4>
                <p className="text-sm text-indigo-700">Pass score: {quiz.passing_score}%</p>
              </div>
              <button 
                onClick={() => onStartQuiz(quiz.id)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
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
