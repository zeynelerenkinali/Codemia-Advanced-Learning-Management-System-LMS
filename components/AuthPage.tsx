
import React, { useState } from 'react';
import { AuthService } from '../services/AuthService';
import { User, UserRole } from '../types';
import { GraduationCap, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, CheckCircle, Loader2, Briefcase, ChevronLeft, Layout } from 'lucide-react';

interface Props {
  onLogin: (user: User, remember: boolean) => void;
}

type AuthMode = 'landing' | 'login' | 'register' | 'forgot';

export const AuthPage: React.FC<Props> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('landing');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const authService = new AuthService();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      if (mode === 'login') {
        const user = authService.login(email, password);
        onLogin(user, remember);
      } else if (mode === 'register') {
        const user = authService.register(name, email, password, role);
        onLogin(user, false); // Don't remember on register by default
      } else if (mode === 'forgot') {
        const exists = authService.resetPassword(email);
        if (exists) {
            setSuccess(`Password reset link sent to ${email}`);
            setTimeout(() => setMode('login'), 3000);
        } else {
            setError("Email address not found.");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInstructor = () => {
    setRole(UserRole.INSTRUCTOR);
    setMode('register');
    setError(null); 
    setSuccess(null);
  };

  const handleStartStudent = () => {
    setRole(UserRole.STUDENT);
    setMode('register');
    setError(null);
    setSuccess(null);
  };

  // --- LANDING PAGE VIEW ---
  if (mode === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        {/* Navbar */}
        <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-200">
              <GraduationCap className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">Codemia</span>
          </div>
          <div>
            <button 
              onClick={() => setMode('login')}
              className="text-slate-600 font-bold px-5 py-2 hover:text-indigo-600 transition-colors"
            >
              Log In
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 -mt-10">
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold mb-2">
              <Layout size={14} /> E-Learning Platform Demo
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Learn without <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">limits.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
              Codemia is a local-first e-learning platform designed to help you learn any software related content, while demonstrating advanced architecture and design patterns in action.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button 
                onClick={handleStartInstructor}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
              >
                <Briefcase className="group-hover:scale-110 transition-transform" />
                Become an Instructor
              </button>
              
              <button 
                onClick={handleStartStudent}
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3"
              >
                <UserIcon />
                Join as Student
              </button>
            </div>
          </div>
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left px-4 opacity-80">
            <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 font-bold">1</div>
              <h3 className="font-bold text-lg mb-2">Schema Design</h3>
              <p className="text-slate-500 text-sm">Explore complex ER relationships, ISA hierarchies, and normalization in a simulated PostgreSQL environment.</p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4 font-bold">2</div>
              <h3 className="font-bold text-lg mb-2">Design Patterns</h3>
              <p className="text-slate-500 text-sm">See Singleton, Factory, Strategy, Observer, and Repository patterns implemented in Typescript.</p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4 font-bold">3</div>
              <h3 className="font-bold text-lg mb-2">Full CRUD</h3>
              <p className="text-slate-500 text-sm">Comprehensive Create, Read, Update, and Delete operations for Courses, Lessons, and Quizzes.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- AUTH CARD VIEW (Login / Register / Forgot) ---
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 relative">
        
        <button 
          onClick={() => setMode('landing')}
          className="absolute top-4 left-4 p-2 text-white/80 hover:text-white z-20 hover:bg-white/10 rounded-full transition-colors"
          title="Back to Home"
        >
          <ChevronLeft />
        </button>

        {/* Header */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-indigo-600 opacity-10 transform skew-y-12 scale-150"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <GraduationCap className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Codemia</h1>
            <p className="text-slate-400 text-sm">
              {mode === 'register' && role === UserRole.INSTRUCTOR ? 'Instructor Access' : 'E-Learning Platform'}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'register' && (role === UserRole.INSTRUCTOR ? 'Join Faculty' : 'Create Account')}
            {mode === 'forgot' && 'Reset Password'}
          </h2>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg flex items-center gap-2">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Field (Register only) */}
            {mode === 'register' && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  required
                />
              </div>
            )}

            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                required
              />
            </div>

            {/* Password Field (Login & Register) */}
            {mode !== 'forgot' && (
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  required
                />
              </div>
            )}

            {/* Role Selection (Register only) - Hidden if role is pre-selected via Landing */}
            {mode === 'register' && (
              <div className="flex gap-4 pt-2">
                 <label className={`flex-1 flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all ${role === UserRole.STUDENT ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    <input type="radio" name="role" className="hidden" checked={role === UserRole.STUDENT} onChange={() => setRole(UserRole.STUDENT)} />
                    <span className="text-xs font-bold uppercase flex items-center gap-1"><UserIcon size={12}/> Student</span>
                 </label>
                 <label className={`flex-1 flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all ${role === UserRole.INSTRUCTOR ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    <input type="radio" name="role" className="hidden" checked={role === UserRole.INSTRUCTOR} onChange={() => setRole(UserRole.INSTRUCTOR)} />
                    <span className="text-xs font-bold uppercase flex items-center gap-1"><Briefcase size={12} /> Instructor</span>
                 </label>
              </div>
            )}

            {/* Remember Me & Forgot Password (Login only) */}
            {mode === 'login' && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input 
                    type="checkbox" 
                    checked={remember} 
                    onChange={e => setRemember(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  Remember me
                </label>
                <button type="button" onClick={() => setMode('forgot')} className="text-indigo-600 hover:underline font-medium">
                  Forgot Password?
                </button>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {mode === 'login' && 'Sign In'}
              {mode === 'register' && (role === UserRole.INSTRUCTOR ? 'Register as Instructor' : 'Sign Up')}
              {mode === 'forgot' && 'Send Reset Link'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Footer Toggle */}
          <div className="mt-8 text-center text-sm text-slate-500">
            {mode === 'login' && (
              <p>
                Don't have an account?{' '}
                <button onClick={() => setMode('register')} className="text-indigo-600 font-bold hover:underline">
                  Sign Up
                </button>
              </p>
            )}
            {mode === 'register' && (
              <p>
                Already have an account?{' '}
                <button onClick={() => setMode('login')} className="text-indigo-600 font-bold hover:underline">
                  Sign In
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <button onClick={() => setMode('login')} className="text-indigo-600 font-bold hover:underline">
                Back to Login
              </button>
            )}
          </div>

          {/* Demo Credentials Hint */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-center text-slate-400">
            <p className="font-semibold mb-1">Demo Credentials:</p>
            <p>Admin: admin@codemia.edu / pw</p>
            <p>Student: student@codemia.edu / pw</p>
          </div>
        </div>
      </div>
    </div>
  );
};
