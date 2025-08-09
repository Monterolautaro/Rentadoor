import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Briefcase, Users, DollarSign, Calendar, Mail, Phone, Hash } from 'lucide-react';
import { reservationsService } from '@/services/reservationsService';

const ReservationDetailsModal = ({ reservation, property }) => {
  const [coEarners, setCoEarners] = useState([]);
  const [coEarnersLoaded, setCoEarnersLoaded] = useState(false);

  if (!reservation) return null;

  const handleOpen = async () => {
    if (!coEarnersLoaded && reservation.id) {
      try {
        const data = await reservationsService.getCoEarners(reservation.id);
        setCoEarners(data);
        setCoEarnersLoaded(true);
      } catch (e) {
        setCoEarners([]);
        setCoEarnersLoaded(true);
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild onClick={handleOpen}>
        <Button variant="outline" size="sm">
          <User className="mr-2 h-4 w-4" /> Ver Detalles
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalles de la Reserva</DialogTitle>
          <DialogDescription>
            Información profesional y personal del postulante para la propiedad: <span className="font-semibold">{reservation.owner_property_title || reservation.property_title || reservation.propertyId}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 flex items-center"><User className="mr-2 h-5 w-5 text-blue-600"/>Postulante Principal</h3>
            <div className="grid grid-cols-2 gap-4 text-sm p-4 bg-slate-50 rounded-md">
              <div><p className="font-medium text-slate-500">Nombre</p><p>{reservation.main_applicant_name || '-'}</p></div>
              <div><p className="font-medium text-slate-500">Email</p><p>{reservation.main_applicant_email || '-'}</p></div>
              <div><p className="font-medium text-slate-500">Teléfono</p><p>{reservation.main_applicant_phone || '-'}</p></div>
              <div><p className="font-medium text-slate-500">Adultos</p><p>{reservation.adults_count ?? '-'}</p></div>
              <div><p className="font-medium text-slate-500">Niños</p><p>{reservation.children_count ?? '-'}</p></div>
              <div className="col-span-2"><p className="font-medium text-slate-500">Personas que vivirán en el inmueble</p><p>{reservation.cohabitants || '-'}</p></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 flex items-center"><Briefcase className="mr-2 h-5 w-5 text-blue-600"/>Información Profesional</h3>
            <div className="grid grid-cols-2 gap-4 text-sm p-4 bg-slate-50 rounded-md">
              <div><p className="font-medium text-slate-500">Fuente de Ingresos Principal</p><p>{reservation.income_source || '-'}</p></div>
              <div><p className="font-medium text-slate-500">Profesión o Actividad</p><p>{reservation.profession || '-'}</p></div>
              <div><p className="font-medium text-slate-500">Nombre de la Empresa/Empleador</p><p>{reservation.employer_name || '-'}</p></div>
              <div><p className="font-medium text-slate-500">CUIT/CUIL</p><p>{reservation.cuit_cuil || '-'}</p></div>
              <div><p className="font-medium text-slate-500">Ingresos Mensuales</p><p>${reservation.monthly_income?.toLocaleString('es-AR') || '-'}</p></div>
              <div><p className="font-medium text-slate-500">Ingresos Totales del Hogar</p><p>${reservation.total_household_income?.toLocaleString('es-AR') || '-'}</p></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 flex items-center"><Calendar className="mr-2 h-5 w-5 text-green-600"/>Período de Contrato</h3>
            <div className="grid grid-cols-2 gap-4 text-sm p-4 bg-slate-50 rounded-md">
              <div className="col-span-2"><p className="font-medium text-slate-500">Duración</p><p>{property && property.rental_period ? `${property.rental_period} meses` : 'N/A'}</p></div>
            </div>
          </div>

          {coEarners && coEarners.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center"><Users className="mr-2 h-5 w-5 text-purple-600"/>Co-solicitantes</h3>
              {coEarners.map((earner, idx) => (
                <div key={earner.id || idx} className="grid grid-cols-2 gap-4 text-sm p-4 bg-slate-50 rounded-md border border-purple-100">
                  <div><p className="font-medium text-slate-500">Nombre Completo</p><p>{earner.full_name || '-'}</p></div>
                  <div><p className="font-medium text-slate-500">DNI</p><p>{earner.dni || '-'}</p></div>
                  <div><p className="font-medium text-slate-500">CUIT/CUIL</p><p>{earner.cuit_cuil || '-'}</p></div>
                  <div><p className="font-medium text-slate-500">Fuente de Ingresos</p><p>{earner.income_source || '-'}</p></div>
                  <div><p className="font-medium text-slate-500">Nombre de la Empresa/Empleador</p><p>{earner.employer_name || '-'}</p></div>
                  <div><p className="font-medium text-slate-500">Ingresos Mensuales</p><p>{earner.income_amount ? `$${Number(earner.income_amount).toLocaleString('es-AR')}` : '-'}</p></div>
                </div>
              ))}
            </div>
          )}
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