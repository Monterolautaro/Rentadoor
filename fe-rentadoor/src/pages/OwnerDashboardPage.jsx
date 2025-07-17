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

const OwnerDashboardPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedSection, setSelectedSection] = useState('overview');
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
              <DollarSign className="h-5 w-5" />
              Ingresos Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-green-600">
                {/* TODO: Implementar endpoint para ingresos */}
                -
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
                            ${property.monthlyRent}/mes
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

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Actividad Reciente</h2>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Nueva reserva confirmada</span>
                  </div>
                  <span className="text-xs text-slate-500">Hace 2 horas</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Pago recibido</span>
                  </div>
                  <span className="text-xs text-slate-500">Hace 1 día</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Nueva solicitud de reserva</span>
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
                      ${property.price}/noche
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
    <DevelopmentCard
      title="Mis Reservas"
      description="Panel para gestionar las reservas de tus propiedades."
      icon={Calendar}
      estimatedTime="En desarrollo"
      features={[
        "Lista de reservas",
        "Confirmar reservas",
        "Historial de reservas"
      ]}
      showProgress={true}
      progress={20}
    />
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