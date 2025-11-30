import React from 'react';

export const PatternsInfo: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-800">Software Design Patterns Implementation</h2>
      <p className="text-lg text-slate-600">
        This project implements 5 core design patterns to ensure scalability, maintainability, and clear separation of concerns, fulfilling the DBMS term project requirements.
      </p>

      <div className="grid gap-6">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">1. Singleton Pattern</h3>
          <p className="text-slate-700 mb-2"><strong>Where:</strong> <code>services/Database.ts</code></p>
          <p className="text-slate-600 text-sm">
            <strong>Why:</strong> We need a single source of truth for the database state across the entire React application. 
            Just like a real database connection pool, we shouldn't instantiate multiple copies of the data store. 
            The <code>getInstance()</code> method ensures only one database object exists.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <h3 className="text-xl font-bold text-green-900 mb-2">2. Repository Pattern</h3>
          <p className="text-slate-700 mb-2"><strong>Where:</strong> <code>services/repositories/CourseRepository.ts</code></p>
          <p className="text-slate-600 text-sm">
            <strong>Why:</strong> It abstracts the data layer. The UI components (like <code>CourseList</code>) shouldn't know 
            how data is fetched (SQL, API, or Local Memory). The repository provides clean methods like <code>getAll()</code> 
            or <code>findById()</code>, making the code testable and easier to migrate to a real backend later.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <h3 className="text-xl font-bold text-blue-900 mb-2">3. Factory Method Pattern</h3>
          <p className="text-slate-700 mb-2"><strong>Where:</strong> <code>services/factories/QuestionFactory.ts</code></p>
          <p className="text-slate-600 text-sm">
            <strong>Why:</strong> Creating complex objects like 'Questions' (which can be Multiple Choice, True/False, etc.) 
            requires conditional logic. The Factory centralizes this. Instead of `new Question()`, we call 
            <code>QuestionFactory.createDefault('type')</code>, ensuring all required fields are initialized correctly for that specific type.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-500">
          <h3 className="text-xl font-bold text-amber-900 mb-2">4. Strategy Pattern</h3>
          <p className="text-slate-700 mb-2"><strong>Where:</strong> <code>services/strategies/ScoringStrategy.ts</code></p>
          <p className="text-slate-600 text-sm">
            <strong>Why:</strong> Used in the Quiz module to switch between 'Standard Scoring' and 'Strict Scoring' (penalty for wrong answers).
            This allows adding new scoring rules (e.g., 'Time Based') without modifying the core Quiz component logic, adhering to the Open/Closed Principle.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
          <h3 className="text-xl font-bold text-purple-900 mb-2">5. Observer Pattern</h3>
          <p className="text-slate-700 mb-2"><strong>Where:</strong> <code>services/observers/ProgressObserver.ts</code></p>
          <p className="text-slate-600 text-sm">
            <strong>Why:</strong> When a student finishes a lesson, multiple parts of the UI (progress bar, course list checkmarks) need to update.
            The Lesson view notifies the Subject, and all subscribed observers update automatically, preventing "prop drilling" and tight coupling.
          </p>
        </div>

      </div>
    </div>
  );
};
