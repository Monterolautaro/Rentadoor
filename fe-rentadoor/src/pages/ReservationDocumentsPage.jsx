import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Eye, Download, FileText, Shield, ArrowLeft } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const ReservationDocumentsPage = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('');

  useEffect(() => {
    const loadReservation = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';
        const res = await fetch(`${API_URL}/reservations/${reservationId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('No se pudo obtener la reserva');
        const data = await res.json();
        // Validar acceso: owner o admin
        if (user.role === 'admin' || data.owner_id === user.id) {
          setReservation(data);
        } else {
          toast({ title: 'Acceso denegado', description: 'No tienes acceso a esta reserva.', variant: 'destructive' });
          navigate(-1);
        }
      } catch (error) {
        toast({ title: 'Error', description: 'No se pudo cargar la reserva.', variant: 'destructive' });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    if (user && reservationId) loadReservation();
  }, [user, reservationId, toast, navigate]);

  const handlePreview = async (fileId) => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/storage/download/${fileId}?bucket=reservations-docs`, { credentials: 'include' });
      if (!res.ok) throw new Error('No se pudo descargar el archivo');
      const { fileName, base64 } = await res.json();
      let type = 'image';
      if (fileName.endsWith('.pdf')) type = 'pdf';
      setPreviewType(type);
      setPreviewUrl(`data:${type === 'pdf' ? 'application/pdf' : 'image/*'};base64,${base64}`);
      setShowPreview(true);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo previsualizar el archivo.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId) => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/storage/download/${fileId}?bucket=reservations-docs`, { credentials: 'include' });
      if (!res.ok) throw new Error('No se pudo descargar el archivo');
      const { fileName, base64 } = await res.json();
      const link = document.createElement('a');
      link.href = `data:application/octet-stream;base64,${base64}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo descargar el archivo.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !reservation) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  const documents = [
    ...(reservation.income_documents || []),
    ...(reservation.additional_documents || [])
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <Card className="shadow-xl border border-slate-200">
          <CardHeader className="flex flex-col gap-2 items-start">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" /> Documentos de la Reserva
            </CardTitle>
            <Badge className="bg-blue-100 text-blue-800">Reserva #{reservation.id}</Badge>
            <div className="text-slate-600 text-sm">Propiedad: <span className="font-semibold">{reservation.property_title || reservation.property_id}</span></div>
            <div className="text-slate-600 text-sm">Inquilino: <span className="font-semibold">{reservation.main_applicant_name}</span></div>
            <div className="text-slate-600 text-xs flex items-center gap-1 mt-2"><Shield className="h-4 w-4 text-yellow-500" /> <span>Documentos confidenciales. Solo para uso de validación.</span></div>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center text-slate-500 py-8">No hay documentos subidos para esta reserva.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {documents.map((fileId, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-100 rounded-lg px-4 py-3 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="text-slate-800 text-sm font-medium">Archivo {i + 1}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handlePreview(fileId)}>
                        <Eye className="w-4 h-4 mr-1" /> Ver
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDownload(fileId)}>
                        <Download className="w-4 h-4 mr-1" /> Descargar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          {previewType === 'image' ? (
            <img src={previewUrl} alt="Documento" className="w-full h-auto rounded-lg border border-slate-200" />
          ) : previewType === 'pdf' ? (
            <iframe src={previewUrl} title="Documento PDF" className="w-full h-[70vh] rounded-lg border border-slate-200" />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReservationDocumentsPage; 