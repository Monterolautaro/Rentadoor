import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, Users, Home, Bath, Car, DollarSign, ChevronLeft, ChevronRight, MessageSquare, BedDouble, CalendarCheck } from 'lucide-react';

const PropertyDetailPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser_rentadoor');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    const fetchProperty = () => {
      setLoading(true);
      const allProperties = JSON.parse(localStorage.getItem('properties_rentadoor')) || [];
      const mockProperties = [
        { id: "mock-1", ownerId: "mock-owner", title: "Moderno Loft en Palermo", location: "Palermo, Buenos Aires", price: 85000, currency: "ARS", rating: 4.8, guests: 4, bedrooms: 2, description: "Hermoso loft moderno con todas las comodidades en el corazón de Palermo. Perfecto para parejas o familias pequeñas.", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80", status: "Disponible", allImages: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80", "https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80", "https://images.unsplash.com/photo-1493809842344-ab619ba68aef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"]},
        { id: "mock-2", ownerId: "mock-owner", title: "Elegante Apartamento en Recoleta", location: "Recoleta, Buenos Aires", price: 120000, currency: "ARS", rating: 4.9, guests: 6, bedrooms: 3, description: "Apartamento elegante y espacioso en una de las zonas más exclusivas de Buenos Aires. Vista panorámica de la ciudad.", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80", status: "Disponible", allImages: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"]},
        { id: "mock-3", ownerId: "mock-owner", title: "Acogedor Estudio en San Telmo", location: "San Telmo, Buenos Aires", price: 55000, currency: "ARS", rating: 4.6, guests: 2, bedrooms: 1, description: "Estudio acogedor en el histórico barrio de San Telmo. Ideal para parejas que buscan autenticidad porteña.", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80", status: "Disponible", allImages: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"]},
        { id: "mock-4", ownerId: "mock-owner", title: "Penthouse con Vista al Río", location: "Puerto Madero, Buenos Aires", price: 950, currency: "USD", rating: 5.0, guests: 8, bedrooms: 4, description: "Increíble penthouse con vista panorámica al Río de la Plata. Lujo y comodidad en el moderno Puerto Madero.", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80", status: "Disponible", allImages: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"]},
      ];
      
      const processedMocks = mockProperties.map(p => ({...p, allImages: Array.isArray(p.allImages) ? p.allImages : (p.image ? [p.image] : []), currency: p.currency || 'ARS' }));
      const processedStored = allProperties.map(p => ({...p, allImages: Array.isArray(p.allImages) ? p.allImages : (p.image ? [p.image] : []), currency: p.currency || 'ARS' }));

      const combinedProperties = [...processedMocks, ...processedStored.filter(sp => !processedMocks.find(mp => mp.id === sp.id))];
      
      const foundProperty = combinedProperties.find(p => p.id.toString() === propertyId);
      
      if (foundProperty) {
        setProperty(foundProperty);
      } else {
        toast({
          title: "Propiedad no encontrada",
          description: "No pudimos encontrar los detalles para esta propiedad.",
          variant: "destructive",
        });
        navigate('/');
      }
      setLoading(false);
    };

    fetchProperty();
     const handlePropertiesChanged = () => {
        fetchProperty();
    };
    window.addEventListener('propertiesChanged_rentadoor', handlePropertiesChanged);

    return () => {
        window.removeEventListener('propertiesChanged_rentadoor', handlePropertiesChanged);
    };
  }, [propertyId, navigate, toast]);

  const handleContactOwner = () => {
    toast({
      title: "🚧 Contactar al Propietario",
      description: "Esta función aún no está implementada. ¡Pronto podrás comunicarte directamente!",
    });
  };

  const handleReserve = () => {
    if (!currentUser) {
      toast({
        title: "Inicia sesión para reservar",
        description: "Debes estar registrado y haber iniciado sesión para poder reservar una propiedad.",
        variant: "destructive",
      });
      return;
    }
    if (currentUser.identityStatus !== 'Verified') {
      toast({
        title: "Verificación Requerida",
        description: "Debes verificar tu identidad para poder reservar una propiedad.",
        variant: "destructive",
      });
      navigate('/dashboard/verificar-identidad');
      return;
    }
    navigate(`/propiedad/${propertyId}/reservar`);
  };

  const nextImage = () => {
    if (property && property.allImages && property.allImages.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % property.allImages.length);
    }
  };

  const prevImage = () => {
    if (property && property.allImages && property.allImages.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + property.allImages.length) % property.allImages.length);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-slate-700"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-slate-600">Propiedad no encontrada.</p>
        <Button onClick={() => navigate('/')} className="mt-4">Volver al inicio</Button>
      </div>
    );
  }
  
  const imagesToShow = property.allImages && property.allImages.length > 0 
    ? property.allImages 
    : (property.image ? [property.image] : ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"]);
  
  const displayPrice = property.monthlyRent !== undefined ? property.monthlyRent : property.price;
  const currencySymbol = property.currency === 'USD' ? 'U$S' : '$';
  const priceLabel = "/mes";

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 text-slate-700 hover:text-slate-900">
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver
        </Button>

        <Card className="overflow-hidden shadow-2xl">
          <CardHeader className="p-0">
            <div className="relative">
              {imagesToShow.length > 0 && (
                <img 
                  src={imagesToShow[currentImageIndex]}
                  alt={`Imagen ${currentImageIndex + 1} de ${property.title}`}
                  className="w-full h-[300px] md:h-[450px] object-cover"
                />
              )}
              {imagesToShow.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-slate-700"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-slate-700"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                   <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {currentImageIndex + 1} / {imagesToShow.length}
                  </div>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <CardTitle className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">{property.title}</CardTitle>
                <div className="flex items-center gap-2 text-slate-600 mb-4">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span>{property.location}</span>
                </div>
                <h2 className="text-xl font-semibold text-slate-700 mb-2">Descripción</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap mb-6">{property.description}</p>
                
                <h2 className="text-xl font-semibold text-slate-700 mb-3">Características Principales</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-slate-700">
                  <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>{property.guests} Huéspedes</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
                    <Home className="h-5 w-5 text-blue-600" />
                    <span>{property.environments || property.bedrooms} Ambientes</span>
                  </div>
                  {property.bathrooms !== undefined && (
                    <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
                      <Bath className="h-5 w-5 text-blue-600" />
                      <span>{property.bathrooms} Baño{property.bathrooms !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {property.garages !== undefined && (
                    <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
                      <Car className="h-5 w-5 text-blue-600" />
                      <span>{property.garages} Cochera{property.garages !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                   {property.bedrooms !== undefined && property.environments === undefined && ( 
                    <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
                      <BedDouble className="h-5 w-5 text-blue-600" />
                      <span>{property.bedrooms} Dormitorio{property.bedrooms !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-1 space-y-6">
                <Card className="bg-slate-50 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-2xl text-slate-800">Alquiler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600 mb-1">
                      {currencySymbol} {displayPrice.toLocaleString('es-AR')} <span className="text-lg font-normal text-slate-600">{priceLabel}</span>
                    </p>
                    {property.expensePrice > 0 && (
                       <p className="text-md text-slate-500">
                         + ${property.expensePrice.toLocaleString('es-AR')} de expensas (ARS)
                       </p>
                    )}
                    <Button className="w-full mt-4 bg-slate-700 hover:bg-slate-600" onClick={handleContactOwner}>
                      <MessageSquare className="mr-2 h-5 w-5" /> Contactar al Propietario
                    </Button>
                    <Button variant="outline" className="w-full mt-2 text-slate-700 hover:text-slate-900" onClick={() => toast({title: "🚧 Próximamente", description: "Podrás guardar esta propiedad en tus favoritos."})}>
                       Guardar en Favoritos
                    </Button>
                    <Button className="w-full mt-2 bg-blue-600 hover:bg-blue-500" onClick={handleReserve}>
                      <CalendarCheck className="mr-2 h-5 w-5" /> Reservar
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-50 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-800">Información Adicional</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 space-y-1">
                        <p>ID Propiedad: {property.id}</p>
                        <p>Dueño ID: {property.ownerId || "No especificado"}</p>
                        <p>Rating: {property.rating} ⭐</p>
                        <p>Estado: <span className={`font-semibold ${property.status === "Disponible" ? "text-green-600" : "text-red-600"}`}>{property.status}</span></p>
                    </CardContent>
                </Card>

              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PropertyDetailPage;