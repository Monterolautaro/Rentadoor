import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Download, FileText, PenTool, ChevronLeft, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';

const ContractViewPage = () => {
  const { contractId } = useParams();
  const [contractBase64, setContractBase64] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pendiente');
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState('');
  const [signSuccess, setSignSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminView = location.search.includes('admin=1');
  const { user } = useAuthContext();
  const [contractInfo, setContractInfo] = useState(null);
  const [reservation, setReservation] = useState(null);

  useEffect(() => {
    const fetchContract = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/contracts/download-pdf/${contractId}`, { credentials: 'include' });
        const data = await res.json();
        if (data && data.base64) {
          setContractBase64(data.base64);
        } else {
          setContractBase64(null);
        }
      } catch {
        setContractBase64(null);
      } finally {
        setLoading(false);
      }
    };
    const fetchPayments = async () => {
      try {
        const res = await fetch(`${API_URL}/payments/by-reservation/${contractId}`, { credentials: 'include' });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPaymentStatus(data[0].status || 'pendiente');
        } else {
          setPaymentStatus('pendiente');
        }
      } catch {
        setPaymentStatus('pendiente');
      }
    };
    const fetchContractInfo = async () => {
      try {
        const res = await fetch(`${API_URL}/contracts/by-reservation/${contractId}`, { credentials: 'include' });
        const data = await res.json();
        setContractInfo(data);
      } catch {
        setContractInfo(null);
      }
    };
    const fetchReservation = async () => {
      try {
        const res = await fetch(`${API_URL}/reservations/${contractId}`, { credentials: 'include' });
        const data = await res.json();
        setReservation(data);
      } catch {
        setReservation(null);
      }
    };
    fetchContract();
    fetchPayments();
    fetchContractInfo();
    fetchReservation()
  }, [contractId, location.search]);

  const handleDownload = () => {
    if (contractBase64) {
      // Descargar el PDF usando un blob
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${contractBase64}`;
      link.download = `contrato_${contractId}.pdf`;
      link.click();
    }
  };

  const handleSignContract = async () => {
    if (!user) return;
    setSigning(true);
    setSignError('');
    setSignSuccess(false);
    try {

      const res = await fetch(`${API_URL}/api/docusign/envelopes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reservationId: contractId }),
      });
      if (!res.ok) throw new Error('No se pudo iniciar la firma.');
      const data = await res.json();
      const envelopeId = data.envelopeId;
      const signer = data.signers.find(s => s.email === user.email);
      if (!signer) throw new Error('No se encontró el firmante.');
      const returnUrl = `${window.location.origin}/contrato/${contractId}?signed=1`;
      const res2 = await fetch(`${API_URL}/api/docusign/envelopes/${envelopeId}/recipient-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ signer, returnUrl }),
      });
      if (!res2.ok) throw new Error();
      const data2 = await res2.json();
      if (data2.url) {
        setSigning(false);
        window.location.href = data2.url;
      } else {
        throw new Error();
      }
    } catch (err) {
      
      if (err?.message?.includes('RECIPIENT_NOT_IN_SEQUENCE')) {
        setSignError('Aún no puedes firmar. Debes esperar a que el otro firmante complete su parte.');
      } else {
        setSignError(err?.message || 'Error iniciando la firma digital.');
      }
      setSigning(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Button variant="ghost" className="mb-2 flex items-center gap-2" onClick={() => navigate(-1)}>
        <ChevronLeft className="h-5 w-5" /> Volver
      </Button>
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-slate-800 flex items-center gap-2 text-center justify-center w-full">
          <FileText className="h-7 w-7 text-blue-600" /> Contrato de Alquiler
        </h1>
        <div className="w-full flex flex-col items-center">
          <div className="w-full h-96 flex items-center justify-center bg-slate-100 border border-slate-200 rounded mb-6">
            {loading ? (
              <span className="text-slate-400">Cargando contrato...</span>
            ) : contractBase64 ? (
              <iframe src={`data:application/pdf;base64,${contractBase64}`} title="Contrato" className="w-full h-full rounded" />
            ) : (
              <span className="text-slate-400">Contrato aún no cargado</span>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full justify-center mb-2">
            <Button variant="outline" size="sm" disabled={!contractBase64} onClick={handleDownload} className="flex-1 min-w-[100px] py-2">
              <Download className="mr-2 h-4 w-4" /> Descargar
            </Button>
            {!isAdminView && (
              <Button
              disabled={reservation?.owner_id == user.id}
              variant="outline" size="sm" onClick={() => navigate(`/pagos/${contractId}`)} className="flex-1 min-w-[100px] py-2">
                <FileText className="mr-2 h-4 w-4" /> Pagos
              </Button>
            )}
            {!isAdminView && (
              <Button
                className="bg-blue-600 hover:bg-blue-500 flex-1 min-w-[100px] py-2 text-white"
                size="sm"
                disabled={
                paymentStatus !== 'aprobado' ||
                 (contractInfo?.signature_status === 'pending' && contractInfo?.owner_client_user_id == user.id)
                }
                onClick={handleSignContract}
              >
                {signing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PenTool className="mr-2 h-4 w-4" />}
                {signing ? 'Redirigiendo...' :
                  contractInfo && contractInfo?.signature_status === 'completed' ? 'Ver contrato firmado'
                  : contractInfo && contractInfo?.signature_status === 'sent' && user && contractInfo?.tenant_client_user_id == user.id ? 'Ver contrato firmado'
                  : 'Firmar Contrato'}
              </Button>
            )}
          </div>
          {!isAdminView && paymentStatus !== 'aprobado' && contractInfo?.tenant_client_user_id == user.id &&(
            <div className="mt-4 text-sm text-red-600 text-center w-full">
              Para firmar el contrato, primero debes completar y tener aprobados todos los pagos requeridos.
            </div>
          )}
          {
            contractInfo?.signature_status === 'pending' && contractInfo?.owner_client_user_id == user.id && (
              <div className="mt-4 text-sm text-red-600 text-center w-full">
              Para poder firmar, debes esperar a que el inquilino realice primero su firma.
            </div>
            )
          }
          {isAdminView && (
            <div className="mt-4 flex justify-center w-full">
              <Button variant="outline" onClick={() => navigate(`/admin/pagos/${contractId}`)}>
                <FileText className="mr-2 h-4 w-4" /> Ver pagos
              </Button>
            </div>
          )}
          {signError && (
            <div className="mt-2 text-sm text-red-600 text-center w-full">{signError}</div>
          )}
          {signSuccess && (
            <div className="mt-2 text-sm text-green-600 text-center w-full">¡Tu firma fue registrada! Te avisaremos cuando el contrato esté firmado por ambas partes.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractViewPage; 