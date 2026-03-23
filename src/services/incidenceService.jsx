import { get, post, put, deleteRequest } from './apiClient';

/**
 * Incidence Service para MuniTrack Mobile
 * Gestiona todas las operaciones CRUD de incidencias
 * Aprovecha el apiClient que maneja token y URL base automáticamente
 */

/**
 * Obtener todas las incidencias activas
 * @returns {Promise<Array>} - Lista de incidencias
 */
export const getIncidences = async () => {
  try {
    const data = await get('/Incidence');
    return data || [];
  } catch (error) {
    console.error('Error obteniendo incidencias:', error);
    throw error;
  }
};

/**
 * Obtener todas las incidencias eliminadas
 * @returns {Promise<Array>} - Lista de incidencias eliminadas
 */
export const getDeletedIncidences = async () => {
  try {
    const data = await get('/Incidence/deleted');
    return data || [];
  } catch (error) {
    console.error('Error obteniendo incidencias eliminadas:', error);
    throw error;
  }
};

/**
 * Crear una nueva incidencia
 * @param {object} formData - Datos del formulario
 * @param {string} formData.date - Fecha ISO (ej: '2026-03-22T10:30:00')
 * @param {number} formData.incidenceType - Tipo de incidencia (int: 0, 1, 2...)
 * @param {string} formData.description - Descripción de la incidencia
 * @param {number} formData.state - Estado (int: 0=Abierta, 1=EnProceso, 2=Cerrada, etc)
 * @param {number} formData.operatorId - ID del operador asignado
 * @param {number} formData.areaId - ID del área afectada
 * @returns {Promise<object>} - Incidencia creada con el ID del servidor
 */
export const createIncidence = async (formData) => {
  try {
    // Mapear datos del formulario al DTO de C#
    const dtoData = {
      Date: formData.date || new Date().toISOString(),
      IncidenceType: Number(formData.incidenceType),
      Description: formData.description,
      State: Number(formData.state) || 0,
      OperatorId: Number(formData.operatorId),
      AreaId: Number(formData.areaId),
    };

    const response = await post('/Incidence', dtoData);
    return response;
  } catch (error) {
    console.error('Error creando incidencia:', error);
    throw error;
  }
};

/**
 * Actualizar una incidencia existente
 * @param {number} id - ID de la incidencia
 * @param {object} formData - Datos a actualizar
 * @param {string} formData.date - Fecha ISO (opcional)
 * @param {number} formData.incidenceType - Tipo de incidencia (opcional)
 * @param {string} formData.description - Nueva descripción (opcional)
 * @param {number} formData.state - Nuevo estado (opcional)
 * @param {number} formData.areaId - ID del área (opcional, normalmente no se cambia)
 * @returns {Promise<object>} - Incidencia actualizada
 */
export const updateIncidence = async (id, formData) => {
  try {
    // Mapear datos del formulario al DTO de C#
    const dtoData = {};

    if (formData.date !== undefined) {
      dtoData.Date = formData.date;
    }

    if (formData.incidenceType !== undefined) {
      dtoData.IncidenceType = Number(formData.incidenceType);
    }

    if (formData.description !== undefined) {
      dtoData.Description = formData.description;
    }

    if (formData.state !== undefined) {
      dtoData.State = Number(formData.state);
    }

    if (formData.areaId !== undefined) {
      dtoData.AreaId = Number(formData.areaId);
    }

    const response = await put(`/Incidence/${id}`, dtoData);
    return response;
  } catch (error) {
    console.error(`Error actualizando incidencia ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar una incidencia (soft delete)
 * @param {number} id - ID de la incidencia
 * @returns {Promise<object>} - Respuesta del servidor
 */
export const deleteIncidence = async (id) => {
  try {
    const response = await deleteRequest(`/Incidence/${id}`);
    return response;
  } catch (error) {
    console.error(`Error eliminando incidencia ${id}:`, error);
    throw error;
  }
};

/**
 * Restaurar una incidencia eliminada
 * @param {number} id - ID de la incidencia a restaurar
 * @returns {Promise<object>} - Incidencia restaurada
 */
export const restoreIncidence = async (id) => {
  try {
    const response = await put(`/Incidence/${id}/restore`, {});
    return response;
  } catch (error) {
    console.error(`Error restaurando incidencia ${id}:`, error);
    throw error;
  }
};

/**
 * Exportar todas las funciones en un objeto para comodidad
 * Uso: import incidenceService from '../services/incidenceService';
 *      incidenceService.getIncidences()
 */
export default {
  getIncidences,
  getDeletedIncidences,
  createIncidence,
  updateIncidence,
  deleteIncidence,
  restoreIncidence,
};
