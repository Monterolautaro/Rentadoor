import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import SearchBar from '@/components/SearchBar';
import PropertyCard from '@/components/PropertyCard';
import { useProperties } from '@/hooks/useProperties';
import { formatCurrency } from '@/utils/formatCurrency';

const HomePage = () => {
  const { properties, loading, loadAvailableProperties, searchProperties } = useProperties();
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  // Mock properties para mostrar mientras no hay datos reales
  const mockProperties = [
    { id: "mock-1", owner_id: "mock-owner", title: "Moderno Loft en Palermo", location: "Palermo, Buenos Aires", monthly_rent: 150000, currency: "ARS", type: "Departamento", environments: 2, bathrooms: 2, garages: 1, rating: 4.8, approx_m2: 85, rental_period: 12, bedrooms: 1, description: "Hermoso loft moderno con todas las comodidades en el corazón de Palermo.", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80", status: "Disponible", all_images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"]},
    { id: "mock-2", owner_id: "mock-owner", title: "Elegante Apartamento en Recoleta", location: "Recoleta, Buenos Aires", monthly_rent: 900, currency: "USD", type: "Departamento", environments: 3, bathrooms: 2, garages: 1, rating: 4.9, approx_m2: 120, rental_period: 24, bedrooms: 2, description: "Apartamento elegante y espacioso en una de las zonas más exclusivas de Buenos Aires.", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80", status: "Disponible", all_images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"]},
    { id: "mock-3", owner_id: "mock-owner", title: "Acogedor PH en San Telmo", location: "San Telmo, Buenos Aires", monthly_rent: 95000, currency: "ARS", type: "PH", environments: 3, bathrooms: 1, garages: 0, rating: 4.6, approx_m2: 200, rental_period: 36, bedrooms: 3, description: "Estudio acogedor en el histórico barrio de San Telmo.", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80", status: "Disponible", all_images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"]},
    { id: "mock-4", owner_id: "mock-owner", title: "Casa con Jardín en Belgrano", location: "Belgrano, Buenos Aires", monthly_rent: 1500, currency: "USD", type: "Casa", environments: 5, bathrooms: 3, garages: 2, rating: 5.0, approx_m2: 180, rental_period: 18, bedrooms: 4, description: "Increíble casa con jardín y piscina en el tranquilo barrio de Belgrano R.", image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80", status: "Disponible", all_images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"]},
  ];

  // Función para normalizar propiedades (convertir campos de API a formato frontend)
  const normalizeProperties = (properties) => {
    return properties.map(prop => ({
      ...prop,
      // Mapear campos de API a formato frontend
      monthlyRent: prop.monthly_rent || prop.monthlyRent,
      allImages: prop.all_images || prop.allImages || (prop.image ? [prop.image] : []),
      type: prop.type || 'Departamento',
      // Asegurar que los campos existan
      rating: prop.rating || 0,
      approxM2: prop.approx_m2 || prop.approxM2 || 0,
      rentalPeriod: prop.rental_period || prop.rentalPeriod || 12,
      bedrooms: prop.bedrooms || 1,
    }));
  };
  
  // Cargar propiedades al montar el componente
  useEffect(() => {
    const loadInitialProperties = async () => {
      try {
        await loadAvailableProperties();
      } catch (error) {
        console.error('Error loading properties:', error);
        // Si falla la API, usar mock properties
        setFilteredProperties(normalizeProperties(mockProperties));
      }
    };

    loadInitialProperties();
  }, [loadAvailableProperties]);

  // Actualizar propiedades filtradas cuando cambien las propiedades
  useEffect(() => {
    const normalizedProps = normalizeProperties(properties);
    setFilteredProperties(normalizedProps.filter(p => p.status === "Disponible"));
  }, [properties]);

  const handleSearch = useCallback((filters) => {
    setActiveFilters(filters);
    
    // Si hay filtros, usar la API de búsqueda
    if (Object.keys(filters).length > 0) {
      searchProperties(filters);
    } else {
      // Si no hay filtros, cargar propiedades disponibles
      loadAvailableProperties();
    }
  }, [searchProperties, loadAvailableProperties]);

  // Combinar propiedades de API con mock properties si no hay datos
  const allProperties = properties.length > 0 
    ? normalizeProperties(properties)
    : normalizeProperties(mockProperties);

  const availableProperties = allProperties.filter(p => p.status === "Disponible");

  return (
    <>
      <section className="gradient-bg py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-4">
              Encontrá tu hogar ideal
            </h1>
            <p className="text-xl text-slate-600 mb-2">
              Descubrí los mejores departamentos en alquiler en Buenos Aires.
            </p>
            <p className="text-lg text-blue-600 font-medium mb-12">
              Sin garantía propietaria ni seguros costosos y 100% digital.
            </p>
          </motion.div>
          
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-slate-800"
            >
              Propiedades Disponibles
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-gray-600"
            >
              {loading ? 'Cargando...' : `${availableProperties.length} propiedades encontradas`}
            </motion.p>
          </div>

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-xl text-gray-500 mt-4">Cargando propiedades...</p>
            </motion.div>
          ) : availableProperties.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-xl text-gray-500">
                No se encontraron propiedades que coincidan con tu búsqueda.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availableProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default HomePage;