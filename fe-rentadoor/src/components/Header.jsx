import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, LogIn, UserPlus, LogOut, ChevronDown, Building, LayoutDashboard, Mail, CheckCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import RegisterModal from '@/components/RegisterModal';
import LoginModal from '@/components/LoginModal';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, logout } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleHostPropertyRedirect = () => {
    if (user) {
      if (!user.isEmailVerified) {
        toast({
          title: "Verificación de Email Requerida",
          description: "Debes verificar tu email para publicar propiedades.",
          variant: "destructive"
        });
        return;
      }
      navigate('/dashboard/propietario');
    } else {
       toast({
        title: "Inicia Sesión Primero",
        description: "Debes iniciar sesión para acceder al panel de propietario. 🚀",
        variant: "destructive"
      });
      setIsLoginModalOpen(true);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      
      toast({
        title: 'Cierre de sesión exitoso',
        description: 'Has cerrado sesión correctamente.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error al cerrar sesión',
        description: 'Hubo un problema al cerrar sesión.',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.header 
      className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-slate-800" />
            <span className="text-2xl font-bold text-slate-800">Rentadoor</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button 
                  onClick={handleHostPropertyRedirect}
                  className="bg-slate-800 hover:bg-slate-700"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Publicar Propiedad
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{user.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Hola, {user.name.split(' ')[0]}</DropdownMenuLabel>
                    {!user.isEmailVerified && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => navigate('/verify-email')}
                          className="text-amber-600 bg-amber-50 hover:bg-amber-100"
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          <span>Verificar Email (Requerido)</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={() => navigate('/dashboard/mi-cuenta')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Mi Cuenta</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard/inquilino')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Panel Inquilino</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard/propietario')}>
                      <Building className="mr-2 h-4 w-4" />
                      <span>Panel Propietario</span>
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <DropdownMenuItem onClick={() => navigate('/dashboard/admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Panel Administrador</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setIsLoginModalOpen(true)}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Inicia Sesión
                </Button>
                <Button onClick={() => setIsRegisterModalOpen(true)} className="bg-slate-800 hover:bg-slate-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Regístrate
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <RegisterModal isOpen={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen} />
      <LoginModal isOpen={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </motion.header>
  );
};

export default Header;