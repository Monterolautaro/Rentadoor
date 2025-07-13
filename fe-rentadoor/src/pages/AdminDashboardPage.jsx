import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Users, FileText, CheckCircle, XCircle, Clock, Eye, Check, X } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import axios from 'axios';

const AdminDashboardPage = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { toast } = useToast();
  const { user } = useAuthContext();

  const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        const response = await axios.get(`${API_URL}/storage`, {
          withCredentials: true
        });
        setVerifications(response.data);
      } catch (error) {
        console.error('Error fetching verifications:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las verificaciones.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchVerifications();
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
            Panel de Administrador
          </h1>
          <p className="text-slate-600">
            Gestiona las verificaciones de identidad de los usuarios
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Verificaciones Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-blue-600">
                  {verifications.filter(v => v.status === 'pending').length}
                </p>
                <p className="text-sm text-slate-600">
                  Usuarios esperando verificación
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Archivos Subidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-slate-800">
                  {verifications.reduce((total, v) => total + v.files.length, 0)}
                </p>
                <p className="text-sm text-slate-600">
                  Documentos en el sistema
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-green-600">
                  Activo
                </p>
                <p className="text-sm text-slate-600">
                  Sistema funcionando
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verificaciones de Identidad</CardTitle>
            <CardDescription>
              Revisa y aprueba las verificaciones de identidad de los usuarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            {verifications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No hay verificaciones pendientes
                </h3>
                <p className="text-slate-600">
                  Los usuarios aparecerán aquí cuando suban sus documentos de identidad
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {verifications.map((verification) => (
                  <Card key={verification.userId} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {verification.user?.name || `Usuario ID: ${verification.userId}`}
                          </CardTitle>
                          <CardDescription>
                            {verification.user?.email && (
                              <div className="text-sm text-slate-600 mb-1">
                                {verification.user.email}
                              </div>
                            )}
                            {verification.files.length} documento{verification.files.length !== 1 ? 's' : ''} subido{verification.files.length !== 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                        {getStatusBadge(verification.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {verification.files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-slate-400" />
                                <div>
                                  <p className="text-sm font-medium">{file.file_name}</p>
                                  <p className="text-xs text-slate-500">
                                    {new Date(file.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewImage(file.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        {verification.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApprove(verification.userId)}
                              className="bg-green-600 hover:bg-green-500"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Aprobar
                            </Button>
                            <Button
                              onClick={() => handleReject(verification.userId)}
                              variant="destructive"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Rechazar
                            </Button>
                          </div>
                        )}
                        {verification.status === 'verified' && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Verificación aprobada</span>
                          </div>
                        )}
                        {verification.status === 'rejected' && (
                          <div className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm">Verificación rechazada</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal para ver imágenes */}
        {showImageModal && selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 max-w-2xl max-h-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Vista previa del documento</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowImageModal(false);
                    setSelectedImage(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <img
                src={selectedImage}
                alt="Documento"
                className="max-w-full max-h-96 object-contain"
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboardPage; 