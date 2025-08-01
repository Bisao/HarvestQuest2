import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin, AlertTriangle, Settings, Heart, Droplet, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { OfflineActivityConfig } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface OfflineConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  currentConfig?: OfflineActivityConfig;
}

export function OfflineConfigModal({ 
  isOpen, 
  onClose, 
  playerId, 
  currentConfig 
}: OfflineConfigModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [config, setConfig] = useState<OfflineActivityConfig>({
    enabled: currentConfig?.enabled ?? true,
    preferredBiome: currentConfig?.preferredBiome,
    maxDuration: currentConfig?.maxDuration ?? 12,
    stopOnLowResources: currentConfig?.stopOnLowResources ?? true,
    minHunger: currentConfig?.minHunger ?? 20,
    minThirst: currentConfig?.minThirst ?? 20,
    preferredResources: currentConfig?.preferredResources ?? [],
  });

  const { data: biomes } = useQuery({
    queryKey: ['/api/biomes']
  });

  const { data: player } = useQuery({
    queryKey: ['/api/player', playerId]
  });

  const { data: resources } = useQuery({
    queryKey: ['/api/resources']
  });

  const { data: inventory } = useQuery({
    queryKey: ['/api/inventory', playerId]
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: OfflineActivityConfig) => {
      const response = await fetch(`/api/player/${playerId}/offline-config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig)
      });
      if (!response.ok) throw new Error('Failed to update config');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Configuração Salva",
        description: "Suas configurações de atividade offline foram atualizadas!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/player', playerId] });
      onClose();
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Falha ao salvar configurações",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (currentConfig) {
      setConfig({
        enabled: currentConfig.enabled ?? true,
        preferredBiome: currentConfig.preferredBiome,
        maxDuration: currentConfig.maxDuration ?? 12,
        stopOnLowResources: currentConfig.stopOnLowResources ?? true,
        minHunger: currentConfig.minHunger ?? 20,
        minThirst: currentConfig.minThirst ?? 20,
        preferredResources: currentConfig.preferredResources ?? [],
      });
    }
  }, [currentConfig]);

  const accessibleBiomes = (Array.isArray(biomes) ? biomes : []).filter((biome: any) => 
    biome.requiredLevel <= ((player as any)?.level || 1)
  );

  // Função para verificar se o jogador pode coletar um recurso
  const canCollectResource = (resource: any) => {
    if (!resource.requirements) return true;
    
    const playerLevel = (player as any)?.level || 1;
    const playerInventory = Array.isArray(inventory) ? inventory : [];
    
    // Verifica requisito de nível
    if (resource.requirements.level && playerLevel < resource.requirements.level) {
      return false;
    }
    
    // Verifica requisito de ferramenta
    if (resource.requirements.tool) {
      const hasTool = playerInventory.some((item: any) => 
        item.itemId === resource.requirements.tool && item.quantity > 0
      ) || (player as any)?.equippedTool === resource.requirements.tool;
      
      if (!hasTool) return false;
    }
    
    // Verifica requisito de bioma
    if (resource.requirements.biomes && resource.requirements.biomes.length > 0) {
      const selectedBiome = config.preferredBiome;
      if (selectedBiome && !resource.requirements.biomes.includes(selectedBiome)) {
        return false;
      }
    }
    
    return true;
  };

  // Recursos disponíveis para coleta baseado nos requisitos
  const availableResources = (Array.isArray(resources) ? resources : [])
    .filter((resource: any) => resource.type === 'resource' && canCollectResource(resource))
    .sort((a: any, b: any) => (a.requirements?.level || 0) - (b.requirements?.level || 0));

  const handleResourceToggle = (resourceId: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      preferredResources: checked 
        ? [...(prev.preferredResources || []), resourceId]
        : (prev.preferredResources || []).filter(id => id !== resourceId)
    }));
  };

  const getResourceRequirementsText = (resource: any) => {
    const reqs = [];
    if (resource.requirements?.level) reqs.push(`Nível ${resource.requirements.level}`);
    if (resource.requirements?.tool) {
      const toolName = availableResources.find((r: any) => r.id === resource.requirements.tool)?.name || resource.requirements.tool;
      reqs.push(`Ferramenta: ${toolName}`);
    }
    if (resource.requirements?.biomes?.length > 0) {
      const biomeNames = resource.requirements.biomes.map((biomeId: string) => {
        const biome = accessibleBiomes.find((b: any) => b.id === biomeId);
        return biome ? biome.name : biomeId;
      }).join(', ');
      reqs.push(`Biomas: ${biomeNames}`);
    }
    return reqs.length > 0 ? reqs.join(' • ') : 'Sem requisitos especiais';
  };

  const handleSave = () => {
    updateConfigMutation.mutate(config);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            Configurações de Atividade Offline
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Estado Geral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5" />
                Configuração Geral
              </CardTitle>
              <CardDescription>
                Configure como seu personagem se comporta quando você está offline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enabled">Atividade Offline Ativada</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite que seu personagem colete recursos automaticamente quando offline
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={config.enabled}
                  onCheckedChange={(enabled) => setConfig({ ...config, enabled })}
                />
              </div>
            </CardContent>
          </Card>

          {config.enabled && (
            <>
              {/* Configurações de Local */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5" />
                    Local Preferido
                  </CardTitle>
                  <CardDescription>
                    Escolha onde seu personagem fará expedições offline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Bioma Preferido</Label>
                    <Select
                      value={config.preferredBiome || "auto"}
                      onValueChange={(value) => 
                        setConfig({ 
                          ...config, 
                          preferredBiome: value === "auto" ? undefined : value 
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um bioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">🎲 Automático (Melhor disponível)</SelectItem>
                        {accessibleBiomes.map((biome: any) => (
                          <SelectItem key={biome.id} value={biome.id}>
                            {biome.emoji} {biome.name} (Nível {biome.requiredLevel})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Automático escolhe o bioma de maior nível que você pode acessar
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Configurações de Recursos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5" />
                    Recursos para Coletar
                  </CardTitle>
                  <CardDescription>
                    Escolha quais recursos você quer focar durante as expedições offline
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availableResources.length > 0 ? (
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      <div className="flex items-center space-x-2 pb-2 border-b">
                        <Checkbox
                          id="select-all-resources"
                          checked={config.preferredResources?.length === availableResources.length}
                          onCheckedChange={(checked) => {
                            setConfig(prev => ({
                              ...prev,
                              preferredResources: checked 
                                ? availableResources.map((r: any) => r.id)
                                : []
                            }));
                          }}
                        />
                        <Label htmlFor="select-all-resources" className="font-medium">
                          Selecionar Todos os Recursos
                        </Label>
                      </div>
                      
                      {availableResources.map((resource: any) => (
                        <div key={resource.id} className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`resource-${resource.id}`}
                              checked={config.preferredResources?.includes(resource.id) || false}
                              onCheckedChange={(checked) => 
                                handleResourceToggle(resource.id, checked as boolean)
                              }
                            />
                            <Label 
                              htmlFor={`resource-${resource.id}`} 
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <span>{resource.emoji}</span>
                              <span>{resource.name}</span>
                            </Label>
                          </div>
                          <p className="text-xs text-muted-foreground ml-6">
                            {getResourceRequirementsText(resource)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum recurso disponível para seu nível atual</p>
                      <p className="text-xs">Melhore seu nível e equipamentos para desbloquear mais recursos</p>
                    </div>
                  )}
                  
                  {config.preferredResources?.length === 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        💡 <strong>Dica:</strong> Se nenhum recurso for selecionado, a expedição coletará automaticamente os recursos mais valiosos disponíveis no bioma escolhido.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Configurações de Tempo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" />
                    Limites de Tempo
                  </CardTitle>
                  <CardDescription>
                    Configure por quanto tempo as atividades offline devem continuar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Duração Máxima: {config.maxDuration} horas</Label>
                    <Slider
                      value={[config.maxDuration || 12]}
                      onValueChange={([value]) => setConfig({ ...config, maxDuration: value })}
                      max={24}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Atividades param automaticamente após este tempo para evitar exploits
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Configurações de Segurança */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5" />
                    Condições de Parada
                  </CardTitle>
                  <CardDescription>
                    Configure quando as atividades offline devem parar automaticamente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="stopOnLowResources">Parar com Recursos Baixos</Label>
                      <p className="text-sm text-muted-foreground">
                        Para atividades quando fome ou sede ficam baixas
                      </p>
                    </div>
                    <Switch
                      id="stopOnLowResources"
                      checked={config.stopOnLowResources}
                      onCheckedChange={(value) => 
                        setConfig({ ...config, stopOnLowResources: value })
                      }
                    />
                  </div>

                  {config.stopOnLowResources && (
                    <div className="space-y-4 pl-4 border-l-2 border-muted">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          Fome Mínima: {config.minHunger}%
                        </Label>
                        <Slider
                          value={[config.minHunger || 20]}
                          onValueChange={([value]) => setConfig({ ...config, minHunger: value })}
                          max={80}
                          min={5}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Droplet className="h-4 w-4 text-blue-500" />
                          Sede Mínima: {config.minThirst}%
                        </Label>
                        <Slider
                          value={[config.minThirst || 20]}
                          onValueChange={([value]) => setConfig({ ...config, minThirst: value })}
                          max={80}
                          min={5}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informações de Eficiência */}
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-blue-700 dark:text-blue-300">💡 Dicas de Eficiência</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Atividades offline são 60% menos eficientes que manuais</li>
                    <li>• Equipamentos melhoram a eficiência offline (+15% com ferramentas)</li>
                    <li>• Fome e sede altas no início aumentam a duração das atividades</li>
                    <li>• Níveis mais altos resultam em melhor eficiência offline</li>
                    <li>• Evite períodos offline muito longos (diminui eficiência)</li>
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Separator />

        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateConfigMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {updateConfigMutation.isPending ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}