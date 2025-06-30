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
import { ChevronLeft, Banknote, Landmark, Home, Clock } from 'lucide-react';

const ReceivePaymentPage = () => {
  const { rentalId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [rental, setRental] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cbu, setCbu] = useState('');
  const [address, setAddress] = useState('');
  const [timeRange, setTimeRange] = useState('');

  useEffect(() => {
    const allRentals = JSON.parse(localStorage.getItem('rentals_rentadoor')) || [];
    const foundRental = allRentals.find(r => r.id === rentalId);
    if (foundRental) {
      setRental(foundRental);
    } else {
      toast({ title: "Error", description: "No se encontró el alquiler.", variant: "destructive" });
      navigate('/dashboard/propietario');
    }
  }, [rentalId, navigate, toast]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paymentMethod || (paymentMethod === 'transfer' && !cbu) || (paymentMethod === 'cash' && (!address || !timeRange))) {
      toast({ title: "Formulario incompleto", description: "Por favor, completa todos los campos requeridos.", variant: "destructive" });
      return;
    }

    const allRentals = JSON.parse(localStorage.getItem('rentals_rentadoor')) || [];
    const rentalIndex = allRentals.findIndex(r => r.id === rentalId);
    if (rentalIndex !== -1) {
      allRentals[rentalIndex].paymentReceived = true;
      allRentals[rentalIndex].payoutInfo = {
        method: paymentMethod,
        cbu: paymentMethod === 'transfer' ? cbu : undefined,
        address: paymentMethod === 'cash' ? address : undefined,
        timeRange: paymentMethod === 'cash' ? timeRange : undefined,
      };
      localStorage.setItem('rentals_rentadoor', JSON.stringify(allRentals));
      toast({
        title: "¡Información Enviada!",
        description: "Hemos recibido tus datos. El pago se procesará en las próximas 72 horas hábiles.",
      });
      navigate('/dashboard/propietario');
    }
  };

  if (!rental) return null;

  const initialPayment = rental.payments.find(p => p.type === 'Pago Inicial');

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Button onClick={() => navigate('/dashboard/propietario')} variant="outline" className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver al Panel
        </Button>
        <Card className="shadow-2xl">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-slate-800">Recibir Pago Inicial</CardTitle>
              <CardDescription>
                Propiedad: <span className="font-semibold text-blue-600">{rental.propertyTitle}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-700">Monto a Recibir</h3>
                <p className="text-2xl font-bold text-green-600">
                  {rental.currency === 'USD' ? 'U$S' : '$'}{(initialPayment.amount * 0.95).toLocaleString('es-AR')}
                </p>
                <p className="text-sm text-slate-500">
                  (Total: {rental.currency === 'USD' ? 'U$S' : '$'}{initialPayment.amount.toLocaleString('es-AR')} - 5% comisión Rentadoor)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Método de Cobro</Label>
                <Select onValueChange={setPaymentMethod} value={paymentMethod}>
                  <SelectTrigger id="paymentMethod"><SelectValue placeholder="Selecciona cómo quieres recibir el pago" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">Transferencia Bancaria (CBU/CVU)</SelectItem>
                    <SelectItem value="cash">Efectivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === 'transfer' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                  <Label htmlFor="cbu"><Landmark className="inline mr-2 h-4 w-4"/>CBU o CVU</Label>
                  <Input id="cbu" value={cbu} onChange={(e) => setCbu(e.target.value)} placeholder="Ingresa tu CBU/CVU de 22 dígitos" />
                </motion.div>
              )}

              {paymentMethod === 'cash' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address"><Home className="inline mr-2 h-4 w-4"/>Dirección de Entrega</Label>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, Número, Piso, Depto" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeRange"><Clock className="inline mr-2 h-4 w-4"/>Rango Horario</Label>
                    <Input id="timeRange" value={timeRange} onChange={(e) => setTimeRange(e.target.value)} placeholder="Ej: Lunes a Viernes de 9 a 18hs" />
                  </div>
                  <p className="text-xs text-amber-700 bg-amber-100 p-2 rounded-md">Nota: El envío de pago en efectivo tiene un costo adicional que se descontará del total a recibir.</p>
                </motion.div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={!paymentMethod}>
                <Banknote className="mr-2 h-4 w-4" /> Confirmar y Recibir Pago
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ReceivePaymentPage;