


import React, { useState, useEffect } from 'react';
import { User, UserRole, InstructorProfile } from '../types';
import { UserRepository } from '../services/repositories/UserRepository';
import { Save, User as UserIcon, MapPin, Lock, Briefcase, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';

interface Props {
  currentUser: User;
  onUpdate: (user: User) => void;
  onDeleteAccount?: () => void;
}

export const ProfileSettings: React.FC<Props> = ({ currentUser, onUpdate, onDeleteAccount }) => {
  const repo = new UserRepository();
  
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

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load instructor profile if applicable
    if (currentUser.role === UserRole.INSTRUCTOR) {
        const profile = repo.getInstructorProfile(currentUser.id);
        if (profile) {
            setBio(profile.bio);
            setExpertise(profile.expertise_area);
        }
    }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
        // 1. Update User Entity
        const updatedUser = repo.updateProfile(currentUser.id, {
            name,
            email,
            password_hash: password,
            country,
            city,
            postal_code: zip
        });

        // 2. Update Instructor Entity (if applicable)
        if (currentUser.role === UserRole.INSTRUCTOR) {
            repo.updateInstructorSpecifics(currentUser.id, bio, expertise);
        }

        onUpdate(updatedUser);
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(null), 3000);
    } catch (err) {
        alert("Failed to update profile");
    }
  };

  const handleDelete = () => {
      if (confirm("Are you absolutely sure you want to delete your account? This action cannot be undone. All your data, enrollments, and reviews will be permanently removed.")) {
          try {
              repo.deleteAccount(currentUser.id);
              if (onDeleteAccount) onDeleteAccount();
          } catch (e) {
              alert("Error deleting account.");
          }
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
                    type="text" // Visible for demo purposes
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none font-mono" 
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">Stored as simulated hash in DB.</p>
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
                      <input 
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
                      <input 
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Postal Code</label>
                      <input 
                        value={zip}
                        onChange={e => setZip(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                      />
                  </div>
              </div>
          </div>

          {/* Instructor Specifics */}
          {currentUser.role === UserRole.INSTRUCTOR && (
             <div className="bg-indigo-50 p-6 rounded-xl shadow-sm border border-indigo-100">
                <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                    <Briefcase size={20} className="text-indigo-600"/> Professional Profile
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">Area of Expertise</label>
                        <input 
                            value={expertise}
                            onChange={e => setExpertise(e.target.value)}
                            className="w-full p-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">Bio</label>
                        <textarea 
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            rows={4}
                            className="w-full p-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                        />
                    </div>
                </div>
             </div>
          )}

          <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 flex items-center gap-2"
              >
                  <Save size={18} /> Save Changes
              </button>
          </div>
      </form>

      {/* DANGER ZONE */}
      <div className="mt-12 border border-red-200 rounded-xl overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-200">
              <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                  <AlertTriangle size={20} /> Danger Zone
              </h3>
          </div>
          <div className="p-6 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                  <h4 className="font-bold text-slate-700">Delete Account</h4>
                  <p className="text-sm text-slate-500 mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
              </div>
              <button 
                type="button"
                onClick={handleDelete}
                className="bg-white border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
              >
                  <Trash2 size={16} /> Delete Account
              </button>
          </div>
      </div>
    </div>
  );
};
