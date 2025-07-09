import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const token = searchParams.get('token');
  const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';

  useEffect(() => {
    if (!token) {
      toast({
        title: 'Token inválido',
        description: 'El enlace de recuperación es inválido.',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    checkToken();
  }, [token, navigate, toast]);

  const checkToken = async () => {
    try {
      await axios.get(`${API_URL}/auth/verify-reset-token?token=${token}`, {
        withCredentials: true
      });
      setIsValidToken(true);
    } catch (error) {
      toast({
        title: 'Token expirado',
        description: 'El enlace de recuperación ha expirado o es inválido.',
        variant: 'destructive',
      });
      navigate('/');
    } finally {
      setIsCheckingToken(false);
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('Mínimo 8 caracteres.');
    if (!/[a-z]/.test(password)) errors.push('Una minúscula.');
    if (!/[A-Z]/.test(password)) errors.push('Una mayúscula.');
    if (!/[0-9]/.test(password)) errors.push('Un número.');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('Un caracter especial.');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor, completa todos los campos.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Contraseñas no coinciden',
        description: 'Las contraseñas no coinciden.',
        variant: 'destructive',
      });
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      toast({
        title: 'Contraseña débil',
        description: passwordErrors.join(' '),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await axios.put(`${API_URL}/auth/reset-password`, {
        token,
        password,
      }, {
        withCredentials: true
      });

      setIsSuccess(true);
      toast({
        title: '¡Contraseña actualizada!',
        description: 'Tu contraseña ha sido restablecida exitosamente.',
      });

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo restablecer la contraseña.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600 mb-4" />
            <p className="text-slate-600">Verificando enlace...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return null;
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                ¡Contraseña Actualizada!
              </h2>
              <p className="text-slate-600 text-center mb-4">
                Tu contraseña ha sido restablecida exitosamente. 
                Serás redirigido al login en unos segundos.
              </p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-slate-800 hover:bg-slate-700"
              >
                Ir al Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
              <Lock className="h-6 w-6 text-slate-600" />
            </div>
            <CardTitle className="text-2xl text-slate-800">Restablecer Contraseña</CardTitle>
            <CardDescription>
              Ingresa tu nueva contraseña para completar el proceso de recuperación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu nueva contraseña"
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu nueva contraseña"
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando contraseña...
                  </>
                ) : (
                  'Restablecer Contraseña'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage; 