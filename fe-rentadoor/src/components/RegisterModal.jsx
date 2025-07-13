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
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, MailCheck, Copy } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

const PasswordStrengthIndicator = ({ password }) => {
  const validatePassword = (password) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
    return checks;
  };

  const checks = validatePassword(password);
  const strength = Object.values(checks).filter(Boolean).length;

  const strengthLevels = [
    { text: 'Muy débil', color: 'bg-red-500' },
    { text: 'Débil', color: 'bg-red-500' },
    { text: 'Aceptable', color: 'bg-yellow-500' },
    { text: 'Buena', color: 'bg-blue-500' },
    { text: 'Fuerte', color: 'bg-green-500' },
    { text: 'Muy Fuerte', color: 'bg-green-500' },
  ];

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${strengthLevels[strength].color}`}
          initial={{ width: 0 }}
          animate={{ width: `${(strength / 5) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-xs text-right text-gray-500">{strengthLevels[strength].text}</p>
    </div>
  );
};


const RegisterModal = ({ isOpen, onOpenChange }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [confirmationLink, setConfirmationLink] = useState('');
  const { toast } = useToast();
  const { signup } = useAuthContext();

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('Mínimo 8 caracteres.');
    if (!/[a-z]/.test(password)) errors.push('Una minúscula.');
    if (!/[A-Z]/.test(password)) errors.push('Una mayúscula.');
    if (!/[0-9]/.test(password)) errors.push('Un número.');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('Un caracter especial.');
    return errors;
  };
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const newErrors = {};
    if (!formData.name) newErrors.name = 'El nombre es obligatorio.';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido.';
    if (!formData.phone) newErrors.phone = 'El teléfono es obligatorio.';
    
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) newErrors.password = passwordErrors.join(' ');
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await signup({
        name: formData.name,
        email: formData.email,
        telephone: formData.phone,
        password: formData.password,
      });

      // Si el servidor devuelve un enlace de confirmación, usarlo
      if (response.confirmationLink) {
        setConfirmationLink(response.confirmationLink);
      } else {
        // Crear enlace local como fallback
        const confirmationToken = response.confirmationToken || crypto.randomUUID();
        const link = `${window.location.origin}/confirmar-email/${confirmationToken}`;
        setConfirmationLink(link);
      }

      setIsSubmitted(true);
      toast({
        title: '¡Registro exitoso!',
        description: 'Tu cuenta ha sido creada. Revisa tu email para confirmar tu cuenta.',
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'No se pudo completar el registro.', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(confirmationLink);
    toast({
      title: "¡Enlace copiado!",
      description: "Pega el enlace en tu navegador para activar tu cuenta.",
    });
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setConfirmationLink('');
    setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    setErrors({});
  }
  
  const handleModalOpenChange = (open) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogHeader>
                <DialogTitle className="text-2xl text-slate-800">Crear una cuenta</DialogTitle>
                <DialogDescription>
                  Únete a Rentadoor. ¡Es rápido y fácil!
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="Tu nombre completo"
                    disabled={isLoading}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    placeholder="tu@email.com"
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
                 <div className="space-y-1">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    placeholder="Tu número de teléfono"
                    disabled={isLoading}
                  />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? 'text' : 'password'} 
                      value={formData.password} 
                      onChange={handleInputChange} 
                      placeholder="Crea una contraseña segura"
                      disabled={isLoading}
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
                  <PasswordStrengthIndicator password={formData.password} />
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={formData.confirmPassword} 
                    onChange={handleInputChange} 
                    placeholder="Repite tu contraseña"
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-slate-800 hover:bg-slate-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      'Crear Cuenta'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogHeader>
                <DialogTitle className="text-2xl text-slate-800">¡Cuenta Creada!</DialogTitle>
                <DialogDescription>
                  Tu cuenta ha sido creada exitosamente. Revisa tu email para confirmar tu cuenta.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MailCheck className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-800">
                      Se ha enviado un enlace de confirmación a tu email.
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Enlace de confirmación:</Label>
                  <div className="flex space-x-2">
                    <Input 
                      value={confirmationLink} 
                      readOnly 
                      className="text-xs"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleCopyLink}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => handleModalOpenChange(false)}
                  className="w-full bg-slate-800 hover:bg-slate-700"
                >
                  Continuar
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;