import { get, post, put, deleteRequest } from './apiClient';

/**
 * Operator Service para MuniTrack Mobile
 * Gestiona todas las operaciones CRUD de operadores
 * Aprovecha el apiClient que maneja token y URL base automáticamente
 */

/**
 * Obtener todos los operadores
 * @returns {Promise<Array>} - Lista de operadores
 */
export const getOperators = async () => {
  try {
    const data = await get('/Operator');
    return data || [];
  } catch (error) {
    // Relanzar sin console.error para no interferir
    throw error;
  }
};

/**
 * Obtener un operador por ID
 * @param {number} id - ID del operador
 * @returns {Promise<object>} - Datos del operador
 */
export const getOperatorById = async (id) => {
  try {
    const data = await get(`/Operator/${id}`);
    return data;
  } catch (error) {
    // Relanzar sin console.error para no interferir
    throw error;
  }
};

/**
 * Crear un nuevo operador
 * @param {object} formData - Datos del formulario (camelCase)
 * @param {number} formData.dni - DNI (int, Key)
 * @param {string} formData.name - Nombre
 * @param {string} formData.lastName - Apellido
 * @param {number} formData.nLegajo - Número de legajo
 * @param {string} formData.email - Email
 * @param {string} formData.phone - Teléfono (opcional)
 * @param {string} formData.password - Contraseña (MinLength 8)
 * @param {number} formData.position - Role: 0=OperatorBasic, 1=Admin, 2=SysAdmin
 * @returns {Promise<object>} - Operador creado
 */
export const createOperator = async (formData) => {
  try {
    // Mapeo idéntico al DTO de C# (camelCase porque Program.cs usa CamelCase)
    const dtoData = {
      dni: Number(formData.dni),
      name: formData.name,
      lastName: formData.lastName,
      nLegajo: Number(formData.nLegajo),
      email: formData.email,
      phone: formData.phone || null,
      password: formData.password,
      position: Number(formData.position),
    };

    const response = await post('/Operator', dtoData);
    return response;
  } catch (error) {
    // Relanzar el error sin console.error para no interferir con React Native
    // El componente CreateOperator.jsx manejará el error correctamente
    throw error;
  }
};

/**
 * Actualizar un operador existente
 * @param {number} dni - DNI del operador (identificador en URL)
 * @param {object} formData - Datos a actualizar (camelCase)
 * @param {string} formData.name - Nombre (Required)
 * @param {string} formData.lastName - Apellido (Required)
 * @param {string} formData.email - Email (Required)
 * @param {string} formData.phone - Teléfono (opcional)
 * @param {string} formData.password - Contraseña (Required, pero si estaba vacía usar default)
 * @param {number} formData.position - Role: 0=OperatorBasic, 1=Admin, 2=SysAdmin
 * @returns {Promise<object>} - Operador actualizado
 */
export const updateOperator = async (dni, formData) => {
  try {
    // Mapeo idéntico al UpdateOperatorDto del backend
    // IMPORTANTE: Password es [Required] en el DTO, así que si está vacío, enviar default como Desktop
    const dtoData = {
      name: String(formData.name),
      lastName: String(formData.lastName),
      email: String(formData.email),
      // Si password está vacío, usar default "Password123!" (como hace Desktop)
      password: String(formData.password || 'Password123!'),
      // Phone es opcional, solo incluir si tiene valor
      ...(formData.phone && formData.phone.trim().length > 0 && { phone: String(formData.phone) }),
      position: Number(formData.position),
    };

    const response = await put(`/Operator/${dni}`, dtoData);
    return response;
  } catch (error) {
    // Relanzar sin console.error para no interferir
    throw error;
  }
};

/**
 * Eliminar un operador
 * @param {number} id - ID del operador
 * @returns {Promise<object>} - Respuesta del servidor
 */
export const deleteOperator = async (id) => {
  try {
    const response = await deleteRequest(`/Operator/${id}`);
    return response;
  } catch (error) {
    // Relanzar sin console.error para no interferir
    throw error;
  }
};
