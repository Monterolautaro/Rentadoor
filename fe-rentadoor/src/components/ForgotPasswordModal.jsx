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
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';

const ForgotPasswordModal = ({ isOpen, onOpenChange, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, ingresa un email válido.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      }, {
        withCredentials: true
      });

      setIsSubmitted(true);
      toast({
        title: 'Email enviado',
        description: 'Si el email existe en nuestra base de datos, recibirás un enlace de recuperación.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo enviar el email de recuperación.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setEmail('');
    setIsSubmitted(false);
    onBackToLogin();
  };

  const handleModalOpenChange = (open) => {
    if (!open) {
      setEmail('');
      setIsSubmitted(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-slate-800">Recuperar Contraseña</DialogTitle>
          <DialogDescription>
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </DialogDescription>
        </DialogHeader>
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="tu@email.com"
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>
            
            <DialogFooter className="flex flex-col gap-2">
              <Button 
                type="submit" 
                className="w-full bg-slate-800 hover:bg-slate-700"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar email'}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleBackToLogin}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Login
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Email Enviado
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Si el email <strong>{email}</strong> existe en nuestra base de datos, 
                recibirás un enlace para restablecer tu contraseña.
              </p>
              <p className="text-xs text-slate-500">
                Revisa tu carpeta de spam si no encuentras el email.
              </p>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={handleBackToLogin}
                className="w-full bg-slate-800 hover:bg-slate-700"
              >
                Volver al Login
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal; 