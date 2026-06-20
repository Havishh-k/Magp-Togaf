import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export const AuthProvider = ({ children }) => {
  const initialize = useAuthStore(state => state.initialize);
  const loading = useAuthStore(state => state.loading);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) return null;
  return children;
};

export const useAuth = useAuthStore;
