import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Edit3, ShieldCheck, ShieldAlert, ShieldX, BadgeCheck, ChevronLeft } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const AccountPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadData = () => {
      const storedUser = localStorage.getItem('currentUser_rentadoor');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      } else {
        navigate('/');
      }
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
    };
  }, [navigate]);

  const handleNotImplemented = (feature) => {
    toast({
      title: `🚧 ${feature}`,
      description: "Esta función aún no está implementada. ¡Puedes solicitarla en tu próximo mensaje! 🚀"
    });
  };

  const renderIdentityStatus = () => {
    if (!currentUser) return null;
    switch (currentUser.identityStatus) {
      case 'Verified':
        return <div className="flex items-center gap-2 text-green-600 bg-green-100 px-3 py-2 rounded-md"><ShieldCheck className="h-5 w-5" /> <span className="font-semibold">Identidad Verificada</span></div>;
      case 'Pending':
        return <div className="flex items-center gap-2 text-yellow-600 bg-yellow-100 px-3 py-2 rounded-md"><ShieldAlert className="h-5 w-5 animate-pulse" /> <span className="font-semibold">Verificación Pendiente</span></div>;
      case 'Not Verified':
      default:
        return <div className="flex items-center gap-2 text-red-600 bg-red-100 px-3 py-2 rounded-md"><ShieldX className="h-5 w-5" /> <span className="font-semibold">Identidad No Verificada</span></div>;
    }
  };

  if (!currentUser) {
    return <div className="flex justify-center items-center h-screen"><p className="text-xl text-slate-600">Cargando datos del usuario...</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8">
            <Button onClick={() => navigate(-1)} variant="outline" className="mb-6">
                <ChevronLeft className="mr-2 h-4 w-4" /> Volver
            </Button>
            <h1 className="text-4xl font-bold text-slate-800">Mi Cuenta</h1>
            <p className="text-lg text-slate-600">Gestiona tu información personal y el estado de tu cuenta.</p>
        </div>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl text-slate-700 flex items-center gap-2"><User className="h-6 w-6"/>Información Personal</CardTitle>
                <CardDescription>Revisa y actualiza tus datos personales y estado de verificación.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4 p-4 border rounded-lg bg-slate-50/50">
                    <div><p className="font-medium text-slate-600">Nombre Completo:</p><p className="text-slate-800">{currentUser.name}</p></div>
                    <div><p className="font-medium text-slate-600">Correo Electrónico:</p><p className="text-slate-800">{currentUser.email}</p></div>
                </div>
                <div className="space-y-2">
                    <p className="font-medium text-slate-600">Verificación de Identidad:</p>
                    {renderIdentityStatus()}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <Button onClick={() => handleNotImplemented('Editar Información')} variant="outline"><Edit3 className="mr-2 h-4 w-4" /> Editar Información</Button>
                {currentUser.identityStatus !== 'Verified' && (
                  <Button onClick={() => navigate('/dashboard/verificar-identidad')} className="bg-blue-600 hover:bg-blue-500">
                    <BadgeCheck className="mr-2 h-4 w-4" /> 
                    {currentUser.identityStatus === 'Pending' ? 'Ver Estado' : 'Verificar Identidad'}
                  </Button>
                )}
            </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default AccountPage;