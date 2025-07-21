import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { UploadCloud, Save, Trash2, DollarSign, BedDouble, Bath, Car, Home, ChevronLeft, Ruler } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthContext } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import { NEIGHBORHOODS } from '@/utils/neighborhoods.utils';

const EditPropertyPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const { getPropertyById, updateProperty, uploadPropertyImages, loading } = useProperties();
  const [property, setProperty] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [currency, setCurrency] = useState('ARS'); 
  const [expensePrice, setExpensePrice] = useState('');
  const [environments, setEnvironments] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [garages, setGarages] = useState('');
  const [approxM2, setApproxM2] = useState();
  const [rentalPeriod, setRentalPeriod] = useState('12');
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Acceso Denegado",
        description: "Debes iniciar sesión para editar una propiedad.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
  }, [user, navigate, toast]);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const propertyData = await getPropertyById(propertyId);
        setProperty(propertyData);
        
        // Llenar el formulario con los datos existentes
        setTitle(propertyData.title || '');
        setDescription(propertyData.description || '');
        setLocation(propertyData.location || '');
        setMonthlyRent(propertyData.monthlyRent?.toString() || propertyData.monthly_rent?.toString() || '');
        setCurrency(propertyData.currency || 'ARS');        setExpensePrice(propertyData.expensePrice?.toString() || propertyData.expense_price?.toString() || '');
        setEnvironments(propertyData.environments?.toString() || '');
        setBathrooms(propertyData.bathrooms?.toString() || '');
        setGarages(propertyData.garages?.toString() || '');
        setApproxM2(propertyData.approxM2?.toString() || propertyData.approx_m2?.toString() || '');
        setRentalPeriod(propertyData.rentalPeriod?.toString() || propertyData.rental_period?.toString() || '12');
        
        // Configurar imágenes existentes
        if (propertyData.allImages && propertyData.allImages.length > 0) {
          setExistingImageUrls(propertyData.allImages);
        } else if (propertyData.all_images && propertyData.all_images.length > 0) {
          setExistingImageUrls(propertyData.all_images);
        } else if (propertyData.image) {
          setExistingImageUrls([propertyData.image]);
        }
      } catch (error) {
        console.error('Error loading property:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la propiedad.",
          variant: "destructive",
        });
        navigate('/dashboard/propietario');
      }
    };

    if (propertyId) {
      loadProperty();
    }
  }, [propertyId, getPropertyById, navigate, toast]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 10) {
      toast({
        title: "Límite de imágenes",
        description: "Puedes subir un máximo de 10 imágenes.",
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

  const removeExistingImage = (index) => {
    setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !location || !monthlyRent || !currency || !environments || !bathrooms || !garages || !approxM2 || !rentalPeriod) {
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

    try {
      // Subir nuevas imágenes si las hay
      let newImageUrls = [];
      if (imageFiles.length > 0) {
        const uploadResult = await uploadPropertyImages(imageFiles);
        newImageUrls = uploadResult.images || [];
      }

      // Combinar imágenes existentes con nuevas
      const allFinalImageUrls = [...existingImageUrls, ...newImageUrls];

      // Preparar datos para actualizar
      const updateData = {
        title,
        description,
        location,
        monthlyRent: parseFloat(monthlyRent),
        currency,
        expensePrice: expensePrice ? parseFloat(expensePrice) : 0,
        environments: parseInt(environments),
        bathrooms: parseInt(bathrooms),
        garages: parseInt(garages),
        approxM2: parseFloat(approxM2),
        rentalPeriod: parseInt(rentalPeriod),
        bedrooms: parseInt(environments > 1 ? environments - 1 : 1),
        allImages: allFinalImageUrls,
      };

      await updateProperty(propertyId, updateData);
      
      toast({
        title: "¡Propiedad Actualizada!",
        description: `${title} ha sido actualizada exitosamente.`,
      });
      navigate('/dashboard/propietario');    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        title: "Error al actualizar la propiedad",
        description: error.message || "Hubo un problema al actualizar la propiedad. Intenta de nuevo.",
        variant: "destructive",
      });
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
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Seleccionar barrio" />
                    </SelectTrigger>
                    <SelectContent>
                      {NEIGHBORHOODS.map((neighborhood) => (
                        <SelectItem key={neighborhood} value={neighborhood}>
                          {neighborhood}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="environments" className="text-slate-700">Ambientes</Label>
                  <Input id="environments" type="number" value={environments} onChange={(e) => setEnvironments(e.target.value)} placeholder="Ej: 3" min="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms" className="text-slate-700">Baños</Label>
                  <div className="relative">
                    <Bath className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="bathrooms" type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="Ej: 2" min="1" className="pl-8" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="garages" className="text-slate-700">Cocheras</Label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="garages" type="number" value={garages} onChange={(e) => setGarages(e.target.value)} placeholder="Ej: 1" min="0" className="pl-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approxM2" className="text-slate-700">Aproximado m²</Label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="approxM2" type="number" value={approxM2} onChange={(e) => setApproxM2(e.target.value)} placeholder="Ej: 85" min="1" className="pl-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rentalPeriod" className="text-slate-700">Periodo de Contrato</Label>
                  <Select value={rentalPeriod} onValueChange={setRentalPeriod}>
                    <SelectTrigger id="rentalPeriod">
                      <SelectValue placeholder="Seleccionar periodo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 meses</SelectItem>
                      <SelectItem value="18">18 meses</SelectItem>
                      <SelectItem value="24">24 meses</SelectItem>
                      <SelectItem value="36">36 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-slate-700">Imágenes de la Propiedad</Label>
                
                {/* Imágenes existentes */}
                {existingImageUrls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">Imágenes actuales:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {existingImageUrls.map((imageUrl, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img src={imageUrl} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover rounded-lg border" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeExistingImage(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subir nuevas imágenes */}
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <UploadCloud className="h-12 w-12 text-slate-400 mb-2" />
                    <div className="text-center">
                      <p className="text-sm text-slate-600">
                        Arrastra las imágenes aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG, JPG hasta 10MB cada una
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md transition-colors"
                    >
                      Seleccionar Imágenes
                    </label>
                  </div>
                </div>

                {imagePreviews.length > 0 && (
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
                  </div>
                )}

                <p className="text-sm text-slate-500">
                  Puedes subir hasta 10 imágenes. La primera imagen será la principal.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Actualizando propiedad...' : 'Actualizar Propiedad'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default EditPropertyPage;