import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * API Client para MuniTrack Mobile
 * Maneja todas las peticiones HTTP con token automático
 */

const BASE_URL = 'http://192.168.100.107:5216/api';

/**
 * Función privada para realizar peticiones HTTP
 * Obtiene el token automáticamente y lo agrega a los headers
 * @param {string} endpoint - Endpoint relativo (ej: '/Citizen')
 * @param {object} options - Opciones de fetch (method, body, etc)
 * @returns {Promise} - Respuesta JSON de la API
 */
async function request(endpoint, options = {}) {
  try {
    // Obtener token del AsyncStorage
    const token = await AsyncStorage.getItem('userToken');

    // Registrar en consola si hay token
    if (!token) {
      console.warn('⚠️  NO HAY TOKEN - El usuario podría no estar autenticado');
    } else {
      console.log('✅ Token encontrado en AsyncStorage');
    }

    // Headers por defecto
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Agregar token al header si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 Token agregado al header Authorization');
    } else {
      console.warn('⚠️  No se agregará Authorization header - Sin token disponible');
    }

    // Construir URL completa
    const url = `${BASE_URL}${endpoint}`;

    // Realizar la petición
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Registrar respuesta
    console.log(`📡 ${options.method || 'GET'} ${endpoint} - Status: ${response.status}`);

    // Si la respuesta no es OK, lanzar error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      console.error(`❌ Error ${response.status}:`, errorData.message || errorData.error);
      
      // Si es 401, el token puede estar expirado
      if (response.status === 401) {
        console.error('🔓 Error 401: Token inválido o expirado. Limpiando asyncStorage...');
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('token');
      }
      
      throw new Error(`Error ${response.status}: ${errorData.message || errorData.error}`);
    }

    // Intentar parsear como JSON
    const data = await response.json().catch(() => null);
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

/**
 * GET - Obtener datos
 * @param {string} endpoint - Endpoint relativo (ej: '/Citizen/1')
 * @param {object} options - Opciones adicionales de fetch
 * @returns {Promise}
 */
export const get = (endpoint, options = {}) =>
  request(endpoint, { ...options, method: 'GET' });

/**
 * POST - Crear datos
 * @param {string} endpoint - Endpoint relativo (ej: '/Citizen')
 * @param {object} body - Datos a enviar
 * @param {object} options - Opciones adicionales de fetch
 * @returns {Promise}
 */
export const post = (endpoint, body, options = {}) =>
  request(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });

/**
 * PUT - Actualizar datos
 * @param {string} endpoint - Endpoint relativo (ej: '/Citizen/1')
 * @param {object} body - Datos a actualizar
 * @param {object} options - Opciones adicionales de fetch
 * @returns {Promise}
 */
export const put = (endpoint, body, options = {}) =>
  request(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  });

/**
 * DELETE - Eliminar datos
 * @param {string} endpoint - Endpoint relativo (ej: '/Citizen/1')
 * @param {object} options - Opciones adicionales de fetch
 * @returns {Promise}
 */
export const deleteRequest = (endpoint, options = {}) =>
  request(endpoint, { ...options, method: 'DELETE' });

/**
 * Exportar todas las funciones en un objeto para comodidad
 * Uso: import apiClient from '../services/apiClient';
 *      apiClient.get('/endpoint')
 */
export default {
  get,
  post,
  put,
  delete: deleteRequest,
  BASE_URL,
};
