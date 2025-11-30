
import React, { useState, useEffect } from 'react';
import { CourseRepository } from '../services/repositories/CourseRepository';
import { Course, Lesson, LessonType, QuestionType, Quiz, Question } from '../types';
import { QuestionFactory } from '../services/factories/QuestionFactory';
import { Plus, Trash2, Save, ArrowLeft, FileText, Video, HelpCircle, Paperclip, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  courseId: number;
  onBack: () => void;
}

export const InstructorCourseEditor: React.FC<Props> = ({ courseId, onBack }) => {
  const repo = new CourseRepository();
  const [course, setCourse] = useState<Course | undefined>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  
  // Lesson Edit State
  const [lTitle, setLTitle] = useState('');
  const [lContent, setLContent] = useState('');
  const [lType, setLType] = useState<LessonType>('article');
  const [lAttachments, setLAttachments] = useState(''); // Comma separated

  // Quiz Edit State
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | undefined>(undefined);
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Question Editing State
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editQText, setEditQText] = useState('');
  const [editQType, setEditQType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);
  const [editQCorrect, setEditQCorrect] = useState('');
  const [editQOptions, setEditQOptions] = useState<string[]>([]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    if (selectedLessonId) {
        // Need to refetch lessons to ensure we have latest data
        const l = lessons.find(x => x.id === selectedLessonId);
        if (l) {
            setLTitle(l.title);
            setLContent(l.content);
            setLType(l.type);
            setLAttachments(l.attachment_urls.join(', '));
            
            const q = repo.getQuizByLessonId(l.id);
            setCurrentQuiz(q);
            if (q) {
                setQuizTitle(q.title);
                setQuestions(repo.getQuestionsByQuizId(q.id));
            } else {
                setQuizTitle('');
                setQuestions([]);
            }
            // Reset edit state when switching lessons
            setEditingQuestionId(null);
        } else {
            // Lesson might have been deleted
            setSelectedLessonId(null);
        }
    }
  }, [selectedLessonId, lessons]);

  const loadData = () => {
    setCourse(repo.getById(courseId));
    const allLessons = repo.getLessonsByCourseId(courseId);
    setLessons(allLessons);
    if (!selectedLessonId && allLessons.length > 0) {
        setSelectedLessonId(allLessons[0].id);
    }
  };

  const handleCreateLesson = (e: React.MouseEvent) => {
    e.preventDefault();
    const newLesson = repo.createLesson({
        course_id: courseId,
        title: 'New Lesson',
        content: '',
        type: 'article',
        order_index: lessons.length + 1,
        attachment_urls: []
    });
    loadData();
    setSelectedLessonId(newLesson.id);
  };

  const handleDeleteLesson = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation(); // Stop bubbling to the selection handler
    if (confirm("Delete this lesson? This will remove any associated quizzes and progress.")) {
        repo.deleteLesson(id);
        
        // Critical: Refresh data from DB explicitly
        loadData();
        
        if (selectedLessonId === id) {
             setSelectedLessonId(null);
             setCurrentQuiz(undefined);
             setQuestions([]);
        }
    }
  };

  const handleSaveLesson = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedLessonId) return;
    repo.updateLesson(selectedLessonId, {
        title: lTitle,
        content: lContent,
        type: lType,
        attachment_urls: lAttachments.split(',').map(s => s.trim()).filter(Boolean)
    });
    alert("Lesson saved!");
    // Refresh list in case title changed
    loadData();
  };

  const handleCreateQuiz = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedLessonId) return;
    const q = repo.createQuiz({
        lesson_id: selectedLessonId,
        title: `${lTitle} Quiz`,
        passing_score: 70
    });
    setCurrentQuiz(q);
    setQuizTitle(q.title);
  };

  const handleDeleteQuiz = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentQuiz) return;
    if (confirm("Delete assessment and all its questions?")) {
        repo.deleteQuiz(currentQuiz.id);
        
        // UI Update: Remove quiz from view immediately
        setCurrentQuiz(undefined);
        setQuestions([]);
        setEditingQuestionId(null);
        setQuizTitle('');
    }
  };

  const handleAddQuestion = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentQuiz) return;
    const q = QuestionFactory.createDefault(QuestionType.MULTIPLE_CHOICE, currentQuiz.id);
    repo.createQuestion(q);
    
    // Refresh questions
    const updated = repo.getQuestionsByQuizId(currentQuiz.id);
    setQuestions(updated);
    
    // Immediately select for editing
    const newQ = updated[updated.length - 1];
    startEditingQuestion(newQ);
  };

  const handleDeleteQuestion = (e: React.MouseEvent, qid: number) => {
      e.preventDefault();
      e.stopPropagation();
      if(confirm("Delete this question?")) {
        repo.deleteQuestion(qid);
        
        // UI Update: Fetch fresh questions from repo immediately
        if (currentQuiz) {
            const freshQuestions = repo.getQuestionsByQuizId(currentQuiz.id);
            setQuestions(freshQuestions);
        }
        
        if (editingQuestionId === qid) setEditingQuestionId(null);
      }
  };

  const startEditingQuestion = (q: Question) => {
      setEditingQuestionId(q.id);
      setEditQText(q.text);
      setEditQType(q.type);
      setEditQCorrect(q.correct_answer);
      // Ensure options is initialized for editing
      setEditQOptions(q.options || []);
  };

  const handleSaveQuestion = (e: React.MouseEvent) => {
      e.preventDefault();
      if (!editingQuestionId) return;
      
      repo.updateQuestion(editingQuestionId, {
          text: editQText,
          type: editQType,
          correct_answer: editQCorrect,
          options: editQOptions
      });
      
      setEditingQuestionId(null);
      if (currentQuiz) setQuestions(repo.getQuestionsByQuizId(currentQuiz.id));
  };

  // Helper to handle type switching (resets unrelated fields)
  const handleTypeChange = (newType: QuestionType) => {
      setEditQType(newType);
      
      if (newType === QuestionType.MULTIPLE_CHOICE) {
          setEditQOptions(['Option A', 'Option B', 'Option C', 'Option D']);
          setEditQCorrect('Option A');
      } else if (newType === QuestionType.TRUE_FALSE) {
          setEditQOptions(['True', 'False']);
          setEditQCorrect('True');
      } else if (newType === QuestionType.SHORT_ANSWER) {
          setEditQOptions([]); // Clear options for storage
          setEditQCorrect('');
      }
  };

  if (!course) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-150px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full" title="Back">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h2 className="text-xl font-bold text-slate-800">Edit Content: {course.title}</h2>
                <p className="text-xs text-slate-500">Manage Syllabus, Content, and Assessments</p>
            </div>
        </div>
        <button 
            type="button"
            onClick={handleCreateLesson} 
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700"
        >
            <Plus size={16} /> Add Lesson
        </button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Sidebar: Lesson List */}
        <div className="w-64 bg-slate-50 border rounded-lg overflow-y-auto p-2 space-y-2">
            {lessons.map((l, idx) => (
                <div 
                    key={l.id} 
                    onClick={() => setSelectedLessonId(l.id)}
                    className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${
                        selectedLessonId === l.id ? 'bg-indigo-100 border-indigo-200 shadow-sm' : 'hover:bg-slate-100 border-transparent border'
                    }`}
                >
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {idx + 1}
                    </div>
                    <div className="flex-1 truncate text-sm font-medium text-slate-700">
                        {l.title}
                    </div>
                    {selectedLessonId === l.id && (
                        <button 
                            type="button" 
                            onClick={(e) => handleDeleteLesson(e, l.id)} 
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded z-10"
                            title="Delete Lesson"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            ))}
            {lessons.length === 0 && <p className="text-xs text-center text-slate-400 py-4">No lessons yet.</p>}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 bg-white border rounded-lg shadow-sm overflow-y-auto p-6">
            {selectedLessonId ? (
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Lesson Details */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                            <FileText size={18} /> Lesson Details
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                <input 
                                    value={lTitle}
                                    onChange={e => setLTitle(e.target.value)}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                                <select 
                                    value={lType}
                                    onChange={e => setLType(e.target.value as LessonType)}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                >
                                    <option value="article">Article / Text</option>
                                    <option value="video">Video</option>
                                    <option value="quiz">Assessment Only</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                {lType === 'video' ? 'Video URL (YouTube or MP4 Link)' : 'Content (Markdown supported)'}
                            </label>
                            {lType === 'video' ? (
                                <input 
                                    value={lContent}
                                    onChange={e => setLContent(e.target.value)}
                                    className="w-full p-3 border rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            ) : (
                                <textarea 
                                    value={lContent}
                                    onChange={e => setLContent(e.target.value)}
                                    rows={8}
                                    className="w-full p-3 border rounded focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                <Paperclip size={12} /> Attachment URLs (Comma separated)
                            </label>
                            <input 
                                value={lAttachments}
                                onChange={e => setLAttachments(e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-600"
                                placeholder="https://example.com/slides.pdf, https://youtube.com/..."
                            />
                        </div>

                        <div className="pt-2">
                            <button type="button" onClick={handleSaveLesson} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2">
                                <Save size={16} /> Save Lesson Changes
                            </button>
                        </div>
                    </section>

                    {/* Quiz Section */}
                    <section className="space-y-4 pt-6 border-t">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <HelpCircle size={18} /> Assessment (Quiz)
                            </h3>
                            {currentQuiz ? (
                                <button type="button" onClick={handleDeleteQuiz} className="text-red-500 text-xs font-bold hover:underline">Delete Assessment</button>
                            ) : (
                                <button type="button" onClick={handleCreateQuiz} className="text-indigo-600 text-sm font-bold hover:underline">
                                    + Create Quiz for this Lesson
                                </button>
                            )}
                        </div>

                        {currentQuiz && (
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quiz Title</label>
                                    <input 
                                        value={quizTitle} 
                                        readOnly 
                                        className="w-full p-2 border rounded bg-slate-100 text-slate-500" 
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <h4 className="font-bold text-sm text-slate-700">Questions ({questions.length})</h4>
                                        <button type="button" onClick={handleAddQuestion} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 shadow-sm font-medium">
                                            + Add Question
                                        </button>
                                    </div>
                                    
                                    {/* Question List / Editor */}
                                    <div className="space-y-3">
                                        {questions.map((q, i) => (
                                            <div key={q.id} className={`bg-white border rounded-lg overflow-hidden transition-all ${editingQuestionId === q.id ? 'ring-2 ring-indigo-500 shadow-md' : 'hover:shadow-sm'}`}>
                                                
                                                {/* Edit Form */}
                                                {editingQuestionId === q.id ? (
                                                    <div className="p-4 space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-indigo-600 uppercase">Editing Question #{i + 1}</span>
                                                            <button type="button" onClick={() => setEditingQuestionId(null)} className="text-slate-400 hover:text-slate-600">
                                                                <XCircle size={18} />
                                                            </button>
                                                        </div>

                                                        {/* Type & Text */}
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div className="col-span-1">
                                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                                                                <select 
                                                                    value={editQType}
                                                                    onChange={e => handleTypeChange(e.target.value as QuestionType)}
                                                                    className="w-full p-2 border rounded text-sm outline-none focus:border-indigo-500"
                                                                >
                                                                    <option value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</option>
                                                                    <option value={QuestionType.TRUE_FALSE}>True / False</option>
                                                                    <option value={QuestionType.SHORT_ANSWER}>Short Answer</option>
                                                                </select>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Question Text</label>
                                                                <input 
                                                                    value={editQText}
                                                                    onChange={e => setEditQText(e.target.value)}
                                                                    className="w-full p-2 border rounded text-sm outline-none focus:border-indigo-500"
                                                                    placeholder="Enter the question..."
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Dynamic Answer Fields */}
                                                        <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                                            <p className="text-xs font-bold text-slate-500 mb-2 border-b pb-1">Answer Configuration</p>
                                                            
                                                            {/* MULTIPLE CHOICE */}
                                                            {editQType === QuestionType.MULTIPLE_CHOICE && (
                                                                <div className="space-y-2">
                                                                    {editQOptions.slice(0, 4).map((opt, idx) => (
                                                                        <div key={idx} className="flex items-center gap-2">
                                                                            <input 
                                                                                type="radio" 
                                                                                name="correct_ans"
                                                                                checked={editQCorrect === opt && opt !== ''}
                                                                                onChange={() => setEditQCorrect(opt)}
                                                                                className="text-indigo-600 focus:ring-indigo-500"
                                                                            />
                                                                            <input 
                                                                                value={opt}
                                                                                onChange={(e) => {
                                                                                    const newOpts = [...editQOptions];
                                                                                    newOpts[idx] = e.target.value;
                                                                                    setEditQOptions(newOpts);
                                                                                    // Update correct answer if this option was selected
                                                                                    if (editQCorrect === opt) setEditQCorrect(e.target.value);
                                                                                }}
                                                                                className="flex-1 p-1.5 border rounded text-sm"
                                                                                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* TRUE / FALSE */}
                                                            {editQType === QuestionType.TRUE_FALSE && (
                                                                <div className="flex gap-4">
                                                                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded border hover:bg-slate-50">
                                                                        <input 
                                                                            type="radio" 
                                                                            name="tf_ans"
                                                                            value="True"
                                                                            checked={editQCorrect === 'True'}
                                                                            onChange={() => setEditQCorrect('True')}
                                                                        />
                                                                        <span className="text-sm font-medium">True</span>
                                                                    </label>
                                                                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded border hover:bg-slate-50">
                                                                        <input 
                                                                            type="radio" 
                                                                            name="tf_ans"
                                                                            value="False"
                                                                            checked={editQCorrect === 'False'}
                                                                            onChange={() => setEditQCorrect('False')}
                                                                        />
                                                                        <span className="text-sm font-medium">False</span>
                                                                    </label>
                                                                </div>
                                                            )}

                                                            {/* SHORT ANSWER */}
                                                            {editQType === QuestionType.SHORT_ANSWER && (
                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <label className="block text-xs text-slate-500 mb-1">Correct Answer (Exact Match)</label>
                                                                        <input 
                                                                            value={editQCorrect}
                                                                            onChange={e => setEditQCorrect(e.target.value)}
                                                                            className="w-full p-2 border rounded text-sm"
                                                                            placeholder="e.g. 42"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs text-slate-500 mb-1">Lookup Table / Acceptable Variations (Comma Separated)</label>
                                                                        <textarea 
                                                                            value={editQOptions.join(', ')}
                                                                            onChange={e => setEditQOptions(e.target.value.split(',').map(s => s.trim()))}
                                                                            className="w-full p-2 border rounded text-sm h-20"
                                                                            placeholder="e.g. forty-two, forty two"
                                                                        />
                                                                        <p className="text-[10px] text-slate-400 mt-1">These variations will also be marked correct.</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex justify-end gap-2 pt-2">
                                                            <button type="button" onClick={() => setEditingQuestionId(null)} className="px-3 py-1 text-sm text-slate-500 hover:text-slate-800">Cancel</button>
                                                            <button type="button" onClick={handleSaveQuestion} className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-indigo-700 flex items-center gap-1">
                                                                <CheckCircle size={14} /> Save Changes
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Read-Only View
                                                    <div className="flex items-center justify-between p-3" onClick={() => startEditingQuestion(q)}>
                                                        <div className="flex-1 cursor-pointer">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold text-slate-500 text-sm">#{i+1}</span>
                                                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                                                                    q.type === QuestionType.TRUE_FALSE ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                                    q.type === QuestionType.MULTIPLE_CHOICE ? 'bg-purple-50 text-purple-600 border-purple-200' :
                                                                    'bg-orange-50 text-orange-600 border-orange-200'
                                                                }`}>
                                                                    {q.type.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-800 font-medium truncate pr-4">{q.text || '(Empty Question)'}</p>
                                                            <p className="text-xs text-slate-400 mt-1">Answer: {q.correct_answer} {q.type === QuestionType.SHORT_ANSWER && q.options && q.options.length > 0 && `(+${q.options.length} variations)`}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); startEditingQuestion(q); }} 
                                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded"
                                                            >
                                                                <FileText size={14} />
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => handleDeleteQuestion(e, q.id)} 
                                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {questions.length === 0 && <p className="text-sm text-slate-400 italic text-center py-4">No questions added yet.</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <FileText size={48} className="mb-4 opacity-50" />
                    <p>Select a lesson to edit or create a new one.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
