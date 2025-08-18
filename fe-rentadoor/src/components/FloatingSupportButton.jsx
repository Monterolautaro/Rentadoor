import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

const FloatingSupportButton = () => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const footer = document.getElementById('app-footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setHidden(entry.isIntersecting);
        });
      },
      { root: null, threshold: 0.01 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    window.open('https://wa.me/1124506393', '_blank');
  };

  if (hidden) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        onClick={handleClick}
        className="rounded-full shadow-lg bg-green-600 hover:bg-green-500 text-white px-4 h-12 flex items-center gap-2"
        aria-label="Contactar soporte por WhatsApp"
      >
        <Phone className="h-5 w-5" />
        <span className="hidden md:inline">Contactar soporte</span>
      </Button>
    </div>
  );
};

export default FloatingSupportButton;


