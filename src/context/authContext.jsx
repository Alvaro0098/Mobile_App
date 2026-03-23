import React, { createContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData } from '../services/authService';

export const AuthContext = createContext();

/**
 * AuthProvider: Proveedor de contexto de autenticación
 * Maneja la persistencia del usuario y token en AsyncStorage
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Cargar datos del usuario desde AsyncStorage al montar el componente
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Intentar leer token (primero "userToken", luego "token" por compatibilidad)
        let storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) {
          storedToken = await AsyncStorage.getItem('token');
        }
        const storedUser = await AsyncStorage.getItem('user');

        if (storedToken && storedUser) {
          // Validar que el token sea válido decodificándolo
          const userData = getUserData(storedToken);

          if (userData) {
            const parsedUser = JSON.parse(storedUser);
            setToken(storedToken);
            setUser({ ...parsedUser, token: storedToken });

            console.log('Usuario restaurado desde AsyncStorage:', parsedUser);
          } else {
            // Token inválido o expirado
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error al restaurar sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Guardar usuario y token en AsyncStorage
   */
  const saveUserToStorage = async (userData, userToken) => {
    try {
      // Guardar token con clave "userToken"
      await AsyncStorage.setItem('userToken', userToken);
      // Guardar token también con clave "token" para compatibilidad
      await AsyncStorage.setItem('token', userToken);
      // Guardar datos del usuario
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Actualizar estado global
      setToken(userToken);
      setUser({ ...userData, token: userToken });
      
      console.log('Usuario guardado en AsyncStorage:', userData);
    } catch (error) {
      console.error('Error al guardar usuario en AsyncStorage:', error);
    }
  };

  /**
   * Cerrar sesión: limpiar AsyncStorage y estado
   */
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  /**
   * Valores del contexto con propiedades calculadas
   * Mapeo de roles:
   * - 0: Usuario/Operador (isOperatorBasic)
   * - 1: Admin (isAdmin)
   * - 2: SuperAdmin (isSuperAdmin)
   */
  const value = useMemo(
    () => ({
      user,
      token,
      setUser,
      saveUserToStorage,
      logout,
      isAuthenticated: !!user && !!token,
      isOperatorBasic: user?.role === 0,
      isAdmin: user?.role === 1,
      isSuperAdmin: user?.role === 2,
    }),
    [user, token]
  );

  // No renderizar hasta que se cargue la sesión guardada
  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
