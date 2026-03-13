// T031: Auth service
import api from './api.js';

export async function register(userData) {
  const data = await api.post('/auth/register', userData);
  return data; // Returns { user, message }
}

export async function login(email, password) {
  const data = await api.post('/auth/login', { email, password });
  return data; // Returns { user, message }
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function getCurrentUser() {
  try {
    const user = await api.get('/auth/me');
    return user;
  } catch (error) {
    if (error.status === 401) {
      return null;
    }
    throw error;
  }
}

export const authService = {
  register,
  login,
  logout,
  getCurrentUser
};

export default authService;
