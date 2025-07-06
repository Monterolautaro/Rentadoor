import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, LogIn, UserPlus, LogOut, ChevronDown, Building, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import RegisterModal from '@/components/RegisterModal';
import LoginModal from '@/components/LoginModal';
import axios from 'axios';
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
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3001/api';

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser_rentadoor');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('currentUser_rentadoor');
      const newCurrentUser = updatedUser ? JSON.parse(updatedUser) : null;
      setCurrentUser(newCurrentUser);
      if (!newCurrentUser && (window.location.pathname.includes('/dashboard'))) {
         navigate('/'); // Redirige a home si se cierra sesión desde un dashboard
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('currentUserChanged_rentadoor', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('currentUserChanged_rentadoor', handleStorageChange);
    };
  }, [navigate]);

  const handleHostPropertyRedirect = () => {
    if (currentUser) {
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
      const token = localStorage.getItem('authToken_rentadoor');
      if (token) {
        // Llamar al endpoint de logout del backend
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error al hacer logout en el backend:', error);
      // Continuar con el logout local aunque falle la llamada al backend
    }

    // Limpiar datos locales
    localStorage.removeItem('currentUser_rentadoor');
    localStorage.removeItem('authToken_rentadoor');
    setCurrentUser(null);
    window.dispatchEvent(new Event('currentUserChanged_rentadoor'));
    
    toast({
      title: 'Cierre de sesión exitoso',
      description: 'Has cerrado sesión correctamente.',
    });
    navigate('/');
  };
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      const storedUser = localStorage.getItem('currentUser_rentadoor');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      if (JSON.stringify(currentUser) !== JSON.stringify(parsedUser)) {
        setCurrentUser(parsedUser);
      }
    }, 500); 

    return () => clearInterval(intervalId);
  }, [currentUser]);

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
            {currentUser ? (
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
                      <span>{currentUser.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Hola, {currentUser.name.split(' ')[0]}</DropdownMenuLabel>
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