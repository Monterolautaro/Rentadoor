import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Construction, 
  Clock, 
  AlertTriangle, 
  Code, 
  Database,
  Server,
  Zap
} from 'lucide-react';

const DevelopmentCard = ({ 
  title = "Funcionalidad en Desarrollo", 
  description = "Esta funcionalidad está siendo desarrollada y estará disponible pronto.",
  icon: Icon = Construction,
  estimatedTime = "Próximamente",
  features = [],
  showProgress = false,
  progress = 0
}) => {
  return (
    <Card className="border-dashed border-2 border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-200 rounded-lg">
              <Icon className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-800">{title}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                <Clock className="w-3 h-3 mr-1" />
                {estimatedTime}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-slate-600 text-sm leading-relaxed">
          {description}
        </p>

        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Progreso</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-slate-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {features.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-700">Funcionalidades planificadas:</h4>
            <div className="space-y-1">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Code className="w-3 h-3" />
          <span>Backend API en desarrollo</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Database className="w-3 h-3" />
          <span>Base de datos en configuración</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Server className="w-3 h-3" />
          <span>Endpoints pendientes</span>
        </div>

        <div className="pt-2">
          <Button variant="outline" size="sm" className="w-full" disabled>
            <Zap className="w-4 h-4 mr-2" />
            Funcionalidad no disponible
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DevelopmentCard; 