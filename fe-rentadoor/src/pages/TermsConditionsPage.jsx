import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ChevronLeft } from 'lucide-react';

const TermsConditionsPage = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <Button variant="ghost" className="mb-4 flex items-center gap-2" onClick={() => navigate(-1)}>
        <ChevronLeft className="h-5 w-5" /> Volver
      </Button>
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2">
          <FileText className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Términos y Condiciones</h1>
          <p className="text-sm text-slate-500">Última actualización: 15 de agosto de 2025</p>
        </div>
      </div>
      <Card className="shadow-lg border-slate-200">
        <CardContent className="p-6 md:p-8">
          <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-blue-600">
            <h2>1. Aceptación</h2>
            <p>Al utilizar la plataforma Rentadoor, el usuario acepta los presentes Términos y Condiciones.</p>
            <hr />
            <h2
            style={{marginTop: '20px'}}>2. Objeto del servicio</h2>
            <p>Rentadoor es un marketplace de alquiler de inmuebles a largo plazo que actúa como intermediario y parte de los contratos, ofreciendo garantía de pago al propietario.</p>
            <hr />
            <h2
            style={{marginTop: '20px'}}>3. Requisitos de uso</h2>
            <p>Ser mayor de 18 años, proporcionar datos verídicos y aceptar la consulta de historial crediticio.</p>
            <hr />
            <h2
            style={{marginTop: '20px'}}>4. Comisiones y pagos</h2>
            <p>Comisión inicial de un mes de alquiler y fee mensual del 5% sobre el valor del alquiler, pagados por el inquilino, en pesos o dólares.</p>
            <hr />
            <h2
            style={{marginTop: '20px'}}>5. Reembolsos y cancelaciones</h2>
            <p>Reembolso si la operación no se concreta, descontando comisiones bancarias. Una vez iniciado el contrato, no hay reembolso de comisiones ni fees.</p>
            <hr />
            <h2
            style={{marginTop: '20px'}}>6. Responsabilidad</h2>
            <p>Rentadoor no es propietario de los inmuebles y no garantiza su estado físico, salvo lo estipulado en el contrato de garantía.</p>
            <hr />
            <h2
            style={{marginTop: '20px'}}>7. Resolución de conflictos</h2>
            <p>Las disputas se resolverán según el contrato de alquiler, actuando Rentadoor como árbitro imparcial.</p>
            <hr />
            <h2
            style={{marginTop: '20px'}}>8. Prohibiciones</h2>
            <p>Prohibido proporcionar información falsa, realizar actividades ilegales o eludir pagos a Rentadoor.</p>
            <hr />
            <h2
            style={{marginTop: '20px'}}>9. Jurisdicción</h2>
            <p>Se aplican las leyes de la República Argentina y la jurisdicción de los tribunales de CABA.</p>
            <hr />
            <h2
            style={{marginTop: '20px'}}>10. Contacto</h2>
            <p>Email: <strong>rentadoor.arg@gmail.com</strong> — WhatsApp: disponible en la plataforma.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsConditionsPage;


