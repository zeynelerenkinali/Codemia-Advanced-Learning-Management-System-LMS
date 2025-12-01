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
  
  // ID ile Kullanıcı Getir
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

  // Eğitmen Profilini Getir
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

  // Eğitmen Olma İsteği (Promote)
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

  // Profil Güncelleme
  async updateProfile(userId: number, data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT', // veya PATCH
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Profil güncellenemedi.");
    return await response.json();
  },

  // Eğitmen Bilgilerini Güncelleme
  async updateInstructorSpecifics(userId: number, bio: string, expertise: string): Promise<void> {
    const response = await fetch(`${API_URL}/instructors/${userId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ bio, expertise }),
    });

    if (!response.ok) throw new Error("Eğitmen profili güncellenemedi.");
  },

  // Hesap Silme
  async deleteAccount(userId: number): Promise<void> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error("Hesap silinemedi.");
  }
};