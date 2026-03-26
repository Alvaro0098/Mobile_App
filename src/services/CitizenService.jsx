import { get, post, put, deleteRequest } from './apiClient';

/**
 * Citizen Service para MuniTrack Mobile
 * Gestiona todas las operaciones CRUD de ciudadanos
 * Aprovecha el apiClient que maneja token y URL base automáticamente
 */

/**
 * Obtener todos los ciudadanos
 * @returns {Promise<Array>} - Lista de ciudadanos
 */
export const getCitizens = async () => {
  try {
    const data = await get('/Citizen');
    return data || [];
  } catch (error) {
    // Relanzar sin console.error para no interferir
    throw error;
  }
};

/**
 * Obtener un ciudadano por DNI
 * @param {string} dni - DNI del ciudadano
 * @returns {Promise<object|null>} - Datos del ciudadano o null si no existe
 */
export const getCitizenByDni = async (dni) => {
  try {
    const data = await get(`/Citizen/${dni}`);
    return data;
  } catch (error) {
    // Si el error es "no encontrado" (404), retornar null sin relanzar
    const errorMsg = error.message || '';
    if (errorMsg.toLowerCase().includes('encontr') || errorMsg.toLowerCase().includes('not found')) {
      return null;
    }
    // Para otros errores, relanzar para que se maneje como error real
    throw error;
  }
};

/**
 * Crear un nuevo ciudadano
 * @param {object} formData - Datos del formulario
 * @param {number} formData.dni - DNI (identificador único, int de 8 dígitos)
 * @param {string} formData.name - Nombre
 * @param {string} formData.lastName - Apellido
 * @param {string} formData.email - Email
 * @param {string} formData.adress - Dirección
 * @param {string} formData.phone - Teléfono/Celular
 * @returns {Promise<object>} - Ciudadano creado
 */
export const createCitizen = async (formData) => {
  try {
    // Mapeo idéntico al del desktop (munitrack-front)
    const dtoData = {
      DNI: Number(formData.dni),
      Name: formData.name,
      LastName: formData.lastName,
      Email: formData.email,
      Adress: formData.adress,
      Phone: formData.phone,
    };

    const response = await post('/Citizen', dtoData);
    return response;
  } catch (error) {
    // Relanzar sin console.error para no interferir
    throw error;
  }
};

/**
 * Actualizar un ciudadano existente
 * @param {string} dni - DNI del ciudadano (identificador)
 * @param {object} formData - Datos a actualizar
 * @returns {Promise<object>} - Ciudadano actualizado
 */
export const updateCitizen = async (dni, formData) => {
  try {
    // Mapeo idéntico al del desktop
    const dtoData = {
      Name: formData.name,
      LastName: formData.lastName,
      Email: formData.email,
      Adress: formData.adress,
      Phone: formData.phone,
    };

    const response = await put(`/Citizen/${dni}`, dtoData);
    return response;
  } catch (error) {
    // Relanzar sin console.error para no interferir
    throw error;
  }
};

/**
 * Eliminar un ciudadano
 * @param {string} dni - DNI del ciudadano
 * @returns {Promise<object>} - Respuesta del servidor
 */
export const deleteCitizen = async (dni) => {
  try {
    const response = await deleteRequest(`/Citizen/${dni}`);
    return response;
  } catch (error) {
    // Relanzar sin console.error para no interferir
    throw error;
  }
};
