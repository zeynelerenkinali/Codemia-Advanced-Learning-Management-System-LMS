import React from 'react';
import { SQL_SCHEMA } from '../constants';

export const SQLViewer: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-slate-800">Database Specification (SQL)</h2>
      <p className="text-slate-600">
        The following SQL code creates the 10 required entities, enforces constraints, handles relationships (including Weak Entities and M-N), and inserts sample data as per the project requirements.
      </p>
      <div className="relative group">
        <pre className="bg-slate-900 text-blue-300 p-6 rounded-xl shadow-inner overflow-x-auto text-sm font-mono leading-relaxed h-[600px] overflow-y-scroll border-4 border-slate-800">
          {SQL_SCHEMA}
        </pre>
      </div>
    </div>
  );
};
