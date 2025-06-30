import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, LogIn, UserPlus, LogOut, ChevronDown, Building, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import RegisterModal from '@/components/RegisterModal';
import LoginModal from '@/components/LoginModal';
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

  const handleLogout = () => {
    localStorage.removeItem('currentUser_rentadoor');
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
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm border-b sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Rentadoor</h1>
                <p className="text-xs text-gray-500">La nueva forma de alquilar</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleHostPropertyRedirect}
                className="hidden sm:flex"
              >
                <Building className="h-4 w-4 mr-2" />
                Modo Propietario
              </Button>
              {currentUser ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <User className="h-5 w-5 text-slate-700" />
                        <span className="text-sm text-slate-700 hidden md:inline">{currentUser.name.split(' ')[0]}</span>
                        <ChevronDown className="h-4 w-4 text-slate-500" />
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
      </motion.header>
      <RegisterModal isOpen={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen} />
      <LoginModal isOpen={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </>
  );
};

export default Header;