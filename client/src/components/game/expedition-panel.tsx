import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, X, Minimize2, MapPin, Timer } from 'lucide-react';
import type { Biome, Resource, Equipment } from '@shared/types';
import { useQueryClient } from "@tanstack/react-query";
import { useInventoryUpdates } from '@/hooks/use-inventory-updates';
import { usePlayer } from '@/hooks/use-player';

interface ActiveExpedition {
  id: string;
  biome: string;
  startTime: number;
  endTime: number;
  status: 'active' | 'completed';
  selectedResources?: string[];
  progress?: number;
}

interface ExpeditionPanelProps {
  expedition: ActiveExpedition;
  onComplete: () => void;
  onMinimize: () => void;
  biomes: Biome[];
  resources: Resource[];
  equipment: Equipment[];
}

export default function ExpeditionPanel({
  expedition,
  onComplete,
  onMinimize,
  biomes,
  resources,
  equipment
}: ExpeditionPanelProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { player } = usePlayer();
  const playerId = player?.id
  const { invalidateInventoryData } = useInventoryUpdates(playerId);

  // Find expedition biome
  const expeditionBiome = biomes.find(b => b.id === expedition.biome || b.name === expedition.biome);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, expedition.endTime - now);
      const total = expedition.endTime - expedition.startTime;
      const progressPercent = total > 0 ? ((total - remaining) / total) * 100 : 100;

      setTimeRemaining(remaining);
      setProgress(progressPercent);

      if (remaining <= 0 && expedition.status === 'active') {
        handleExpeditionComplete();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expedition]);

  const handleExpeditionComplete = async () => {
    try {
      const response = await fetch(`/api/expeditions/${expedition.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "🎉 Expedição Concluída!",
          description: `Você coletou recursos com sucesso!`,
        });
        onComplete();
      } else {
        throw new Error('Erro ao completar expedição');
      }
    } catch (error) {
      console.error('Erro ao completar expedição:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível completar a expedição.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async () => {
    try {
      const response = await fetch(`/api/expeditions/${expedition.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Expedição Cancelada",
          description: "A expedição foi cancelada com sucesso.",
        });
        onComplete();
      } else {
        throw new Error('Erro ao cancelar expedição');
      }
    } catch (error) {
      console.error('Erro ao cancelar expedição:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível cancelar a expedição.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isMinimized) {
    return (
      <Card className="w-64 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span className="font-medium text-sm">
                {expeditionBiome?.name || expedition.biome}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(false)}
              className="text-white hover:bg-white/20"
            >
              <Timer className="w-4 h-4" />
            </Button>
          </div>
          <Progress value={progress} className="mt-2 h-1" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-blue-800 flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Expedição Ativa</span>
          </CardTitle>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(true)}
              className="text-gray-500 hover:bg-gray-100"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="text-red-500 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Biome Info */}
        <div className="bg-white rounded-lg p-3 border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">
                {expeditionBiome?.name || expedition.biome}
              </h3>
              <p className="text-sm text-gray-600">
                {expeditionBiome?.description || 'Explorando...'}
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {expedition.status === 'active' ? 'Em Andamento' : 'Concluída'}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Progresso</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Time Remaining */}
        <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Tempo Restante</span>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {timeRemaining > 0 ? formatTime(timeRemaining) : 'Concluído!'}
          </Badge>
        </div>

        {/* Selected Resources */}
        {expedition.selectedResources && expedition.selectedResources.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">Recursos Alvo</span>
            <div className="flex flex-wrap gap-1">
              {expedition.selectedResources.map((resourceId) => {
                const resource = resources.find(r => r.id === resourceId);
                return (
                  <Badge
                    key={resourceId}
                    variant="secondary"
                    className="text-xs bg-green-50 text-green-700 border-green-200"
                  >
                    {resource?.emoji} {resource?.name || resourceId}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        {timeRemaining <= 0 && expedition.status === 'active' && (
          <Button
            onClick={handleExpeditionComplete}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Coletar Recompensas
          </Button>
        )}
      </CardContent>
    </Card>
  );
}