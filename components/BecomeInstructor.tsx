import React, { useState } from 'react';
import { User } from '../types';
import { UserRepository } from '../services/repositories/UserRepository';
import { CheckCircle, Briefcase, Award, Loader2 } from 'lucide-react';

interface Props {
  currentUser: User;
  onSuccess: (updatedUser: User) => void;
}

export const BecomeInstructor: React.FC<Props> = ({ currentUser, onSuccess }) => {
  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  
  // NOT: UserRepository artık static bir obje olduğu için 'new' keyword'ü kullanmıyoruz.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Yapay gecikmeyi (setTimeout) kaldırdık. Gerçek ağ isteği yapacağız.
    
    try {
        // Backend'e istek atıyoruz (Asenkron)
        const updatedUser = await UserRepository.becomeInstructor(currentUser.id, bio, expertise);
        
        // İşlem başarılıysa üst bileşeni bilgilendir
        onSuccess(updatedUser);
    } catch (error: any) {
        console.error("Eğitmen olma hatası:", error);
        alert(error.message || "Eğitmen kaydı yapılamadı. Lütfen tekrar deneyin.");
        setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Become an Instructor</h2>
      
      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-10 -translate-y-10">
             <Award size={150} />
        </div>

        <p className="text-slate-600 mb-8 text-lg">
            Share your knowledge with the world. Upgrade your account to create courses, manage lessons, and grade quizzes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Briefcase size={16} /> Professional Bio
                </label>
                <textarea 
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    placeholder="Tell us about your background, education, and teaching philosophy..."
                    required
                />
            </div>
            
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Award size={16} /> Area of Expertise
                </label>
                <input 
                    type="text"
                    value={expertise}
                    onChange={e => setExpertise(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    placeholder="e.g. Computer Science, Mathematics, History"
                    required
                />
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-sm text-indigo-800">
                <strong>Note:</strong> This action is irreversible. You will gain access to the Instructor Dashboard immediately after submission.
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                       <Loader2 className="animate-spin" size={20} /> Processing...
                    </>
                ) : (
                    <>
                        Complete Registration <CheckCircle size={18} />
                    </>
                )}
            </button>
        </form>
      </div>
    </div>
  );
};