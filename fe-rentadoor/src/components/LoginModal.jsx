import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import axios from 'axios';
import ForgotPasswordModal from './ForgotPasswordModal';

const LoginModal = ({ isOpen, onOpenChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const { toast } = useToast();

  const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Error de validación',
        description: 'Por favor, completa todos los campos.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/signin`, {
        email,
        password,
      }, {
        withCredentials: true
      });

      // Guardar usuario en localStorage como antes
      localStorage.setItem('currentUser_rentadoor', JSON.stringify(response.data.user));
      
      window.dispatchEvent(new Event('currentUserChanged_rentadoor'));

      toast({
        title: '¡Inicio de sesión exitoso!',
        description: `Bienvenido de nuevo, ${response.data.user.name}.`,
      });

      setEmail('');
      setPassword('');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error de inicio de sesión',
        description: error.response?.data?.message || 'Correo electrónico o contraseña incorrectos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    onOpenChange(false);
    setIsForgotPasswordOpen(true);
  };

  const handleBackToLogin = () => {
    setIsForgotPasswordOpen(false);
    onOpenChange(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-slate-800">Iniciar Sesión</DialogTitle>
            <DialogDescription>
              Accede a tu cuenta de Rentadoor
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="tu@email.com"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Tu contraseña"
                disabled={isLoading}
              />
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full bg-slate-800 hover:bg-slate-700"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </DialogFooter>
            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-slate-600 hover:text-slate-800 underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ForgotPasswordModal 
        isOpen={isForgotPasswordOpen}
        onOpenChange={setIsForgotPasswordOpen}
        onBackToLogin={handleBackToLogin}
      />
    </>
  );
};

export default LoginModal;