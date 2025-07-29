import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, CheckCircle, XCircle, ChevronLeft } from 'lucide-react';
import { paymentsService } from '@/services/paymentsService';
import ImageZoomModal from '@/components/ImageZoomModal';

const paymentTypes = [
  { key: 'primer_mes', label: 'Primer mes' },
  { key: 'mes_deposito', label: 'Mes de depósito' },
  { key: 'deposito', label: 'Depósito' },
];

const AdminPaymentsReviewPage = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalStatus, setGlobalStatus] = useState('pendiente');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    if (reservationId) fetchPayments();
    // eslint-disable-next-line
  }, [reservationId]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentsService.getPaymentsByReservation(reservationId);
      setPayments(data || []);
      if (Array.isArray(data) && data.length > 0) {
        setGlobalStatus(data[0].status || 'pendiente');
      } else {
        setGlobalStatus('pendiente');
      }
    } catch {
      setPayments([]);
      setGlobalStatus('pendiente');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = async (fileUrl) => {
    if (!fileUrl) return;
    // Si la URL es relativa, agregar el dominio del backend
    const isAbsolute = fileUrl.startsWith('http');
    const url = isAbsolute ? fileUrl : `${import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000'}/storage/public/payments/${fileUrl}`;
    setSelectedImage(url);
    setShowImageModal(true);
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      await paymentsService.approvePayment(reservationId);
      await fetchPayments();
    } catch (err) {
      alert('Error aprobando el pago');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await paymentsService.rejectPayment(reservationId);
      await fetchPayments();
    } catch (err) {
      alert('Error rechazando el pago');
    } finally {
      setRejecting(false);
    }
  };

  const statusColor = {
    aprobado: 'text-green-600',
    pendiente: 'text-yellow-600',
    rechazado: 'text-red-600',
  };

  const getPaymentForType = (type) => payments.find((p) => p.type === type) || {};

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Button variant="ghost" className="mb-2 flex items-center gap-2" onClick={() => navigate(-1)}>
        <ChevronLeft className="h-5 w-5" /> Volver
      </Button>
      <h1 className="text-3xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <Eye className="h-7 w-7 text-blue-600" /> Revisión de Pagos de Reserva
      </h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            Estado:
            {globalStatus === 'aprobado' && <CheckCircle className="h-6 w-6 text-green-600" />}
            {globalStatus === 'rechazado' && <XCircle className="h-6 w-6 text-red-600" />}
            <span className={`font-bold text-lg ${statusColor[globalStatus]}`}>{globalStatus.charAt(0).toUpperCase() + globalStatus.slice(1)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {paymentTypes.map((pt) => {
              const payment = getPaymentForType(pt.key);
              return (
                <div key={pt.key} className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                  <div>
                    <div className="text-lg font-semibold text-slate-700">{pt.label}</div>
                    <div className="text-xs text-slate-500 mb-1">Estado: <span className={`font-bold ${statusColor[payment.status || 'pendiente']}`}>{payment.status || 'pendiente'}</span></div>
                    {payment.file_url ? (
                      <Button size="sm" variant="outline" onClick={() => handleViewFile(payment.file_url)}>
                        <Eye className="mr-2 h-4 w-4" /> Ver comprobante
                      </Button>
                    ) : (
                      <span className="text-slate-400 text-sm">Pendiente</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-8 justify-center">
            <Button className="bg-green-600 hover:bg-green-500" onClick={handleApprove} disabled={globalStatus === 'aprobado' || approving}>
              <CheckCircle className="mr-2 h-5 w-5" /> Aprobar pagos
            </Button>
            <Button className="bg-red-600 hover:bg-red-500" onClick={handleReject} disabled={globalStatus === 'rechazado' || rejecting}>
              <XCircle className="mr-2 h-5 w-5" /> Rechazar pagos
            </Button>
          </div>
        </CardContent>
      </Card>
      {showImageModal && selectedImage && (
        <ImageZoomModal imageSrc={selectedImage} onClose={() => setShowImageModal(false)} />
      )}
    </div>
  );
};

export default AdminPaymentsReviewPage; 