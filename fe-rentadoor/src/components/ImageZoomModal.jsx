import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';

const IMAGE_SIZE = 350;

const ImageZoomModal = ({ imageSrc, onClose }) => {
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
    setZoomVisible(true);
  };

  const handleMouseLeave = () => setZoomVisible(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-[90vw] max-h-[90vh] w-full flex flex-col md:flex-row p-0 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>
        <div className="flex-1 flex items-center justify-center p-6 min-w-[300px]">
          <div
            ref={imageRef}
            className="relative border border-gray-200 rounded-lg overflow-hidden cursor-crosshair bg-gray-100"
            style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={imageSrc}
              alt="Documento de identidad"
              className="w-full h-full object-contain"
              draggable={false}
            />
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              Zoom
            </div>
            {zoomVisible && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-500/10 rounded pointer-events-none"
                style={{
                  width: 100,
                  height: 100,
                  left: `calc(${zoomPosition.x}% - 50px)`,
                  top: `calc(${zoomPosition.y}% - 50px)`,
                }}
              />
            )}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 min-w-[300px]">
          <div
            className="border border-gray-200 rounded-lg shadow-lg overflow-hidden bg-gray-100"
            style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
          >
            {zoomVisible ? (
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url(${imageSrc})`,
                  backgroundSize: '200% 200%',
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundRepeat: 'no-repeat',
                  width: '100%',
                  height: '100%',
                }}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
                Pasa el cursor sobre la imagen
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageZoomModal; 