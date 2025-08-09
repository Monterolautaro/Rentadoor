import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Users, FileText, CheckCircle, XCircle, Clock, Eye, Check, X, Building, Calendar, UserCheck, Trash2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import DevelopmentCard from '@/components/DevelopmentCard';
import ImageZoomModal from '@/components/ImageZoomModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/utils/formatCurrency';
import { useReservations } from '@/hooks/useReservations';
import ReservationDetailsModal from '@/components/ReservationDetailsModal';
import { useRef } from 'react';

const AdminDashboardPage = () => {
  const [verifications, setVerifications] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState('overview');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const { reservations, loading: reservationsLoading, fetchAll, approveAsAdmin } = useReservations();
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [rejectingReservationId, setRejectingReservationId] = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [uploadingContract, setUploadingContract] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const fileInputRef = useRef();

  const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const verificationsResponse = await axios.get(`${API_URL}/storage`, { withCredentials: true });
        setVerifications(verificationsResponse.data);
        const propertiesResponse = await axios.get(`${API_URL}/properties/admin/all`, { withCredentials: true });
        setProperties(propertiesResponse.data);
      
        const usersResponse = await axios.get(`${API_URL}/user`, { withCredentials: true });
        setUsers(usersResponse.data);
        await fetchAll();
      } catch (error) {
        toast({ title: 'Error', description: 'No se pudieron cargar los datos.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user, API_URL, toast, fetchAll]);

  const handleApprove = async (verificationId) => {
    try {
      await axios.post(`${API_URL}/auth/admin/approve-identity/${verificationId}`, {}, { withCredentials: true });
      toast({ title: 'Verificación aprobada', description: 'La verificación de identidad ha sido aprobada exitosamente.' });
      const response = await axios.get(`${API_URL}/storage`, { withCredentials: true });
      setVerifications(response.data);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo aprobar la verificación.', variant: 'destructive' });
    }
  };

  const handleReject = async (verificationId) => {
    try {
      await axios.post(`${API_URL}/auth/admin/reject-identity/${verificationId}`, {}, { withCredentials: true });
      toast({ title: 'Verificación rechazada', description: 'La verificación de identidad ha sido rechazada.' });
      const response = await axios.get(`${API_URL}/storage`, { withCredentials: true });
      setVerifications(response.data);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo rechazar la verificación.', variant: 'destructive' });
    }
  };

  const handleViewImage = async (fileId) => {
    try {
      const response = await axios.get(`${API_URL}/storage/download/${fileId}`, { withCredentials: true });
      setSelectedImage(`data:image/jpeg;base64,${response.data.base64}`);
      setShowImageModal(true);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cargar la imagen.', variant: 'destructive' });
    }
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const handleSuspendUser = async (userId, suspend) => {
    try {
      await axios.patch(`${API_URL}/user/${userId}/suspend`, { suspend }, { withCredentials: true });
      toast({ title: suspend ? 'Usuario suspendido' : 'Usuario reactivado', description: 'El estado del usuario ha sido actualizado.' });
      // Actualizar usuarios en frontend sin recargar
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isSuspended: suspend } : u));
    } catch (error) {
      // Si el usuario ya está en ese estado, no mostrar error
      if (error.response && error.response.status === 400) {
        toast({ title: 'Estado ya actualizado', description: 'El usuario ya tenía ese estado.' });
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isSuspended: suspend } : u));
      } else {
        toast({ title: 'Error', description: 'No se pudo actualizar el estado del usuario.', variant: 'destructive' });
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${API_URL}/user/${userId}`, { withCredentials: true });
      toast({ title: 'Usuario eliminado', description: 'El usuario ha sido eliminado.' });
      // Actualizar usuarios en frontend sin recargar
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      // Si el usuario ya está eliminado, no mostrar error
      if (error.response && error.response.status === 400) {
        toast({ title: 'Usuario ya eliminado', description: 'El usuario ya estaba eliminado.' });
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        toast({ title: 'Error', description: 'No se pudo eliminar el usuario.', variant: 'destructive' });
      }
    }
  };

  const handleShowUserInfo = async (user) => {
    let propertiesCount = 0;
    let reservationsCount = 0;
    try {
      const propsRes = await axios.get(`${API_URL}/properties/owner/${user.id}`, { withCredentials: true });
      propertiesCount = Array.isArray(propsRes.data) ? propsRes.data.length : 0;
    } catch {}
    // Reservas mockeadas
    reservationsCount = 0;
    setSelectedUser({ ...user, propertiesCount, reservationsCount });
    setShowUserModal(true);
  };

  const handleRejectReservation = (reservationId) => {
    setRejectingReservationId(reservationId);
    setRejectNote('');
    setShowRejectModal(true);
  };

  const confirmRejectReservation = async () => {
    try {
      
      await axios.post(`${API_URL}/admin/reject-reservation/${rejectingReservationId}`, { note: rejectNote }, { withCredentials: true });
      toast({ title: 'Reserva rechazada', description: 'La reserva ha sido rechazada y el usuario notificado.' });
      setShowRejectModal(false);
      setRejectingReservationId(null);
      setRejectNote('');
      await fetchAll();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo rechazar la reserva.', variant: 'destructive' });
    }
  };

  const handleOpenContractModal = (reservationId) => {
    setSelectedReservationId(reservationId);
    setShowContractModal(true);
  };

  const handleContractUpload = async (file) => {
    if (!file || !selectedReservationId) return;
    setUploadingContract(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('reservationId', selectedReservationId);
      await axios.post(`${API_URL}/contracts/upload`, formData, { withCredentials: true });
      toast({ title: 'Contrato enviado', description: 'El contrato fue subido correctamente.' });
      setShowContractModal(false);
      setSelectedReservationId(null);
      await fetchAll();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo subir el contrato.', variant: 'destructive' });
    } finally {
      setUploadingContract(false);
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
        {status === 'verified' ? 'Verificada' : status === 'approved' ? 'Aprobada' : status === 'rejected' ? 'Rechazada' : status === 'pending' ? 'Pendiente' : 'No verificada'}
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

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" />Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-800">{users.length}</p>
              <p className="text-sm text-slate-600">Usuarios registrados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><Building className="h-5 w-5" />Propiedades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-800">{properties.length}</p>
              <p className="text-sm text-slate-600">Propiedades activas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><Calendar className="h-5 w-5" />Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-800">{reservations.length}</p>
              <p className="text-sm text-slate-600">Reservas totales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><UserCheck className="h-5 w-5" />Verificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-800">{verifications.filter(v => v.status === 'pending').length}</p>
              <p className="text-sm text-slate-600">Pendientes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h2>
          <p className="text-slate-600">Administra todos los usuarios del sistema</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No hay usuarios registrados</h3>
              <p className="text-slate-600">No se han encontrado usuarios en el sistema.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rol</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-slate-800 font-medium">{user.nombre || user.name || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-slate-700">{user.email}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-slate-700 capitalize">{user.rol || user.role || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap align-middle">
                        <div style={{ minWidth: 110, display: 'flex', justifyContent: 'center' }}>
                          {user.isSuspended ? (
                            <Badge className="bg-yellow-100 text-yellow-800 px-4 py-1 text-center">Suspendido</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 px-4 py-1 text-center">Activo</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className={`border-yellow-300 hover:bg-yellow-50 ${user.isSuspended ? 'text-green-600' : 'text-yellow-600'}`}
                          style={{ minWidth: 110, justifyContent: 'center' }}
                          onClick={() => handleSuspendUser(user.id, !user.isSuspended)}
                        >
                          {user.isSuspended ? 'Reactivar' : 'Suspender'}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>Eliminar</Button>
                        <Button size="sm" variant="outline" onClick={() => handleShowUserInfo(user)}>Más info.</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
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
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No hay propiedades registradas</h3>
              <p className="text-slate-600">No se han encontrado propiedades en el sistema.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => (
                <div key={property.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-800">{property.title}</h4>
                      <p className="text-sm text-slate-600">{property.address}</p>
                      <p className="text-xs text-slate-500">Propietario: {property.ownerId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{formatCurrency(property.monthlyRent, property.currency)} /mes</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/propiedad/${property.id}`)}><Eye className="w-4 h-4 mr-2" />Ver Detalles</Button>
                    <Button size="sm" variant="destructive"><Trash2 className="w-4 h-4 mr-2" />Eliminar</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderVerifications = () => (
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
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No hay verificaciones pendientes</h3>
              <p className="text-slate-600">Todos los usuarios han sido verificados o no hay solicitudes pendientes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {verifications.map((verification, index) => (
                <div key={verification.userId || index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      {verification.user ? (
                        <>
                          <h4 className="font-semibold text-slate-800">{verification.user.name}</h4>
                          <p className="text-sm text-slate-600">{verification.user.email}</p>
                          <p className="text-xs text-slate-500">{verification.files?.length || 0} documentos subidos</p>
                        </>
                      ) : (
                        <>
                          <h4 className="font-semibold text-slate-800">Usuario #{verification.userId}</h4>
                          <p className="text-sm text-slate-600">Información no disponible</p>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">{getStatusBadge(verification.status)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {verification.files && verification.files.map((file, fileIndex) => (
                      <Button key={file.id || fileIndex} size="sm" onClick={() => handleViewImage(file.id)} variant="outline">
                        <Eye className="w-4 h-4 mr-2" />Ver {file.file_name?.startsWith('selfie_') ? 'Selfie' : 'DNI'}
                      </Button>
                    ))}
                    {verification.status === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => handleApprove(verification.userId)} className="bg-green-600 hover:bg-green-700"><Check className="w-4 h-4 mr-2" />Aprobar</Button>
                        <Button size="sm" onClick={() => handleReject(verification.userId)} variant="destructive"><X className="w-4 h-4 mr-2" />Rechazar</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderReservations = () => {
    if (reservationsLoading) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
        </div>
      );
    }
    if (reservations.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No hay reservas registradas</h3>
          <p className="text-slate-600">No se han encontrado reservas.</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {reservations.map((reservation) => {
          const property = properties.find(p => p.id === reservation.property_id);
          const userObj = users.find(u => u.id === reservation.user_id);
          const ownerObj = users.find(u => u.id === reservation.owner_id);
          return (
            <Card key={reservation.id} className="p-0 overflow-hidden shadow-md border border-slate-200 mb-6 rounded-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-50 px-6 py-4 border-b">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <span className="font-semibold text-lg text-slate-800">{property ? property.title : reservation.property_id}</span>
                  <span className="ml-2 text-xs text-slate-500">#{reservation.id}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  {getReservationStatusBadge(reservation.status)}
                  <ReservationDetailsModal reservation={reservation} property={property} />
                </div>
              </div>
              <CardContent className="py-6 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center text-center">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Período de Contrato</div>
                  <div className="font-medium text-slate-700">{property?.rental_period || property?.rentalPeriod || 'N/A'} meses</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Inquilino</div>
                  <div className="font-medium text-slate-700">{userObj ? `${userObj.nombre} (${userObj.email})` : reservation.user_id}</div>
                  <Button size="xs" variant="outline" className="mt-2" onClick={() => { setSelectedTenant(userObj); setShowTenantModal(true); }}>Ver Inquilino</Button>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Propietario</div>
                  <div className="font-medium text-slate-700">{ownerObj ? `${ownerObj.nombre} (${ownerObj.email})` : reservation.owner_id}</div>
                  <Button size="xs" variant="outline" className="mt-2" onClick={() => { setSelectedOwner(ownerObj); setShowOwnerModal(true); }}>Ver Propietario</Button>
                </div>
                <div className="flex flex-row gap-2 justify-center items-center">
                  {reservation.status !== 'rechazada_owner' && reservation.status !== 'rechazada_admin' && (
                    <>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Pagos</div>
                        <Button size="xs" variant="outline" onClick={() => navigate(`/admin/pagos/${reservation.id}`)}>
                          Ver pagos
                        </Button>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Contrato</div>
                        {reservation.contract_status === 'enviado' ? (
                          <Button size="xs" variant="outline" onClick={() => navigate(`/contrato/${reservation.id}?admin=1`)}>
                            <FileText className="mr-2 h-4 w-4" /> Ver contrato
                          </Button>
                        ) : (
                          <Button size="xs" variant="outline" onClick={() => handleOpenContractModal(reservation.id)}>
                            Enviar contrato
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {/* Modales de detalle */}
        <Dialog open={showPropertyModal && !!selectedProperty} onOpenChange={setShowPropertyModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalle de Propiedad</DialogTitle>
            </DialogHeader>
            {selectedProperty ? (
              <div className="space-y-2">
                <div><b>ID:</b> {selectedProperty.id}</div>
                <div><b>Título:</b> {selectedProperty.title}</div>
                <div><b>Dirección:</b> {selectedProperty.address}</div>
                <div><b>Precio:</b> {formatCurrency(selectedProperty.monthlyRent, selectedProperty.currency)}</div>
                <div><b>Ambientes:</b> {selectedProperty.environments}</div>
                <div><b>Baños:</b> {selectedProperty.bathrooms}</div>
                <div><b>Garages:</b> {selectedProperty.garages}</div>
                <div><b>Descripción:</b> {selectedProperty.description}</div>
              </div>
            ) : <div>No se encontró la propiedad.</div>}
          </DialogContent>
        </Dialog>
        <Dialog open={showTenantModal && !!selectedTenant} onOpenChange={setShowTenantModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalle de Inquilino</DialogTitle>
            </DialogHeader>
            {selectedTenant ? (
              <div className="space-y-2">
                <div><b>ID:</b> {selectedTenant.id}</div>
                <div><b>Nombre:</b> {selectedTenant.nombre || selectedTenant.name}</div>
                <div><b>Email:</b> {selectedTenant.email}</div>
                <div><b>Teléfono:</b> {selectedTenant.telefono || selectedTenant.phone}</div>
                <div><b>Rol:</b> {selectedTenant.rol || selectedTenant.role}</div>
                <div><b>Verificado:</b> {selectedTenant.isEmailVerified ? 'Sí' : 'No'}</div>
                <div><b>Estado:</b> {selectedTenant.isSuspended ? 'Suspendido' : 'Activo'}</div>
              </div>
            ) : <div>No se encontró el usuario.</div>}
          </DialogContent>
        </Dialog>
        <Dialog open={showOwnerModal && !!selectedOwner} onOpenChange={setShowOwnerModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalle de Propietario</DialogTitle>
            </DialogHeader>
            {selectedOwner ? (
              <div className="space-y-2">
                <div><b>ID:</b> {selectedOwner.id}</div>
                <div><b>Nombre:</b> {selectedOwner.nombre || selectedOwner.name}</div>
                <div><b>Email:</b> {selectedOwner.email}</div>
                <div><b>Teléfono:</b> {selectedOwner.telefono || selectedOwner.phone}</div>
                <div><b>Rol:</b> {selectedOwner.rol || selectedOwner.role}</div>
                <div><b>Verificado:</b> {selectedOwner.isEmailVerified ? 'Sí' : 'No'}</div>
                <div><b>Estado:</b> {selectedOwner.isSuspended ? 'Suspendido' : 'Activo'}</div>
              </div>
            ) : <div>No se encontró el usuario.</div>}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Modal de rechazo de reserva (fuera del renderReservations)
  const renderContent = () => {
    switch (selectedSection) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'properties':
        return renderProperties();
      case 'verifications':
        return renderVerifications();
      case 'reservations':
        return renderReservations();
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {renderContent()}
          </motion.div>
        </div>
      </div>
      {showImageModal && selectedImage && (
        <ImageZoomModal
          imageSrc={selectedImage}
          onClose={handleCloseImageModal}
        />
      )}
      {showUserModal && selectedUser && (
        <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Información de Usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <p><span className="font-semibold">ID:</span> {selectedUser.id}</p>
              <p><span className="font-semibold">Nombre:</span> {selectedUser.nombre || selectedUser.name}</p>
              <p><span className="font-semibold">Email:</span> {selectedUser.email}</p>
              <p><span className="font-semibold">Teléfono:</span> {selectedUser.telefono || selectedUser.phone || '-'}</p>
              <p><span className="font-semibold">Rol:</span> {selectedUser.rol || selectedUser.role || '-'}</p>
              <p><span className="font-semibold">Verificado:</span> {selectedUser.isEmailVerified ? 'Sí' : 'No'}</p>
              <p><span className="font-semibold">Estado:</span> {selectedUser.isSuspended ? 'Suspendido' : 'Activo'}</p>
              <p><span className="font-semibold">Propiedades:</span> {selectedUser.propertiesCount}</p>
              <p><span className="font-semibold">Reservas:</span> {selectedUser.reservationsCount}</p>
            </div>
            <div className="mt-6 text-right">
              <Button variant="outline" onClick={() => setShowUserModal(false)}>Cerrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Modal de rechazo de reserva */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Reserva</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Motivo del rechazo (nota para el usuario):</label>
            <textarea
              className="w-full border rounded-md p-2 min-h-[80px]"
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              placeholder="Escribe aquí la nota que recibirá el usuario..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmRejectReservation} disabled={!rejectNote.trim()}>Rechazar Reserva</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal para subir contrato */}
      <Dialog open={showContractModal} onOpenChange={setShowContractModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Contrato</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4">
            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleContractUpload(e.target.files[0]);
                }
              }}
            />
            <div
              className="w-full h-32 border-2 border-dashed border-blue-400 rounded flex items-center justify-center cursor-pointer bg-slate-50 hover:bg-blue-50"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              onDrop={e => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleContractUpload(e.dataTransfer.files[0]);
                }
              }}
              onDragOver={e => e.preventDefault()}
            >
              <span className="text-blue-600 font-semibold">Arrastra y suelta el PDF aquí, o haz click para seleccionar</span>
            </div>
            <Button onClick={() => fileInputRef.current && fileInputRef.current.click()} disabled={uploadingContract} className="w-full">
              Seleccionar archivo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboardPage; 