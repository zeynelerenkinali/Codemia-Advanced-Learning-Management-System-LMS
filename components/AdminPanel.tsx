import React, { useState, useEffect } from 'react';
import { QuestionFactory } from '../services/factories/QuestionFactory';
import { QuestionType, UserRole, User } from '../types';
import { ShieldAlert, Loader2, Search, Filter } from 'lucide-react'; // İkonları import et


const reportStyles = `
@media print {
  nav, button, input, select, .no-print, [className*="Maintenance"], [className*="Question-Factory"], svg {
    display: none !important;
  }
  body::before {
    content: "CODEMIA - STUDENT PERFORMANCE & SYSTEM USAGE REPORT";
    display: block;
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 30px;
    color: #1e293b;
  }
  table { width: 100% !important; border-collapse: collapse !important; }
  th, td { border: 1px solid #cbd5e1 !important; padding: 12px !important; color: black !important; }
  .bg-white { background-color: white !important; }
}
`;

const API_URL = 'http://localhost:5000/api';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- YENİ EKLENEN STATE'LER (Arama ve İstatistik için) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole | string>("ALL");
  const [sortByGpa, setSortByGpa] = useState(false);

  // Factory Demo State
  const [demoQType, setDemoQType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);
  const [generatedQuestion, setGeneratedQuestion] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Backend'den Kullanıcıları Çek
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
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

  // --- MEVCUT useEffect'in ALTINA EKLE ---
  // Bu kod backend'e dokunmadan, student olanların notlarını
  // tek tek çekip ana listeye monte eder.
    useEffect(() => {
    const fetchStudentGPAs = async () => {
      // 1. Student olup GPA'sı henüz görünmeyenleri bul
      const studentsToFetch = users.filter(u => u.role === 'student'); 
      
      if (studentsToFetch.length === 0) return;

      const token = localStorage.getItem('token');
      const updatedUsers = [...users];
      let hasChanges = false;

      await Promise.all(studentsToFetch.map(async (student) => {
        try {
          const res = await fetch(`${API_URL}/users/${student.id}/student-profile`, {
             headers: { 'Authorization': token ? `Bearer ${token}` : '' }
          });
          
          if (res.ok) {
            const data = await res.json();
            
            // --- DÜZELTME BURADA ---
            let incomingGpa = data.gpa;

            // Eğer backend 25 ile çarpıp gönderiyorsa (yani değer 4.0'dan büyükse)
            // biz onu tekrar 25'e bölüp orijinal haline getiriyoruz.
            if (incomingGpa > 4.0) {
                incomingGpa = incomingGpa / 25;
            }
            
            const index = updatedUsers.findIndex(u => u.id === student.id);
            if (index !== -1) {
              // Eğer eski değerle yeni değer farklıysa güncelle (sonsuz döngüyü engellemek için kontrol)
              if (updatedUsers[index].gpa !== incomingGpa) {
                  updatedUsers[index] = { 
                      ...updatedUsers[index], 
                      gpa: incomingGpa 
                  };
                  hasChanges = true;
              }
            }
          }
        } catch (err) {
          console.error(`GPA fetch error`, err);
        }
      }));

      if (hasChanges) {
        setUsers(updatedUsers);
      }
    };

    if (users.length > 0) {
        fetchStudentGPAs();
    }
  }, [users.length]);

  // --- İSTATİSTİK HESAPLAMA ---
  const totalUsers = users.length;
  const studentCount = users.filter(u => u.role === 'student').length;
  const instructorCount = users.filter(u => u.role === 'instructor').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  // --- FİLTRELEME VE SIRALAMA MANTIĞI ---
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  }).sort((a, b) => {
      if (!sortByGpa) return 0;
      // Öğrenci olmayanları en alta at, öğrencileri GPA'ya göre sırala (Büyükten küçüğe)
      const gpaA = a.role === 'student' ? (a.gpa || 0) : -1;
      const gpaB = b.role === 'student' ? (b.gpa || 0) : -1;
      return gpaB - gpaA;
  });

  const handleUpdateUser = async (userId: number, updatedData: Partial<User>) => {
        try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            name: updatedData.name,
            email: updatedData.email,
            role: updatedData.role,
            })
        });

        if (!response.ok) throw new Error("Update failed");
        const result = await response.json();
        
        setUsers(prevUsers => 
            prevUsers.map(u => (u.id === userId ? { ...u, ...result } : u))
        );
        alert("User updated successfully!");
        setEditingUser(null);
        
        } catch (error) {
        console.error("Error updating user:", error);
        alert("Failed to update user.");
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!window.confirm("Are you sure?")) return;
        try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
        } catch (error) { alert("Delete failed."); }
    };

  const handleGenerateQuestion = () => {
    const q = QuestionFactory.createDefault(demoQType, 1);
    setGeneratedQuestion(q);
  };

  const handleGpaRecalc = async () => {
      if(!confirm("This will recalculate GPAs for ALL students based on their quiz scores. Continue?")) return;
      try {
          const token = localStorage.getItem('token');
          await fetch(`${API_URL}/admin/recalculate-gpa`, { 
              method: 'POST',
              headers: { 'Authorization': token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' }
          });
          alert("Success! Please refresh the page to see updated GPAs.");
          // İstersen burada fetchUsers() çağırıp listeyi yenileyebilirsin
      } catch (error) { alert("Operation failed."); }
    };

  if (loading) return <div className="flex h-64 items-center justify-center text-indigo-600"><Loader2 className="animate-spin mr-2"/> Yükleniyor...</div>;

  return (
    
    
    <div className="space-y-8 animate-fade-in pb-10">

      <style>{reportStyles}</style>

      <h2 className="text-3xl font-bold text-slate-800 no-print">Admin System Control</h2>
    
      {/* --- DASHBOARD STATS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col">
           <span className="text-slate-500 text-xs font-bold uppercase">Total Users</span>
           <span className="text-3xl font-bold text-slate-800">{totalUsers}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 flex flex-col">
           <span className="text-indigo-500 text-xs font-bold uppercase">Instructors</span>
           <span className="text-3xl font-bold text-indigo-700">{instructorCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 flex flex-col">
           <span className="text-green-600 text-xs font-bold uppercase">Students</span>
           <span className="text-3xl font-bold text-green-700">{studentCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex flex-col">
           <span className="text-red-500 text-xs font-bold uppercase">Admins</span>
           <span className="text-3xl font-bold text-red-700">{adminCount}</span>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
    <h3 className="text-xl font-bold text-slate-700">System Users</h3>

    <button 
        onClick={() => window.print()} 
        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700"
    >
        <span className="text-lg">🖨️</span> Export PDF / Print Report
    </button>
    </div>

        {/* --- SEARCH & FILTER --- */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
            <div className="relative">
                <Filter className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <select 
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white appearance-none"
                >
                    <option value="ALL">All Roles</option>
                    <option value="student">Students</option>
                    <option value="instructor">Instructors</option>
                    <option value="admin">Admins</option>
                </select>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-900 font-bold uppercase">
                    <tr>
                        <th className="p-3 rounded-tl-lg">ID</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Role</th>
                        {/* GPA SORTABLE HEADER */}
                        <th 
                            className="p-3 cursor-pointer hover:bg-slate-200 transition-colors select-none"
                            onClick={() => setSortByGpa(!sortByGpa)}
                            title="Click to sort by GPA"
                        >
                            GPA {sortByGpa ? '↓' : ''}
                        </th>
                        <th className="p-3 rounded-tr-lg">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(u => (
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
                            {/* GPA DISPLAY LOGIC */}
                            <td className="p-3">
                                {u.role === 'student' ? (
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold ${
                                            (u.gpa || 0) >= 3.0 ? 'text-green-600' : 
                                            (u.gpa || 0) >= 2.0 ? 'text-yellow-600' : 
                                            'text-red-500'
                                        }`}>
                                            {u.gpa !== undefined && u.gpa !== null ? Number(u.gpa).toFixed(2) : '-'}
                                        </span>
                                        {(u.gpa || 0) >= 3.5 && <span title="High Honor">🏆</span>}
                                    </div>
                                ) : (
                                    <span className="text-slate-300">-</span>
                                )}
                            </td>
                            <td className="p-3 flex gap-3">
                                <button onClick={() => setEditingUser(u)} className="text-indigo-600 font-bold hover:underline">Edit</button>
                                <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 font-bold hover:underline">Remove</button>
                            </td>
                        </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                        <tr><td colSpan={6} className="p-4 text-center text-slate-400 italic">No users found matching filters.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Factory Demo & Maintenance Section (Kısaltıldı) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
                <ShieldAlert className="text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-700">Question Factory</h3>
            </div>
            <div className="flex gap-2 items-center mb-4">
                <select 
                    value={demoQType} 
                    onChange={e => setDemoQType(e.target.value as QuestionType)}
                    className="p-2 border rounded text-sm bg-white"
                >
                    <option value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</option>
                    <option value={QuestionType.TRUE_FALSE}>True/False</option>
                </select>
                <button onClick={handleGenerateQuestion} className="bg-slate-800 text-white px-3 py-2 rounded text-sm hover:bg-slate-700">
                    Generate
                </button>
            </div>
            {generatedQuestion && (
                <pre className="bg-slate-900 text-green-400 p-3 rounded text-xs overflow-x-auto font-mono h-32">
                    {JSON.stringify(generatedQuestion, null, 2)}
                </pre>
            )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-700 mb-4">Maintenance</h3>
            <p className="text-sm text-slate-500 mb-4">Run batch jobs for GPA sync.</p>
            <button 
                onClick={handleGpaRecalc}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded font-bold hover:bg-indigo-700 shadow flex justify-center items-center gap-2"
            >
                <Loader2 size={18} /> Recalculate GPAs
            </button>
        </div>
      </div>

      {/* Edit Modal (Mevcut haliyle kalabilir, sadece kod tekrarını önlemek için buraya koymadım ama en alta ekli olmalı) */}
       {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Edit User</h3>
            {/* Form alanları... */}
            <input className="border p-2 w-full mb-2" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
            <input className="border p-2 w-full mb-2" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
            <select className="border p-2 w-full mb-4" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as any})}>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
            </select>
            <div className="flex justify-end gap-2">
                <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-slate-500">Cancel</button>
                <button onClick={() => handleUpdateUser(editingUser.id, editingUser)} className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
};
