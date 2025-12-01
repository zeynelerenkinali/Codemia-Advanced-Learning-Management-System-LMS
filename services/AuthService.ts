// services/AuthService.ts

const API_URL = 'http://localhost:5000/api/auth';

export const AuthService = {
  async login(email, password) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    // Token'ı kaydet (Backend'den token dönüyorsa)
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data.user;
  },

  async register(name, email, password, role) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
    }
    
    return await response.json();
  },
  
  logout() {
    localStorage.removeItem('token');
  }
};