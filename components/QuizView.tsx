import React, { useState, useEffect } from 'react';
import { ScoringStrategy, StandardScoring, StrictScoring } from '../services/strategies/ScoringStrategy';
import { Question, QuestionType, Quiz } from '../types';
import { Loader2 } from 'lucide-react';

interface Props {
  quizId: number;
  onBack: () => void;
}

const API_URL = 'http://localhost:5000/api';

export const QuizView: React.FC<Props> = ({ quizId, currentUserId, onBack}) => {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  
  // STRATEGY PATTERN USAGE
  const [strategyName, setStrategyName] = useState<'standard' | 'strict'>('standard');
  const getStrategy = (): ScoringStrategy => strategyName === 'standard' ? new StandardScoring() : new StrictScoring();

  // Verileri Backend'den Çek
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };

        // 1. Quiz Detayını Çek
        const quizRes = await fetch(`${API_URL}/quizzes/${quizId}`, { headers });
        if (!quizRes.ok) throw new Error("Quiz bulunamadı");
        const quizData = await quizRes.json();
        setQuiz(quizData);

        // 2. Soruları Çek
        const qRes = await fetch(`${API_URL}/quizzes/${quizId}/questions`, { headers });
        if (!qRes.ok) throw new Error("Sorular yüklenemedi");
        const qData = await qRes.json();
        setQuestions(qData);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, [quizId]);

const handleSubmit = async () => {
    
    // --- Existing Strategy Pattern Logic ---
    const strategy = getStrategy();
    const calculatedScore = strategy.calculateScore(questions, answers);
    
    setScore(calculatedScore);
    setSubmitted(true);

    try {
        const token = localStorage.getItem('token');

        await fetch(`${API_URL}/quizzes/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({
                studentId: currentUserId, // Make sure you have this from props!
                quizId: quizId,           // Make sure you have this from props!
                score: calculatedScore
            })
        });
        
        console.log("Score saved successfully!");

        // Optional: specific callback if you want to notify parent
        // if (onComplete) onComplete(calculatedScore);

    } catch (error) {
        console.error("Failed to save quiz score:", error);
        // Optional: Show an error toast/alert to the user
    }
  };

  // UI Yardımcısı: Cevabın doğru olup olmadığını kontrol eder (renklendirme için)
  const isCorrect = (q: Question) => {
      const userAns = (answers[q.id] || '').trim().toLowerCase();
      const correctAns = q.correct_answer.trim().toLowerCase();
      
      // Short Answer için varyasyon kontrolü (backend'den array gelmeli veya string split yapılmalı)
      let variations: string[] = [];
      if (Array.isArray(q.options)) {
          variations = q.options.map(o => o.trim().toLowerCase());
      }

      return userAns === correctAns || variations.includes(userAns);
  };

  const maxScore = questions.reduce((acc, q) => acc + q.points, 0);

  if (loading) {
    return (
        <div className="flex h-64 items-center justify-center text-indigo-600">
            <Loader2 className="animate-spin mr-2" /> Quiz Yükleniyor...
        </div>
    );
  }

  if (!quiz) return <div className="text-center p-10 text-red-500">Quiz bulunamadı veya silinmiş.</div>;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
       <button onClick={onBack} className="text-indigo-600 hover:underline mb-4 block">&larr; Back to Lesson</button>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <div className="flex justify-between items-start mb-6 border-b pb-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
                <p className="text-slate-500 text-sm mt-1">Total Questions: {questions.length} | Max Points: {maxScore}</p>
            </div>
            
            {!submitted && (
                <div className="text-right">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Scoring Mode</label>
                    <select 
                        value={strategyName} 
                        onChange={(e) => setStrategyName(e.target.value as any)}
                        className="text-sm border rounded p-1 bg-slate-50"
                    >
                        <option value="standard">Standard</option>
                        <option value="strict">Strict (Penalty)</option>
                    </select>
                </div>
            )}
        </div>

        {/* Info Box about Pattern */}
        <div className="mb-6 bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-800">
            <strong>Strategy Pattern Active:</strong> {getStrategy().getDescription()}
        </div>

        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="font-semibold text-lg text-slate-800 mb-3">
                {idx + 1}. {q.text} <span className="text-xs font-normal text-slate-500">({q.points} pts)</span>
              </p>
              
              {/* MULTIPLE CHOICE */}
              {q.type === QuestionType.MULTIPLE_CHOICE && q.options && (
                <div className="space-y-2">
                  {q.options.map(opt => (
                    <label key={opt} className={`flex items-center p-3 rounded cursor-pointer border transition-colors ${
                        submitted 
                            ? opt === q.correct_answer 
                                ? 'bg-green-100 border-green-500' 
                                : answers[q.id] === opt 
                                    ? 'bg-red-50 border-red-300' 
                                    : 'border-transparent'
                            : answers[q.id] === opt 
                                ? 'bg-indigo-100 border-indigo-500' 
                                : 'bg-white border-slate-200 hover:bg-slate-100'
                    }`}>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt}
                        disabled={submitted}
                        checked={answers[q.id] === opt}
                        onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className="mr-3"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {/* TRUE / FALSE */}
              {q.type === QuestionType.TRUE_FALSE && q.options && (
                 <div className="flex gap-4">
                    {q.options.map(opt => (
                         <button
                            key={opt}
                            disabled={submitted}
                            onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className={`px-4 py-2 rounded border font-medium transition-colors ${
                                submitted 
                                    ? opt === q.correct_answer 
                                        ? 'bg-green-600 text-white border-green-700' 
                                        : answers[q.id] === opt 
                                            ? 'bg-red-500 text-white border-red-600'
                                            : 'bg-slate-100 text-slate-400'
                                    : answers[q.id] === opt 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-white hover:bg-slate-100'
                            }`}
                         >
                             {opt}
                         </button>
                    ))}
                 </div>
              )}

              {/* SHORT ANSWER */}
              {q.type === QuestionType.SHORT_ANSWER && (
                  <div>
                      <input 
                        type="text"
                        disabled={submitted}
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                        className={`w-full p-3 border rounded outline-none transition-colors ${
                             submitted 
                                ? isCorrect(q) 
                                    ? 'bg-green-50 border-green-500 text-green-900' 
                                    : 'bg-red-50 border-red-500 text-red-900'
                                : 'focus:ring-2 focus:ring-indigo-500 border-slate-300'
                        }`}
                        placeholder="Type your answer here..."
                      />
                      {submitted && !isCorrect(q) && (
                          <div className="mt-2 text-xs text-red-600 font-bold">
                              Correct Answer: {q.correct_answer} 
                              {q.options && q.options.length > 0 && ` (or: ${q.options.join(', ')})`}
                          </div>
                      )}
                  </div>
              )}

            </div>
          ))}
        </div>

        <div className="mt-8 border-t pt-6">
          {!submitted ? (
            <button 
              onClick={handleSubmit}
              className="w-full bg-indigo-600 text-white text-lg font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Submit Quiz
            </button>
          ) : (
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900 mb-2">Score: {score} / {maxScore}</p>
              <p className={`text-lg font-medium ${score >= (maxScore * 0.7) ? 'text-green-600' : 'text-red-500'}`}>
                {score >= (maxScore * 0.7) ? 'Passed!' : 'Try Again'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};