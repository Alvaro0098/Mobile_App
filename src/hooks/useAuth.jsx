import { useContext } from 'react';
import { AuthContext } from '../context/authContext';

/**
 * Hook personalizado para acceder al contexto de autenticación
 * Proporciona acceso a: user, token, login, logout, isAuthenticated, roles
 * @returns {object} - Contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de AuthProvider');
  }

  return context;
};

export default useAuth;
