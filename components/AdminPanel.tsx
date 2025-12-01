import React, { useState, useEffect } from 'react';
import { QuestionFactory } from '../services/factories/QuestionFactory';
import { QuestionType, UserRole, User } from '../types';
import { ShieldAlert, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export const AdminPanel: React.FC = () => {
  // Veritabanı yerine State kullanıyoruz
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Factory Demo State
  const [demoQType, setDemoQType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);
  const [generatedQuestion, setGeneratedQuestion] = useState<any>(null);

  // Backend'den Kullanıcıları Çek
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Backend'e GET isteği atıyoruz
        const response = await fetch(`${API_URL}/users`, {
           headers: {
               'Authorization': token ? `Bearer ${token}` : '',
               'Content-Type': 'application/json'
           }
        });

        if (!response.ok) throw new Error("Kullanıcılar çekilemedi");
        
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Kullanıcı listesi yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleGenerateQuestion = () => {
    // FACTORY PATTERN USAGE (Client side logic)
    const q = QuestionFactory.createDefault(demoQType, 1);
    setGeneratedQuestion(q);
  };

  if (loading) {
      return <div className="flex h-64 items-center justify-center text-indigo-600"><Loader2 className="animate-spin mr-2"/> Sistem Verileri Yükleniyor...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-800">Admin System Control</h2>
      
      {/* User Management Overview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-700 mb-4">System Users</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-900 font-bold uppercase">
                    <tr>
                        <th className="p-3 rounded-tl-lg">ID</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Role</th>
                        <th className="p-3 rounded-tr-lg">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3">{u.id}</td>
                            <td className="p-3 font-medium text-slate-900">{u.name}</td>
                            <td className="p-3">{u.email}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    u.role === UserRole.ADMIN ? 'bg-red-100 text-red-700' :
                                    u.role === UserRole.INSTRUCTOR ? 'bg-indigo-100 text-indigo-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                    {u.role}
                                </span>
                            </td>
                            <td className="p-3">
                                <button className="text-indigo-600 font-bold hover:underline">Edit</button>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-4 text-center text-slate-400 italic">No users found in database.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Factory Pattern Demo Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
             <ShieldAlert className="text-indigo-600" />
             <h3 className="text-xl font-bold text-slate-700">Question Factory (Design Pattern Demo)</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">
            Admins can test the content generation engines. Select a type to generate a default question object using the <code>QuestionFactory</code> class.
        </p>
        
        <div className="flex gap-4 items-center mb-4">
            <select 
                value={demoQType} 
                onChange={e => setDemoQType(e.target.value as QuestionType)}
                className="p-2 border rounded bg-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</option>
                <option value={QuestionType.TRUE_FALSE}>True/False</option>
                <option value={QuestionType.SHORT_ANSWER}>Short Answer</option>
            </select>
            <button onClick={handleGenerateQuestion} className="bg-indigo-600 text-white px-4 py-2 rounded font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700">
                Generate Template
            </button>
        </div>

        {generatedQuestion && (
            <div className="relative">
                <div className="absolute top-0 right-0 bg-slate-800 text-white text-xs px-2 py-1 rounded-bl">JSON Output</div>
                <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                    {JSON.stringify(generatedQuestion, null, 2)}
                </pre>
            </div>
        )}
      </div>
    </div>
  );
};