import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  loginLibrarian: (email, password) => api.post('/auth/login/librarian', { email, password }),
  loginStudent: (email, password) => api.post('/auth/login/student', { email, password }),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  getProfile: () => api.get('/auth/profile'),
};

export const studentAPI = {
  addStudent: (data) => api.post('/student', data),
  getStudents: () => api.get('/student'),
  getStudentById: (id) => api.get(`/student/detail/${id}`),
  deleteStudent: (id) => api.delete(`/student/${id}`),
  getMyBooks: () => api.get('/student/my-books/all'),
};

export const bookAPI = {
  addBook: (data) => api.post('/book', data),
  getBooks: (params) => api.get('/book', { params }),
  getBookById: (id) => api.get(`/book/detail/${id}`),
  updateBook: (id, data) => api.put(`/book/${id}`, data),
  deleteBook: (id) => api.delete(`/book/${id}`),
  getCategories: () => api.get('/book/category/all'),
  addCategory: (data) => api.post('/book/category/add', data),
};

export const issueAPI = {
  issueBook: (data) => api.post('/issue/issue', data),
  returnBook: (data) => api.post('/issue/return', data),
  getActiveIssues: () => api.get('/issue/active'),
  getOverdueIssues: () => api.get('/issue/overdue'),
  getStudentIssueHistory: (studentId) => api.get(`/issue/student/${studentId}`),
};

export default api;
