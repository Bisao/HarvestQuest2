
import { useState } from "react";
import type { Resource, StorageItem } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { RESOURCE_IDS } from "@shared/constants/game-ids";

interface WorkshopTabProps {
  resources: Resource[];
  playerLevel: number;
  playerId: string;
  isBlocked?: boolean;
}

interface WorkshopProcess {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  requiredLevel: number;
  input: {
    resourceId: string;
    quantity: number;
  };
  output: {
    resourceId: string;
    quantity: number;
  };
  processingTime: number; // em segundos
  efficiency: number; // % de eficiência (pode produzir mais que 1:1)
  experienceGained: number;
}

const WORKSHOP_PROCESSES: WorkshopProcess[] = [
  // MADEIRA
  {
    id: "proc-madeira-refinada-001",
    name: "Madeira Refinada",
    emoji: "🪵",
    description: "Processe gravetos em madeira de qualidade",
    category: "madeira",
    requiredLevel: 2,
    input: { resourceId: RESOURCE_IDS.GRAVETOS, quantity: 5 },
    output: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 2 },
    processingTime: 30,
    efficiency: 80,
    experienceGained: 15
  },
  {
    id: "proc-bambu-processado-001", 
    name: "Bambu Processado",
    emoji: "🎋",
    description: "Refine bambu bruto em material de construção",
    category: "madeira",
    requiredLevel: 3,
    input: { resourceId: RESOURCE_IDS.BAMBU, quantity: 3 },
    output: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 1 },
    processingTime: 25,
    efficiency: 90,
    experienceGained: 12
  },

  // PEDRAS
  {
    id: "proc-pedras-lapidadas-001",
    name: "Pedras Lapidadas", 
    emoji: "🪨",
    description: "Transforme pedras pequenas em pedras de qualidade",
    category: "pedras",
    requiredLevel: 2,
    input: { resourceId: RESOURCE_IDS.PEDRAS_SOLTAS, quantity: 8 },
    output: { resourceId: RESOURCE_IDS.PEDRA, quantity: 3 },
    processingTime: 40,
    efficiency: 75,
    experienceGained: 20
  },
  {
    id: "proc-argila-refinada-001",
    name: "Argila Refinada",
    emoji: "🧱", 
    description: "Purifique argila bruta para uso em cerâmica",
    category: "pedras",
    requiredLevel: 4,
    input: { resourceId: RESOURCE_IDS.ARGILA, quantity: 4 },
    output: { resourceId: RESOURCE_IDS.ARGILA, quantity: 6 },
    processingTime: 45,
    efficiency: 120,
    experienceGained: 25
  },

  // FIBRAS
  {
    id: "proc-fibra-processada-001",
    name: "Fibra Processada",
    emoji: "🌾",
    description: "Processe fibras brutas em material têxtil",
    category: "fibras",
    requiredLevel: 1,
    input: { resourceId: RESOURCE_IDS.FIBRA, quantity: 10 },
    output: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 4 },
    processingTime: 20,
    efficiency: 80,
    experienceGained: 10
  },
  {
    id: "proc-couro-tratado-001",
    name: "Couro Tratado",
    emoji: "🦫",
    description: "Trate couro bruto para melhor qualidade",
    category: "fibras", 
    requiredLevel: 5,
    input: { resourceId: RESOURCE_IDS.COURO, quantity: 2 },
    output: { resourceId: RESOURCE_IDS.COURO, quantity: 3 },
    processingTime: 60,
    efficiency: 110,
    experienceGained: 30
  },

  // METAIS
  {
    id: "proc-ferro-fundido-001",
    name: "Fundição de Ferro",
    emoji: "🔩",
    description: "Processe pedras em ferro fundido",
    category: "metais",
    requiredLevel: 6,
    input: { resourceId: RESOURCE_IDS.PEDRA, quantity: 6 },
    output: { resourceId: RESOURCE_IDS.FERRO_FUNDIDO, quantity: 2 },
    processingTime: 90,
    efficiency: 70,
    experienceGained: 40
  },

  // ALIMENTOS
  {
    id: "proc-conservas-001",
    name: "Conservas de Carne",
    emoji: "🥩",
    description: "Processe carne fresca em conservas duradouras",
    category: "alimentos",
    requiredLevel: 4,
    input: { resourceId: RESOURCE_IDS.CARNE, quantity: 3 },
    output: { resourceId: RESOURCE_IDS.CARNE_ASSADA, quantity: 4 },
    processingTime: 50,
    efficiency: 105,
    experienceGained: 22
  },
  {
    id: "proc-cogumelos-secos-001",
    name: "Cogumelos Secos",
    emoji: "🍄",
    description: "Desidrate cogumelos para preservação prolongada",
    category: "alimentos",
    requiredLevel: 3,
    input: { resourceId: RESOURCE_IDS.COGUMELOS, quantity: 5 },
    output: { resourceId: RESOURCE_IDS.COGUMELOS_ASSADOS, quantity: 6 },
    processingTime: 35,
    efficiency: 115,
    experienceGained: 18
  }
];

export default function WorkshopsTab({ resources, playerLevel, playerId, isBlocked = false }: WorkshopTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<string>("madeira");
  const [processQuantities, setProcessQuantities] = useState<Record<string, number>>({});
  const [processingInProgress, setProcessingInProgress] = useState<Record<string, boolean>>({});

  // Get storage items
  const { data: storageItems = [] } = useQuery<StorageItem[]>({
    queryKey: ["/api/storage", playerId],
    enabled: !!playerId,
  });

  const processMutation = useMutation({
    mutationFn: async ({ processId, quantity = 1 }: { processId: string; quantity?: number }) => {
      try {
        const response = await fetch("/api/v2/workshop/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, processId, quantity: quantity || 1 }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Erro desconhecido no servidor" }));
          console.error("Workshop Process API Error:", errorData);
          throw new Error(errorData.message || `Erro HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log("Workshop Process Success:", result);
        return { ...result, processId };
      } catch (error) {
        console.error("Workshop Process Error Details:", error);
        if (error instanceof Error) {
          throw { ...error, processId };
        }
        throw new Error("Erro de conexão com o servidor");
      }
    },
    onSuccess: (response) => {
      const data = response.data || response;
      const quantity = data?.quantity || 1;
      const processName = data?.process?.name || data?.process || "Item";
      const processId = response.processId || data?.process?.id;

      toast({
        title: "Processamento Concluído!",
        description: `${quantity}x ${processName} foi processado com sucesso!`,
      });

      if (processId) {
        setProcessQuantities(prev => ({ ...prev, [processId]: 1 }));
        setProcessingInProgress(prev => ({ ...prev, [processId]: false }));
      }

      // Force cache invalidation
      queryClient.removeQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player", playerId] });
    },
    onError: (error: any) => {
      console.error("Workshop process error:", error);
      
      if (error.processId) {
        setProcessingInProgress(prev => ({ ...prev, [error.processId]: false }));
      }
      
      toast({
        title: "Erro no Processamento",
        description: error.message || "Não foi possível processar o recurso",
        variant: "destructive",
      });
    },
  });

  // Get resource data
  const getResourceData = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (resource) return resource;

    // Fallback names
    const fallbackNames: Record<string, { name: string; emoji: string }> = {
      [RESOURCE_IDS.GRAVETOS]: { name: "Gravetos", emoji: "🪵" },
      [RESOURCE_IDS.MADEIRA]: { name: "Madeira", emoji: "🪵" },
      [RESOURCE_IDS.PEDRAS_SOLTAS]: { name: "Pedras Pequenas", emoji: "🪨" },
      [RESOURCE_IDS.PEDRA]: { name: "Pedra", emoji: "🪨" },
      [RESOURCE_IDS.FIBRA]: { name: "Fibra", emoji: "🌾" },
      [RESOURCE_IDS.BARBANTE]: { name: "Barbante", emoji: "🧵" },
      [RESOURCE_IDS.FERRO_FUNDIDO]: { name: "Ferro Fundido", emoji: "🔩" }
    };

    return {
      id: resourceId,
      name: fallbackNames[resourceId]?.name || "Recurso Desconhecido",
      emoji: fallbackNames[resourceId]?.emoji || "📦"
    };
  };

  // Get available quantity in storage
  const getStorageQuantity = (resourceId: string) => {
    const storageItem = storageItems.find(item => item.resourceId === resourceId);
    return storageItem ? storageItem.quantity : 0;
  };

  // Calculate max processable quantity
  const getMaxProcessable = (process: WorkshopProcess) => {
    const availableInput = getStorageQuantity(process.input.resourceId);
    return Math.floor(availableInput / process.input.quantity);
  };

  // Check if process can be executed
  const canProcess = (process: WorkshopProcess) => {
    if (playerLevel < process.requiredLevel) return false;
    return getMaxProcessable(process) > 0;
  };

  // Handle process action
  const handleProcess = (process: WorkshopProcess) => {
    if (isBlocked || !canProcess(process) || processMutation.isPending || processingInProgress[process.id]) return;
    
    setProcessingInProgress(prev => ({ ...prev, [process.id]: true }));
    
    const quantity = processQuantities[process.id] || 1;
    processMutation.mutate({ processId: process.id, quantity });
  };

  // Categorize processes
  const categorizedProcesses = WORKSHOP_PROCESSES.reduce((acc, process) => {
    if (!acc[process.category]) acc[process.category] = [];
    acc[process.category].push(process);
    return acc;
  }, {} as Record<string, WorkshopProcess[]>);

  const categoryInfo = {
    madeira: { name: "Madeira", emoji: "🪵", color: "bg-amber-50 border-amber-200" },
    pedras: { name: "Pedras", emoji: "🪨", color: "bg-gray-50 border-gray-200" },
    fibras: { name: "Fibras", emoji: "🌾", color: "bg-green-50 border-green-200" },
    metais: { name: "Metais", emoji: "🔩", color: "bg-blue-50 border-blue-200" },
    alimentos: { name: "Alimentos", emoji: "🍖", color: "bg-red-50 border-red-200" }
  };

  // Render process card
  const renderProcessCard = (process: WorkshopProcess) => {
    const inputResource = getResourceData(process.input.resourceId);
    const outputResource = getResourceData(process.output.resourceId);
    const maxProcessable = getMaxProcessable(process);
    const canProcessItem = canProcess(process);
    const currentQuantity = processQuantities[process.id] || 1;
    const availableInput = getStorageQuantity(process.input.resourceId);

    return (
      <Card key={process.id} className={`transition-all duration-200 ${
        canProcessItem 
          ? "border-green-200 bg-green-50 hover:bg-green-100" 
          : "border-gray-200 bg-gray-50"
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{process.emoji}</span>
              <div>
                <div className="font-semibold text-gray-800">{process.name}</div>
                <div className="text-xs text-gray-500">Nível {process.requiredLevel}</div>
              </div>
            </div>
            {playerLevel < process.requiredLevel && (
              <span className="text-xs text-red-500 font-medium">Nível insuficiente</span>
            )}
          </CardTitle>
          <p className="text-sm text-gray-600">{process.description}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Input/Output Display */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <div className="text-2xl mb-1">{inputResource.emoji}</div>
              <div className="text-sm font-medium">{inputResource.name}</div>
              <div className={`text-sm ${availableInput >= (process.input.quantity * currentQuantity) ? "text-green-600" : "text-red-500"}`}>
                {availableInput}/{process.input.quantity * currentQuantity}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl">→</div>
              <div className="text-xs text-gray-500">{process.processingTime}s</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl mb-1">{outputResource.emoji}</div>
              <div className="text-sm font-medium">{outputResource.name}</div>
              <div className="text-sm text-blue-600">
                +{process.output.quantity * currentQuantity}
              </div>
            </div>
          </div>

          {/* Efficiency and XP info */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>Eficiência: {process.efficiency}%</span>
            <span>XP: +{process.experienceGained * currentQuantity}</span>
          </div>

          {/* Quantity selector */}
          {canProcessItem && maxProcessable > 1 && (
            <div>
              <Label className="text-sm">Quantidade: {currentQuantity}</Label>
              <Slider
                value={[currentQuantity]}
                onValueChange={([value]) => {
                  setProcessQuantities(prev => ({ ...prev, [process.id]: value }));
                }}
                max={maxProcessable}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
          )}

          {/* Process button */}
          <Button
            onClick={() => handleProcess(process)}
            disabled={!canProcessItem || isBlocked || processMutation.isPending || processingInProgress[process.id]}
            className={`w-full ${
              canProcessItem && !processingInProgress[process.id]
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {(processMutation.isPending || processingInProgress[process.id]) ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processando...
              </div>
            ) : !canProcessItem ? (
              playerLevel < process.requiredLevel ? "Nível insuficiente" : "Recursos insuficientes"
            ) : (
              `Processar ${currentQuantity > 1 ? `(${currentQuantity}x)` : ""}`
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          🏭 Oficinas de Processamento
        </h3>
        <p className="text-gray-600">
          Processe recursos brutos em materiais refinados com maior eficiência
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {Object.entries(categoryInfo).map(([categoryKey, categoryData]) => {
          const categoryProcesses = categorizedProcesses[categoryKey] || [];
          if (categoryProcesses.length === 0) return null;

          const isActive = activeCategory === categoryKey;
          
          return (
            <button
              key={categoryKey}
              onClick={() => setActiveCategory(categoryKey)}
              className={`px-4 py-3 rounded-t-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${
                isActive
                  ? "bg-white border-t border-l border-r border-gray-300 text-gray-800 -mb-px"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              <span className="text-lg">{categoryData.emoji}</span>
              <span>{categoryData.name}</span>
              <span className="text-xs text-gray-500">({categoryProcesses.length})</span>
            </button>
          );
        })}
      </div>

      {/* Active category content */}
      {Object.entries(categorizedProcesses).map(([categoryKey, categoryProcesses]) => {
        if (categoryKey !== activeCategory || categoryProcesses.length === 0) return null;

        return (
          <div key={categoryKey} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryProcesses.map(renderProcessCard)}
          </div>
        );
      })}
    </div>
  );
}
