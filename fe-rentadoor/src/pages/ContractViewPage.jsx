import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Download, FileText, PenTool } from 'lucide-react';

const ContractViewPage = () => {
  const { id } = useParams();
  // Placeholder: datos simulados
  const [contractUrl] = useState('-'); // URL del PDF
  const [paymentStatus] = useState('pendiente'); // 'pendiente', 'aprobado', 'rechazado'

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <FileText className="h-7 w-7 text-blue-600" /> Contrato de Alquiler
      </h1>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex flex-col items-center">
        {/* Placeholder PDF */}
        <div className="w-full h-96 flex items-center justify-center bg-slate-100 border border-slate-200 rounded mb-4">
          {contractUrl === '-' ? (
            <span className="text-slate-400">Contrato aún no cargado</span>
          ) : (
            <iframe src={contractUrl} title="Contrato" className="w-full h-full rounded" />
          )}
        </div>
        <div className="flex gap-4">
          <Button variant="outline" disabled={contractUrl === '-'}>
            <Download className="mr-2 h-5 w-5" /> Descargar
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-500"
            disabled={paymentStatus !== 'aprobado' || contractUrl === '-'}
            onClick={() => window.open('https://www.docusign.com/', '_blank')}
          >
            <PenTool className="mr-2 h-5 w-5" /> Firmar Contrato
          </Button>
        </div>
        {paymentStatus !== 'aprobado' && (
          <div className="mt-4 text-sm text-red-600 text-center">
            Para firmar el contrato, primero debes completar y tener aprobados todos los pagos requeridos.
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractViewPage; 