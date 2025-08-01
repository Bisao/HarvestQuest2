import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { getResourceData } from '@/lib/game-data';

interface WorkshopProcess {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: "bancada" | "madeira" | "pedras" | "forja" | "fogueira";
  requiredLevel: number;
  input: {
    resourceId: string;
    quantity: number;
  };
  secondary?: {
    resourceId: string;
    quantity: number;
  };
  fuel?: {
    resourceId: string;
    quantity: number;
  };
  output: {
    resourceId: string;
    quantity: number;
  };
  processingTime: number;
  efficiency: number;
  experienceGained: number;
}

// SISTEMA ROBUSTO DE OFICINAS - PRODUÇÃO REALISTA POR PARTES
const ROBUST_WORKSHOP_PROCESSES: WorkshopProcess[] = [
  // ===== SERRA (MADEIRA) - CABOS E PARTES DE MADEIRA =====
  {
    id: "proc-cabo-machado-001",
    name: "Cabo de Machado",
    emoji: "🪵",
    description: "Serrar madeira para criar cabo resistente de machado",
    category: "madeira",
    requiredLevel: 2,
    input: {
      resourceId: "madeira",
      quantity: 2
    },
    output: {
      resourceId: "cabo-machado",
      quantity: 1
    },
    processingTime: 30,
    efficiency: 90,
    experienceGained: 15
  },
  {
    id: "proc-cabo-picareta-001",
    name: "Cabo de Picareta",
    emoji: "🪵",
    description: "Serrar madeira para criar cabo de picareta",
    category: "madeira",
    requiredLevel: 2,
    input: {
      resourceId: "madeira",
      quantity: 2
    },
    output: {
      resourceId: "cabo-picareta",
      quantity: 1
    },
    processingTime: 30,
    efficiency: 90,
    experienceGained: 15
  },
  {
    id: "proc-cabo-espada-001",
    name: "Empunhadura de Espada",
    emoji: "🪵",
    description: "Esculpir madeira para empunhadura de espada",
    category: "madeira",
    requiredLevel: 3,
    input: {
      resourceId: "madeira",
      quantity: 1
    },
    output: {
      resourceId: "cabo-espada",
      quantity: 1
    },
    processingTime: 25,
    efficiency: 85,
    experienceGained: 12
  },
  {
    id: "proc-vara-pesca-001",
    name: "Vara de Pescar",
    emoji: "🎣",
    description: "Preparar madeira flexível para vara de pesca",
    category: "madeira",
    requiredLevel: 1,
    input: {
      resourceId: "madeira",
      quantity: 1
    },
    output: {
      resourceId: "vara-pesca",
      quantity: 1
    },
    processingTime: 20,
    efficiency: 80,
    experienceGained: 10
  },
  {
    id: "proc-haste-flecha-001",
    name: "Haste de Flecha",
    emoji: "🏹",
    description: "Cortar madeira em hastes finas para flechas",
    category: "madeira",
    requiredLevel: 1,
    input: {
      resourceId: "madeira",
      quantity: 1
    },
    output: {
      resourceId: "haste-flecha",
      quantity: 5
    },
    processingTime: 15,
    efficiency: 85,
    experienceGained: 8
  },

  // ===== FORJA - PARTES METÁLICAS E FUNDIÇÃO =====
  {
    id: "proc-barra-ferro-001",
    name: "Barra de Ferro",
    emoji: "🔩",
    description: "Fundir minério de ferro em barras utilizáveis",
    category: "forja",
    requiredLevel: 2,
    input: {
      resourceId: "mineral-ferro",
      quantity: 3
    },
    fuel: {
      resourceId: "carvao",
      quantity: 1
    },
    output: {
      resourceId: "barra-ferro",
      quantity: 1
    },
    processingTime: 45,
    efficiency: 80,
    experienceGained: 20
  },
  {
    id: "proc-cabeca-machado-001",
    name: "Cabeça de Machado",
    emoji: "🔨",
    description: "Forjar cabeça cortante do machado",
    category: "forja",
    requiredLevel: 3,
    input: {
      resourceId: "barra-ferro",
      quantity: 2
    },
    fuel: {
      resourceId: "carvao",
      quantity: 1
    },
    output: {
      resourceId: "cabeca-machado",
      quantity: 1
    },
    processingTime: 50,
    efficiency: 85,
    experienceGained: 25
  },
  {
    id: "proc-cabeca-picareta-001",
    name: "Cabeça de Picareta",
    emoji: "⛏️",
    description: "Forjar cabeça perfurante da picareta",
    category: "forja",
    requiredLevel: 3,
    input: {
      resourceId: "barra-ferro",
      quantity: 2
    },
    fuel: {
      resourceId: "carvao",
      quantity: 1
    },
    output: {
      resourceId: "cabeca-picareta",
      quantity: 1
    },
    processingTime: 50,
    efficiency: 85,
    experienceGained: 25
  },
  {
    id: "proc-lamina-espada-001",
    name: "Lâmina de Espada",
    emoji: "⚔️",
    description: "Forjar lâmina afiada e equilibrada",
    category: "forja",
    requiredLevel: 4,
    input: {
      resourceId: "barra-ferro",
      quantity: 3
    },
    fuel: {
      resourceId: "carvao",
      quantity: 2
    },
    output: {
      resourceId: "lamina-espada",
      quantity: 1
    },
    processingTime: 70,
    efficiency: 80,
    experienceGained: 35
  },
  {
    id: "proc-ponta-flecha-001",
    name: "Ponta de Flecha",
    emoji: "🏹",
    description: "Forjar pontas afiadas para flechas",
    category: "forja",
    requiredLevel: 2,
    input: {
      resourceId: "barra-ferro",
      quantity: 1
    },
    fuel: {
      resourceId: "carvao",
      quantity: 1
    },
    output: {
      resourceId: "ponta-flecha",
      quantity: 8
    },
    processingTime: 30,
    efficiency: 90,
    experienceGained: 15
  },
  {
    id: "proc-anzol-001",
    name: "Anzol",
    emoji: "🪝",
    description: "Forjar anzóis curvos para pesca",
    category: "forja",
    requiredLevel: 1,
    input: {
      resourceId: "barra-ferro",
      quantity: 1
    },
    fuel: {
      resourceId: "carvao",
      quantity: 1
    },
    output: {
      resourceId: "anzol",
      quantity: 5
    },
    processingTime: 25,
    efficiency: 95,
    experienceGained: 12
  },

  // ===== BANCADA - MONTAGEM DE ITENS FINAIS =====
  {
    id: "proc-machado-ferro-completo-001",
    name: "Machado de Ferro",
    emoji: "🪓",
    description: "Montar machado unindo cabo e cabeça",
    category: "bancada",
    requiredLevel: 3,
    input: {
      resourceId: "cabo-machado",
      quantity: 1
    },
    secondary: {
      resourceId: "cabeca-machado",
      quantity: 1
    },
    output: {
      resourceId: "machado-ferro",
      quantity: 1
    },
    processingTime: 20,
    efficiency: 95,
    experienceGained: 30
  },
  {
    id: "proc-picareta-ferro-completa-001",
    name: "Picareta de Ferro",
    emoji: "⛏️",
    description: "Montar picareta unindo cabo e cabeça",
    category: "bancada",
    requiredLevel: 3,
    input: {
      resourceId: "cabo-picareta",
      quantity: 1
    },
    secondary: {
      resourceId: "cabeca-picareta",
      quantity: 1
    },
    output: {
      resourceId: "picareta-ferro",
      quantity: 1
    },
    processingTime: 20,
    efficiency: 95,
    experienceGained: 30
  },
  {
    id: "proc-espada-ferro-completa-001",
    name: "Espada de Ferro",
    emoji: "⚔️",
    description: "Montar espada unindo empunhadura e lâmina",
    category: "bancada",
    requiredLevel: 4,
    input: {
      resourceId: "cabo-espada",
      quantity: 1
    },
    secondary: {
      resourceId: "lamina-espada",
      quantity: 1
    },
    output: {
      resourceId: "espada-ferro",
      quantity: 1
    },
    processingTime: 25,
    efficiency: 90,
    experienceGained: 45
  },
  {
    id: "proc-flecha-completa-001",
    name: "Flecha",
    emoji: "🏹",
    description: "Montar flechas com hastes e pontas",
    category: "bancada",
    requiredLevel: 2,
    input: {
      resourceId: "haste-flecha",
      quantity: 3
    },
    secondary: {
      resourceId: "ponta-flecha",
      quantity: 3
    },
    output: {
      resourceId: "flecha",
      quantity: 3
    },
    processingTime: 12,
    efficiency: 85,
    experienceGained: 18
  },
  {
    id: "proc-vara-pesca-completa-001",
    name: "Vara de Pesca Completa",
    emoji: "🎣",
    description: "Montar vara de pesca com anzol",
    category: "bancada",
    requiredLevel: 1,
    input: {
      resourceId: "vara-pesca",
      quantity: 1
    },
    secondary: {
      resourceId: "anzol",
      quantity: 1
    },
    output: {
      resourceId: "vara-pesca-completa",
      quantity: 1
    },
    processingTime: 8,
    efficiency: 90,
    experienceGained: 15
  },

  // ===== BANCADA - MATERIAIS E EQUIPAMENTOS =====
  {
    id: "proc-barbante-001",
    name: "Barbante",
    emoji: "🧵",
    description: "Processar fibras em barbante resistente",
    category: "bancada",
    requiredLevel: 1,
    input: {
      resourceId: "fibra-algodao",
      quantity: 4
    },
    output: {
      resourceId: "barbante",
      quantity: 3
    },
    processingTime: 15,
    efficiency: 85,
    experienceGained: 5
  },
  {
    id: "proc-corda-001",
    name: "Corda",
    emoji: "🪢",
    description: "Trançar barbante em corda resistente",
    category: "bancada",
    requiredLevel: 2,
    input: {
      resourceId: "barbante",
      quantity: 6
    },
    output: {
      resourceId: "corda",
      quantity: 2
    },
    processingTime: 25,
    efficiency: 80,
    experienceGained: 12
  },
  {
    id: "proc-mochila-001",
    name: "Mochila",
    emoji: "🎒",
    description: "Costurar mochila para mais capacidade",
    category: "bancada",
    requiredLevel: 3,
    input: {
      resourceId: "couro-tratado",
      quantity: 3
    },
    secondary: {
      resourceId: "corda",
      quantity: 2
    },
    output: {
      resourceId: "mochila",
      quantity: 1
    },
    processingTime: 45,
    efficiency: 80,
    experienceGained: 35
  },

  // ===== PEDRAS - PROCESSAMENTO DE MINERAIS =====
  {
    id: "proc-pedra-amolada-001",
    name: "Pedra Amolada",
    emoji: "🪨",
    description: "Amolar pedras para ferramentas primitivas",
    category: "pedras",
    requiredLevel: 1,
    input: {
      resourceId: "pedra",
      quantity: 2
    },
    output: {
      resourceId: "pedra-amolada",
      quantity: 1
    },
    processingTime: 20,
    efficiency: 75,
    experienceGained: 8
  },

  // ===== FOGUEIRA - COZIMENTO E PRESERVAÇÃO =====
  {
    id: "proc-carne-assada-001",
    name: "Carne Assada",
    emoji: "🍖",
    description: "Assar carne para preservar e nutrir",
    category: "fogueira",
    requiredLevel: 1,
    input: {
      resourceId: "carne-crua",
      quantity: 2
    },
    fuel: {
      resourceId: "madeira",
      quantity: 1
    },
    output: {
      resourceId: "carne-assada",
      quantity: 2
    },
    processingTime: 30,
    efficiency: 90,
    experienceGained: 10
  },
  {
    id: "proc-couro-tratado-001",
    name: "Couro Tratado",
    emoji: "🦫",
    description: "Tratar couro bruto para uso em equipamentos",
    category: "fogueira",
    requiredLevel: 2,
    input: {
      resourceId: "couro-bruto",
      quantity: 2
    },
    fuel: {
      resourceId: "madeira",
      quantity: 1
    },
    output: {
      resourceId: "couro-tratado",
      quantity: 1
    },
    processingTime: 40,
    efficiency: 85,
    experienceGained: 15
  }
];

interface WorkshopTabProps {
  resources: Array<{id: string, resourceId: string, quantity: number}>;
  playerLevel: number;
  playerId: string;
  isBlocked?: boolean;
}

export default function RobustWorkshopsTab({ resources, playerLevel, playerId, isBlocked = false }: WorkshopTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<string>("bancada");
  const [selectedProcess, setSelectedProcess] = useState<WorkshopProcess | null>(null);
  const [processQuantity, setProcessQuantity] = useState<number>(1);
  const [processingInProgress, setProcessingInProgress] = useState<boolean>(false);
  const [outputItems, setOutputItems] = useState<Array<{resourceId: string, quantity: number}>>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Informações das categorias
  const categoryInfo = {
    bancada: { name: "Bancada", emoji: "🔨", color: "bg-blue-50 border-blue-200", description: "Montagem e criação final de itens" },
    madeira: { name: "Serra", emoji: "🪚", color: "bg-amber-50 border-amber-200", description: "Processamento de madeira e cabos" },
    pedras: { name: "Pedras", emoji: "🪨", color: "bg-gray-50 border-gray-200", description: "Processamento de minerais e pedras" },
    forja: { name: "Forja", emoji: "🔥", color: "bg-red-50 border-red-200", description: "Fundição e forja de partes metálicas" },
    fogueira: { name: "Fogueira", emoji: "🏕️", color: "bg-orange-50 border-orange-200", description: "Cozimento e tratamento de materiais" }
  };

  // Filtros por tipo de item melhorados
  const itemFilters = {
    all: { name: "Todos", emoji: "📋", description: "Todos os processos" },
    parts: { name: "Partes", emoji: "🔧", description: "Cabos, cabeças e componentes" },
    tools: { name: "Ferramentas", emoji: "🛠️", description: "Machados, picaretas completas" },
    weapons: { name: "Armas", emoji: "⚔️", description: "Espadas, flechas completas" },
    materials: { name: "Materiais", emoji: "🧵", description: "Barbante, corda, couro" },
    equipment: { name: "Equipamentos", emoji: "🎒", description: "Mochilas e acessórios" }
  };

  // Função para determinar o tipo de item
  const getItemType = (process: WorkshopProcess): string => {
    const outputId = process.output.resourceId;
    
    // Partes e componentes
    if (outputId.includes("cabo-") || outputId.includes("cabeca-") || outputId.includes("lamina-") || 
        outputId.includes("ponta-") || outputId.includes("haste-") || outputId.includes("anzol")) {
      return "parts";
    }
    
    // Ferramentas completas
    if (outputId.includes("machado") || outputId.includes("picareta") || outputId.includes("vara-pesca-completa")) {
      return "tools";
    }
    
    // Armas completas
    if (outputId.includes("espada") || outputId.includes("flecha")) {
      return "weapons";
    }
    
    // Equipamentos
    if (outputId.includes("mochila")) {
      return "equipment";
    }
    
    // Materiais
    return "materials";
  };

  // Agrupar processos por categoria
  const categorizedProcesses = ROBUST_WORKSHOP_PROCESSES.reduce((acc, process) => {
    if (!acc[process.category]) {
      acc[process.category] = [];
    }
    acc[process.category].push(process);
    return acc;
  }, {} as Record<string, WorkshopProcess[]>);

  // Filtrar processos por categoria e tipo
  const getFilteredProcesses = () => {
    const categoryProcesses = categorizedProcesses[activeCategory] || [];
    
    if (activeFilter === "all") {
      return categoryProcesses;
    }
    
    return categoryProcesses.filter(process => getItemType(process) === activeFilter);
  };

  // Usar função existente do game-data

  const getResourceQuantity = (resourceId: string): number => {
    const resource = resources.find(r => r.resourceId === resourceId);
    return resource ? resource.quantity : 0;
  };

  const canProcess = (process: WorkshopProcess): boolean => {
    if (playerLevel < process.requiredLevel) return false;
    
    const hasInput = getResourceQuantity(process.input.resourceId) >= process.input.quantity * processQuantity;
    const hasSecondary = !process.secondary || getResourceQuantity(process.secondary.resourceId) >= process.secondary.quantity * processQuantity;
    const hasFuel = !process.fuel || getResourceQuantity(process.fuel.resourceId) >= process.fuel.quantity * processQuantity;
    
    return hasInput && hasSecondary && hasFuel;
  };

  const getMaxProcessable = (process: WorkshopProcess): number => {
    if (playerLevel < process.requiredLevel) return 0;
    
    let max = Math.floor(getResourceQuantity(process.input.resourceId) / process.input.quantity);
    
    if (process.secondary) {
      max = Math.min(max, Math.floor(getResourceQuantity(process.secondary.resourceId) / process.secondary.quantity));
    }
    
    if (process.fuel) {
      max = Math.min(max, Math.floor(getResourceQuantity(process.fuel.resourceId) / process.fuel.quantity));
    }
    
    return Math.max(0, max);
  };

  const maxProcessable = selectedProcess ? getMaxProcessable(selectedProcess) : 0;
  const canProcessSelected = selectedProcess ? canProcess(selectedProcess) : false;

  const handleProcess = async () => {
    if (!selectedProcess || !canProcessSelected || processingInProgress) return;

    setProcessingInProgress(true);
    
    try {
      const response = await apiRequest(`/api/workshop/process/${playerId}`, {
        method: 'POST',
        body: JSON.stringify({
          processId: selectedProcess.id,
          quantity: processQuantity
        })
      });

      if (response.success) {
        setOutputItems(response.outputItems || []);
        await queryClient.invalidateQueries({ queryKey: ['/api/inventory', playerId] });
        await queryClient.invalidateQueries({ queryKey: ['/api/storage', playerId] });
        
        toast({
          title: "Processamento Concluído!",
          description: `${selectedProcess.name} processado com sucesso.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro no Processamento",
        description: "Não foi possível processar o item.",
        variant: "destructive"
      });
    } finally {
      setProcessingInProgress(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Categoria Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(categoryInfo).map(([key, category]) => (
          <button
            key={key}
            onClick={() => {
              setActiveCategory(key);
              setActiveFilter("all");
              setSelectedProcess(null);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeCategory === key
                ? `${category.color} border-2`
                : "bg-white border border-gray-200 hover:bg-gray-50"
            }`}
            title={category.description}
          >
            <span className="mr-2">{category.emoji}</span>
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Process Selection */}
        <Card>
          <CardHeader>
            <CardTitle>
              {categoryInfo[activeCategory as keyof typeof categoryInfo]?.name} - Processos Disponíveis
            </CardTitle>
            
            {/* Filtros por tipo de item */}
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(itemFilters).map(([key, filter]) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    activeFilter === key
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title={filter.description}
                >
                  <span className="mr-1">{filter.emoji}</span>
                  {filter.name}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {getFilteredProcesses().map((process) => {
              const isAvailable = canProcess(process);
              const isSelected = selectedProcess?.id === process.id;
              
              return (
                <div
                  key={process.id}
                  onClick={() => {
                    setSelectedProcess(process);
                    setProcessQuantity(1);
                    setOutputItems([]);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : isAvailable
                        ? "border-green-200 bg-green-50 hover:bg-green-100"
                        : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{process.emoji}</span>
                      <div>
                        <div className="font-medium">{process.name}</div>
                        <div className="text-xs text-gray-500">Nível {process.requiredLevel}</div>
                      </div>
                    </div>
                    {playerLevel < process.requiredLevel && (
                      <span className="text-xs text-red-500">Bloqueado</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{process.description}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Workshop Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Estação de Trabalho</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedProcess ? (
              <>
                <div className="text-center">
                  <div className="text-4xl mb-2">{selectedProcess.emoji}</div>
                  <h3 className="text-lg font-semibold">{selectedProcess.name}</h3>
                  <p className="text-sm text-gray-600">{selectedProcess.description}</p>
                </div>

                {/* Quantity Slider */}
                {maxProcessable > 1 && (
                  <div>
                    <Label className="text-sm">Quantidade: {processQuantity}</Label>
                    <Slider
                      value={[processQuantity]}
                      onValueChange={([value]) => setProcessQuantity(value)}
                      max={maxProcessable}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                )}

                {/* Process Button */}
                <Button
                  onClick={handleProcess}
                  disabled={!canProcessSelected || isBlocked || processingInProgress}
                  className={`w-full ${
                    canProcessSelected && !processingInProgress
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-gray-300"
                  }`}
                >
                  {processingInProgress ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processando...
                    </div>
                  ) : !canProcessSelected ? (
                    playerLevel < selectedProcess.requiredLevel ? "Nível insuficiente" : "Recursos insuficientes"
                  ) : (
                    `Processar ${processQuantity > 1 ? `(${processQuantity}x)` : ""}`
                  )}
                </Button>
              </>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <div className="text-4xl mb-4">🏭</div>
                <p>Selecione um processo para começar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}