import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Building, Plus, Calendar, DollarSign, Users, Home, CheckCircle, Clock, AlertCircle, Eye, TrendingUp, Settings, FileText, BarChart3 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import Sidebar from '@/components/Sidebar';
import DevelopmentCard from '@/components/DevelopmentCard';
import { formatCurrency } from '@/utils/formatCurrency';
import { useReservations } from '@/hooks/useReservations';
import ReservationDetailsModal from '@/components/ReservationDetailsModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X} from 'lucide-react';

const OwnerDashboardPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedSection, setSelectedSection] = useState('overview');
  const { toast } = useToast();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { properties, loadMyProperties, loading: propertiesLoading } = useProperties();
  const { reservations: allReservations, loading: loadingReservations, fetchAll, approveAsOwner, fetchByOwner } = useReservations();
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingReservationId, setRejectingReservationId] = useState(null);
  const [contractStatus, setContractStatus] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar propiedades del usuario
        await loadMyProperties();
        
        if (user) {
          // Obtener reservas del owner
          const data = await fetchByOwner(user.id);
          setReservations(data);
        }
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
  }, [user, loadMyProperties, toast, fetchByOwner]);

  useEffect(() => {
    const fetchContracts = async () => {
      const statuses = {};
      for (const reservation of reservations) {
        try {
          // Llama al endpoint real de reserva para obtener contract_status
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

  const handleAddProperty = () => {
    navigate('/dashboard/propietario/agregar');
  };

  const handleViewProperty = (propertyId) => {
    navigate(`/propiedad/${propertyId}`);
  };

  const handleShowTenant = (reservation) => {
    setSelectedTenant({
      id: reservation.user_id,
      nombre: reservation.main_applicant_name,
      email: reservation.main_applicant_email,
      telefono: reservation.main_applicant_phone,
    });
    setShowTenantModal(true);
  };

  const handleRejectReservation = (reservationId) => {
    setRejectingReservationId(reservationId);
    setShowRejectModal(true);
  };

  const confirmRejectReservation = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000'}/reservations/${rejectingReservationId}/owner-reject`, {
        method: 'PATCH',
        credentials: 'include',
      });
      toast({ title: 'Reserva rechazada', description: 'La reserva ha sido rechazada.' });
      setShowRejectModal(false);
      setRejectingReservationId(null);
      setReservations(prev => prev.map(r =>
        r.id === rejectingReservationId ? { ...r, status: 'rechazada_owner' } : r
      ));
      if (user) await fetchByOwner(user.id);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo rechazar la reserva.', variant: 'destructive' });
    }
  };

  const handleApproveReservation = async (reservationId) => {
    try {
      await approveAsOwner(reservationId);
      toast({ title: 'Reserva aprobada', description: 'La reserva ha sido aprobada.' });
      setReservations(prev => prev.map(r =>
        r.id === reservationId ? { ...r, status: 'aprobada' } : r
      ));
      if (user) await fetchByOwner(user.id);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo aprobar la reserva.', variant: 'destructive' });
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                {/* TODO: Implementar endpoint para reservas */}
                -
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
              <Users className="h-5 w-5" />
              Inquilinos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-800">
                {/* TODO: Implementar endpoint para inquilinos */}
                -
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
                    Comienza agregando tu primera propiedad para empezar a generar ingresos.
                  </p>
                  <Button onClick={handleAddProperty}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primera Propiedad
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {properties.slice(0, 3).map((property) => (
                <Card key={property.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 mb-1">
                          {property.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          {property.address}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-600">
                            {formatCurrency(property.monthlyRent || property.monthly_rent, property.currency)} /mes
                          </span>
                          {getStatusBadge(property.status || 'Disponible')}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProperty(property.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {properties.length > 3 && (
                <div className="text-center">
                  <Button variant="outline" onClick={() => setSelectedSection('properties')}>
                    Ver todas las propiedades ({properties.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProperties = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mis Propiedades</h2>
          <p className="text-slate-600">Gestiona todas tus propiedades</p>
        </div>
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
                Comienza agregando tu primera propiedad para empezar a generar ingresos.
              </p>
              <Button onClick={handleAddProperty}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primera Propiedad
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">
                      {property.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {property.address}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(property.monthlyRent || property.monthly_rent, property.currency)} /mes
                    </span>
                    {getStatusBadge(property.status || 'Disponible')}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewProperty(property.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/dashboard/propietario/editar/${property.id}`)}
                    >
                      Editar
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Reservas de mis propiedades</h2>
      {loadingReservations ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-8 text-slate-600">No hay reservas registradas.</div>
      ) : (
        <div className="space-y-6">
          {reservations
            .filter(r => r.owner_id === user?.id)
            .map((reservation) => (
              <Card key={reservation.id} className="p-0 overflow-hidden shadow-md border border-slate-200 mb-6 rounded-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-50 px-6 py-4 border-b">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <span className="font-semibold text-lg text-slate-800">{reservation.owner_property_title || properties?.find(p => p.id === reservation.property_id)?.title || reservation.property_id}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    {getReservationStatusBadge(reservation.status)}
                    <ReservationDetailsModal reservation={reservation} property={properties?.find(p => p.id === reservation.property_id)} />
                  </div>
                </div>
                <CardContent className="py-6 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Período de Contrato</div>
                    <div className="font-medium text-slate-700">{(properties?.find(p => p.id === reservation.property_id)?.rental_period || properties?.find(p => p.id === reservation.property_id)?.rentalPeriod || 'N/A')} meses</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Inquilino</div>
                    <div className="font-medium text-slate-700">{reservation.main_applicant_name || reservation.user_id}</div>
                    <Button size="xs" variant="outline" className="mt-2" onClick={() => handleShowTenant(reservation)}>
                      Ver Inquilino
                    </Button>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Ingresos declarados</div>
                    <div className="font-medium text-slate-700">${reservation.monthly_income?.toLocaleString('es-AR') || '-'}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Contrato</div>
                      {(contractStatus[reservation.id] === 'enviado') ? (
                        <Button size="xs" variant="outline" onClick={() => navigate(`/contrato/${reservation.id}`)}>
                          <FileText className="mr-2 h-4 w-4" /> Ver contrato
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-sm">Contrato en preparación</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
      {/* Modal de inquilino */}
      <Dialog open={showTenantModal && !!selectedTenant} onOpenChange={setShowTenantModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de Inquilino</DialogTitle>
          </DialogHeader>
          {selectedTenant ? (
            <div className="space-y-2">
              {/* <div><b>ID:</b> {selectedTenant.id}</div> */}
              <div><b>Nombre:</b> {selectedTenant.nombre}</div>
              <div><b>Email:</b> {selectedTenant.email}</div>
              <div><b>Teléfono:</b> {selectedTenant.telefono}</div>
            </div>
          ) : <div>No se encontró el usuario.</div>}
        </DialogContent>
      </Dialog>
      {/* Modal de rechazo */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Reserva</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>¿Estás seguro que deseas rechazar esta reserva? El usuario será notificado.</div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmRejectReservation}>Rechazar Reserva</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderIncome = () => (
    <DevelopmentCard
      title="Análisis de Ingresos"
      description="Herramientas para analizar tus ingresos."
      icon={DollarSign}
      estimatedTime="En desarrollo"
      features={[
        "Dashboard de ingresos",
        "Reportes mensuales",
        "Exportación de datos"
      ]}
      showProgress={true}
      progress={15}
    />
  );

  const renderTenants = () => (
    <DevelopmentCard
      title="Gestión de Inquilinos"
      description="Panel para gestionar la relación con tus inquilinos."
      icon={Users}
      estimatedTime="En desarrollo"
      features={[
        "Lista de inquilinos",
        "Sistema de mensajería",
        "Calificaciones"
      ]}
      showProgress={true}
      progress={10}
    />
  );

  const renderSettings = () => (
    <DevelopmentCard
      title="Configuración de Cuenta"
      description="Configuración de tu cuenta y preferencias."
      icon={Settings}
      estimatedTime="En desarrollo"
      features={[
        "Configuración de perfil",
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
      case 'properties':
        return renderProperties();
      case 'reservations':
        return renderReservations();
      case 'income':
        return renderIncome();
      case 'tenants':
        return renderTenants();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  if (loading || propertiesLoading) {
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
        userRole="owner"
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

export default OwnerDashboardPage;