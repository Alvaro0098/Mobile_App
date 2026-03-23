import { get, post, put, deleteRequest } from './apiClient';

/**
 * Area Service para MuniTrack Mobile
 */

export const getAreas = async () => {
  try {
    const data = await get('/Area');
    return data || [];
  } catch (error) {
    console.error('Error obteniendo áreas:', error);
    throw error;
  }
};

export const getAreaById = async (id) => {
  try {
    const data = await get(`/Area/${id}`);
    return data;
  } catch (error) {
    console.error(`Error obteniendo área ${id}:`, error);
    throw error;
  }
};

export const createArea = async (formData) => {
  try {
    const dtoData = {
      name: formData.name,
    };
    const response = await post('/Area', dtoData);
    return response;
  } catch (error) {
    console.error('Error creando área:', error);
    throw error;
  }
};

export const updateArea = async (id, formData) => {
  try {
    const dtoData = {
      name: String(formData.name),
    };
    const response = await put(`/Area/${id}`, dtoData);
    return response;
  } catch (error) {
    console.error(`Error actualizando área ${id}:`, error);
    throw error;
  }
};

export const deleteArea = async (id) => {
  try {
    const response = await deleteRequest(`/Area/${id}`);
    return response;
  } catch (error) {
    console.error(`Error eliminando área ${id}:`, error);
    throw error;
  }
};