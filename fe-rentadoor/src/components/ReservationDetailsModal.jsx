import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Briefcase, Users, FileText, DollarSign, Building, Hash, Mail } from 'lucide-react';

const ReservationDetailsModal = ({ reservation }) => {
  if (!reservation || !reservation.application) {
    return null;
  }

  const { application, userName } = reservation;
  const {
    incomeSource,
    employerName,
    profession,
    cohabitants,
    cuitCuil,
    incomeSourcesCount,
    individualIncome,
    totalIncome,
    documentation,
    additionalEarners
  } = application;

  const incomeSourceText = {
    dependencia: 'Relación de Dependencia',
    monotributista: 'Monotributista',
    otro: 'Otro'
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><User className="mr-2 h-4 w-4" /> Ver Postulación</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalles de la Postulación</DialogTitle>
          <DialogDescription>
            Información del postulante para la propiedad: <span className="font-semibold">{reservation.propertyTitle}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 flex items-center"><User className="mr-2 h-5 w-5 text-blue-600"/>Postulante Principal: {userName}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm p-4 bg-slate-50 rounded-md">
              <div><p className="font-medium text-slate-500">Fuente de Ingresos</p><p>{incomeSourceText[incomeSource]}</p></div>
              {employerName && <div><p className="font-medium text-slate-500">Empleador</p><p>{employerName}</p></div>}
              <div><p className="font-medium text-slate-500">Profesión/Actividad</p><p>{profession}</p></div>
              <div><p className="font-medium text-slate-500">CUIT/CUIL</p><p>{cuitCuil}</p></div>
              <div><p className="font-medium text-slate-500">Ingresos Individuales</p><p>${(individualIncome || 0).toLocaleString('es-AR')}</p></div>
              <div><p className="font-medium text-slate-500">Ingresos Totales del Hogar</p><p>${(totalIncome || 0).toLocaleString('es-AR')}</p></div>
              <div className="col-span-2"><p className="font-medium text-slate-500">Personas que vivirán en el inmueble</p><p>{cohabitants}</p></div>
            </div>
          </div>

          {additionalEarners && additionalEarners.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center"><Users className="mr-2 h-5 w-5 text-purple-600"/>Co-solicitantes ({additionalEarners.length})</h3>
              {additionalEarners.map((earner, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-md space-y-2">
                  <p className="font-semibold text-md text-slate-800">Persona Adicional {index + 1}: {earner.fullName}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="font-medium text-slate-500">DNI</p><p>{earner.dni}</p></div>
                    <div><p className="font-medium text-slate-500">CUIT/CUIL</p><p>{earner.cuitCuil}</p></div>
                    <div><p className="font-medium text-slate-500">Fuente de Ingresos</p><p>{incomeSourceText[earner.incomeSource]}</p></div>
                    {earner.employerName && <div><p className="font-medium text-slate-500">Empleador</p><p>{earner.employerName}</p></div>}
                    <div><p className="font-medium text-slate-500">Ingresos</p><p>${(earner.income || 0).toLocaleString('es-AR')}</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-700 flex items-center"><FileText className="mr-2 h-5 w-5 text-red-600"/>Documentación Adjunta</h3>
            <ul className="list-disc list-inside text-sm text-slate-600">
              {documentation && documentation.length > 0 ? (
                documentation.map((doc, index) => <li key={index}>{doc}</li>)
              ) : (
                <li>No se adjuntó documentación.</li>
              )}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationDetailsModal;