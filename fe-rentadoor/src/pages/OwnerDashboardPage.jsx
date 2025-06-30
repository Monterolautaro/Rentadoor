import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, CheckCircle, DollarSign, PlusCircle, Edit2, Send, UserCheck, FileSignature, KeyRound, Banknote } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import ReservationDetailsModal from '@/components/ReservationDetailsModal';

const mockProperties = [
    { id: "mock-1", ownerId: "mock-owner", title: "Moderno Loft en Palermo", location: "Palermo, Buenos Aires", price: 85000, monthlyRent: 85000, currency: "ARS", rating: 4.8, guests: 4, bedrooms: 2, description: "Hermoso loft moderno con todas las comodidades en el corazón de Palermo.", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80", status: "Disponible", allImages: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80", "https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"]},
    { id: "mock-2", ownerId: "mock-owner", title: "Elegante Apartamento en Recoleta", location: "Recoleta, Buenos Aires", price: 120000, monthlyRent: 120000, currency: "ARS", rating: 4.9, guests: 6, bedrooms: 3, description: "Apartamento elegante y espacioso en una de las zonas más exclusivas de Buenos Aires.", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80", status: "Disponible", allImages: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"]},
];

const demoReservationTemplate = {
  id: 'res_demo_1',
  propertyId: 'mock-1',
  propertyTitle: 'Moderno Loft en Palermo',
  propertyPrice: 85000,
  propertyCurrency: 'ARS',
  userId: 'user-francisco-123',
  userName: 'Francisco Bolaños',
  status: 'Pendiente Aprobación Propietario',
  ownerApprovalStatus: 'Pendiente',
  paymentStatus: 'No Requerido',
  contractStatus: 'No Requerido',
  keysStatus: 'Pendiente Entrega',
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  application: {
      incomeSource: 'dependencia',
      employerName: 'Globant',
      profession: 'Ingeniero de Software',
      cohabitants: 'Mi pareja y yo.',
      cuitCuil: '20351234567',
      incomeSourcesCount: 2,
      individualIncome: 450000,
      totalIncome: 700000,
      documentation: ['recibo_sueldo_1.pdf', 'recibo_sueldo_2.pdf', 'dni_frente.jpg'],
      additionalEarners: [{
          fullName: 'Sofía Martínez',
          dni: '38123456',
          cuitCuil: '27381234565',
          incomeSource: 'monotributista',
          employerName: '',
          income: 250000
      }]
  },
};

const OwnerDashboardPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [ownerProperties, setOwnerProperties] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [rentals, setRentals] = useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadData = () => {
    let allProperties = JSON.parse(localStorage.getItem('properties_rentadoor')) || [];
    let propsChanged = false;
    mockProperties.forEach(mockProp => {
        if (!allProperties.find(p => p.id === mockProp.id)) {
            allProperties.push(mockProp);
            propsChanged = true;
        }
    });
    if (propsChanged) {
        localStorage.setItem('properties_rentadoor', JSON.stringify(allProperties));
    }

    let allReservations = JSON.parse(localStorage.getItem('reservations_rentadoor')) || [];
    const demoResIndex = allReservations.findIndex(r => r.id === 'res_demo_1');
    
    const freshDemoReservation = JSON.parse(JSON.stringify(demoReservationTemplate));

    if (demoResIndex === -1) {
        allReservations.unshift(freshDemoReservation);
    } else {
        allReservations[demoResIndex] = freshDemoReservation;
    }
    localStorage.setItem('reservations_rentadoor', JSON.stringify(allReservations));

    const storedUser = localStorage.getItem('currentUser_rentadoor');
    if (storedUser) {
      let parsedUser = JSON.parse(storedUser);
      if (!parsedUser.identityStatus) {
        parsedUser.identityStatus = 'Not Verified';
        localStorage.setItem('currentUser_rentadoor', JSON.stringify(parsedUser));
      }
      setCurrentUser(parsedUser);
      
      const currentProperties = JSON.parse(localStorage.getItem('properties_rentadoor')) || [];
      const userProperties = currentProperties.filter(prop => prop.ownerId === parsedUser.id);
      setOwnerProperties(userProperties);
      
      const currentReservations = JSON.parse(localStorage.getItem('reservations_rentadoor')) || [];
      const propertyIds = userProperties.map(p => p.id);
      const userReservations = currentReservations
        .filter(res => propertyIds.includes(res.propertyId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReservations(userReservations);

      const allRentals = JSON.parse(localStorage.getItem('rentals_rentadoor')) || [];
      const userRentals = allRentals.filter(r => propertyIds.includes(r.propertyId));
      setRentals(userRentals);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    window.addEventListener('storage', loadData);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadData);
    };
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

  const handleApproveReservation = (id) => {
    updateReservationStatus(id, { ownerApprovalStatus: 'Aprobado', status: 'Pendiente Pago Inquilino' });
    toast({ title: "Reserva Aprobada", description: "Se ha notificado al inquilino para que proceda con el pago." });
  };

  const handleRejectReservation = (id) => {
    updateReservationStatus(id, { ownerApprovalStatus: 'Rechazado', status: 'Rechazada' });
    toast({ title: "Reserva Rechazada", description: "La solicitud ha sido rechazada.", variant: "destructive" });
  };
  
  const handleOwnerSign = (id) => {
    updateReservationStatus(id, { contractStatus: 'Firmado por Ambas Partes', status: 'Contrato Firmado' });
    toast({ title: "¡Contrato Firmado!", description: "El contrato ha sido firmado por ambas partes." });
  };

  const handleKeysDelivered = (id) => {
    updateReservationStatus(id, { keysStatus: 'Entregadas' });
    const reservation = reservations.find(r => r.id === id);
    const newRental = {
      id: `rental_${reservation.propertyId}`,
      propertyId: reservation.propertyId,
      propertyTitle: reservation.propertyTitle,
      tenantId: reservation.userId,
      tenantName: reservation.userName,
      ownerId: currentUser.id,
      startDate: new Date().toISOString(),
      rentAmount: reservation.propertyPrice,
      currency: reservation.propertyCurrency,
      paymentReceived: false,
      payments: [{
        id: `pay_${Date.now()}`,
        type: 'Pago Inicial',
        amount: reservation.propertyPrice * 3,
        date: new Date().toISOString(),
        receipt: reservation.paymentReceipt,
        status: 'Pagado por Inquilino'
      }]
    };
    const allRentals = JSON.parse(localStorage.getItem('rentals_rentadoor')) || [];
    allRentals.push(newRental);
    localStorage.setItem('rentals_rentadoor', JSON.stringify(allRentals));
    updateReservationStatus(id, { status: 'Alquilada' });
    toast({ title: "Llaves Entregadas", description: "Se ha registrado la entrega de llaves. El inquilino debe confirmar." });
  };

  const handleAddPropertyClick = () => {
    if (currentUser.identityStatus !== 'Verified') {
      toast({
        title: "Identidad no verificada",
        description: "Debes verificar tu identidad para poder publicar propiedades.",
        variant: "destructive",
      });
      navigate('/dashboard/verificar-identidad');
    } else {
      navigate('/dashboard/propietario/agregar');
    }
  };

  const getStatusBadge = (status, styles) => <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles}`}>{status}</span>;

  const renderReservationStatus = (res) => {
    if (res.status === 'Pendiente') return getStatusBadge('Pre-aprobación Rentadoor', 'bg-gray-200 text-gray-700');
    if (res.status === 'Pendiente Aprobación Propietario') return getStatusBadge('Pendiente Su Aprobación', 'bg-yellow-200 text-yellow-800');
    if (res.status === 'Pendiente Pago Inquilino') return getStatusBadge('Pendiente Pago Inquilino', 'bg-blue-200 text-blue-800');
    if (res.status === 'Pendiente Firma Inquilino') return getStatusBadge('Pendiente Firma Inquilino', 'bg-purple-200 text-purple-800');
    if (res.status === 'Pendiente Firma Propietario') return getStatusBadge('Pendiente Su Firma', 'bg-green-200 text-green-800');
    if (res.status === 'Contrato Firmado') return getStatusBadge('Contrato Firmado', 'bg-green-300 text-green-900');
    if (res.status === 'Alquilada') return getStatusBadge('Alquilada', 'bg-indigo-300 text-indigo-900');
    if (res.status === 'Rechazada') return getStatusBadge('Rechazada', 'bg-red-200 text-red-800');
    return getStatusBadge(res.status, 'bg-gray-200 text-gray-700');
  };

  const renderReservationActions = (res) => {
    if (res.status === 'Pendiente Aprobación Propietario') {
      return (
        <div className="flex flex-wrap gap-2">
          <ReservationDetailsModal reservation={res} />
          <Button onClick={() => handleApproveReservation(res.id)} size="sm" className="bg-green-600 hover:bg-green-700"><UserCheck className="mr-2 h-4 w-4"/> Aprobar</Button>
          <Button onClick={() => handleRejectReservation(res.id)} size="sm" variant="destructive"><UserCheck className="mr-2 h-4 w-4"/> Rechazar</Button>
        </div>
      );
    }
    if (res.status === 'Pendiente Firma Propietario') {
      return <Button onClick={() => handleOwnerSign(res.id)} size="sm" className="bg-green-600 hover:bg-green-700"><FileSignature className="mr-2 h-4 w-4"/> Firmar Contrato</Button>;
    }
    if (res.status === 'Contrato Firmado' && res.keysStatus !== 'Entregadas') {
      return <Button onClick={() => handleKeysDelivered(res.id)} size="sm" className="bg-blue-600 hover:bg-blue-700"><KeyRound className="mr-2 h-4 w-4"/> Registrar Entrega de Llaves</Button>;
    }
    return <p className="text-sm text-slate-500">Esperando acción del inquilino...</p>;
  };

  if (!currentUser) return <div className="flex justify-center items-center h-screen"><p>Cargando...</p></div>;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Panel de Propietario</h1>
            <p className="text-lg text-slate-600">Bienvenido, {currentUser.name.split(' ')[0]}.</p>
          </div>
          <Button onClick={handleAddPropertyClick} className="bg-blue-600 hover:bg-blue-500"><PlusCircle className="mr-2 h-4 w-4" /> Agregar Propiedad</Button>
        </div>

        <Tabs defaultValue="reservations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
            <TabsTrigger value="properties"><Building className="mr-2 h-4 w-4" />Mis Propiedades</TabsTrigger>
            <TabsTrigger value="reservations"><Send className="mr-2 h-4 w-4" />Solicitudes</TabsTrigger>
            <TabsTrigger value="rentals"><CheckCircle className="mr-2 h-4 w-4" />Alquiladas</TabsTrigger>
            <TabsTrigger value="collections"><DollarSign className="mr-2 h-4 w-4" />Cobros</TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
             <Card className="shadow-lg"><CardHeader><CardTitle>Todas Mis Propiedades</CardTitle></CardHeader>
              <CardContent>
                {ownerProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ownerProperties.map(prop => (
                      <Card key={prop.id} className="bg-slate-50/50"><CardHeader><CardTitle>{prop.title}</CardTitle><CardDescription>{prop.location}</CardDescription></CardHeader>
                        <CardFooter className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/propietario/editar/${prop.id}`)}><Edit2 className="h-3 w-3 mr-1" /> Editar</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : <p>No tienes propiedades publicadas.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reservations">
            <Card className="shadow-lg"><CardHeader><CardTitle>Solicitudes de Reserva</CardTitle><CardDescription>Gestiona las solicitudes de tus propiedades.</CardDescription></CardHeader>
              <CardContent>
                {reservations.filter(r => r.status !== 'Alquilada' && r.status !== 'Rechazada').length > 0 ? (
                  <ul className="space-y-4">
                    {reservations.filter(r => r.status !== 'Alquilada' && r.status !== 'Rechazada').map(res => (
                      <li key={res.id} className="p-4 border rounded-lg bg-slate-50/50">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <div>
                            <h3 className="font-semibold text-lg text-slate-800">{res.propertyTitle}</h3>
                            <p className="text-sm text-slate-500 mb-2">Postulante: {res.userName}</p>
                          </div>
                          <div className="mt-2 sm:mt-0">{renderReservationStatus(res)}</div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200">{renderReservationActions(res)}</div>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-center py-10 text-slate-500">No hay solicitudes de reserva activas.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rentals">
            <Card className="shadow-lg"><CardHeader><CardTitle>Propiedades Alquiladas</CardTitle></CardHeader>
              <CardContent>
                {rentals.length > 0 ? (
                  <ul className="space-y-4">
                    {rentals.map(rental => (
                      <li key={rental.id} className="p-4 border rounded-lg">
                        <h3 className="font-semibold">{rental.propertyTitle}</h3>
                        <p>Inquilino: {rental.tenantName}</p>
                        {!rental.paymentReceived && <Button size="sm" className="mt-2" onClick={() => navigate(`/dashboard/propietario/recibir-pago/${rental.id}`)}><Banknote className="mr-2 h-4 w-4"/> Recibir Pago Inicial</Button>}
                      </li>
                    ))}
                  </ul>
                ) : <p>No tienes propiedades alquiladas.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collections">
            <Card className="shadow-lg"><CardHeader><CardTitle>Historial de Cobros</CardTitle></CardHeader>
              <CardContent>
                <p>No hay cobros registrados.</p>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </motion.div>
    </div>
  );
};

export default OwnerDashboardPage;