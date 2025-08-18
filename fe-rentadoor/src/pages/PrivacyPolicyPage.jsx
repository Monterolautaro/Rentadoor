import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ChevronLeft } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <Button variant="ghost" className="mb-4 flex items-center gap-2" onClick={() => navigate(-1)}>
        <ChevronLeft className="h-5 w-5" /> Volver
      </Button>
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Política de Privacidad</h1>
          <p className="text-sm text-slate-500">Última actualización: 15 de agosto de 2025</p>
        </div>
      </div>
      <Card className="shadow-lg border-slate-200">
        <CardContent className="p-6 md:p-8">
          <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-blue-600">
            <h2 id="identidad">1. Identidad y domicilio del responsable</h2>
            <ul>
              <li><strong>Razón social</strong>: Rentadoor SAS</li>
              <li><strong>CUIT</strong>: 30-71905922-4</li>
              <li><strong>Domicilio legal</strong>: Combate de los Pozos 758, Piso 2, Depto. 2C, Ciudad Autónoma de Buenos Aires, Argentina</li>
              <li><strong>Correo de contacto</strong>: rentadoor.arg@gmail.com</li>
            </ul>
            <hr />
            <h2
            style={{marginTop: '20px'}}
            id="informacion">2. Información que recopilamos</h2>
            <p>Recopilamos: nombre completo, DNI, teléfono, correo electrónico, domicilio, datos de cuenta bancaria (solo propietarios), historial crediticio (Veraz), documentación de ingresos, dirección IP, cookies y datos técnicos.</p>
            <hr />
            <h2
            style={{marginTop: '20px'}}
            id="recoleccion">3. Forma de recolección</h2>
            <p>Los datos se obtienen mediante registro manual, formularios web y consultas manuales a Veraz cuando un usuario intenta reservar una propiedad.</p>
            <hr />
            <h2
            style={{marginTop: '20px'}} id="finalidad">4. Finalidad del tratamiento</h2>
            <p>Verificación de identidad, procesamiento de pagos, análisis crediticio, gestión de reservas y contratos, cumplimiento legal y envío de comunicaciones relacionadas al servicio.</p>
            <hr />
            <h2
            style={{marginTop: '20px'}} id="base-legal">5. Base legal para el tratamiento</h2>
            <p>El tratamiento se realiza conforme a la Ley 25.326 con el consentimiento del usuario y para la ejecución de obligaciones contractuales.</p>
            <hr />
            <h2
            style={{marginTop: '20px'}} id="terceros">6. Compartición de datos con terceros</h2>
            <p>Compartimos datos solo con procesadores de pago, Veraz y propietarios de inmuebles. No vendemos datos a terceros ajenos al servicio.</p>
            <hr />
            <h2
            style={{marginTop: '20px'}} id="seguridad">7. Almacenamiento y seguridad</h2>
            <p>Los datos se almacenan en servidores seguros de Supabase con medidas de seguridad técnicas y organizativas.</p>
            <hr />
            <h2
            style={{marginTop: '20px'}} id="plazo">8. Plazo de conservación</h2>
            <p>Conservaremos los datos por 10 años desde la última actividad, salvo solicitud de eliminación previa.</p>
            <hr />
            <h2
            style={{marginTop: '20px'}} id="derechos">9. Derechos del usuario</h2>
            <p>Usted puede acceder, rectificar, eliminar sus datos o revocar su consentimiento escribiendo a <strong>rentadoor.arg@gmail.com</strong>.</p>
            <hr />
            <h2
            style={{marginTop: '20px'}} id="menores">10. Menores de edad</h2>
            <p>El uso de la plataforma está limitado a mayores de 18 años.</p>
            <hr />
            <h2
            style={{marginTop: '20px'}} id="modificaciones">11. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar esta política. Los cambios serán publicados en nuestro sitio web.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicyPage;


