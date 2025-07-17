import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Home, Calendar, Heart, User, Settings, Search, MapPin, Star, Clock, CheckCircle, AlertCircle, TrendingUp, FileText, BarChart3 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import DevelopmentCard from '@/components/DevelopmentCard';

const UserDashboardPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedSection, setSelectedSection] = useState('overview');
  const { toast } = useToast();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // TODO: Implementar endpoints reales para favoritos y búsquedas
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Por ahora, datos vacíos hasta implementar endpoints
        setFavorites([]);
        setRecentSearches([]);
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
  }, [user, toast]);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Favoritos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-800">
                {favorites.length}
              </p>
              <p className="text-sm text-slate-600">
                Propiedades guardadas
              </p>
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
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-800">
                {/* TODO: Implementar endpoint para mis reservas */}
                -
              </p>
              <p className="text-sm text-slate-600">
                Reservas activas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              Calificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-800">
                {/* TODO: Implementar endpoint para calificaciones */}
                -
              </p>
              <p className="text-sm text-slate-600">
                Promedio recibido
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Búsquedas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-800">
                {recentSearches.length}
              </p>
              <p className="text-sm text-slate-600">
                Búsquedas recientes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Mis Favoritos</h2>
            <Button variant="outline" onClick={() => setSelectedSection('favorites')}>
              Ver todos
            </Button>
          </div>
          
          {favorites.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    No tienes favoritos aún
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Guarda las propiedades que te gusten para encontrarlas fácilmente.
                  </p>
                  <Button onClick={() => navigate('/')}>
                    <Search className="w-4 h-4 mr-2" />
                    Explorar Propiedades
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {favorites.slice(0, 3).map((favorite) => (
                <Card key={favorite.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 mb-1">
                          {favorite.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          {favorite.location}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-600">
                            ${favorite.price}/noche
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>{favorite.rating}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/propiedad/${favorite.id}`)}
                      >
                        Ver
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Actividad Reciente</h2>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Reserva confirmada</span>
                  </div>
                  <span className="text-xs text-slate-500">Hace 2 horas</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Propiedad agregada a favoritos</span>
                  </div>
                  <span className="text-xs text-slate-500">Hace 1 día</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Búsqueda realizada</span>
                  </div>
                  <span className="text-xs text-slate-500">Hace 2 días</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mis Favoritos</h2>
          <p className="text-slate-600">Propiedades que has guardado</p>
        </div>
        <Button onClick={() => navigate('/')}>
          <Search className="w-4 h-4 mr-2" />
          Explorar Más
        </Button>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No tienes favoritos aún
              </h3>
              <p className="text-slate-600 mb-4">
                Guarda las propiedades que te gusten para encontrarlas fácilmente.
              </p>
              <Button onClick={() => navigate('/')}>
                <Search className="w-4 h-4 mr-2" />
                Explorar Propiedades
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">
                      {favorite.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {favorite.location}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      ${favorite.price}/noche
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm">{favorite.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/propiedad/${favorite.id}`)}
                    >
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Reservar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderReservations = () => (
    <DevelopmentCard
      title="Mis Reservas"
      description="Panel para gestionar tus reservas y viajes."
      icon={Calendar}
      estimatedTime="En desarrollo"
      features={[
        "Lista de reservas",
        "Historial de viajes",
        "Calificaciones"
      ]}
      showProgress={true}
      progress={20}
    />
  );

  const renderSearches = () => (
    <DevelopmentCard
      title="Historial de Búsquedas"
      description="Revisa tus búsquedas recientes."
      icon={Search}
      estimatedTime="En desarrollo"
      features={[
        "Historial de búsquedas",
        "Búsquedas guardadas",
        "Alertas de precio"
      ]}
      showProgress={true}
      progress={15}
    />
  );

  const renderProfile = () => (
    <DevelopmentCard
      title="Mi Perfil"
      description="Gestiona tu información personal."
      icon={User}
      estimatedTime="En desarrollo"
      features={[
        "Información personal",
        "Documentos de identidad",
        "Configuración de privacidad"
      ]}
      showProgress={true}
      progress={25}
    />
  );

  const renderSettings = () => (
    <DevelopmentCard
      title="Configuración"
      description="Configuración de tu cuenta y preferencias."
      icon={Settings}
      estimatedTime="En desarrollo"
      features={[
        "Configuración de cuenta",
        "Preferencias de notificaciones",
        "Configuración de seguridad"
      ]}
      showProgress={true}
      progress={30}
    />
  );

  const renderContent = () => {
    switch (selectedSection) {
      case 'overview':
        return renderOverview();
      case 'favorites':
        return renderFavorites();
      case 'reservations':
        return renderReservations();
      case 'searches':
        return renderSearches();
      case 'profile':
        return renderProfile();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        userRole="tenant"
        onSectionChange={setSelectedSection}
      />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;