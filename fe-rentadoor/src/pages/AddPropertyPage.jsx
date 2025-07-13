import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { UploadCloud, PlusCircle, Trash2, DollarSign, BedDouble, Bath, Car, Home } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthContext } from '@/contexts/AuthContext';

const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const AddPropertyPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [currency, setCurrency] = useState('ARS');
  const [expensePrice, setExpensePrice] = useState('');
  const [environments, setEnvironments] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [garages, setGarages] = useState('');
  const [guests, setGuests] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Acceso Denegado",
        description: "Debes iniciar sesión para agregar una propiedad.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
  }, [user, navigate, toast]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 5) {
      toast({
        title: "Límite de imágenes",
        description: "Puedes subir un máximo de 5 imágenes.",
        variant: "destructive",
      });
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    e.target.value = null;
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const currentPreview = prev[index];
      if (currentPreview.startsWith('blob:')) {
        URL.revokeObjectURL(currentPreview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !location || !monthlyRent || !currency || !environments || !bathrooms || !garages || !guests) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, rellena todos los campos obligatorios, incluyendo la moneda.",
        variant: "destructive",
      });
      return;
    }
    if (imageFiles.length === 0) {
       toast({
        title: "Sin imágenes",
        description: "Por favor, sube al menos una imagen de la propiedad.",
        variant: "destructive",
      });
      return;
    }

    const imageDataUrls = await Promise.all(
      imageFiles.map(file => fileToDataUrl(file))
    );

    const newProperty = {
      id: Date.now(), 
      ownerId: user ? user.id : 'unknown_owner',
      title,
      description,
      location,
      price: parseFloat(monthlyRent), // Mantenemos price por compatibilidad, pero usaremos monthlyRent y currency
      monthlyRent: parseFloat(monthlyRent),
      currency,
      expensePrice: expensePrice ? parseFloat(expensePrice) : 0,
      environments: parseInt(environments),
      bathrooms: parseInt(bathrooms),
      garages: parseInt(garages),
      guests: parseInt(guests),
      bedrooms: parseInt(environments > 1 ? environments -1 : 1),
      rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
      image: imageDataUrls.length > 0 ? imageDataUrls[0] : 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      allImages: imageDataUrls,
      status: "Disponible",
    };

    try {
      const existingProperties = JSON.parse(localStorage.getItem('properties_rentadoor')) || [];
      localStorage.setItem('properties_rentadoor', JSON.stringify([...existingProperties, newProperty]));
      window.dispatchEvent(new Event('propertiesChanged_rentadoor'));
      toast({
        title: "¡Propiedad Agregada!",
        description: `${title} ha sido agregada exitosamente.`,
      });
      navigate('/dashboard/propietario'); 
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "Hubo un problema al guardar la propiedad. Intenta de nuevo.",
        variant: "destructive",
      });
      console.error("Error saving property:", error);
    }
  };

  if (!user) {
    return null; 
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-slate-800">Agregar Nueva Propiedad</CardTitle>
            <CardDescription>Completa los detalles de tu inmueble para publicarlo en Rentadoor.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-700">Título de la Propiedad</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Moderno Loft en Palermo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-slate-700">Ubicación</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej: Palermo, Buenos Aires" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700">Descripción</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe tu propiedad detalladamente..." rows={4} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="monthlyRent" className="text-slate-700">Precio de Alquiler Mensual</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="monthlyRent" type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} placeholder="Ej: 85000 o 700" className="pl-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-slate-700">Moneda</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Seleccionar moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
                      <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="expensePrice" className="text-slate-700">Precio de Expensas (Opcional)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="expensePrice" type="number" value={expensePrice} onChange={(e) => setExpensePrice(e.target.value)} placeholder="Ej: 15000" className="pl-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="environments" className="text-slate-700">Ambientes</Label>
                  <Input id="environments" type="number" value={environments} onChange={(e) => setEnvironments(e.target.value)} placeholder="Ej: 3" min="1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bathrooms" className="text-slate-700">Baños</Label>
                  <div className="relative">
                    <Bath className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="bathrooms" type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="Ej: 2" min="1" className="pl-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="garages" className="text-slate-700">Cocheras</Label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="garages" type="number" value={garages} onChange={(e) => setGarages(e.target.value)} placeholder="Ej: 1" min="0" className="pl-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guests" className="text-slate-700">Huéspedes Máximos</Label>
                  <div className="relative">
                    <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="guests" type="number" value={guests} onChange={(e) => setGuests(e.target.value)} placeholder="Ej: 4" min="1" className="pl-8" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-slate-700">Imágenes de la Propiedad</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg border" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {imagePreviews.length < 5 && (
                    <Label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors aspect-square"
                    >
                      <UploadCloud className="h-8 w-8 text-slate-400" />
                      <span className="text-sm text-slate-600 mt-2">Agregar imagen</span>
                    </Label>
                  )}
                </div>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Propiedad
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default AddPropertyPage;