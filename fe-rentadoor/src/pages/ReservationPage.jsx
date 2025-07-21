import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, Briefcase, Users, FileText, DollarSign, UploadCloud, Trash2, Send } from 'lucide-react';
import { reservationsService } from '@/services/reservationsService';
import { useAuthContext } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';

const ReservationPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const { getPropertyById } = useProperties();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const [incomeSource, setIncomeSource] = useState('');
  const [employerName, setEmployerName] = useState('');
  const [profession, setProfession] = useState('');
  const [cohabitants, setCohabitants] = useState('');
  const [cuitCuil, setCuitCuil] = useState('');
  const [incomeSourcesCount, setIncomeSourcesCount] = useState(1);
  const [individualIncome, setIndividualIncome] = useState('');
  const [totalIncome, setTotalIncome] = useState('');
  const [documentation, setDocumentation] = useState([]);
  const [docPreviews, setDocPreviews] = useState([]);
  const [additionalEarners, setAdditionalEarners] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const propertyData = await getPropertyById(propertyId);
        setProperty(propertyData);
      } catch (error) {
        toast({
          title: "Propiedad no encontrada",
          description: "No pudimos encontrar los detalles para esta propiedad.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId, getPropertyById, navigate, toast]);

  useEffect(() => {
    const count = Math.max(0, (incomeSourcesCount || 1) - 1);
    setAdditionalEarners(currentEarners => {
      const newEarners = JSON.parse(JSON.stringify(currentEarners));
      while (newEarners.length < count) {
        newEarners.push({ fullName: '', dni: '', cuitCuil: '', incomeSource: '', employerName: '', income: '' });
      }
      return newEarners.slice(0, count);
    });
  }, [incomeSourcesCount]);

  const handleAdditionalEarnerChange = (index, field, value) => {
    const updatedEarners = [...additionalEarners];
    updatedEarners[index][field] = value;
    setAdditionalEarners(updatedEarners);
  };

  const handleDocChange = (e) => {
    const files = Array.from(e.target.files);
    const totalDocs = documentation.length + files.length;
    if (totalDocs > 5) {
      toast({ title: "Límite de documentos", description: "Puedes subir un máximo de 5 documentos.", variant: "destructive" });
      return;
    }
    setDocumentation(prev => [...prev, ...files]);
    const newPreviews = files.map(file => ({ name: file.name, type: file.type }));
    setDocPreviews(prev => [...prev, ...newPreviews]);
    e.target.value = null;
  };

  const removeDoc = (index) => {
    setDocumentation(prev => prev.filter((_, i) => i !== index));
    setDocPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "No autenticado", description: "Debes iniciar sesión para reservar.", variant: "destructive" });
      return;
    }
    if (!property) {
      toast({ title: "Propiedad no encontrada", description: "No se pudo cargar la propiedad.", variant: "destructive" });
      return;
    }
    let isFormValid = true;
    let validationMessage = "";
    if (!incomeSource || (incomeSource === 'dependencia' && !employerName) || !profession || !cuitCuil || !individualIncome || !totalIncome || documentation.length === 0) {
      isFormValid = false;
      validationMessage = "Por favor, completa todos los campos de tu información y sube la documentación requerida.";
    }
    if (isFormValid) {
      for (const [index, earner] of additionalEarners.entries()) {
        if (!earner.fullName || !earner.dni || !earner.cuitCuil || !earner.incomeSource || (earner.incomeSource === 'dependencia' && !earner.employerName) || !earner.income) {
          isFormValid = false;
          validationMessage = `Por favor, completa toda la información de la Persona Adicional ${index + 1}, incluyendo sus ingresos.`;
          break;
        }
      }
    }
    if (!isFormValid) {
      toast({ title: "Formulario incompleto", description: validationMessage, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      // Subir documentos primero (si hay)
      let income_documents = [];
      for (const file of documentation) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'reservations-docs');
        formData.append('table', 'encrypted_files');
        const res = await fetch(`${import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000'}/reservations/upload-document`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        const data = await res.json();
       
        if (data.url && typeof data.url === 'object' && data.url.id) income_documents.push(data.url.id);
       
        else if (typeof data.url === 'number') income_documents.push(data.url);
       
        else if (!isNaN(Number(data.url))) income_documents.push(Number(data.url));
      }
      
      const reservationPayload = {
        property_id: Number(property.id),
        user_id: Number(user.id),
        owner_id: Number(property.owner_id),
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        main_applicant_name: user.name,
        main_applicant_email: user.email,
        main_applicant_phone: user.phone,
        adults_count: 1,
        children_count: 0,
        cohabitants,
        monthly_income: Number(individualIncome),
        total_household_income: Number(totalIncome),
        income_documents,
        additional_documents: [],
        owner_property_title: property.title,
      };
      await reservationsService.create(reservationPayload);
      toast({
        title: "¡Reserva Enviada!",
        description: "Tu solicitud está siendo pre-aprobada. Recibirás una respuesta en un máximo de 48 horas.",
        duration: 7000,
      });
      navigate('/dashboard/inquilino');
    } catch (error) {
      toast({
        title: "Error al crear reserva",
        description: error?.response?.data?.message || error.message || "No se pudo crear la reserva.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-slate-700"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Button onClick={() => navigate(`/propiedad/${propertyId}`)} variant="outline" className="mb-6 text-slate-700 hover:text-slate-900">
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver a la Propiedad
        </Button>
        <Card className="shadow-2xl">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-slate-800">Formulario de Reserva</CardTitle>
              <CardDescription>Estás reservando: <span className="font-semibold text-blue-600">{property?.title}</span></CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-700 flex items-center"><Briefcase className="mr-2 h-5 w-5 text-blue-600"/>Tu Información Profesional y Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="incomeSource">Fuente de Ingresos Principal</Label>
                    <Select onValueChange={setIncomeSource} value={incomeSource}><SelectTrigger id="incomeSource"><SelectValue placeholder="Selecciona una opción" /></SelectTrigger><SelectContent><SelectItem value="dependencia">Relación de Dependencia</SelectItem><SelectItem value="monotributista">Monotributista</SelectItem><SelectItem value="otro">Otro</SelectItem></SelectContent></Select>
                  </div>
                  {incomeSource === 'dependencia' && (<div className="space-y-2"><Label htmlFor="employerName">Nombre de la Empresa/Empleador</Label><Input id="employerName" value={employerName} onChange={(e) => setEmployerName(e.target.value)} placeholder="Ej: Tech Solutions S.A." /></div>)}
                  <div className="space-y-2 md:col-span-2"><Label htmlFor="profession">Profesión o Actividad</Label><Input id="profession" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Ej: Desarrollador de Software" /></div>
                </div>
                <div className="space-y-2"><Label htmlFor="cohabitants">¿Qué personas vivirán en el inmueble?</Label><Textarea id="cohabitants" value={cohabitants} onChange={(e) => setCohabitants(e.target.value)} placeholder="Describe brevemente quiénes vivirán contigo (pareja, hijos, etc.)" /></div>
                <div className="space-y-2"><Label htmlFor="cuitCuil">Tu CUIT/CUIL (solo números)</Label><Input id="cuitCuil" type="number" value={cuitCuil} onChange={(e) => setCuitCuil(e.target.value)} placeholder="Ej: 20123456789" /></div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-700 flex items-center"><DollarSign className="mr-2 h-5 w-5 text-green-600"/>Información de Ingresos del Hogar</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2"><Label htmlFor="incomeSourcesCount">Nº de Personas que Aportan Ingresos</Label><Input id="incomeSourcesCount" type="number" min="1" value={incomeSourcesCount} onChange={(e) => setIncomeSourcesCount(parseInt(e.target.value) || 1)} /></div>
                  <div className="space-y-2"><Label htmlFor="individualIncome">Tus Ingresos Mensuales (ARS)</Label><Input id="individualIncome" type="number" value={individualIncome} onChange={(e) => setIndividualIncome(e.target.value)} placeholder="Ej: 150000" /></div>
                  <div className="space-y-2"><Label htmlFor="totalIncome">Ingresos Totales del Hogar (ARS)</Label><Input id="totalIncome" type="number" value={totalIncome} onChange={(e) => setTotalIncome(e.target.value)} placeholder="Ej: 250000" /></div>
                </div>
              </div>

              {incomeSourcesCount > 1 && (
                <div className="space-y-6 pt-6 border-t"><h3 className="text-xl font-semibold text-slate-700 flex items-center"><Users className="mr-2 h-5 w-5 text-purple-600"/>Información de Co-solicitantes</h3>
                  {additionalEarners.map((earner, index) => (
                    <Card key={index} className="p-4 bg-slate-50 border-slate-200"><CardHeader className="p-2 pb-4"><CardTitle className="text-lg text-slate-800">Persona Adicional {index + 1}</CardTitle></CardHeader>
                      <CardContent className="space-y-4 p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2"><Label htmlFor={`earnerName-${index}`}>Nombre Completo</Label><Input id={`earnerName-${index}`} value={earner.fullName} onChange={(e) => handleAdditionalEarnerChange(index, 'fullName', e.target.value)} placeholder="Nombre y Apellido"/></div>
                          <div className="space-y-2"><Label htmlFor={`earnerDNI-${index}`}>DNI</Label><Input id={`earnerDNI-${index}`} type="number" value={earner.dni} onChange={(e) => handleAdditionalEarnerChange(index, 'dni', e.target.value)} placeholder="Número de Documento"/></div>
                          <div className="space-y-2"><Label htmlFor={`earnerCuit-${index}`}>CUIT/CUIL</Label><Input id={`earnerCuit-${index}`} type="number" value={earner.cuitCuil} onChange={(e) => handleAdditionalEarnerChange(index, 'cuitCuil', e.target.value)} placeholder="Solo números"/></div>
                          <div className="space-y-2"><Label htmlFor={`earnerIncomeSource-${index}`}>Fuente de Ingresos</Label><Select value={earner.incomeSource} onValueChange={(value) => handleAdditionalEarnerChange(index, 'incomeSource', value)}><SelectTrigger id={`earnerIncomeSource-${index}`}><SelectValue placeholder="Seleccionar..."/></SelectTrigger><SelectContent><SelectItem value="dependencia">Relación de Dependencia</SelectItem><SelectItem value="monotributista">Monotributista</SelectItem><SelectItem value="otro">Otro</SelectItem></SelectContent></Select></div>
                        </div>
                        {earner.incomeSource === 'dependencia' && (<div className="space-y-2 pt-2"><Label htmlFor={`earnerEmployerName-${index}`}>Nombre de la Empresa/Empleador</Label><Input id={`earnerEmployerName-${index}`} value={earner.employerName} onChange={(e) => handleAdditionalEarnerChange(index, 'employerName', e.target.value)} placeholder="Ej: Tech Solutions S.A."/></div>)}
                        <div className="space-y-2 pt-2">
                          <Label htmlFor={`earnerIncome-${index}`}>Ingresos Mensuales (ARS)</Label>
                          <Input id={`earnerIncome-${index}`} type="number" value={earner.income} onChange={(e) => handleAdditionalEarnerChange(index, 'income', e.target.value)} placeholder="Ej: 120000"/>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-700 flex items-center"><FileText className="mr-2 h-5 w-5 text-red-600"/>Documentación de Respaldo</h3>
                <p className="text-sm text-slate-500">Sube tus últimos 3 recibos de sueldo, constancias de monotributo, etc. Si hay más de un ingreso, adjunta la documentación de cada persona.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {docPreviews.map((doc, index) => (<div key={index} className="relative group p-2 border rounded-md bg-slate-50 flex items-center justify-between"><FileText className="h-6 w-6 text-slate-500 mr-2" /><span className="text-sm text-slate-700 truncate" title={doc.name}>{doc.name}</span><Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500 opacity-50 group-hover:opacity-100" onClick={() => removeDoc(index)}><Trash2 className="h-4 w-4" /></Button></div>))}
                  {documentation.length < 5 && (<Label htmlFor="doc-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-md cursor-pointer hover:border-blue-400 transition-colors p-4 text-center"><UploadCloud className="h-8 w-8 text-slate-400 mb-1" /><span className="text-sm text-slate-500">Subir Documentos</span></Label>)}
                </div>
                <Input id="doc-upload" type="file" multiple onChange={handleDocChange} className="hidden" />
                {documentation.length > 0 && <p className="text-xs text-slate-500">{documentation.length} de 5 documentos seleccionados.</p>}
              </div>

            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={submitting}>
                <Send className="mr-2 h-4 w-4" /> {submitting ? 'Enviando...' : 'Enviar Reserva'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ReservationPage;