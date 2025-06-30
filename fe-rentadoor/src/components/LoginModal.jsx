import React, { useState, useEffect } from 'react';
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

const LoginModal = ({ isOpen, onOpenChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const existingUsers = JSON.parse(localStorage.getItem('users_rentadoor')) || [];
    const ownerExists = existingUsers.some(u => u.email === 'propietario@demo.com');
    const tenantExists = existingUsers.some(u => u.name === 'Francisco Bolaños');

    if (!ownerExists) {
        existingUsers.push({
            id: 'mock-owner',
            name: 'Propietario Demo',
            email: 'propietario@demo.com',
            password: 'password',
            type: 'owner'
        });
    }

    if (!tenantExists) {
        existingUsers.push({
            id: 'user-francisco-123',
            name: 'Francisco Bolaños',
            email: 'francisco@demo.com',
            password: 'password',
            type: 'tenant'
        });
    }
    
    if (!ownerExists || !tenantExists) {
        localStorage.setItem('users_rentadoor', JSON.stringify(existingUsers));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Error de validación',
        description: 'Por favor, completa todos los campos.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const existingUsers = JSON.parse(localStorage.getItem('users_rentadoor')) || [];
      const user = existingUsers.find(u => u.email === email && u.password === password);

      if (user) {
        toast({
          title: '¡Inicio de sesión exitoso!',
          description: `Bienvenido de nuevo, ${user.name}.`,
        });
        localStorage.setItem('currentUser_rentadoor', JSON.stringify(user));
        window.dispatchEvent(new Event('currentUserChanged_rentadoor'));
        setEmail('');
        setPassword('');
        onOpenChange(false);
      } else {
        toast({
          title: 'Error de inicio de sesión',
          description: 'Correo electrónico o contraseña incorrectos.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un problema al intentar iniciar sesión. Intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <DialogHeader>
            <DialogTitle className="text-2xl text-slate-800">Iniciar Sesión</DialogTitle>
            <DialogDescription>
              Ingresa tus credenciales para acceder a tu cuenta de Rentadoor.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email-login" className="text-right text-slate-700">
                  Email
                </Label>
                <Input
                  id="email-login"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="col-span-3"
                  placeholder="tu@email.com"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password-login" className="text-right text-slate-700">
                  Contraseña
                </Label>
                <Input
                  id="password-login"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="col-span-3"
                  placeholder="Tu contraseña"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-slate-800 hover:bg-slate-700">
                Iniciar Sesión
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;