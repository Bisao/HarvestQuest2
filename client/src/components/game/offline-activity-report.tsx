import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Clock, Package, Star, Zap, Heart, Droplet, Trophy, Calendar, Sparkles } from "lucide-react";
import type { OfflineActivityReport } from "@shared/types";
import { useQuery } from "@tanstack/react-query";

interface OfflineActivityReportProps {
  isOpen: boolean;
  onClose: () => void;
  report: OfflineActivityReport;
  onConfigureOffline?: () => void;
}

export function OfflineActivityReportDialog({ 
  isOpen, 
  onClose, 
  report,
  onConfigureOffline 
}: OfflineActivityReportProps) {
  // Early return if no report or not open
  if (!report || !isOpen) return null;
  
  const { data: resources } = useQuery({
    queryKey: ['/api/resources']
  });

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutos`;
    } else if (hours < 24) {
      return `${hours.toFixed(1)} horas`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return `${days} dia${days !== 1 ? 's' : ''} e ${remainingHours}h`;
    }
  };

  const getResourceName = (resourceId: string) => {
    if (!resources || !Array.isArray(resources)) return resourceId;
    const resource = resources.find((r: any) => r.id === resourceId);
    return resource ? `${resource.emoji} ${resource.name}` : resourceId;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return "text-green-600 dark:text-green-400";
    if (efficiency >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getEfficiencyDescription = (efficiency: number) => {
    if (efficiency >= 80) return "Excelente";
    if (efficiency >= 60) return "Boa";
    if (efficiency >= 40) return "Regular";
    return "Baixa";
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Bem-vindo de volta, Aventureiro!
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Resumo Principal */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-lg">Resumo da Aventura Offline</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatDuration(report?.hoursOffline || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Tempo Offline</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {report?.expeditionsCompleted || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Expedições</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    +{report?.experienceGained || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Experiência</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getEfficiencyColor(report?.efficiency || 0)}`}>
                    {report?.efficiency || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Eficiência</div>
                </div>
              </div>
              
              <div className="mt-3 text-center">
                <Badge variant="secondary" className={getEfficiencyColor(report.efficiency)}>
                  Eficiência {getEfficiencyDescription(report.efficiency)}
                </Badge>
              </div>
            </div>

            {/* Recursos Coletados */}
            {Object.keys(report.resourcesCollected).length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold">Recursos Coletados</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(report.resourcesCollected).map(([resourceId, quantity]) => (
                    <div key={resourceId} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <span className="text-sm font-medium">
                        {getResourceName(resourceId)}
                      </span>
                      <Badge variant="outline" className="text-green-600 dark:text-green-400">
                        +{quantity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status de Recursos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <Heart className="h-5 w-5 text-red-500" />
                <div>
                  <div className="font-medium text-red-700 dark:text-red-300">Fome Consumida</div>
                  <div className="text-sm text-red-600 dark:text-red-400">-{report.hungerConsumed} pontos</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Droplet className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium text-blue-700 dark:text-blue-300">Sede Consumida</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">-{report.thirstConsumed} pontos</div>
                </div>
              </div>
            </div>

            {/* Eventos Especiais */}
            {report.specialEvents.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold">Eventos Especiais</h3>
                </div>
                
                <div className="space-y-2">
                  {report.specialEvents.map((event, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="mt-0.5">
                        {event.type === 'resource_bonus' && <Star className="h-4 w-4 text-yellow-500" />}
                        {event.type === 'level_up' && <Trophy className="h-4 w-4 text-purple-500" />}
                        {event.type === 'special_find' && <Sparkles className="h-4 w-4 text-blue-500" />}
                        {event.type === 'tool_break' && <Zap className="h-4 w-4 text-red-500" />}
                        {event.type === 'quest_complete' && <Trophy className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{event.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(event.timestamp).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Dicas de Otimização */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">💡 Dicas para Melhorar a Eficiência Offline:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Mantenha fome e sede altas antes de sair offline</li>
                <li>• Equipe suas melhores ferramentas e armas</li>
                <li>• Configure um bioma preferido nas configurações</li>
                <li>• Evite ficar offline por mais de 12 horas consecutivas</li>
              </ul>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onConfigureOffline}>
            ⚙️ Configurar Offline
          </Button>
          <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
            🎯 Continuar Aventura
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}