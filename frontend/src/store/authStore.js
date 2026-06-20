import { create } from 'zustand';
import api from '../api';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  
  initialize: async () => {
    if (!localStorage.getItem('token')) {
      set({ loading: false });
      return;
    }
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data, loading: false });
    } catch (err) {
      localStorage.removeItem('token');
      set({ user: null, loading: false });
    }
  },
  
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const res = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    localStorage.setItem('token', res.data.access_token);
    const userRes = await api.get('/auth/me');
    set({ user: userRes.data });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null });
  },
  
  updateUser: (newData) => {
    set((state) => ({
      user: { ...state.user, ...newData }
    }));
  }
}));

export default useAuthStore;
