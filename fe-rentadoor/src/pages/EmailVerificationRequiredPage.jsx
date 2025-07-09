import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const EmailVerificationRequiredPage = () => {
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';

  const resendVerification = async () => {
    setIsResending(true);
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
        description: 'Se ha reenviado el email de verificación. Revisa tu bandeja de entrada.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo reenviar el email de verificación.',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser_rentadoor');
    window.dispatchEvent(new Event('currentUserChanged_rentadoor'));
    navigate('/');
  };

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
            <Mail className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-slate-800">Verificación de Email Requerida</CardTitle>
            <CardDescription>
              Para acceder a todas las funciones de Rentadoor, necesitas verificar tu dirección de email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Pasos para verificar tu email:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Revisa tu bandeja de entrada</li>
                    <li>Busca el email de "Rentadoor"</li>
                    <li>Haz click en el enlace de verificación</li>
                    <li>¡Listo! Ya puedes usar todas las funciones</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={resendVerification}
                disabled={isResending}
                className="w-full bg-slate-800 hover:bg-slate-700"
              >
                {isResending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Reenviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Reenviar Email de Verificación
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleLogout}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EmailVerificationRequiredPage; 