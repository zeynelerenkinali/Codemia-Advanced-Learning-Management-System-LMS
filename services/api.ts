// frontend/src/services/api.ts

const API_URL = 'http://localhost:4000/api';

export const api = {
  // Giriş Yap
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Giriş başarısız');
    }
    return data;
  },

  // Kayıt Ol
  register: async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Kayıt başarısız');
    }
    return data;
  }
};