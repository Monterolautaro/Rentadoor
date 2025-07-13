import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, MapPin, DollarSign, Clock, User, Shield, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

const UserDashboardPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Por ahora, como no existe el endpoint de reservas, usamos datos locales
    const fetchReservations = async () => {
      try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        setReservations([]);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las reservas.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReservations();
    }
  }, [user, toast]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
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

  const handleVerifyIdentity = () => {
    navigate('/dashboard/verificar-identidad');
  };

  const handleVerifyEmail = () => {
    navigate('/verify-email');
  };

  const handleExploreProperties = () => {
    navigate('/');
  };

  if (loading) {
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
            Panel de Inquilino
          </h1>
          <p className="text-slate-600">
            Gestiona tus reservas y verifica tu identidad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Mi Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Nombre:</span> {user?.name}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Email:</span> {user?.email}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Estado:</span> 
                  {user?.isEmailVerified ? (
                    <Badge className="ml-2 bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  ) : (
                    <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pendiente
                    </Badge>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verificación de Identidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Estado:</span>
                  {user.identityVerificationStatus === 'verified' ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verificada
                    </Badge>
                  ) : user.identityVerificationStatus === 'pending' ? (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      En proceso
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      No verificada
                    </Badge>
                  )}
                </div>
                {user.identityVerificationStatus !== 'verified' && (
                  <Button className="w-full" variant="outline" onClick={handleVerifyIdentity}>
                    <FileText className="w-4 h-4 mr-2" />
                    {user.identityVerificationStatus === 'pending' ? 'Ver estado' : 'Verificar Identidad'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Mis Reservas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Tienes {reservations.length} reserva{reservations.length !== 1 ? 's' : ''} activa{reservations.length !== 1 ? 's' : ''}.
                </p>
                <Button className="w-full" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver Todas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Reservas Recientes</h2>
          
          {reservations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    No tienes reservas aún
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Explora propiedades y haz tu primera reserva
                  </p>
                  <Button onClick={handleExploreProperties}>
                    Explorar Propiedades
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reservations.map((reservation) => (
                <Card key={reservation.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{reservation.property.title}</CardTitle>
                      {getStatusBadge(reservation.status)}
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4" />
                        {reservation.property.location}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Check-in:</span>
                        <span>{new Date(reservation.checkIn).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Check-out:</span>
                        <span>{new Date(reservation.checkOut).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total:</span>
                        <span className="text-green-600">
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
      </motion.div>
    </div>
  );
};

export default UserDashboardPage;