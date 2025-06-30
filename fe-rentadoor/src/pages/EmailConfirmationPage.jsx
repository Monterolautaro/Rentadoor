import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const EmailConfirmationPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [status, setStatus] = useState('verifying'); // verifying, success, error

    useEffect(() => {
        const verifyToken = () => {
            try {
                const users = JSON.parse(localStorage.getItem('users_rentadoor')) || [];
                const userIndex = users.findIndex(user => user.confirmationToken === token);

                if (userIndex !== -1) {
                    users[userIndex].verified = true;
                    delete users[userIndex].confirmationToken;
                    localStorage.setItem('users_rentadoor', JSON.stringify(users));
                    setStatus('success');
                    toast({
                        title: '¡Cuenta verificada!',
                        description: 'Tu correo ha sido confirmado. Ya puedes iniciar sesión.',
                    });
                } else {
                    setStatus('error');
                    toast({
                        title: 'Error de verificación',
                        description: 'El enlace de confirmación es inválido o ha expirado.',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                setStatus('error');
                toast({
                    title: 'Error',
                    description: 'Ocurrió un problema al verificar tu cuenta.',
                    variant: 'destructive',
                });
            } finally {
              setTimeout(() => {
                navigate('/');
              }, 3000);
            }
        };

        verifyToken();
    }, [token, navigate, toast]);
    
    const statusInfo = {
        verifying: {
            icon: <Loader2 className="h-16 w-16 animate-spin text-blue-600" />,
            title: 'Verificando tu cuenta...',
            message: 'Por favor, espera un momento.'
        },
        success: {
            icon: <CheckCircle className="h-16 w-16 text-green-500" />,
            title: '¡Verificación exitosa!',
            message: 'Tu cuenta ha sido activada. Serás redirigido en unos segundos.'
        },
        error: {
            icon: <XCircle className="h-16 w-16 text-red-500" />,
            title: 'Error en la verificación',
            message: 'El enlace es inválido o ya ha sido utilizado. Serás redirigido.'
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-sm w-full"
            >
                <div className="flex justify-center mb-4">
                    {statusInfo[status].icon}
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">{statusInfo[status].title}</h1>
                <p className="text-slate-600">{statusInfo[status].message}</p>
            </motion.div>
        </div>
    );
};

export default EmailConfirmationPage;