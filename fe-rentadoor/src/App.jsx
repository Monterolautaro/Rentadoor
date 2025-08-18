import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import HomePage from '@/pages/HomePage';
import UserDashboardPage from '@/pages/UserDashboardPage';
import OwnerDashboardPage from '@/pages/OwnerDashboardPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AddPropertyPage from '@/pages/AddPropertyPage';
import EditPropertyPage from '@/pages/EditPropertyPage';
import PropertyDetailPage from '@/pages/PropertyDetailPage';
import ReservationPage from '@/pages/ReservationPage';
import InitialPaymentPage from '@/pages/InitialPaymentPage';
import ReceivePaymentPage from '@/pages/ReceivePaymentPage';
import IdentityVerificationPage from '@/pages/IdentityVerificationPage';
import AccountPage from '@/pages/AccountPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import { Toaster } from '@/components/ui/toaster';
import Footer from '@/components/Footer';
import FloatingSupportButton from '@/components/FloatingSupportButton';
import EmailConfirmationPage from '@/pages/EmailConfirmationPage';
import EmailVerificationPage from '@/pages/EmailVerificationPage';
import EmailVerificationRequiredPage from '@/pages/EmailVerificationRequiredPage';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
import ReservationDocumentsPage from './pages/ReservationDocumentsPage';
import ReservationPaymentsPage from '@/pages/ReservationPaymentsPage';
import ContractViewPage from '@/pages/ContractViewPage';
import AdminPaymentsReviewPage from '@/pages/AdminPaymentsReviewPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsConditionsPage from '@/pages/TermsConditionsPage';

const AppRoutes = () => {
  const { user, loading } = useAuthContext();

  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }
    
    if (!user) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  const EmailVerifiedRoute = ({ children }) => {
    if (loading) {
      return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }
    
    if (!user) {
      return <Navigate to="/" replace />;
    }
    
    if (!user.isEmailVerified) {
      return <Navigate to="/verificar-email-requerido" replace />;
    }
    
    return children;
  };

  const AdminRoute = ({ children }) => {
    if (loading) {
      return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }
    
    if (!user) {
      return <Navigate to="/" replace />;
    }
    
    if (user.role !== 'admin') {
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
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/verificar-email-requerido" element={<EmailVerificationRequiredPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route 
            path="/propiedad/:propertyId/reservar" 
            element={
              <ProtectedRoute>
                <EmailVerifiedRoute>
                  <ReservationPage />
                </EmailVerifiedRoute>
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/reserva/:reservationId/pago-inicial" 
            element={
              <ProtectedRoute>
                <EmailVerifiedRoute>
                  <InitialPaymentPage />
                </EmailVerifiedRoute>
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
                <EmailVerifiedRoute>
                  <OwnerDashboardPage />
                </EmailVerifiedRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/admin" 
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/propietario/recibir-pago/:rentalId"
            element={
              <ProtectedRoute>
                <EmailVerifiedRoute>
                  <ReceivePaymentPage />
                </EmailVerifiedRoute>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/dashboard/propietario/agregar" 
            element={
              <ProtectedRoute>
                <EmailVerifiedRoute>
                  <AddPropertyPage />
                </EmailVerifiedRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/propietario/editar/:propertyId"
            element={
              <ProtectedRoute>
                <EmailVerifiedRoute>
                  <EditPropertyPage />
                </EmailVerifiedRoute>
              </ProtectedRoute>
            } 
          />
          <Route
            path="/dashboard/verificar-identidad"
            element={
              <ProtectedRoute>
                <EmailVerifiedRoute>
                  <IdentityVerificationPage />
                </EmailVerifiedRoute>
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
          <Route 
            path="/dashboard/propietario/reserva/:reservationId/documentos" 
            element={
              <ProtectedRoute>
                <EmailVerifiedRoute>
                  <ReservationDocumentsPage />
                </EmailVerifiedRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pagos/:reservationId"
            element={
              <ProtectedRoute>
                <ReservationPaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pagos/:reservationId"
            element={
              <ProtectedRoute>
                <AdminPaymentsReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contrato/:contractId"
            element={
              <ProtectedRoute>
                <ContractViewPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/legal/politica-de-privacidad" element={<PrivacyPolicyPage />} />
          <Route path="/legal/terminos-y-condiciones" element={<TermsConditionsPage />} />
        </Routes>
      </main>
      <Toaster />
      <Footer />
      <FloatingSupportButton />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;