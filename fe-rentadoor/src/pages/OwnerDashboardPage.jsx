import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Building, Plus, Calendar, DollarSign, Users, Home, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';

const OwnerDashboardPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { properties, loadMyProperties, loading: propertiesLoading } = useProperties();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar propiedades del usuario
        await loadMyProperties();
        
        // Por ahora, como no existe el endpoint de reservas, usamos datos locales
        await new Promise(resolve => setTimeout(resolve, 1000));
        setReservations([]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, loadMyProperties, toast]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      inactive: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      'Disponible': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Ocupado': { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      'Mantenimiento': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleAddProperty = () => {
    navigate('/dashboard/propietario/agregar');
  };

  const handleViewProperty = (propertyId) => {
    navigate(`/propiedad/${propertyId}`);
  };

  if (loading || propertiesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Panel de Propietario
          </h1>
          <p className="text-slate-600">
            Gestiona tus propiedades y reservas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                Mis Propiedades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-slate-800">
                  {properties.length}
                </p>
                <p className="text-sm text-slate-600">
                  Propiedades registradas
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Reservas Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-slate-800">
                  {reservations.filter(r => r.status === 'confirmed').length}
                </p>
                <p className="text-sm text-slate-600">
                  Reservas confirmadas
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Ingresos Mensuales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-green-600">
                  ${reservations
                    .filter(r => r.status === 'confirmed')
                    .reduce((sum, r) => sum + (r.totalPrice || 0), 0)
                    .toLocaleString()}
                </p>
                <p className="text-sm text-slate-600">
                  Este mes
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Inquilinos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-slate-800">
                  {new Set(reservations
                    .filter(r => r.status === 'confirmed')
                    .map(r => r.userId)).size}
                </p>
                <p className="text-sm text-slate-600">
                  Inquilinos activos
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Mis Propiedades</h2>
              <Button onClick={handleAddProperty}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Propiedad
              </Button>
            </div>
            
            {properties.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      No tienes propiedades aún
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Comienza agregando tu primera propiedad
                    </p>
                    <Button onClick={handleAddProperty}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Propiedad
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {properties.map((property) => (
                  <Card key={property.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{property.title}</CardTitle>
                          <CardDescription>
                            <div className="flex items-center gap-2 text-sm mt-1">
                              <Home className="h-4 w-4" />
                              {property.location}
                            </div>
                          </CardDescription>
                        </div>
                        {getStatusBadge(property.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Precio:</span>
                            <span className="font-semibold text-green-600">
                              ${property.monthly_rent || property.monthlyRent}/mes
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Tipo:</span>
                            <span>{property.type || 'Departamento'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Ambientes:</span>
                            <span>{property.environments || property.bedrooms || 1}</span>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewProperty(property.id)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Ver detalles
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Reservas Recientes</h2>
            
            {reservations.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      No hay reservas aún
                    </h3>
                    <p className="text-slate-600">
                      Las reservas aparecerán aquí cuando los usuarios reserven tus propiedades
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <Card key={reservation.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{reservation.propertyTitle}</CardTitle>
                          <CardDescription>
                            <div className="flex items-center gap-2 text-sm mt-1">
                              <Users className="h-4 w-4" />
                              {reservation.userName}
                            </div>
                          </CardDescription>
                        </div>
                        {getStatusBadge(reservation.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Fecha:</span>
                          <span>{reservation.date}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Total:</span>
                          <span className="font-semibold text-green-600">
                            ${reservation.totalPrice}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OwnerDashboardPage;