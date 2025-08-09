import { useState, useEffect, useCallback } from 'react';
import { propertiesService } from '../services/propertiesService';
import { useToast } from '@/components/ui/use-toast';

export const useProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Cargar todas las propiedades
  const loadProperties = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await propertiesService.getAllProperties(filters);
      setProperties(data);
    } catch (error) {
      setError(error.message || 'Error al cargar las propiedades');
      toast({
        title: "Error",
        description: "No se pudieron cargar las propiedades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Cargar propiedades disponibles
  const loadAvailableProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await propertiesService.getAvailableProperties();
      setProperties(data);
    } catch (error) {
      setError(error.message || 'Error al cargar las propiedades disponibles');
      toast({
        title: "Error",
        description: "No se pudieron cargar las propiedades disponibles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Cargar mis propiedades
  const loadMyProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await propertiesService.getMyProperties();
      setProperties(data);
    } catch (error) {
      setError(error.message || 'Error al cargar tus propiedades');
      toast({
        title: "Error",
        description: "No se pudieron cargar tus propiedades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Obtener una propiedad por ID
  const getPropertyById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await propertiesService.getPropertyById(id);
      return data;
    } catch (error) {
      setError(error.message || 'Error al cargar la propiedad');
      toast({
        title: "Error",
        description: "No se pudo cargar la propiedad",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Crear nueva propiedad
  const createProperty = useCallback(async (propertyData) => {
    try {
      setLoading(true);
      setError(null);
      const newProperty = await propertiesService.createProperty(propertyData);
      
      // Actualizar la lista de propiedades
      setProperties(prev => [newProperty, ...prev]);
      
      toast({
        title: "¡Propiedad creada!",
        description: "La propiedad se ha creado exitosamente",
      });
      
      return newProperty;
    } catch (error) {
      setError(error.message || 'Error al crear la propiedad');
      toast({
        title: "Error",
        description: "No se pudo crear la propiedad",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Actualizar propiedad
  const updateProperty = useCallback(async (id, propertyData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProperty = await propertiesService.updateProperty(id, propertyData);
      
      // Actualizar la propiedad en la lista
      setProperties(prev => 
        prev.map(prop => prop.id === id ? updatedProperty : prop)
      );
      
      toast({
        title: "¡Propiedad actualizada!",
        description: "La propiedad se ha actualizado exitosamente",
      });
      
      return updatedProperty;
    } catch (error) {
      setError(error.message || 'Error al actualizar la propiedad');
      toast({
        title: "Error",
        description: "No se pudo actualizar la propiedad",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Eliminar propiedad
  const deleteProperty = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await propertiesService.deleteProperty(id);
      
      // Remover la propiedad de la lista
      setProperties(prev => prev.filter(prop => prop.id !== id));
      
      toast({
        title: "¡Propiedad eliminada!",
        description: "La propiedad se ha eliminado exitosamente",
      });
      
      return true;
    } catch (error) {
      setError(error.message || 'Error al eliminar la propiedad');
      toast({
        title: "Error",
        description: "No se pudo eliminar la propiedad",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Subir imágenes de propiedad
  const uploadPropertyImages = useCallback(async (files) => {
    try {
      setLoading(true);
      setError(null);
      const result = await propertiesService.uploadPropertyImages(files);
      
      toast({
        title: "¡Imágenes subidas!",
        description: "Las imágenes se han subido exitosamente",
      });
      
      return result;
    } catch (error) {
      setError(error.message || 'Error al subir las imágenes');
      toast({
        title: "Error",
        description: "No se pudieron subir las imágenes",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar propiedades con filtros
  const searchProperties = useCallback(async (filters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await propertiesService.getAllProperties(filters);
      setProperties(data);
    } catch (error) {
      setError(error.message || 'Error al buscar propiedades');
      toast({
        title: "Error",
        description: "No se pudieron buscar las propiedades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Agregar propiedades al array global
  const addProperties = useCallback((newProps) => {
    setProperties(prev => {
      // Evitar duplicados por id
      const ids = new Set(prev.map(p => p.id));
      const filtered = newProps.filter(p => p && !ids.has(p.id));
      return [...prev, ...filtered];
    });
  }, []);

  return {
    properties,
    loading,
    error,
    loadProperties,
    loadAvailableProperties,
    loadMyProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    uploadPropertyImages,
    searchProperties,
    addProperties,
  };
}; 