import { User } from '../types';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth/authService';

export const useAuth = () => {
  const { user, isLoading, error, setUser, setLoading, setError, logout } = useAuthStore();

  useEffect(() => {
    // Listener de cambios de autenticación
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  const register = async (
    email: string,
    password: string,
    name: string,
    dateOfBirth: Date
  ) => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.registerWithEmail(
        email,
        password,
        name,
        dateOfBirth
      );
      setUser(user);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.loginWithEmail(email, password);
      setUser(user);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.loginWithGoogle();
      setUser(user);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.sendPasswordReset(email);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');
      
      setLoading(true);
      setError(null);
      await authService.updateUserProfile(user.id, updates);
      
      // Actualizar el estado local
      setUser({ ...user, ...updates });
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      logout();
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    loginWithGoogle,
    sendPasswordReset,
    updateProfile,
    logout: handleLogout,
  };
};