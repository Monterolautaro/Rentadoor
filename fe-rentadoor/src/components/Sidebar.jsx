import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Shield, 
  Users, 
  Building, 
  Calendar, 
  DollarSign, 
  Home, 
  FileText, 
  Settings, 
  BarChart3,
  UserCheck,
  UserX,
  Ban,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  Plus,
  Search,
  Filter,
  Heart,
  Star,
  MapPin,
  User
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

const Sidebar = ({ isOpen, onToggle, userRole = 'user', onSectionChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const [selectedSection, setSelectedSection] = useState('overview');

  const adminSections = [
    {
      id: 'overview',
      title: 'Resumen',
      icon: BarChart3,
      description: 'Métricas básicas del sistema'
    },
    {
      id: 'users',
      title: 'Usuarios',
      icon: Users,
      description: 'Gestionar usuarios'
    },
    {
      id: 'properties',
      title: 'Propiedades',
      icon: Building,
      description: 'Gestionar propiedades'
    },
    {
      id: 'reservations',
      title: 'Reservas',
      icon: Calendar,
      description: 'Gestionar reservas'
    },
    {
      id: 'verifications',
      title: 'Verificaciones',
      icon: UserCheck,
      description: 'Verificaciones de identidad'
    }
  ];

  const userSections = [
    {
      id: 'overview',
      title: 'Mi Panel',
      icon: Home,
      description: 'Resumen de mi actividad'
    },
    {
      id: 'properties',
      title: 'Mis Propiedades',
      icon: Building,
      description: 'Gestionar mis propiedades'
    },
    {
      id: 'reservations',
      title: 'Mis Reservas',
      icon: Calendar,
      description: 'Historial de reservas'
    },
    {
      id: 'settings',
      title: 'Configuración',
      icon: Settings,
      description: 'Configuración de cuenta'
    }
  ];

  const tenantSections = [
    {
      id: 'overview',
      title: 'Mi Panel',
      icon: Home,
      description: 'Resumen de mi actividad'
    },
    {
      id: 'favorites',
      title: 'Mis Favoritos',
      icon: Heart,
      description: 'Propiedades guardadas'
    },
    {
      id: 'reservations',
      title: 'Mis Reservas',
      icon: Calendar,
      description: 'Historial de reservas'
    },
    {
      id: 'settings',
      title: 'Configuración',
      icon: Settings,
      description: 'Configuración de cuenta'
    }
  ];

  const sections = userRole === 'admin' ? adminSections : 
                  userRole === 'owner' ? userSections : 
                  tenantSections;

  const handleSectionClick = (sectionId) => {
    setSelectedSection(sectionId);
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
  };

  return (
    <div className="flex">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-r border-slate-200 h-screen overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">
                  {userRole === 'admin' ? 'Panel Admin' : 
                   userRole === 'owner' ? 'Panel Propietario' : 
                   'Mi Panel'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="p-1"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Navegación</h3>
                <div className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isSelected = selectedSection === section.id;
                    
                    return (
                      <Button
                        key={section.id}
                        variant={isSelected ? "default" : "ghost"}
                        className={`w-full justify-start ${isSelected ? 'bg-slate-800 text-white' : 'hover:bg-slate-100'}`}
                        onClick={() => handleSectionClick(section.id)}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">{section.title}</div>
                          <div className="text-xs opacity-70">{section.description}</div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {userRole === 'admin' && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Acciones Rápidas</h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { if (onSectionChange) onSectionChange('verifications'); }}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Aprobar Usuario
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { if (onSectionChange) onSectionChange('users'); }}>
                      <UserX className="h-4 w-4 mr-2" />
                      Suspender Usuario
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { if (onSectionChange) onSectionChange('users'); }}>
                      <Ban className="h-4 w-4 mr-2" />
                      Banear Usuario
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { if (onSectionChange) onSectionChange('properties'); }}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Propiedad
                    </Button>
                  </div>
                </div>
              )}

              {userRole === 'owner' && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Acciones Rápidas</h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/dashboard/propietario/agregar')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Propiedad
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { if (onSectionChange) onSectionChange('reservations'); }}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver Reservas
                    </Button>
                  </div>
                </div>
              )}

              {userRole === 'tenant' && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Acciones Rápidas</h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/') }>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar Propiedades
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { if (onSectionChange) onSectionChange('reservations'); }}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Mis Reservas
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-2"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 