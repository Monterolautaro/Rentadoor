import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';

axios.defaults.withCredentials = true;

export const propertiesService = {

  async getAllProperties(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await axios.get(`${API_URL}/properties?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  // Obtener propiedades disponibles
  async getAvailableProperties() {
    try {
      const response = await axios.get(`${API_URL}/properties/available`);
      return response.data;
    } catch (error) {
      console.error('Error fetching available properties:', error);
      throw error;
    }
  },

  // Obtener mis propiedades (requiere autenticación)
  async getMyProperties() {
    try {
      const response = await axios.get(`${API_URL}/properties/my-properties`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my properties:', error);
      throw error;
    }
  },

  // Obtener una propiedad por ID
  async getPropertyById(id) {
    try {
      const response = await axios.get(`${API_URL}/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  },

  // Crear nueva propiedad (requiere autenticación)
  async createProperty(propertyData) {
    try {
      const response = await axios.post(`${API_URL}/properties`, propertyData);
      return response.data;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  // Actualizar propiedad (requiere autenticación)
  async updateProperty(id, propertyData) {
    try {
      const response = await axios.patch(`${API_URL}/properties/${id}`, propertyData);
      return response.data;
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  },

  // Eliminar propiedad (requiere autenticación)
  async deleteProperty(id) {
    try {
      await axios.delete(`${API_URL}/properties/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  },

  // Subir imágenes de propiedad (requiere autenticación)
  async uploadPropertyImages(files) {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await axios.post(`${API_URL}/storage/upload-property-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading property images:', error);
      throw error;
    }
  },

  // Obtener URL de imagen de propiedad
  async getPropertyImageUrl(imageName) {
    try {
      const response = await axios.get(`${API_URL}/storage/property-image/${imageName}`);
      return response.data.url;
    } catch (error) {
      console.error('Error getting property image URL:', error);
      throw error;
    }
  },

  // Eliminar imagen de propiedad (requiere autenticación)
  async deletePropertyImage(imageName) {
    try {
      await axios.delete(`${API_URL}/storage/property-image/${imageName}`);
      return true;
    } catch (error) {
      console.error('Error deleting property image:', error);
      throw error;
    }
  }
}; 