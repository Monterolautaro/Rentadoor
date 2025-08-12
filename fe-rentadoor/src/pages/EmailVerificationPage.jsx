import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    setIsVerifying(true);
    try {
      const response = await axios.post(`${API_URL}/auth/verify-email`, {
        token: token
      });

      setVerificationStatus('success');
      toast({
        title: '¡Email verificado!',
        description: 'Tu email ha sido verificado exitosamente.',
      });

      const currentUser = localStorage.getItem('currentUser_rentadoor');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        user.isEmailVerified = true;
        localStorage.setItem('currentUser_rentadoor', JSON.stringify(user));
        window.dispatchEvent(new Event('currentUserChanged_rentadoor'));
      }

      setTimeout(() => {
        navigate('/dashboard/propietario');
      }, 2000);
    } catch (error) {
      setVerificationStatus('error');
      toast({
        title: 'Error de verificación',
        description: error.response?.data?.message || 'El enlace de verificación es inválido o ha expirado.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerification = async () => {
    try {
      const currentUser = localStorage.getItem('currentUser_rentadoor');
      if (!currentUser) {
        toast({
          title: 'Error',
          description: 'Debes iniciar sesión para reenviar el email de verificación.',
          variant: 'destructive',
        });
        return;
      }

      const user = JSON.parse(currentUser);
      await axios.post(`${API_URL}/auth/resend-verification`, {
        email: user.email
      });

      toast({
        title: 'Email reenviado',
        description: 'Se ha reenviado el email de verificación.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo reenviar el email de verificación.',
        variant: 'destructive',
      });
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mb-4"></div>
            <p className="text-slate-600">Verificando tu email...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            {verificationStatus === 'success' ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-green-600">¡Email Verificado!</CardTitle>
                <CardDescription>
                  Tu email ha sido verificado exitosamente. Serás redirigido en unos segundos...
                </CardDescription>
              </>
            ) : verificationStatus === 'error' ? (
              <>
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-red-600">Error de Verificación</CardTitle>
                <CardDescription>
                  El enlace de verificación es inválido o ha expirado.
                </CardDescription>
              </>
            ) : (
              <>
                <Mail className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-slate-800">Verificar Email</CardTitle>
                <CardDescription>
                  Verificando tu email...
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {verificationStatus === 'error' && (
              <div className="space-y-3">
                <Button 
                  onClick={resendVerification}
                  className="w-full bg-slate-800 hover:bg-slate-700"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Reenviar Email de Verificación
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Inicio
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage; 