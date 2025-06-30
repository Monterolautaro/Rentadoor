import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { UploadCloud, Camera, FileImage, Trash2, ChevronLeft, ShieldCheck } from 'lucide-react';

const IdentityVerificationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selfie, setSelfie] = useState(null);
  const [dni, setDni] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [dniPreview, setDniPreview] = useState(null);

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
    e.target.value = null;
  };

  const removeImage = (setFile, setPreview, previewUrl) => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selfie || !dni) {
      toast({
        title: "Archivos Faltantes",
        description: "Por favor, sube tanto tu selfie como la foto de tu DNI.",
        variant: "destructive",
      });
      return;
    }

    const storedUser = localStorage.getItem('currentUser_rentadoor');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      user.identityStatus = 'Pending';
      localStorage.setItem('currentUser_rentadoor', JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));

      toast({
        title: "¡Documentos Enviados!",
        description: "Hemos recibido tus documentos. La verificación puede tardar hasta 24 horas.",
      });

      // Simulación de aprobación
      setTimeout(() => {
        const latestUser = JSON.parse(localStorage.getItem('currentUser_rentadoor'));
        if (latestUser && latestUser.id === user.id) {
          latestUser.identityStatus = 'Verified';
          localStorage.setItem('currentUser_rentadoor', JSON.stringify(latestUser));
          window.dispatchEvent(new Event('storage'));
          toast({
            title: "¡Identidad Verificada!",
            description: "Tu identidad ha sido verificada exitosamente. ¡Ya puedes usar todas las funciones!",
            className: "bg-green-100 border-green-300 text-green-800",
          });
        }
      }, 5000);

      navigate('/dashboard/inquilino');
    }
  };

  const renderUploadBox = (id, file, preview, setFile, setPreview, icon, title, description) => (
    <div className="space-y-2">
      <Label className="text-slate-700 font-semibold">{title}</Label>
      {preview ? (
        <div className="relative group aspect-video">
          <img-replace src={preview} alt={`${title} preview`} className="w-full h-full object-cover rounded-md border" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => removeImage(setFile, setPreview, preview)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Label
          htmlFor={id}
          className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-md cursor-pointer hover:border-blue-400 transition-colors p-8 text-center"
        >
          {icon}
          <span className="mt-2 text-sm text-slate-600">{description}</span>
          <span className="text-xs text-slate-400 mt-1">JPG, PNG</span>
        </Label>
      )}
      <Input id={id} type="file" accept="image/jpeg,image/png" onChange={(e) => handleFileChange(e, setFile, setPreview)} className="hidden" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <Card className="shadow-2xl">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
                Verificación de Identidad
              </CardTitle>
              <CardDescription>
                Para tu seguridad y la de todos, necesitamos verificar tu identidad. Sube una selfie clara y una foto de tu DNI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderUploadBox(
                'selfie-upload',
                selfie,
                selfiePreview,
                setSelfie,
                setSelfiePreview,
                <Camera className="h-10 w-10 text-slate-400" />,
                'Tu Selfie',
                'Sube una foto tuya mirando a la cámara'
              )}
              {renderUploadBox(
                'dni-upload',
                dni,
                dniPreview,
                setDni,
                setDniPreview,
                <FileImage className="h-10 w-10 text-slate-400" />,
                'Tu DNI (Frente)',
                'Sube una foto clara del frente de tu DNI'
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">
                <UploadCloud className="mr-2 h-4 w-4" /> Enviar para Verificación
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default IdentityVerificationPage;