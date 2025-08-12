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
import { formatCurrency } from '@/utils/formatCurrency';
import { useReservations } from '@/hooks/useReservations';
import { useProperties } from '@/hooks/useProperties';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { propertiesService } from '@/services/propertiesService';
import ReservationDetailsModal from '@/components/ReservationDetailsModal';

const UserDashboardPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedSection, setSelectedSection] = useState('overview');
  const { toast } = useToast();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { reservations, loading: loadingReservations, fetchByUser } = useReservations();
  const { properties, getPropertyById, addProperties } = useProperties();
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [owners, setOwners] = useState({});
  const [propertyTitles, setPropertyTitles] = useState({});
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerError, setOwnerError] = useState(null);
  const [contractStatus, setContractStatus] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // TODO: Implementar endpoints reales para favoritos y búsquedas
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Por ahora, datos vacíos hasta implementar endpoints
        setFavorites([]);
        setRecentSearches([]);
    
        if (user) await fetchByUser(user.id);
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
  }, [user, toast, fetchByUser]);

  // Obtener datos de propietarios para las reservas
  useEffect(() => {
    const fetchOwners = async () => {
      const newOwners = {};
      for (const reservation of reservations) {
        if (reservation.property_id && !newOwners[reservation.property_id]) {
          try {
            const property = await getPropertyById(reservation.property_id);
            newOwners[reservation.property_id] = {
              ownerName: property.owner_name || property.ownerNombre || property.owner || '-',
              ownerEmail: property.owner_email || property.ownerEmail || '-',
              ownerPhone: property.owner_phone || property.ownerPhone || '-',
              property,
              ownerId: property.owner_id,
            };
          } catch {
            newOwners[reservation.property_id] = { ownerName: '-', ownerEmail: '-', ownerPhone: '-', property: null, ownerId: null };
          }
        }
      }
      setOwners(newOwners);
    };
    if (reservations.length > 0) fetchOwners();
  }, [reservations, getPropertyById]);

  useEffect(() => {
    // Obtener títulos de propiedades para las reservas
    const fetchTitles = async () => {
      const titles = {};
      for (const reservation of reservations) {
        if (reservation.property_id && !titles[reservation.property_id]) {
          try {
            const property = await getPropertyById(reservation.property_id);
            titles[reservation.property_id] = property?.title || '-';
          } catch {
            titles[reservation.property_id] = '-';
          }
        }
      }
      setPropertyTitles(titles);
    };
    if (reservations.length > 0) fetchTitles();
  }, [reservations, getPropertyById]);

  useEffect(() => {
    const fetchContracts = async () => {
      const statuses = {};
      for (const reservation of reservations) {
        try {
          
          const res = await fetch(`${import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000'}/reservations/${reservation.id}`, { credentials: 'include' });
          const data = await res.json();
          statuses[reservation.id] = data && data.contract_status ? data.contract_status : null;
        } catch {
          statuses[reservation.id] = null;
        }
      }
      setContractStatus(statuses);
    };
    if (reservations.length > 0) fetchContracts();
  }, [reservations]);

  // Sincronizar properties con las propiedades de las reservas
  useEffect(() => {
    const syncPropertiesWithReservations = async () => {
      if (!reservations || reservations.length === 0) return;
      const propertyIdsNeeded = reservations.map(r => r.property_id);
      const missingIds = propertyIdsNeeded.filter(
        id => !properties.some(p => p.id === id)
      );
      if (missingIds.length === 0) return;
      try {
        const fetchedProperties = await Promise.all(
          missingIds.map(id => getPropertyById(id))
        );
        addProperties(fetchedProperties.filter(Boolean));
      } catch (err) {
        // Opcional: mostrar error
      }
    };
    syncPropertiesWithReservations();
  }, [reservations, properties, getPropertyById, addProperties]);

  const handleShowProperty = (propertyId) => {
    navigate(`/propiedad/${propertyId}`);
  };

  const handleShowOwner = async (propertyId) => {
    if (owners[propertyId]) {
      setOwnerLoading(true);
      setOwnerError(null);
      setShowOwnerModal(true);
      try {
        const ownerId = owners[propertyId].ownerId;
        if (ownerId) {
          const user = await propertiesService.getUserById(ownerId);
          setSelectedOwner({
            ownerName: user.nombre || '-',
            ownerEmail: user.email || '-',
            ownerPhone: user.telefono || '-',
          });
        } else {
          setSelectedOwner({ ownerName: '-', ownerEmail: '-', ownerPhone: '-' });
        }
      } catch (err) {
        setOwnerError('No se pudo cargar el propietario.');
        setSelectedOwner({ ownerName: '-', ownerEmail: '-', ownerPhone: '-' });
      } finally {
        setOwnerLoading(false);
      }
    }
  };

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
                {loadingReservations ? '-' : reservations.length}
              </p>
              <p className="text-sm text-slate-600">
                Reservas activas
              </p>
            </div>
          </CardContent>
        </Card>
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
                    <span className="text-lg font-bold text-green-600">{formatCurrency(favorite.monthlyRent || favorite.monthly_rent, favorite.currency)} /mes</span>
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

  const getReservationStatusBadge = (status) => {
    let badge = { color: '', label: '' };
    if (status === 'aprobada') {
      badge = { color: 'bg-green-100 text-green-800', label: 'Aprobada' };
    } else if (status === 'rechazada_admin' || status === 'rechazada_owner') {
      badge = { color: 'bg-red-100 text-red-800', label: 'Rechazada' };
    } else if (status === 'pendiente' || status === 'preaprobada_admin') {
      badge = { color: 'bg-blue-100 text-blue-800', label: 'Pendiente' };
    } else {
      badge = { color: 'bg-gray-100 text-gray-800', label: status };
    }
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  const renderReservations = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Mis Reservas</h2>
      {loadingReservations ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-8 text-slate-600">No tienes reservas registradas.</div>
      ) : (
        <div className="space-y-6">
          {reservations.map((reservation) => {
            const property = properties?.find(p => p.id === reservation.property_id);
            return (
              <Card key={reservation.id} className="p-0 overflow-hidden shadow-md border border-slate-200 mb-6 rounded-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-50 px-6 py-4 border-b">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <span className="font-semibold text-lg text-slate-800">{propertyTitles[reservation.property_id] || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    {getReservationStatusBadge(reservation.status)}
                    <ReservationDetailsModal reservation={reservation} property={property} />
                  </div>
                </div>
                <CardContent className="py-6 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 items-center">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Período de Contrato</div>
                    <div className="font-medium text-slate-700">{property && property.rental_period ? `${property.rental_period} meses` : 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Propietario</div>
                    <Button size="xs" variant="outline" onClick={() => handleShowOwner(reservation.property_id)}>
                      Ver Propietario
                    </Button>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Ingresos declarados</div>
                    <div className="font-medium text-slate-700">${reservation.monthly_income?.toLocaleString('es-AR') || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Propiedad</div>
                    <Button size="xs" variant="outline" onClick={() => handleShowProperty(reservation.property_id)}>
                      Ver detalles
                    </Button>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Pagos</div>
                    {
                    !(reservation.status === 'rechazada_admin' || reservation.status === 'rechazada_owner') && (
                      <Button
                      disabled={reservation.status !== 'aprobada'}
                      size="xs" variant="outline" onClick={() => navigate(`/pagos/${reservation.id}`)}>
                        Ver pagos
                      </Button>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Contrato</div>
                    {!(reservation.status === 'rechazada_admin' || reservation.status === 'rechazada_owner') ? (
                      contractStatus[reservation.id] === 'enviado' ? (
                        <Button size="xs" variant="outline" onClick={() => navigate(`/contrato/${reservation.id}`)}>
                          <FileText className="mr-2 h-4 w-4" /> Ver contrato
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-sm">Contrato en preparación</span>
                      )
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
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
      <Dialog open={showOwnerModal && !!selectedOwner} onOpenChange={setShowOwnerModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de Propietario</DialogTitle>
          </DialogHeader>
          {ownerLoading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-800"></div>
            </div>
          ) : ownerError ? (
            <div className="text-red-600">{ownerError}</div>
          ) : selectedOwner ? (
            <div className="space-y-2">
              <div><b>Nombre:</b> {selectedOwner.ownerName}</div>
              <div><b>Email:</b> {selectedOwner.ownerEmail}</div>
              <div><b>Teléfono:</b> {selectedOwner.ownerPhone}</div>
            </div>
          ) : <div>No se encontró el propietario.</div>}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboardPage;