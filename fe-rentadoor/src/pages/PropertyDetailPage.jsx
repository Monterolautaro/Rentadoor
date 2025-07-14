import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, Users, Home, Bath, Car, DollarSign, ChevronLeft, ChevronRight, MessageSquare, BedDouble, CalendarCheck, Edit, Settings } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';

const PropertyDetailPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const { getPropertyById, loading } = useProperties();
  const [property, setProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const propertyData = await getPropertyById(propertyId);
        setProperty(propertyData);
      } catch (error) {
        console.error('Error fetching property:', error);
        toast({
          title: "Propiedad no encontrada",
          description: "No pudimos encontrar los detalles para esta propiedad.",
          variant: "destructive",
        });
        navigate('/');
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId, getPropertyById, navigate, toast]);

  const handleContactOwner = () => {
    toast({
      title: "🚧 Contactar al Propietario",
      description: "Esta función aún no está implementada. ¡Pronto podrás comunicarte directamente!",
    });
  };

  const handleReserve = () => {
    if (!user) {
      toast({
        title: "Inicia sesión para reservar",
        description: "Debes estar registrado y haber iniciado sesión para poder reservar una propiedad.",
        variant: "destructive",
      });
      return;
    }
    if (user.identityVerificationStatus !== 'verified') {
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

  const handleEditProperty = () => {
    navigate(`/dashboard/propietario/editar/${propertyId}`);
  };

  const handleManageProperty = () => {
    navigate('/dashboard/propietario');
  };

  const nextImage = () => {
    if (property && property.all_images && property.all_images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % property.all_images.length);
    }
  };

  const prevImage = () => {
    if (property && property.all_images && property.all_images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + property.all_images.length) % property.all_images.length);
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
  
  // Normalizar las imágenes para mostrar
  const imagesToShow = property.all_images && property.all_images.length > 0 
    ? property.all_images 
    : (property.image ? [property.image] : ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"]);
  
  const displayPrice = property.monthly_rent || property.monthlyRent || property.price;
  const currencySymbol = property.currency === 'USD' ? 'U$S' : '$';
  const priceLabel = "/mes";

  // Verificar si el usuario es el propietario
  const isOwner = user && property.owner_id && user.id === property.owner_id;

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
                    <span>{property.environments} Ambientes</span>
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
                   {property.bedrooms !== undefined && ( 
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
                    <CardTitle className="text-2xl text-slate-800">
                      {isOwner ? 'Tu Propiedad' : 'Alquiler'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600 mb-1">
                      {currencySymbol} {displayPrice.toLocaleString('es-AR')} <span className="text-lg font-normal text-slate-600">{priceLabel}</span>
                    </p>
                    {property.expense_price > 0 && (
                       <p className="text-md text-slate-500">
                         + ${property.expense_price.toLocaleString('es-AR')} de expensas (ARS)
                       </p>
                    )}
                    
                    {isOwner ? (
                      // Botones para propietario
                      <div className="space-y-2 mt-4">
                        <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={handleEditProperty}>
                          <Edit className="mr-2 h-5 w-5" /> Editar Propiedad
                        </Button>
                        <Button variant="outline" className="w-full text-slate-700 hover:text-slate-900" onClick={handleManageProperty}>
                          <Settings className="mr-2 h-5 w-5" /> Gestionar Propiedades
                        </Button>
                      </div>
                    ) : (
                      // Botones para visitantes
                      <div className="space-y-2 mt-4">
                        <Button className="w-full bg-slate-700 hover:bg-slate-600" onClick={handleContactOwner}>
                          <MessageSquare className="mr-2 h-5 w-5" /> Contactar al Propietario
                        </Button>
                        <Button variant="outline" className="w-full text-slate-700 hover:text-slate-900" onClick={() => toast({title: "🚧 Próximamente", description: "Podrás guardar esta propiedad en tus favoritos."})}>
                           Guardar en Favoritos
                        </Button>
                        <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={handleReserve}>
                          <CalendarCheck className="mr-2 h-5 w-5" /> Reservar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-50 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-800">Información Adicional</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 space-y-1">
                        <p>Estado: {property.status}</p>
                        <p>Moneda: {property.currency}</p>
                        {property.rating && <p>Calificación: {property.rating}/5</p>}
                        <p>Publicado: {new Date(property.created_at).toLocaleDateString('es-AR')}</p>
                        {isOwner && (
                          <>
                            <p>Tipo: {property.type || 'Departamento'}</p>
                            <p>Ambientes: {property.environments}</p>
                            {property.bathrooms !== undefined && <p>Baños: {property.bathrooms}</p>}
                            {property.garages !== undefined && <p>Cocheras: {property.garages}</p>}
                            {property.bedrooms !== undefined && <p>Dormitorios: {property.bedrooms}</p>}
                          </>
                        )}
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