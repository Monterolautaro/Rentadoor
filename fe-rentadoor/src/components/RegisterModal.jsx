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

  const handleSubmit = (e) => {
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
      const existingUsers = JSON.parse(localStorage.getItem('users_rentadoor')) || [];
      if (existingUsers.some(user => user.email === formData.email)) {
        toast({ title: 'Error', description: 'Este correo ya está registrado.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const confirmationToken = crypto.randomUUID();
      const link = `${window.location.origin}/confirmar-email/${confirmationToken}`;
      setConfirmationLink(link);

      const newUser = { 
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        verified: false,
        identityStatus: 'No Verificada',
        confirmationToken: confirmationToken
      };

      existingUsers.push(newUser);
      localStorage.setItem('users_rentadoor', JSON.stringify(existingUsers));
      
      setIsSubmitted(true);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo completar el registro.', variant: 'destructive' });
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
                  <Input id="name" value={formData.name} onChange={handleInputChange} placeholder="Tu nombre completo" />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="tu@email.com" />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
                 <div className="space-y-1">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="Tu número de teléfono" />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange} placeholder="Crea una contraseña segura"/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                   {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                   <PasswordStrengthIndicator password={formData.password} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Repite tu contraseña"/>
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading} className="w-full bg-slate-800 hover:bg-slate-700">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Crear Cuenta'}
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 px-4">
                <MailCheck className="mx-auto h-16 w-16 text-green-500" />
                <DialogTitle className="text-2xl mt-4">¡Un último paso!</DialogTitle>
                <DialogDescription className="mt-2 mb-2">
                    Te hemos enviado un correo a <strong>{formData.email}</strong>.
                </DialogDescription>
                 <div className="mt-4 text-sm text-center text-slate-600">
                  <p className="font-semibold">Simulación de Email:</p>
                  <p className="mb-2">Copia y pega este enlace en tu navegador para activar tu cuenta.</p>
                  <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-md">
                    <Input readOnly value={confirmationLink} className="bg-white text-xs select-all"/>
                    <Button variant="outline" size="icon" onClick={handleCopyLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button onClick={() => handleModalOpenChange(false)} className="w-full mt-6">Entendido</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;