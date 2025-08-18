import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer id="app-footer" className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <div className="text-xs text-slate-400">
              Domicilio legal: Combate de los Pozos 758, Piso 2, Depto. 2C, Ciudad Autónoma de Buenos Aires, Argentina
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link to="/legal/terminos-y-condiciones" className="text-sm hover:text-white">
              Términos y Condiciones
            </Link>
            <Link to="/legal/politica-de-privacidad" className="text-sm hover:text-white">
              Política de Privacidad
            </Link>
            <a href="mailto:rentadoor.arg@gmail.com" className="text-sm hover:text-white">
              Correo
            </a>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-500"
              onClick={() => window.open('https://wa.me/1124506393', '_blank')}
            >
              Contacto
            </Button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800">
          <p className="text-center text-xs text-white/70">
            Rentadoor 2025 — All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


