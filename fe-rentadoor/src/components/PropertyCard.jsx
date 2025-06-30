import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Star, MapPin, Home, Bath, Car, Users, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();

  const handleFavorite = () => {
    toast({
      title: "🚧 Esta función aún no está implementada",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo mensaje 🚀"
    });
  };

  const handleViewDetails = () => {
    navigate(`/propiedad/${property.id}`);
  };

  const displayPrice = property.monthlyRent !== undefined ? property.monthlyRent : property.price;
  const currencySymbol = property.currency === 'USD' ? 'U$S' : 'ARS';
  const priceLabel = "/mes";
  
  const displayRooms = property.environments !== undefined ? `${property.environments} amb.` : `${property.bedrooms || 1} hab.`;
  
  const imageSrc = property.allImages && Array.isArray(property.allImages) && property.allImages.length > 0 
    ? property.allImages[0] 
    : property.image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="h-full flex flex-col"
    >
      <Card className="property-card overflow-hidden cursor-pointer flex-grow flex flex-col" onClick={handleViewDetails}>
        <div className="relative">
          <img 
            src={imageSrc || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"}
            alt={property.title}
            className="w-full h-48 object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-slate-700 hover:text-red-500"
            onClick={(e) => { e.stopPropagation(); handleFavorite(); }}
          >
            <Heart className="h-5 w-5" />
          </Button>
          <div className="absolute bottom-2 left-2 bg-slate-800/90 text-white px-2 py-1 rounded-md text-sm font-semibold">
            {currencySymbol} {displayPrice.toLocaleString('es-AR')} {priceLabel}
          </div>
        </div>
        <CardContent className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-lg truncate text-slate-800" title={property.title}>{property.title}</h3>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-slate-700">{property.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-slate-600 mb-3">
              <MapPin className="h-4 w-4" />
              <span className="text-sm truncate" title={property.location}>{property.location}</span>
            </div>
          
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600 mb-3">
              <div className="flex items-center gap-1.5">
                <Building className="h-4 w-4 text-blue-600"/>
                <span>{property.type || 'Departamento'}</span>
              </div>
               <div className="flex items-center gap-1.5">
                <Home className="h-4 w-4 text-blue-600"/>
                <span>{displayRooms}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-600"/> 
                <span>{property.guests} Huéspedes</span>
              </div>
              {property.bathrooms !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Bath className="h-4 w-4 text-blue-600"/>
                  <span>{property.bathrooms} Baño{property.bathrooms > 1 ? 's' : ''}</span>
                </div>
              )}
              {property.garages !== undefined && (
                 <div className="flex items-center gap-1.5">
                  <Car className="h-4 w-4 text-blue-600"/>
                  <span>{property.garages} Cochera{property.garages > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
             <p className="text-sm text-slate-500 mb-4 line-clamp-2">{property.description}</p>
          </div>
         
          <Button onClick={(e) => { e.stopPropagation(); handleViewDetails(); }} size="sm" className="w-full bg-slate-700 hover:bg-slate-600">
            Ver detalles
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PropertyCard;