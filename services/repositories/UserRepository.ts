import { User, InstructorProfile, UserRole } from '../../types';

const API_URL = 'http://localhost:5000/api';

// Yardımcı Fonksiyon: Backend'e istek atarken Token'ı header'a ekler
const getHeaders = () => {
  const token = localStorage.getItem('token'); // Token ismini login kısmında ne kaydettiysen o olmalı
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const UserRepository = {
  
  // Get User by ID
  async getById(id: number): Promise<User | undefined> {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        headers: getHeaders()
      });
      if (!response.ok) return undefined;
      return await response.json();
    } catch (error) {
      console.error("Kullanıcı getirilemedi:", error);
      return undefined;
    }
  },

  // Get Instructor Profile
  async getInstructorProfile(userId: number): Promise<InstructorProfile | undefined> {
    try {
      const response = await fetch(`${API_URL}/instructors/${userId}`, {
        headers: getHeaders()
      });
      if (!response.ok) return undefined;
      return await response.json();
    } catch (error) {
      return undefined;
    }
  },

  // Request to Become an Instructor (Promote)
  async becomeInstructor(userId: number, bio: string, expertise: string): Promise<User> {
    const response = await fetch(`${API_URL}/instructors`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, bio, expertise }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Eğitmen olunamadı.");
    }
    return await response.json();
  },

  // Update Profile
  async updateProfile(userId: number, data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT', // veya PATCH
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Profil güncellenemedi.");
    return await response.json();
  },

  // Update Instructor Details
  async updateInstructorSpecifics(userId: number, bio: string, expertise: string): Promise<void> {
    const response = await fetch(`${API_URL}/instructors/${userId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ bio, expertise }),
    });

    if (!response.ok) throw new Error("Eğitmen profili güncellenemedi.");
  },

  // Delete Account
  async deleteAccount(userId: number): Promise<void> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error("Hesap silinemedi.");
  }
};