import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { UploadCloud, Save, Trash2, DollarSign, BedDouble, Bath, Car, Home, ChevronLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const EditPropertyPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

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
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser_rentadoor');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      toast({
        title: "Acceso Denegado",
        description: "Debes iniciar sesión para editar una propiedad.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    const allProperties = JSON.parse(localStorage.getItem('properties_rentadoor')) || [];
    const foundProperty = allProperties.find(p => p.id.toString() === propertyId);

    if (foundProperty) {
      setProperty(foundProperty);
      setTitle(foundProperty.title);
      setDescription(foundProperty.description);
      setLocation(foundProperty.location);
      setMonthlyRent(foundProperty.monthlyRent?.toString() || foundProperty.price?.toString() || '');
      setCurrency(foundProperty.currency || 'ARS'); 
      setExpensePrice(foundProperty.expensePrice?.toString() || '');
      setEnvironments(foundProperty.environments?.toString() || '');
      setBathrooms(foundProperty.bathrooms?.toString() || '');
      setGarages(foundProperty.garages?.toString() || '');
      setGuests(foundProperty.guests?.toString() || '');
      
      const currentImages = Array.isArray(foundProperty.allImages) ? foundProperty.allImages : (foundProperty.image ? [foundProperty.image] : []);
      setExistingImageUrls(currentImages);
      setImagePreviews(currentImages);

    } else {
      toast({
        title: "Propiedad no encontrada",
        description: "No se pudo cargar la propiedad para editar.",
        variant: "destructive",
      });
      navigate('/dashboard/propietario');
    }
    setLoading(false);
  }, [propertyId, navigate, toast]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImageUrls.length + imageFiles.length + files.length;

    if (totalImages > 5) {
      toast({
        title: "Límite de imágenes",
        description: `Puedes tener un máximo de 5 imágenes. Ya tienes ${existingImageUrls.length + imageFiles.length}.`,
        variant: "destructive",
      });
      return;
    }

    setImageFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    e.target.value = null;
  };

  const removeImage = (index, isExisting) => {
    if (isExisting) {
      setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingImageUrls.length;
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
      const previewUrlToRemove = imagePreviews[index];
       if (previewUrlToRemove.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrlToRemove);
      }
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
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
    if (existingImageUrls.length + imageFiles.length === 0) {
       toast({
        title: "Sin imágenes",
        description: "Por favor, sube al menos una imagen de la propiedad.",
        variant: "destructive",
      });
      return;
    }

    const newImageDataUrls = await Promise.all(
      imageFiles.map(file => fileToDataUrl(file))
    );
    const allFinalImageUrls = [...existingImageUrls, ...newImageDataUrls];

    const updatedProperty = {
      ...property,
      title,
      description,
      location,
      price: parseFloat(monthlyRent), // Sigue siendo útil tener un 'price' genérico, pero monthlyRent/currency son los primarios
      monthlyRent: parseFloat(monthlyRent),
      currency,
      expensePrice: expensePrice ? parseFloat(expensePrice) : 0,
      environments: parseInt(environments),
      bathrooms: parseInt(bathrooms),
      garages: parseInt(garages),
      guests: parseInt(guests),
      bedrooms: parseInt(environments > 1 ? environments -1 : 1),
      image: allFinalImageUrls.length > 0 ? allFinalImageUrls[0] : 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      allImages: allFinalImageUrls,
    };

    try {
      const existingProperties = JSON.parse(localStorage.getItem('properties_rentadoor')) || [];
      const updatedProperties = existingProperties.map(p => 
        p.id.toString() === propertyId ? updatedProperty : p
      );
      localStorage.setItem('properties_rentadoor', JSON.stringify(updatedProperties));
      window.dispatchEvent(new Event('propertiesChanged_rentadoor'));
      toast({
        title: "¡Propiedad Actualizada!",
        description: `${title} ha sido actualizada exitosamente.`,
      });
      navigate('/dashboard/propietario'); 
    } catch (error) {
      toast({
        title: "Error al actualizar",
        description: "Hubo un problema al actualizar la propiedad. Intenta de nuevo.",
        variant: "destructive",
      });
      console.error("Error updating property:", error);
    }
  };

  if (loading || !currentUser) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-slate-700"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button onClick={() => navigate('/dashboard/propietario')} variant="outline" className="mb-6 text-slate-700 hover:text-slate-900">
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver al Panel
        </Button>
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-slate-800">Editar Propiedad</CardTitle>
            <CardDescription>Modifica los detalles de tu inmueble.</CardDescription>
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
                      <SelectItem value="ARS">ARS ($)</SelectItem>
                      <SelectItem value="USD">USD (U$S)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expensePrice" className="text-slate-700">Precio de Expensas (ARS) (Opcional)</Label>
                 <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="expensePrice" type="number" value={expensePrice} onChange={(e) => setExpensePrice(e.target.value)} placeholder="Ej: 15000" className="pl-8" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="environments" className="text-slate-700">Ambientes</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="environments" type="number" value={environments} onChange={(e) => setEnvironments(e.target.value)} placeholder="Ej: 3" className="pl-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms" className="text-slate-700">Baños</Label>
                  <div className="relative">
                    <Bath className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="bathrooms" type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="Ej: 2" className="pl-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="garages" className="text-slate-700">Cocheras</Label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="garages" type="number" value={garages} onChange={(e) => setGarages(e.target.value)} placeholder="Ej: 1" className="pl-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guests" className="text-slate-700">Máx. Huéspedes</Label>
                   <div className="relative">
                    <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="guests" type="number" value={guests} onChange={(e) => setGuests(e.target.value)} placeholder="Ej: 4" className="pl-8"/>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Imágenes de la Propiedad (Máx. 5)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                  {imagePreviews.map((src, index) => (
                    <div key={src + index} className="relative group aspect-square">
                      <img-replace src={src} alt={`Vista previa ${index + 1}`} className="w-full h-full object-cover rounded-md border" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index, index < existingImageUrls.length)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {(existingImageUrls.length + imageFiles.length) < 5 && (
                    <Label
                      htmlFor="image-upload"
                      className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-md cursor-pointer hover:border-slate-400 transition-colors"
                    >
                      <UploadCloud className="h-8 w-8 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-500">Subir Imagen</span>
                    </Label>
                  )}
                </div>
                <Input id="image-upload" type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                {(existingImageUrls.length + imageFiles.length) > 0 && <p className="text-xs text-slate-500">{(existingImageUrls.length + imageFiles.length)} de 5 imágenes seleccionadas.</p>}
              </div>

            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard/propietario')}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-slate-800 hover:bg-slate-700">
                <Save className="mr-2 h-4 w-4" /> Guardar Cambios
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default EditPropertyPage;