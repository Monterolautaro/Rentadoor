import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  User, 
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

const AdminDashboardPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [viewingImages, setViewingImages] = useState(false);
  const [imageData, setImageData] = useState({ selfie: null, dni: null });
  const navigate = useNavigate();
  const { toast } = useToast();

  const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser_rentadoor');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      
      // Verificar si es administrador
      if (user.role !== 'admin') {
        toast({
          title: "Acceso Denegado",
          description: "No tienes permisos para acceder al panel de administrador.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
      
      loadVerifications();
    } else {
      navigate('/');
    }
  }, [navigate, toast]);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/identity-verifications`, {
        withCredentials: true
      });
      setVerifications(response.data);
    } catch (error) {
      console.error('Error loading verifications:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las verificaciones.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verificationId) => {
    try {
      await axios.put(`${API_URL}/admin/identity-verifications/${verificationId}/approve`, {}, {
        withCredentials: true
      });
      
      toast({
        title: "Verificación Aprobada",
        description: "La verificación de identidad ha sido aprobada.",
      });
      
      loadVerifications();
    } catch (error) {
      console.error('Error approving verification:', error);
      toast({
        title: "Error",
        description: "No se pudo aprobar la verificación.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (verificationId, reason) => {
    try {
      await axios.put(`${API_URL}/admin/identity-verifications/${verificationId}/reject`, {
        reason: reason
      }, {
        withCredentials: true
      });
      
      toast({
        title: "Verificación Rechazada",
        description: "La verificación de identidad ha sido rechazada.",
      });
      
      loadVerifications();
    } catch (error) {
      console.error('Error rejecting verification:', error);
      toast({
        title: "Error",
        description: "No se pudo rechazar la verificación.",
        variant: "destructive",
      });
    }
  };

  const handleViewImages = async (verification) => {
    try {
      setViewingImages(true);
      setSelectedVerification(verification);
      
      // Descargar imágenes
      const [selfieResponse, dniResponse] = await Promise.all([
        axios.get(`${API_URL}/storage/download/${verification.selfieFileId}`, {
          withCredentials: true
        }),
        axios.get(`${API_URL}/storage/download/${verification.dniFileId}`, {
          withCredentials: true
        })
      ]);
      
      setImageData({
        selfie: `data:image/jpeg;base64,${selfieResponse.data.base64}`,
        dni: `data:image/jpeg;base64,${dniResponse.data.base64}`
      });
    } catch (error) {
      console.error('Error loading images:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las imágenes.",
        variant: "destructive",
      });
    } finally {
      setViewingImages(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" /> Pendiente</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" /> Aprobada</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="mr-1 h-3 w-3" /> Rechazada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingVerifications = verifications.filter(v => v.status === 'pending');
  const approvedVerifications = verifications.filter(v => v.status === 'approved');
  const rejectedVerifications = verifications.filter(v => v.status === 'rejected');

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Cargando verificaciones...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Panel de Administrador
          </h1>
          <p className="text-lg text-slate-600">Gestiona las verificaciones de identidad de los usuarios.</p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pending">
              <Clock className="mr-2 h-4 w-4" />
              Pendientes ({pendingVerifications.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              <CheckCircle className="mr-2 h-4 w-4" />
              Aprobadas ({approvedVerifications.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <XCircle className="mr-2 h-4 w-4" />
              Rechazadas ({rejectedVerifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Verificaciones Pendientes</CardTitle>
                <CardDescription>Revisa y aprueba las verificaciones de identidad pendientes.</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingVerifications.length > 0 ? (
                  <div className="space-y-4">
                    {pendingVerifications.map((verification) => (
                      <div key={verification.id} className="border rounded-lg p-4 bg-slate-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-slate-600" />
                              <span className="font-semibold">{verification.userName}</span>
                              {getStatusBadge(verification.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <span>ID: {verification.userId}</span>
                              <span>•</span>
                              <span>Enviado: {new Date(verification.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewImages(verification)}
                              disabled={viewingImages}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Ver
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(verification.id)}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Aprobar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleReject(verification.id, 'Documentos no válidos')}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Rechazar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No hay verificaciones pendientes.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Verificaciones Aprobadas</CardTitle>
                <CardDescription>Historial de verificaciones aprobadas.</CardDescription>
              </CardHeader>
              <CardContent>
                {approvedVerifications.length > 0 ? (
                  <div className="space-y-4">
                    {approvedVerifications.map((verification) => (
                      <div key={verification.id} className="border rounded-lg p-4 bg-green-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-slate-600" />
                              <span className="font-semibold">{verification.userName}</span>
                              {getStatusBadge(verification.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <span>ID: {verification.userId}</span>
                              <span>•</span>
                              <span>Aprobado: {new Date(verification.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewImages(verification)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Ver
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No hay verificaciones aprobadas.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Verificaciones Rechazadas</CardTitle>
                <CardDescription>Historial de verificaciones rechazadas.</CardDescription>
              </CardHeader>
              <CardContent>
                {rejectedVerifications.length > 0 ? (
                  <div className="space-y-4">
                    {rejectedVerifications.map((verification) => (
                      <div key={verification.id} className="border rounded-lg p-4 bg-red-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-slate-600" />
                              <span className="font-semibold">{verification.userName}</span>
                              {getStatusBadge(verification.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <span>ID: {verification.userId}</span>
                              <span>•</span>
                              <span>Rechazado: {new Date(verification.updatedAt).toLocaleDateString()}</span>
                            </div>
                            {verification.reason && (
                              <p className="text-sm text-red-600 mt-1">
                                <strong>Motivo:</strong> {verification.reason}
                              </p>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewImages(verification)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Ver
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No hay verificaciones rechazadas.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal para ver imágenes */}
        {selectedVerification && imageData.selfie && imageData.dni && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Verificación de {selectedVerification.userName}</h3>
                <Button variant="outline" onClick={() => setSelectedVerification(null)}>
                  Cerrar
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Selfie</h4>
                  <img 
                    src={imageData.selfie} 
                    alt="Selfie" 
                    className="w-full rounded-lg border"
                  />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">DNI</h4>
                  <img 
                    src={imageData.dni} 
                    alt="DNI" 
                    className="w-full rounded-lg border"
                  />
                </div>
              </div>
              {selectedVerification.status === 'pending' && (
                <div className="flex gap-2 mt-4 justify-end">
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleApprove(selectedVerification.id);
                      setSelectedVerification(null);
                    }}
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Aprobar
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      handleReject(selectedVerification.id, 'Documentos no válidos');
                      setSelectedVerification(null);
                    }}
                  >
                    <XCircle className="mr-1 h-3 w-3" />
                    Rechazar
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboardPage; 