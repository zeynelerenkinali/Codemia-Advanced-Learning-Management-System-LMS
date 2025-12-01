// services/repositories/CourseRepository.ts

const API_URL = 'http://localhost:5000/api/courses';

// Yardımcı fonksiyon: Header'a Token ekler
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const CourseRepository = {
  async getAll() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch courses');
    return await response.json();
  },

  async getById(id: string) {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Course not found');
    return await response.json();
  },

  async create(courseData: any) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(courseData),
    });
    if (!response.ok) throw new Error('Failed to create course');
    return await response.json();
  }
};