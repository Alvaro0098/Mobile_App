import { useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/authContext';
import { getUserData } from '../services/authService';

/**
 * Hook para verificar el estado del token y debugging
 * Útil para diagnosticar problemas de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  const [tokenStatus, setTokenStatus] = useState({
    hasToken: false,
    isValid: false,
    isExpired: false,
    expiresIn: null,
    error: null,
  });

  useEffect(() => {
    const checkTokenStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        
        if (!token) {
          console.warn('⚠️  useAuth: No hay token en AsyncStorage');
          setTokenStatus({
            hasToken: false,
            isValid: false,
            isExpired: false,
            expiresIn: null,
            error: 'No hay token en AsyncStorage',
          });
          return;
        }

        const userData = getUserData(token);
        
        if (!userData) {
          console.error('❌ useAuth: Token inválido');
          setTokenStatus({
            hasToken: true,
            isValid: false,
            isExpired: false,
            expiresIn: null,
            error: 'Token no puede ser decodificado',
          });
          return;
        }

        // Verificar expiración
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = userData.exp || userData.ExpiresAt;
        
        if (expiresAt && expiresAt < now) {
          console.warn('⏰ useAuth: Token expirado');
          setTokenStatus({
            hasToken: true,
            isValid: true, // Se decodificó correctamente
            isExpired: true,
            expiresIn: null,
            error: 'Token expirado',
          });
          return;
        }

        const timeRemaining = expiresAt ? expiresAt - now : null;
        console.log('✅ useAuth: Token válido y activo');
        console.log('📋 Datos del token:', {
          nLegajo: userData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || userData.sub,
          role: userData['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || userData.role,
          expiresIn: timeRemaining ? `${Math.round(timeRemaining / 60)} minutos` : 'Sin expiración',
        });

        setTokenStatus({
          hasToken: true,
          isValid: true,
          isExpired: false,
          expiresIn: timeRemaining,
          error: null,
        });
      } catch (error) {
        console.error('❌ useAuth: Error verificando token:', error.message);
        setTokenStatus({
          hasToken: false,
          isValid: false,
          isExpired: false,
          expiresIn: null,
          error: error.message,
        });
      }
    };

    checkTokenStatus();
  }, []);

  return {
    ...context,
    tokenStatus,
  };
};
