import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { User, Mail, Shield, CheckCircle, AlertCircle, Edit, Key, LogOut, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { userService } from '@/services/userServce';
import { useAuthContext } from '@/contexts/AuthContext';
import axios from 'axios';

const AccountPage = () => {
  const { user, logout, checkAuth } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isRequestingPasswordReset, setIsRequestingPasswordReset] = useState(false);
  const [cvu, setCvu] = useState(user?.cvu || "");
  const [savingCvu, setSavingCvu] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Cierre de sesión exitoso',
        description: 'Has cerrado sesión correctamente.',
      });
    } catch (error) {
      toast({
        title: 'Error al cerrar sesión',
        description: 'Hubo un problema al cerrar sesión.',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await axios.post(`${API_URL}/auth/resend-verification`, { email: user.email });
      toast({
        title: 'Email enviado',
        description: 'Revisa tu correo y haz clic en el enlace para verificar tu email.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo enviar el email de verificación.',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyIdentity = () => {
    navigate('/dashboard/verificar-identidad');
  };

  const handleChangePassword = async () => {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'No se pudo obtener tu email.',
        variant: 'destructive',
      });
      return;
    }

    setIsRequestingPasswordReset(true);

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, {
        email: user.email
      }, {
        withCredentials: true
      });

      toast({
        title: 'Email enviado',
        description: 'Se ha enviado un enlace de recuperación a tu email.',
      });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar el email de recuperación. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsRequestingPasswordReset(false);
    }
  };

  const handleEditInfo = () => {
    // TODO: Implementar edición de información
    toast({
      title: 'Función en desarrollo',
      description: 'Esta función estará disponible próximamente.',
    });
  };

  const handleSaveCvu = async () => {
    try {
      setSavingCvu(true);
      await userService.updateMyCvu(cvu.trim());
      toast({ title: 'CVU actualizado', description: 'Tu información bancaria fue guardada.' });
      await checkAuth();
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudo guardar el CVU.', variant: 'destructive' });
    } finally {
      setSavingCvu(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Mi Cuenta
          </h1>
          <p className="text-slate-600">
            Gestiona tu información personal y configuración
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Nombre:</span> {user.name}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Email:</span> {user.email}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Teléfono:</span> {user.phone || 'No especificado'}
                </p>
                {user.role === 'admin' && (
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">Rol:</span> 
                    <Badge className="ml-2 bg-blue-100 text-blue-800">
                      Administrador
                    </Badge>
                  </p>
                )}
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-slate-600 font-semibold">CVU</label>
                    {user?.cvu && (
                      <span className="text-xs text-slate-500">Actual: <span className="font-mono text-slate-700">{user.cvu}</span></span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Ingresa tu CVU"
                      value={cvu}
                      onChange={(e) => setCvu(e.target.value)}
                    />
                    <Button variant="outline" onClick={handleSaveCvu} disabled={savingCvu || !cvu.trim()}>
                      {savingCvu ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleEditInfo}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Información
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Estado de Verificación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Email verificado:</span>
                  {user.isEmailVerified ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pendiente
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Identidad verificada:</span>
                  {user.identityVerificationStatus === 'verified' ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verificada
                    </Badge>
                  ) : user.identityVerificationStatus === 'pending' ? (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      En proceso
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      No verificada
                    </Badge>
                  )}
                </div>
              </div>
              {!user.isEmailVerified && (
                <Button variant="outline" className="w-full" onClick={handleVerifyEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Verificar Email
                </Button>
              )}
              {user.role !== 'admin' && (
                <Button variant="outline" className="w-full" onClick={handleVerifyIdentity}>
                  <Shield className="h-4 w-4 mr-2" />
                  Verificar Identidad
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5" />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleChangePassword}
                disabled={isRequestingPasswordReset}
              >
                <Key className="h-4 w-4 mr-2" />
                {isRequestingPasswordReset ? 'Enviando...' : 'Cambiar Contraseña'}
              </Button>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" className="w-full" onClick={() => navigate('/legal/politica-de-privacidad')}>
                  Política de Privacidad
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/legal/terminos-y-condiciones')}>
                  Términos y Condiciones
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                Sesión
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Cierra tu sesión de forma segura
              </p>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountPage;