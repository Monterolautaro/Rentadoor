import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Send, FileSignature, FileDown, Wallet, Home, KeyRound } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const UserDashboardPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [rentals, setRentals] = useState([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadData = () => {
    const storedUser = localStorage.getItem('currentUser_rentadoor');
    if (storedUser) {
      let user = JSON.parse(storedUser);
      if (!user.identityStatus) {
        user.identityStatus = 'Not Verified';
        localStorage.setItem('currentUser_rentadoor', JSON.stringify(user));
      }
      setCurrentUser(user);

      const allReservations = JSON.parse(localStorage.getItem('reservations_rentadoor')) || [];
      
      if (user.name === "Francisco Bolaños" && !allReservations.some(r => r.id === 'res_demo_1')) {
        allReservations.unshift({
          id: 'res_demo_1',
          propertyId: 'mock-1',
          propertyTitle: 'Moderno Loft en Palermo',
          propertyPrice: 85000,
          propertyCurrency: 'ARS',
          userId: user.id,
          userName: user.name,
          status: 'Pendiente Pago Inquilino',
          ownerApprovalStatus: 'Aprobado',
          paymentStatus: 'Pendiente de Pago',
          contractStatus: 'Pendiente de Pago',
          keysStatus: 'Pendiente Entrega',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        });
        localStorage.setItem('reservations_rentadoor', JSON.stringify(allReservations));
      }

      const userReservations = allReservations
        .filter(res => res.userId === user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReservations(userReservations);

      const allRentals = JSON.parse(localStorage.getItem('rentals_rentadoor')) || [];
      const userRentals = allRentals.filter(r => r.tenantId === user.id);
      setRentals(userRentals);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    const interval = setInterval(loadData, 2000);
    return () => {
      window.removeEventListener('storage', loadData);
      clearInterval(interval);
    }
  }, []);

  const updateReservationStatus = (id, updates) => {
    const allReservations = JSON.parse(localStorage.getItem('reservations_rentadoor')) || [];
    const index = allReservations.findIndex(r => r.id === id);
    if (index !== -1) {
      allReservations[index] = { ...allReservations[index], ...updates };
      localStorage.setItem('reservations_rentadoor', JSON.stringify(allReservations));
      loadData();
    }
  };

  const handleSignContract = (reservationId) => {
    updateReservationStatus(reservationId, { contractStatus: 'Firmado Inquilino', status: 'Pendiente Firma Propietario' });
    toast({ title: "¡Contrato Firmado!", description: "Tu firma ha sido registrada. Esperando la firma del propietario." });
  };

  const handleKeysReceived = (reservationId) => {
    updateReservationStatus(reservationId, { keysStatus: 'Recibidas' });
    toast({ title: "¡Llaves Recibidas!", description: "Has confirmado la recepción de las llaves. ¡Disfruta tu nuevo hogar!" });
  };

  const handleNotImplemented = (feature) => {
    toast({
      title: `🚧 ${feature}`,
      description: "Esta función aún no está implementada. ¡Puedes solicitarla en tu próximo mensaje! 🚀"
    });
  };
  
  const getStatusBadge = (status) => {
    const baseClasses = "text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full";
    switch (status) {
      case 'Pendiente':
      case 'Pendiente Aprobación Propietario':
        return <span className={`${baseClasses} text-yellow-600 bg-yellow-200`}>Pendiente</span>;
      case 'Pendiente Pago Inquilino':
        return <span className={`${baseClasses} text-blue-600 bg-blue-200`}>Aprobada</span>;
      case 'Rechazada': return <span className={`${baseClasses} text-red-600 bg-red-200`}>Rechazada</span>;
      case 'Alquilada': return <span className={`${baseClasses} text-indigo-600 bg-indigo-200`}>Alquilada</span>;
      default: return <span className={`${baseClasses} text-slate-600 bg-slate-200`}>{status}</span>;
    }
  };

  const renderReservationActions = (app) => {
    if (app.status === 'Pendiente Pago Inquilino') {
      if (app.paymentStatus === 'Pendiente de Pago') {
        return (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleNotImplemented('Ver Contrato')} size="sm" variant="outline"><FileDown className="mr-2 h-4 w-4"/> Ver Contrato</Button>
            <Button onClick={() => navigate(`/reserva/${app.id}/pago-inicial`)} size="sm" className="bg-blue-600 hover:bg-blue-500"><Wallet className="mr-2 h-4 w-4"/> Realizar Pago Inicial</Button>
          </div>
        );
      }
      if (app.paymentStatus === 'Pendiente de Aprobación') {
        return <Button size="sm" disabled><FileText className="mr-2 h-4 w-4 animate-pulse"/> Pago Pendiente de Aprobación</Button>;
      }
      if (app.paymentStatus === 'Aprobado') {
        updateReservationStatus(app.id, { status: 'Pendiente Firma Inquilino' });
      }
    }
    if (app.status === 'Pendiente Firma Inquilino') {
       return (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleNotImplemented('Ver Contrato')} size="sm" variant="outline"><FileDown className="mr-2 h-4 w-4"/> Ver Contrato</Button>
            <Button onClick={() => handleSignContract(app.id)} size="sm" className="bg-green-600 hover:bg-green-500"><FileSignature className="mr-2 h-4 w-4"/> Firmar Contrato</Button>
          </div>
        );
    }
    if (app.status === 'Pendiente Firma Propietario') {
      return <Button size="sm" disabled><FileSignature className="mr-2 h-4 w-4 animate-pulse"/> Esperando firma del propietario</Button>;
    }
    if (app.status === 'Contrato Firmado' && app.keysStatus === 'Entregadas') {
      return <Button onClick={() => handleKeysReceived(app.id)} size="sm" className="bg-green-600 hover:bg-green-700"><KeyRound className="mr-2 h-4 w-4"/> Confirmar Recepción de Llaves</Button>;
    }
    return null;
  };

  if (!currentUser) {
    return <div className="flex justify-center items-center h-screen"><p className="text-xl text-slate-600">Cargando datos del usuario...</p></div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">Panel de Inquilino</h1>
          <p className="text-lg text-slate-600">Bienvenido de nuevo, {currentUser.name}.</p>
        </div>

        <Tabs defaultValue="reservations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="reservations"><Send className="mr-2 h-4 w-4" />Mis Reservas</TabsTrigger>
            <TabsTrigger value="rentals"><Home className="mr-2 h-4 w-4" />Mis Inmuebles Alquilados</TabsTrigger>
          </TabsList>

          <TabsContent value="reservations">
            <Card className="shadow-lg"><CardHeader><CardTitle className="text-2xl text-slate-700">Mis Reservas</CardTitle><CardDescription>Aquí puedes ver el estado de todas tus reservas.</CardDescription></CardHeader>
              <CardContent>
                {reservations.filter(r => r.status !== 'Alquilada').length > 0 ? (
                  <ul className="space-y-4">
                    {reservations.filter(r => r.status !== 'Alquilada').map(app => (
                      <li key={app.id} className="p-4 border rounded-lg bg-slate-50/50">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <div>
                            <h3 className="font-semibold text-lg text-slate-800">{app.propertyTitle}</h3>
                            <p className="text-sm text-slate-500 mb-2">Enviada: {new Date(app.createdAt).toLocaleDateString('es-ES')}</p>
                          </div>
                          <div className="mt-2 sm:mt-0">{getStatusBadge(app.status)}</div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200">{renderReservationActions(app)}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-10"><FileText className="mx-auto h-12 w-12 text-slate-400"/><h3 className="mt-2 text-sm font-medium text-slate-900">Sin reservas activas</h3><p className="mt-1 text-sm text-slate-500">No tienes ninguna reserva en proceso.</p></div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rentals">
            <Card className="shadow-lg"><CardHeader><CardTitle className="text-2xl text-slate-700">Mis Inmuebles Alquilados</CardTitle><CardDescription>Gestiona tus alquileres y pagos.</CardDescription></CardHeader>
              <CardContent>
                {rentals.length > 0 ? (
                  <ul className="space-y-6">
                    {rentals.map(rental => (
                      <li key={rental.id} className="p-4 border rounded-lg bg-slate-50/50">
                        <h3 className="font-semibold text-xl text-slate-800 mb-2">{rental.propertyTitle}</h3>
                        <p className="text-sm text-slate-500 mb-4">Alquilado desde: {new Date(rental.startDate).toLocaleDateString('es-ES')}</p>
                        <div className="mb-4"><Button onClick={() => handleNotImplemented('Realizar Pago Mensual')}><Wallet className="mr-2 h-4 w-4"/> Realizar Pago Mensual</Button></div>
                        <h4 className="font-semibold text-md text-slate-700 mb-2">Historial de Pagos</h4>
                        <ul className="space-y-2">
                          {rental.payments.map(payment => (
                            <li key={payment.id} className="flex justify-between items-center p-2 bg-white rounded-md border">
                              <div>
                                <p className="font-medium text-slate-800">{payment.type}</p>
                                <p className="text-xs text-slate-500">Fecha: {new Date(payment.date).toLocaleDateString('es-ES')}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">{rental.currency === 'USD' ? 'U$S' : 'ARS'} {payment.amount.toLocaleString('es-AR')}</p>
                                {payment.receipt && <Button variant="link" size="sm" className="h-auto p-0" onClick={() => handleNotImplemented('Ver Comprobante')}>Ver Comprobante</Button>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-10"><Home className="mx-auto h-12 w-12 text-slate-400"/><h3 className="mt-2 text-sm font-medium text-slate-900">Sin inmuebles alquilados</h3><p className="mt-1 text-sm text-slate-500">Aún no tienes ninguna propiedad alquilada.</p></div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default UserDashboardPage;