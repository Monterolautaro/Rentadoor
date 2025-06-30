import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import HomePage from '@/pages/HomePage';
import UserDashboardPage from '@/pages/UserDashboardPage';
import OwnerDashboardPage from '@/pages/OwnerDashboardPage';
import AddPropertyPage from '@/pages/AddPropertyPage';
import EditPropertyPage from '@/pages/EditPropertyPage';
import PropertyDetailPage from '@/pages/PropertyDetailPage';
import ReservationPage from '@/pages/ReservationPage';
import InitialPaymentPage from '@/pages/InitialPaymentPage';
import ReceivePaymentPage from '@/pages/ReceivePaymentPage';
import IdentityVerificationPage from '@/pages/IdentityVerificationPage';
import AccountPage from '@/pages/AccountPage';
import { Toaster } from '@/components/ui/toaster';
import EmailConfirmationPage from '@/pages/EmailConfirmationPage';

const App = () => {
  const ProtectedRoute = ({ children }) => {
    const currentUser = localStorage.getItem('currentUser_rentadoor');
    if (!currentUser) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/propiedad/:propertyId" element={<PropertyDetailPage />} />
          <Route path="/confirmar-email/:token" element={<EmailConfirmationPage />} />
          <Route 
            path="/propiedad/:propertyId/reservar" 
            element={
              <ProtectedRoute>
                <ReservationPage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/reserva/:reservationId/pago-inicial" 
            element={
              <ProtectedRoute>
                <InitialPaymentPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/inquilino" 
            element={
              <ProtectedRoute>
                <UserDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/propietario" 
            element={
              <ProtectedRoute>
                <OwnerDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/propietario/recibir-pago/:rentalId"
            element={
              <ProtectedRoute>
                <ReceivePaymentPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/dashboard/propietario/agregar" 
            element={
              <ProtectedRoute>
                <AddPropertyPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/propietario/editar/:propertyId"
            element={
              <ProtectedRoute>
                <EditPropertyPage />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/dashboard/verificar-identidad"
            element={
              <ProtectedRoute>
                <IdentityVerificationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/mi-cuenta"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
};

export default App;