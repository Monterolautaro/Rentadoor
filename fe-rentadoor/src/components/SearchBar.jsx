import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, Trash2, Building, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [environments, setEnvironments] = useState('');
  const [barrio, setBarrio] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currency, setCurrency] = useState('ARS');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const barrios = [
    'Palermo', 'Recoleta', 'San Telmo', 'Puerto Madero', 'Belgrano',
    'Villa Crespo', 'Caballito', 'Barracas', 'La Boca', 'Núñez'
  ];

  const handleSearch = () => {
    onSearch({
      searchTerm,
      propertyType,
      environments,
      barrio,
      minPrice,
      maxPrice,
      currency,
    });
    setIsPopoverOpen(false);
  };
  
  const handleClearFilters = () => {
    setPropertyType('');
    setEnvironments('');
    setBarrio('');
    setMinPrice('');
    setMaxPrice('');
    setCurrency('ARS');
  };

  const handleClearAndSearch = () => {
    setSearchTerm('');
    handleClearFilters();
    onSearch({});
  }

  const activeFilterCount = [propertyType, environments, barrio, minPrice, maxPrice].filter(Boolean).length;


  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-4 search-shadow max-w-5xl mx-auto"
    >
      <div className="flex flex-col md:flex-row gap-2 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar por barrio o título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 pl-10 text-base"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-12 w-full md:w-auto px-4 relative">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 md:w-96 p-6" align="end">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filtros Avanzados</h4>
                  <p className="text-sm text-muted-foreground">
                    Refina tu búsqueda para encontrar el lugar perfecto.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Tipo de Propiedad</Label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger id="propertyType"><SelectValue placeholder="Todos" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Departamento">Departamento</SelectItem>
                        <SelectItem value="Casa">Casa</SelectItem>
                        <SelectItem value="PH">PH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="environments">Ambientes</Label>
                     <Select value={environments} onValueChange={setEnvironments}>
                      <SelectTrigger id="environments"><SelectValue placeholder="Cualquiera" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 ambiente</SelectItem>
                        <SelectItem value="2">2 ambientes</SelectItem>
                        <SelectItem value="3">3 ambientes</SelectItem>
                        <SelectItem value="4">4 o más ambientes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="barrio">Barrio</Label>
                    <Select value={barrio} onValueChange={setBarrio}>
                      <SelectTrigger id="barrio"><SelectValue placeholder="Todos" /></SelectTrigger>
                      <SelectContent>
                        {barrios.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                     <Label>Rango de Precios</Label>
                     <div className="flex items-center gap-2">
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ARS">ARS</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input type="number" placeholder="Mínimo" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                        <Input type="number" placeholder="Máximo" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                     </div>
                  </div>
                </div>
                 <div className="flex justify-between">
                    <Button variant="ghost" onClick={handleClearFilters} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-2"/> Limpiar
                    </Button>
                    <Button onClick={handleSearch} className="bg-slate-800 hover:bg-slate-700">Aplicar Filtros</Button>
                 </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button onClick={handleSearch} className="h-12 flex-grow md:flex-grow-0 px-6 bg-blue-600 hover:bg-blue-500">
            <Search className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">Buscar</span>
          </Button>
        </div>
      </div>
      {activeFilterCount > 0 && 
        <div className="mt-2 text-center">
            <Button variant="link" size="sm" onClick={handleClearAndSearch} className="text-xs">Limpiar todos los filtros</Button>
        </div>
      }
    </motion.div>
  );
};

export default SearchBar;