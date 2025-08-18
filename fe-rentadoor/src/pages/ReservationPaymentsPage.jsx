import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, PenTool, CheckCircle, XCircle, ChevronLeft, X, Trash2, Copy } from 'lucide-react';
import { paymentsService } from '@/services/paymentsService';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import ImageZoomModal from '@/components/ImageZoomModal';
import HigherImage from '@/components/HigherImage';

const paymentTypes = [
  { key: 'primer_mes', label: 'Primer mes' },
  { key: 'mes_deposito', label: 'Mes de depósito' },
  { key: 'deposito', label: 'Mes de comisión' },
];

const ReservationPaymentsPage = () => {
  const { reservationId } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({});
  const [globalStatus, setGlobalStatus] = useState('pendiente');
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState(null);
  const [modalFileType, setModalFileType] = useState('image');
  const [modalObjectUrl, setModalObjectUrl] = useState(null);
  const RENTADOOR_CVU = '1430001725044293310018';
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (reservationId) {
      fetchPayments();
    }
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
    } catch (err) {
      setPayments([]);
      setGlobalStatus('pendiente');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (type) => {
    const payment = getPaymentForType(type);
    if (payment.file_url) {
      alert('Ya has subido un comprobante para este tipo. Elimina el anterior o espera revisión.');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading((prev) => ({ ...prev, [type]: true }));
      try {
        await paymentsService.uploadPayment({
          file,
          reservationId,
          userId: user?.id,
          type,
        });
        await fetchPayments();
      } catch (err) {
        alert('Error subiendo comprobante');
      } finally {
        setUploading((prev) => ({ ...prev, [type]: false }));
      }
    };
    input.click();
  };

  const handleDelete = async (paymentId) => {
    if (!window.confirm('¿Seguro que quieres eliminar este comprobante?')) return;
    try {
      await paymentsService.deletePayment(paymentId);
      await fetchPayments();
    } catch (err) {
      alert('Error eliminando comprobante');
    }
  };

  const handleViewFile = async (fileUrl) => {
    if (!fileUrl) return;
    
    const cleanFileUrl = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    const url = `${import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000'}/storage/payments/${cleanFileUrl}`;
    if (url.endsWith('.pdf')) {
      setModalFileType('pdf');
    } else {
      setModalFileType('image');
    }
    // Fetch con credenciales y crear object URL
    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('No se pudo cargar el comprobante');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setModalObjectUrl(objectUrl);
      setShowImageModal(true);
    } catch {
      alert('No se pudo cargar el comprobante');
    }
  };

  const handleCloseModal = () => {
    if (modalObjectUrl) URL.revokeObjectURL(modalObjectUrl);
    setShowImageModal(false);
    setModalObjectUrl(null);
  };

  const getPaymentForType = (type) => payments.find((p) => p.type === type) || {};

  const statusColor = {
    aprobado: 'text-green-600',
    pendiente: 'text-yellow-600',
    rechazado: 'text-red-600',
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Button variant="ghost" className="mb-2 flex items-center gap-2" onClick={() => navigate(-1)}>
        <ChevronLeft className="h-5 w-5" /> Volver
      </Button>
      <h1 className="text-3xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <FileText className="h-7 w-7 text-blue-600" /> Pagos de Reserva
      </h1>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="mb-6 flex items-center gap-3">
          {globalStatus === 'aprobado' && <CheckCircle className="h-6 w-6 text-green-600" />}
          {globalStatus === 'rechazado' && <XCircle className="h-6 w-6 text-red-600" />}
          <span className={`font-bold text-lg ${statusColor[globalStatus]}`}>Estado: {globalStatus.charAt(0).toUpperCase() + globalStatus.slice(1)}</span>
        </div>
        <div className="mb-6 p-4 rounded-lg border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">CVU de Rentadoor</div>
              <div className="text-lg font-semibold text-slate-800 tracking-wider">{RENTADOOR_CVU}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(RENTADOOR_CVU);
                  setCopied(true);
                  toast({ title: 'CVU copiado', description: 'Se copió al portapapeles.' });
                  setTimeout(() => setCopied(false), 1500);
                } catch {}
              }}
            >
              {copied ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" /> Copiar
                </>
              )}
            </Button>
          </div>
        </div>
        {globalStatus === 'rechazado' && (
          <div className="mb-4 text-red-600 text-sm">El pago fue rechazado. Por favor, vuelve a subir los comprobantes y contacta a soporte si tienes dudas.</div>
        )}
        <div className="space-y-6">
          {paymentTypes.map((pt) => {
            const payment = getPaymentForType(pt.key);
            return (
              <div key={pt.key} className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                <div>
                  <div className="text-lg font-semibold text-slate-700">{pt.label}</div>
                  {payment.file_url ? (
                    <button type="button" className="text-blue-600 underline text-sm" onClick={() => handleViewFile(payment.file_url)}>
                      Ver comprobante
                    </button>
                  ) : (
                    <span className="text-slate-400 text-sm">No adjuntado</span>
                  )}
                </div>
                <div className="mt-2 md:mt-0 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="px-2 py-1 text-xs" onClick={() => handleUpload(pt.key)} disabled={uploading[pt.key] || globalStatus === 'aprobado' || !!payment.file_url}>
                    <UploadCloud className="mr-1 h-4 w-4" /> {uploading[pt.key] ? 'Subiendo...' : 'Subir comprobante'}
                  </Button>
                  {globalStatus === 'rechazado' && payment.file_url && (
                    <button type="button" className="ml-1 p-1 rounded hover:bg-red-100" title="Eliminar comprobante" onClick={() => handleDelete(payment.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {globalStatus === 'aprobado' && (
          <div className="mt-8 flex flex-col items-center">
            <Button className="bg-blue-600 hover:bg-blue-500" onClick={() => navigate(`/contrato/${reservationId}`)}>
              <PenTool className="mr-2 h-5 w-5" /> Ir a firmar el contrato
            </Button>
            <div className="mt-2 text-green-700 text-sm">¡Tus pagos fueron aprobados! Ahora puedes firmar el contrato.</div>
          </div>
        )}
      </div>
      {showImageModal && modalObjectUrl && (
        modalFileType === 'image' ? (
          <HigherImage imageSrc={modalObjectUrl} onClose={handleCloseModal} alt="Comprobante de pago" />
        ) : (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <button
              onClick={handleCloseModal}
              className="absolute top-6 right-6 z-50 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition"
              aria-label="Cerrar"
            >
              <X className="h-6 w-6 text-gray-700" />
            </button>
            <div className="flex items-center justify-center w-full h-full max-w-[98vw] max-h-[98vh] overflow-hidden">
              <iframe src={modalObjectUrl} title="Comprobante PDF" className="rounded-xl shadow-2xl object-contain border border-white bg-white" style={{ width: '60vw', height: '80vh' }} />
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default ReservationPaymentsPage; 