import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, Wallet, UploadCloud, FileText, Trash2, Copy, Check } from 'lucide-react';

const InitialPaymentPage = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [copied, setCopied] = useState(false);

  const rentadorCBU = "0000003100055555555555";

  useEffect(() => {
    const allReservations = JSON.parse(localStorage.getItem('reservations_rentadoor')) || [];
    const foundReservation = allReservations.find(r => r.id === reservationId);

    if (foundReservation) {
      setReservation(foundReservation);
    } else {
      toast({
        title: "Reserva no encontrada",
        description: "No se pudo cargar la información de la reserva.",
        variant: "destructive",
      });
      navigate('/dashboard/inquilino');
    }
    setLoading(false);
  }, [reservationId, navigate, toast]);

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentReceipt(file);
      setReceiptPreview({ name: file.name });
    }
    e.target.value = null;
  };

  const removeReceipt = () => {
    setPaymentReceipt(null);
    setReceiptPreview(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rentadorCBU).then(() => {
      setCopied(true);
      toast({ title: "CBU Copiado", description: "El CBU ha sido copiado al portapapeles." });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paymentReceipt) {
      toast({ title: "Falta el comprobante", description: "Por favor, sube el comprobante de pago.", variant: "destructive" });
      return;
    }

    const allReservations = JSON.parse(localStorage.getItem('reservations_rentadoor')) || [];
    const reservationIndex = allReservations.findIndex(r => r.id === reservationId);

    if (reservationIndex !== -1) {
      allReservations[reservationIndex].paymentStatus = 'Pendiente de Aprobación';
      allReservations[reservationIndex].paymentReceipt = receiptPreview.name;
      
      setTimeout(() => {
        const currentReservations = JSON.parse(localStorage.getItem('reservations_rentadoor')) || [];
        const currentIndex = currentReservations.findIndex(r => r.id === reservationId);
        if (currentIndex !== -1) {
          currentReservations[currentIndex].paymentStatus = 'Aprobado';
          localStorage.setItem('reservations_rentadoor', JSON.stringify(currentReservations));
          window.dispatchEvent(new Event('storage'));
        }
      }, 5000);

      localStorage.setItem('reservations_rentadoor', JSON.stringify(allReservations));
      window.dispatchEvent(new Event('storage'));
      
      toast({
        title: "¡Comprobante Enviado!",
        description: "Tu pago está pendiente de aprobación. Recibirás una notificación en máximo 24 horas.",
        duration: 7000,
      });
      navigate('/dashboard/inquilino');
    }
  };

  if (loading || !reservation) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-slate-700"></div></div>;
  }

  const rent = reservation.propertyPrice || 0;
  const deposit = rent;
  const commission = rent;
  const total = rent + deposit + commission;
  const currencySymbol = reservation.propertyCurrency === 'USD' ? 'U$S' : '$';

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Button onClick={() => navigate('/dashboard/inquilino')} variant="outline" className="mb-6 text-slate-700 hover:text-slate-900">
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver al Panel
        </Button>
        <Card className="shadow-2xl">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-slate-800">Pago Inicial de Reserva</CardTitle>
              <CardDescription>Para la propiedad: <span className="font-semibold text-blue-600">{reservation.propertyTitle}</span></CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Detalle del Pago</h3>
                <ul className="space-y-2 text-slate-600 border p-4 rounded-md bg-slate-50">
                  <li className="flex justify-between"><span>1 Mes de Alquiler Adelantado:</span> <span className="font-medium">{currencySymbol}{rent.toLocaleString('es-AR')}</span></li>
                  <li className="flex justify-between"><span>1 Mes de Depósito:</span> <span className="font-medium">{currencySymbol}{deposit.toLocaleString('es-AR')}</span></li>
                  <li className="flex justify-between"><span>Comisión Inmobiliaria:</span> <span className="font-medium">{currencySymbol}{commission.toLocaleString('es-AR')}</span></li>
                  <li className="flex justify-between border-t pt-2 mt-2 font-bold text-slate-800 text-lg"><span>Total a Pagar:</span> <span>{currencySymbol}{total.toLocaleString('es-AR')}</span></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Datos para la Transferencia</h3>
                <div className="border p-4 rounded-md bg-slate-50 space-y-2">
                  <p className="text-sm text-slate-600">Realiza la transferencia a la siguiente cuenta:</p>
                  <p><span className="font-semibold">Beneficiario:</span> Rentadoor S.A.</p>
                  <div className="flex items-center justify-between">
                    <p><span className="font-semibold">CBU:</span> {rentadorCBU}</p>
                    <Button type="button" variant="ghost" size="icon" onClick={copyToClipboard} className="h-8 w-8">
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Adjuntar Comprobante de Pago</h3>
                {receiptPreview ? (
                  <div className="relative group p-2 border rounded-md bg-slate-50 flex items-center justify-between">
                    <FileText className="h-6 w-6 text-slate-500 mr-2" />
                    <span className="text-sm text-slate-700 truncate" title={receiptPreview.name}>{receiptPreview.name}</span>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500 opacity-50 group-hover:opacity-100" onClick={removeReceipt}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Label htmlFor="receipt-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-md cursor-pointer hover:border-blue-400 transition-colors p-6 text-center">
                    <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">Haz clic para subir tu comprobante</span>
                    <span className="text-xs text-slate-400 mt-1">PDF, JPG, PNG</span>
                  </Label>
                )}
                <Input id="receipt-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleReceiptChange} className="hidden" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">
                <Wallet className="mr-2 h-4 w-4" /> Enviar Comprobante de Pago
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default InitialPaymentPage;