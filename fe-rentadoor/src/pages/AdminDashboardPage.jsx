import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Users, FileText, CheckCircle, XCircle, Clock, Eye, Check, X, BarChart3, UserCheck, UserX, Ban, Trash2, AlertTriangle, TrendingUp, DollarSign, Building, Calendar } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import DevelopmentCard from '@/components/DevelopmentCard';
import axios from 'axios';

const AdminDashboardPage = () => {
  const [verifications, setVerifications] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedSection, setSelectedSection] = useState('overview');
  const { toast } = useToast();
  const { user } = useAuthContext();

  const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar verificaciones
        const verificationsResponse = await axios.get(`${API_URL}/storage`, {
          withCredentials: true
        });
        setVerifications(verificationsResponse.data);
        
        // Cargar propiedades
        const propertiesResponse = await axios.get(`${API_URL}/properties/admin/all`, {
          withCredentials: true
        });
        setProperties(propertiesResponse.data);
        
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
  }, [user, API_URL, toast]);

  const handleApprove = async (verificationId) => {
    try {
      const response = await axios.post(`${API_URL}/auth/admin/approve-identity/${verificationId}`, {}, {
        withCredentials: true
      });

      toast({
        title: 'Verificación aprobada',
        description: 'La verificación de identidad ha sido aprobada exitosamente.',
      });

      // Recargar las verificaciones
      const fetchVerifications = async () => {
        try {
          const response = await axios.get(`${API_URL}/storage`, {
            withCredentials: true
          });
          setVerifications(response.data);
        } catch (error) {
          console.error('Error fetching verifications:', error);
        }
      };
      fetchVerifications();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo aprobar la verificación.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (verificationId) => {
    try {
      const response = await axios.post(`${API_URL}/auth/admin/reject-identity/${verificationId}`, {}, {
        withCredentials: true
      });

      toast({
        title: 'Verificación rechazada',
        description: 'La verificación de identidad ha sido rechazada.',
      });

      // Recargar las verificaciones
      const fetchVerifications = async () => {
        try {
          const response = await axios.get(`${API_URL}/storage`, {
            withCredentials: true
          });
          setVerifications(response.data);
        } catch (error) {
          console.error('Error fetching verifications:', error);
        }
      };
      fetchVerifications();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo rechazar la verificación.',
        variant: 'destructive',
      });
    }
  };

  const handleViewImage = async (fileId) => {
    try {
      const response = await axios.get(`${API_URL}/storage/download/${fileId}`, {
        withCredentials: true
      });
      
      setSelectedImage(`data:image/jpeg;base64,${response.data.base64}`);
      setShowImageModal(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar la imagen.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      verified: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      not_verified: { color: 'bg-gray-100 text-gray-800', icon: Clock },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status === 'verified' ? 'Verificada' : 
         status === 'approved' ? 'Aprobada' :
         status === 'rejected' ? 'Rechazada' :
         status === 'pending' ? 'Pendiente' : 'No verificada'}
      </Badge>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Total Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-800">
                {/* TODO: Implementar endpoint para contar usuarios */}
                -
              </p>
              <p className="text-sm text-slate-600">
                Usuarios registrados
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5" />
              Propiedades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-800">
                {properties.length}
              </p>
              <p className="text-sm text-slate-600">
                Propiedades activas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-800">
                {/* TODO: Implementar endpoint para contar reservas */}
                -
              </p>
              <p className="text-sm text-slate-600">
                Reservas totales
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Verificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-800">
                {verifications.filter(v => v.status === 'pending').length}
              </p>
              <p className="text-sm text-slate-600">
                Pendientes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUsers = () => (
    <DevelopmentCard
      title="Gestión de Usuarios"
      description="Panel para administrar usuarios del sistema."
      icon={Users}
      estimatedTime="En desarrollo"
      features={[
        "Lista de usuarios",
        "Suspender usuarios",
        "Banear usuarios",
        "Eliminar usuarios"
      ]}
      showProgress={true}
      progress={25}
    />
  );

  const renderProperties = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Propiedades</h2>
          <p className="text-slate-600">Administra todas las propiedades del sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las Propiedades</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No hay propiedades registradas
              </h3>
              <p className="text-slate-600">
                No se han encontrado propiedades en el sistema.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => (
                <div key={property.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {property.title}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {property.address}
                      </p>
                      <p className="text-xs text-slate-500">
                        Propietario: {property.ownerId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        ${property.monthlyRent}/mes
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderVerifications = () => {
    console.log('Renderizando verificaciones:', { verifications, loading, selectedSection });
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Verificaciones de Identidad</h2>
            <p className="text-slate-600">Gestiona las verificaciones pendientes de los usuarios</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verificaciones Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
              </div>
            ) : !verifications || verifications.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No hay verificaciones pendientes
                </h3>
                <p className="text-slate-600">
                  Todos los usuarios han sido verificados o no hay solicitudes pendientes.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {verifications.map((verification, index) => {
                  console.log('Verificación:', verification);
                  return (
                    <div key={verification.userId || index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          {verification.user ? (
                            <>
                              <h4 className="font-semibold text-slate-800">
                                {verification.user.name}
                              </h4>
                              <p className="text-sm text-slate-600">
                                {verification.user.email}
                              </p>
                              <p className="text-xs text-slate-500">
                                {verification.files?.length || 0} documentos subidos
                              </p>
                            </>
                          ) : (
                            <>
                              <h4 className="font-semibold text-slate-800">
                                Usuario #{verification.userId}
                              </h4>
                              <p className="text-sm text-slate-600">
                                Información no disponible
                              </p>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(verification.status)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {verification.files && verification.files.map((file, fileIndex) => (
                          <Button
                            key={file.id || fileIndex}
                            size="sm"
                            onClick={() => handleViewImage(file.id)}
                            variant="outline"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver {file.file_name?.startsWith('selfie_') ? 'Selfie' : 'DNI'}
                          </Button>
                        ))}
                        
                        {verification.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(verification.userId)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleReject(verification.userId)}
                              variant="destructive"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Rechazar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    console.log('Renderizando contenido para sección:', selectedSection);
    
    switch (selectedSection) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'properties':
        return renderProperties();
      case 'verifications':
        return renderVerifications();
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
        userRole="admin"
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

      {/* Modal para ver imágenes */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Documento de Identidad</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <img 
              src={selectedImage} 
              alt="Documento de identidad" 
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage; 