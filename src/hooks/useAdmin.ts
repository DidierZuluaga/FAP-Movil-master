import { useAuth } from './useAuth';

export const useAdmin = () => {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'administrador';
  const isRegularUser = user?.role === 'asociado' || !user?.role; // ← AGREGAR ESTO
  
  return {
    isAdmin,
    isRegularUser, // ← AGREGAR ESTO
    userRole: user?.role || 'asociado'
  };
};