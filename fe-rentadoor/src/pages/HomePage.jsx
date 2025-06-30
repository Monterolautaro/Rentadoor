import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import SearchBar from '@/components/SearchBar';
import PropertyCard from '@/components/PropertyCard';

const HomePage = () => {
  const [allProperties, setAllProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  const mockProperties = [
    { id: "mock-1", ownerId: "mock-owner", title: "Moderno Loft en Palermo", location: "Palermo, Buenos Aires", monthlyRent: 150000, currency: "ARS", type: "Departamento", environments: 2, bathrooms: 2, garages: 1, rating: 4.8, guests: 4, bedrooms: 1, description: "Hermoso loft moderno con todas las comodidades en el corazón de Palermo.", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80", status: "Disponible", allImages: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"]},
    { id: "mock-2", ownerId: "mock-owner", title: "Elegante Apartamento en Recoleta", location: "Recoleta, Buenos Aires", monthlyRent: 900, currency: "USD", type: "Departamento", environments: 3, bathrooms: 2, garages: 1, rating: 4.9, guests: 6, bedrooms: 2, description: "Apartamento elegante y espacioso en una de las zonas más exclusivas de Buenos Aires.", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80", status: "Disponible", allImages: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"]},
    { id: "mock-3", ownerId: "mock-owner", title: "Acogedor PH en San Telmo", location: "San Telmo, Buenos Aires", monthlyRent: 95000, currency: "ARS", type: "PH", environments: 3, bathrooms: 1, garages: 0, rating: 4.6, guests: 3, bedrooms: 2, description: "Estudio acogedor en el histórico barrio de San Telmo.", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80", status: "Disponible", allImages: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"]},
    { id: "mock-4", ownerId: "mock-owner", title: "Casa con Jardín en Belgrano", location: "Belgrano, Buenos Aires", monthlyRent: 1500, currency: "USD", type: "Casa", environments: 5, bathrooms: 3, garages: 2, rating: 5.0, guests: 8, bedrooms: 4, description: "Increíble casa con jardín y piscina en el tranquilo barrio de Belgrano R.", image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80", status: "Disponible", allImages: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"]},
  ];

  const loadProperties = () => {
    const storedProperties = JSON.parse(localStorage.getItem('properties_rentadoor')) || [];
    const processedStoredProperties = storedProperties.map(p => ({
      ...p,
      allImages: Array.isArray(p.allImages) ? p.allImages : (p.image ? [p.image] : []),
      type: p.type || 'Departamento'
    }));
    
    const combined = [...mockProperties.map(p => ({...p, allImages: Array.isArray(p.allImages) ? p.allImages : (p.image ? [p.image] : [])})), 
                      ...processedStoredProperties.filter(sp => !mockProperties.find(mp => mp.id === sp.id))];
    setAllProperties(combined);
    setFilteredProperties(combined.filter(p => p.status === "Disponible"));
  };

  useEffect(() => {
    loadProperties();
    const handlePropertiesChanged = () => { loadProperties(); };
    window.addEventListener('propertiesChanged_rentadoor', handlePropertiesChanged);
    return () => { window.removeEventListener('propertiesChanged_rentadoor', handlePropertiesChanged); };
  }, []);

  const handleSearch = useCallback((filters) => {
    setActiveFilters(filters);
    
    let properties = allProperties.filter(p => p.status === "Disponible");

    if (filters.searchTerm) {
      properties = properties.filter(p =>
        p.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    if (filters.propertyType) {
      properties = properties.filter(p => p.type === filters.propertyType);
    }
    if (filters.environments) {
        if(filters.environments === '4') {
             properties = properties.filter(p => p.environments >= 4);
        } else {
             properties = properties.filter(p => p.environments === parseInt(filters.environments));
        }
    }
    if (filters.barrio) {
      properties = properties.filter(p => p.location.toLowerCase().includes(filters.barrio.toLowerCase()));
    }
    if(filters.minPrice || filters.maxPrice) {
        properties = properties.filter(p => p.currency === filters.currency);
    }
    if (filters.minPrice) {
      properties = properties.filter(p => p.monthlyRent >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      properties = properties.filter(p => p.monthlyRent <= parseFloat(filters.maxPrice));
    }

    setFilteredProperties(properties);
  }, [allProperties]);


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
              {filteredProperties.length} propiedades encontradas
            </motion.p>
          </div>

          {filteredProperties.length === 0 ? (
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
              {filteredProperties.map((property, index) => (
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