import React from 'react';
import { X } from 'lucide-react';

const HigherImage = ({ imageSrc, onClose, alt }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition"
        aria-label="Cerrar"
      >
        <X className="h-6 w-6 text-gray-700" />
      </button>
      <div className="flex items-center justify-center w-full h-full max-w-[98vw] max-h-[98vh] overflow-hidden">
        <img
          src={imageSrc}
          alt={alt || 'Imagen ampliada'}
          className="rounded-xl shadow-2xl object-contain border border-white"
          style={{ transform: 'scale(2)', maxWidth: '50vw', maxHeight: '50vh' }}
          draggable={false}
        />
      </div>
    </div>
  );
};

export default HigherImage; 