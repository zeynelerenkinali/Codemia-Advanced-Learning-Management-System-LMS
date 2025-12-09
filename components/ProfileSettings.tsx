// Updated ProfileSettings.tsx adapted for real DB API integration.
// Replace UserRepository calls with async REST API requests.

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Save, User as UserIcon, MapPin, Lock, Briefcase, CheckCircle, AlertTriangle, Trash2, GraduationCap } from 'lucide-react';

interface Props {
  currentUser: User;
  onUpdate: (user: User) => void;
  onDeleteAccount?: () => void;
}

const API_URL = 'http://localhost:5000/api';

export const ProfileSettings: React.FC<Props> = ({ currentUser, onUpdate, onDeleteAccount }) => {
  // General State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState(currentUser.password_hash);

  // Address State
  const [country, setCountry] = useState(currentUser.country || '');
  const [city, setCity] = useState(currentUser.city || '');
  const [zip, setZip] = useState(currentUser.postal_code || '');

  // Instructor State
  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState('');
  const [gpa, setGpa] = useState<string>('0.00');
  const [message, setMessage] = useState<string | null>(null);

  // Load Instructor Profile
  useEffect(() => {
    const loadInstructor = async () => {
      if (currentUser.role !== UserRole.INSTRUCTOR) return;

      try {
        const res = await fetch(`${API_URL}/users/${currentUser.id}/instructor-profile`);
        if (res.ok) {
          const data = await res.json();
          setBio(data.bio || '');
          setExpertise(data.expertise_area || '');
        }
      } catch {}
    };
    // 2. Student GPA loading
    const loadStudent = async () => {
      if (currentUser.role !== UserRole.STUDENT) return;
      try {
        const res = await fetch(`${API_URL}/users/${currentUser.id}/student-profile`);
        if (res.ok) {
          const data = await res.json();
          // Gelen veri sayı ise virgülden sonra 2 basamak formatla, yoksa olduğu gibi al
          const gpaValue = typeof data.gpa === 'number' ? data.gpa.toFixed(2) : data.gpa;
          setGpa(gpaValue || '0.00');
        }
      } catch {}
    };

    loadInstructor();
    loadStudent();
  }, [currentUser]);

  // Save Profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Update User 
      const res = await fetch(`${API_URL}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password, 
          country,
          city,
          postal_code: zip,
          role: currentUser.role 
        })
      });

      // error handling 
      if (!res.ok) {
        throw new Error('User update failed');
      }

      const updatedUser = await res.json();

      // 2. If instructor, update instructor table
      if (currentUser.role === UserRole.INSTRUCTOR) {
        const resInstructor = await fetch(`${API_URL}/users/${currentUser.id}/instructor-profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bio,
            expertise_area: expertise
          })
        });

        if (!resInstructor.ok) {
             console.warn("Instructor profile update failed but user updated");
        }
      }

      onUpdate(updatedUser);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to update profile. Please check console for details.");
    }
  };

  // Delete Account
  const handleDelete = async () => {
    if (!confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) return;

    try {
      await fetch(`${API_URL}/users/${currentUser.id}`, {
        method: 'DELETE'
      });

      if (onDeleteAccount) onDeleteAccount();
    } catch {
      alert("Error deleting account.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <h2 className="text-3xl font-bold text-slate-800">Account Settings</h2>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-2">
          <CheckCircle size={20} />
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* General Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
            <UserIcon size={20} className="text-indigo-600"/> General Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">User ID (Read Only)</label>
              <input value={currentUser.id} disabled className="w-full p-2 border rounded bg-slate-100 text-slate-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role (Read Only)</label>
              <input value={currentUser.role} disabled className="w-full p-2 border rounded bg-slate-100 text-slate-500 uppercase" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
              <input 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                required
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Lock size={20} className="text-indigo-600"/> Security
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
            <input 
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none font-mono" 
              required
            />
          </div>
        </div>

        {/* Address */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-indigo-600"/> Address
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Country</label>
              <input value={country} onChange={e => setCountry(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
              <input value={city} onChange={e => setCity(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Postal Code</label>
              <input value={zip} onChange={e => setZip(e.target.value)} className="w-full p-2 border rounded" />
            </div>
          </div>
        </div>

        {/* Instructor */}
        {currentUser.role === UserRole.INSTRUCTOR && (
          <div className="bg-indigo-50 p-6 rounded-xl shadow-sm border border-indigo-100">
            <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-indigo-600"/> Professional Profile
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">Area of Expertise</label>
                <input value={expertise} onChange={e => setExpertise(e.target.value)} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className="w-full p-2 border rounded" />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg flex items-center gap-2">
            <Save size={18} /> Save Changes
          </button>
        </div>

        {/* Student Specific (READ ONLY GPA) */}
        {currentUser.role === UserRole.STUDENT && (
          <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <GraduationCap size={20} className="text-blue-600"/> Academic Performance
            </h3>

            <div>
              <label className="block text-xs font-bold text-blue-700 uppercase mb-1">Average Quiz Score (GPA)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={gpa} 
                  disabled 
                  className="w-full p-2 border border-blue-200 rounded bg-blue-100 text-blue-800 font-bold cursor-not-allowed" 
                />
                <div className="absolute right-3 top-2 text-xs text-blue-500 italic">
                  Calculated from quizzes
                </div>
              </div>
              <p className="text-xs text-blue-500 mt-2">
                This score is automatically calculated based on your average performance across all completed quizzes.
              </p>
            </div>
          </div>
        )}


      </form>

      {/* Danger Zone */}
      <div className="mt-12 border border-red-200 rounded-xl overflow-hidden">
        <div className="bg-red-50 px-6 py-4 border-b border-red-200">
          <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
            <AlertTriangle size={20} /> Danger Zone
          </h3>
        </div>

        <div className="p-6 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-700">Delete Account</h4>
            <p className="text-sm text-slate-500">
              Permanently remove your account and all associated data.
            </p>
          </div>

          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 shadow flex items-center gap-2"
          >
            <Trash2 size={18} /> Delete Account
          </button>
        </div>
      </div>

    </div>
  );
};
