import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, Users, Home, Bath, Car, DollarSign, ChevronLeft, ChevronRight, MessageSquare, BedDouble, CalendarCheck, Edit, Settings, Ruler, Calendar } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import { useReservations } from '@/hooks/useReservations';
import ImageZoomModal from '@/components/ImageZoomModal';
import HigherImage from '@/components/HigherImage';
import { userService } from '../services/userServce';

const PropertyDetailPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const { getPropertyById, loading } = useProperties();
  const { reservations: globalReservations, fetchByUser } = useReservations();
  const [checkingReservation, setCheckingReservation] = useState(true);
  const [hasActiveReservation, setHasActiveReservation] = useState(false);
  const [userReservations, setUserReservations] = useState([]);
  const [property, setProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [miniStart, setMiniStart] = useState(0);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomImageSrc, setZoomImageSrc] = useState(null);

  // Normalizar las imágenes para mostrar
  const imagesToShow = property?.all_images && property.all_images.length > 0 
    ? property.all_images 
    : (property?.image ? [property.image] : ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"]);
  const MINIATURES_SHOWN = 4;
  const totalImages = imagesToShow.length;
  const canGoPrevMini = miniStart > 0;
  const canGoNextMini = miniStart + MINIATURES_SHOWN < totalImages;
  const visibleMiniatures = imagesToShow.slice(miniStart, miniStart + MINIATURES_SHOWN);

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

  useEffect(() => {
    const checkReservation = async () => {
      if (user && propertyId) {
        setCheckingReservation(true);
        const data = await fetchByUser(user.id);
        setUserReservations(data);
        // Buscar si hay una reserva activa para esta propiedad
        const active = data.some(r =>
          r.property_id === Number(propertyId) &&
          ['pendiente', 'preaprobada_admin', 'aprobada'].includes(r.status)
        );
        setHasActiveReservation(active);
        setCheckingReservation(false);
      } else {
        setHasActiveReservation(false);
        setCheckingReservation(false);
      }
    };
    checkReservation();
    // eslint-disable-next-line
  }, [user, propertyId]);

  const handleContactOwner = async () => {
    const user = property.owner_id
    const userData = await userService.getUserById(user);
    const phone = userData.telefono;
    console.log(phone);
    
    window.open(`https://wa.me/${phone}`, '_blank');
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
  
  const displayPrice = property.monthly_rent || property.monthlyRent || property.price;
  const currencySymbol = property.currency === 'USD' ? 'U$S' : '$';
  const priceLabel = "/mes";

  // Verificar si el usuario es el propietario
  const isOwner = user && property.owner_id && user.id === property.owner_id;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {zoomModalOpen && (
        <HigherImage
          imageSrc={zoomImageSrc}
          alt={property?.title}
          onClose={() => setZoomModalOpen(false)}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 text-slate-700 hover:text-slate-900">
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver
        </Button>

        <Card className="overflow-hidden shadow-2xl">
          <CardContent className="p-0 md:p-10">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
              {/* Carrusel de imágenes a la izquierda */}
              <div className="w-full md:w-[52%] flex flex-col items-center md:items-start">
                {/* Miniaturas horizontales arriba de la imagen principal */}
                <div className="flex flex-row gap-2 mb-4 w-full justify-center items-center">
                  {canGoPrevMini && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/80 hover:bg-white text-slate-700 shadow"
                      onClick={() => setMiniStart(miniStart - 1)}
                      aria-label="Miniaturas anteriores"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  )}
                  {visibleMiniatures.map((img, idx) => {
                    const realIdx = miniStart + idx;
                    if (idx === MINIATURES_SHOWN - 1 && canGoNextMini) {
                      return (
                        <Button
                          key="mini-next"
                          variant="ghost"
                          size="icon"
                          className="border-2 border-slate-200 rounded-lg w-16 h-16 flex items-center justify-center bg-white hover:border-blue-400"
                          onClick={() => setMiniStart(miniStart + 1)}
                          aria-label="Ver más miniaturas"
                        >
                          <ChevronRight className="h-6 w-6 text-blue-600" />
                        </Button>
                      );
                    }
                    return (
                      <button
                        key={realIdx}
                        className={`border-2 rounded-lg overflow-hidden focus:outline-none transition-all duration-150 shadow-sm bg-white hover:border-blue-400 ${currentImageIndex === realIdx ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-200'}`}
                        style={{ width: 64, height: 64 }}
                        onClick={() => {
                          setCurrentImageIndex(realIdx);
                          setZoomImageSrc(img);
                          setZoomModalOpen(true);
                        }}
                        aria-label={`Ver imagen ${realIdx + 1}`}
                      >
                        <img src={img} alt={`Miniatura ${realIdx + 1}`} className="object-cover w-full h-full" />
                      </button>
                    );
                  })}
                </div>
                {/* Imagen principal */}
                <div className="relative w-full flex justify-center items-center rounded-xl bg-slate-100 border border-slate-200 shadow-md" style={{ minHeight: 320, maxHeight: 420, aspectRatio: '4/3' }}>
                  <img
                    src={imagesToShow[currentImageIndex]}
                    alt={`Imagen ${currentImageIndex + 1} de ${property.title}`}
                    className="object-contain rounded-xl max-h-[420px] w-full transition-all duration-200 cursor-zoom-in"
                    onClick={() => {
                      setZoomImageSrc(imagesToShow[currentImageIndex]);
                      setZoomModalOpen(true);
                    }}
                  />
                  {imagesToShow.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 shadow"
                        onClick={prevImage}
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft className="h-7 w-7" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 shadow"
                        onClick={nextImage}
                        aria-label="Imagen siguiente"
                      >
                        <ChevronRight className="h-7 w-7" />
                      </Button>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded shadow">
                        {currentImageIndex + 1} / {imagesToShow.length}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* Cuadro informativo a la derecha */}
              <div className="w-full md:w-[48%] flex flex-col gap-6">
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-8 flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span className="text-base md:text-lg text-slate-700 font-medium">{property.location}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">{property.title}</h1>
                  <p className="text-lg text-blue-600 font-semibold mb-2">
                    {currencySymbol} {displayPrice.toLocaleString('es-AR')} <span className="text-base font-normal text-slate-600">{priceLabel}</span>
                  </p>
                  {property.expense_price > 0 && (
                    <p className="text-sm text-slate-500 mb-2">
                      + ${property.expense_price.toLocaleString('es-AR')} de expensas ({property.currency})
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium"><Ruler className="h-4 w-4 text-blue-600" />{property.approxM2 || property.approx_m2 || 'N/A'} m²</span>
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium"><Home className="h-4 w-4 text-blue-600" />{property.environments} Amb.</span>
                    {property.bathrooms !== undefined && <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium"><Bath className="h-4 w-4 text-blue-600" />{property.bathrooms} Baño{property.bathrooms !== 1 ? 's' : ''}</span>}
                    {property.garages !== undefined && <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium"><Car className="h-4 w-4 text-blue-600" />{property.garages} Cochera{property.garages !== 1 ? 's' : ''}</span>}
                    {property.bedrooms !== undefined && <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium"><BedDouble className="h-4 w-4 text-blue-600" />{property.bedrooms} Dorm.</span>}
                    {property.rentalPeriod !== undefined && <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium"><Calendar className="h-4 w-4 text-blue-600" />{property.rentalPeriod || property.rental_period || 'N/A'} meses</span>}
                  </div>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-base mb-2">{property.description}</p>
                  <div className="flex flex-col gap-2 mt-2">
                    {isOwner ? (
                      <>
                        <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={handleEditProperty}>
                          <Edit className="mr-2 h-5 w-5" /> Editar Propiedad
                        </Button>
                        <Button variant="outline" className="w-full text-slate-700 hover:text-slate-900" onClick={handleManageProperty}>
                          <Settings className="mr-2 h-5 w-5" /> Gestionar Propiedades
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button className="w-full bg-slate-700 hover:bg-slate-600" onClick={handleContactOwner}>
                          <MessageSquare className="mr-2 h-5 w-5" /> Contactar al Propietario
                        </Button>
                        <Button variant="outline" className="w-full text-slate-700 hover:text-slate-900" onClick={() => toast({title: "🚧 Próximamente", description: "Podrás guardar esta propiedad en tus favoritos."})}>
                          Guardar en Favoritos
                        </Button>
                        {checkingReservation ? (
                          <Button className="w-full bg-blue-600" disabled>Cargando...</Button>
                        ) : hasActiveReservation ? (
                          <Button className="w-full bg-blue-300 cursor-not-allowed" disabled>
                            Reserva en proceso
                          </Button>
                        ) : (
                          <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={handleReserve}>
                            <CalendarCheck className="mr-2 h-5 w-5" /> Reservar
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                  <div className="border-t border-slate-200 mt-4 pt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <span>Estado: {property.status}</span>
                    <span>Moneda: {property.currency}</span>
                    <span>Publicado: {new Date(property.created_at).toLocaleDateString('es-AR')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PropertyDetailPage;