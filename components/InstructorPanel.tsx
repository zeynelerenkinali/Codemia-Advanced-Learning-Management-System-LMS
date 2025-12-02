// Updated InstructorPanel to work with real backend API (REST example)
// Main logic preserved as requested

import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { BookOpen, UserCheck, Edit2, Trash2, PlusCircle, Layers, Eye } from 'lucide-react';
import { InstructorCourseEditor } from './InstructorCourseEditor';

interface Props {
  currentUserId: number;
  onViewCourse?: (courseId: number) => void;
}

const API_URL = 'http://localhost:5000/api';

export const InstructorPanel: React.FC<Props> = ({ currentUserId, onViewCourse }) => {
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [editorCourseId, setEditorCourseId] = useState<number | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');

  const [profile, setProfile] = useState<any>(null);

  // Fetch profile + courses from backend
  useEffect(() => {
    fetch(`${API_URL}/users/${currentUserId}/instructor-profile`)
      .then(res => res.json())
      .then(data => setProfile(data));

    fetch(`${API_URL}/courses/instructor/${currentUserId}`)
      .then(res => res.json())
      .then(data => setMyCourses(data));
  }, [currentUserId, editorCourseId]);

  const openCreateModal = () => {
    setIsEditing(false);
    setCourseTitle('');
    setCourseDesc('');
    setShowModal(true);
  };

  const openEditModal = (course: Course) => {
    setIsEditing(true);
    setCurrentCourseId(course.id);
    setCourseTitle(course.title);
    setCourseDesc(course.description);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    await fetch(`${API_URL}/courses/${id}`, { method: "DELETE" });

    fetch(`${API_URL}/courses/instructor/${currentUserId}`)
      .then(res => res.json())
      .then(data => setMyCourses(data));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && currentCourseId) {
      await fetch(`${API_URL}/courses/${currentCourseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: courseTitle, description: courseDesc })
      });
    } else {
      await fetch(`${API_URL}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: courseTitle,
          description: courseDesc,
          instructor_id: currentUserId
        })
      });
    }

    fetch(`${API_URL}/courses/instructor/${currentUserId}`)
      .then(res => res.json())
      .then(data => setMyCourses(data));

    setShowModal(false);
  };

  if (editorCourseId) {
    return (
      <InstructorCourseEditor
        courseId={editorCourseId}
        onBack={() => setEditorCourseId(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-800">Instructor Dashboard</h2>
        {profile && (
          <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 flex items-center gap-3">
            <div className="bg-indigo-200 p-2 rounded-full">
              <UserCheck className="text-indigo-700" size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide">Expertise Area</p>
              <p className="text-sm font-semibold text-indigo-900">{profile.expertise_area}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-slate-700">
            <BookOpen className="text-indigo-600" />
            <h3 className="text-xl font-bold">My Courses</h3>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <PlusCircle size={16} /> Create New Course
          </button>
        </div>

        {myCourses.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <p className="text-slate-500 italic mb-4">You haven't created any courses yet.</p>
            <button type="button" onClick={openCreateModal} className="text-indigo-600 font-bold hover:underline">Get started now</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 font-bold uppercase">
                <tr>
                  <th className="p-3 rounded-tl-lg">ID</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Content</th>
                  <th className="p-3">Created</th>
                  <th className="p-3 rounded-tr-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myCourses.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono text-xs">{c.id}</td>
                    <td className="p-3 font-bold text-slate-900">{c.title}</td>
                    <td className="p-3 truncate max-w-xs">{c.description}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => setEditorCourseId(c.id)}
                        className="text-xs flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold hover:bg-purple-200 transition-colors"
                      >
                        <Layers size={12} /> Manage Content
                      </button>
                    </td>
                    <td className="p-3">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right flex justify-end gap-2">
                      {onViewCourse && (
                        <button
                          type="button"
                          onClick={() => onViewCourse(c.id)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="View Public Page (Reviews)"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEditModal(c)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Info"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold mb-4 text-slate-800">
                {isEditing ? 'Edit Course Info' : 'Create New Course'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Course Title</label>
                  <input
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g., Intro to Python"
                    value={courseTitle}
                    onChange={e => setCourseTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Course description..."
                    value={courseDesc}
                    onChange={e => setCourseDesc(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                    {isEditing ? 'Save Info' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
