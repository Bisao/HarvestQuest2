
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
  category: "bancada" | "madeira" | "pedras" | "forja" | "fogueira";
  requiredLevel: number;
  input: {
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

const WORKSHOP_PROCESSES: WorkshopProcess[] = [
  // MATERIAIS BÁSICOS
  {
    id: "proc-barbante-001",
    name: "Barbante",
    emoji: "🧵",
    description: "Processe fibras em barbante útil",
    category: "bancada",
    requiredLevel: 1,
    input: { resourceId: RESOURCE_IDS.FIBRA, quantity: 5 },
    output: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 1 },
    processingTime: 5,
    efficiency: 100,
    experienceGained: 10
  },

  // FERRAMENTAS BÁSICAS
  {
    id: "proc-machado-001",
    name: "Machado",
    emoji: "🪓",
    description: "Crie um machado para cortar madeira",
    category: "madeira",
    requiredLevel: 1,
    input: { resourceId: RESOURCE_IDS.PEDRAS_SOLTAS, quantity: 1 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 2 },
    output: { resourceId: "eq-tool-2b3c4d5e-6f78-9012-bcde-f12345678901", quantity: 1 }, // EQUIPMENT_IDS.MACHADO
    processingTime: 30,
    efficiency: 95,
    experienceGained: 25
  },
  {
    id: "proc-picareta-001",
    name: "Picareta", 
    emoji: "⛏️",
    description: "Forje uma picareta para mineração",
    category: "forja",
    requiredLevel: 1,
    input: { resourceId: RESOURCE_IDS.PEDRAS_SOLTAS, quantity: 2 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 2 },
    output: { resourceId: "eq-tool-1a2b3c4d-5e6f-7890-abcd-ef1234567890", quantity: 1 }, // EQUIPMENT_IDS.PICARETA
    processingTime: 35,
    efficiency: 95,
    experienceGained: 30
  },
  {
    id: "proc-faca-001",
    name: "Faca",
    emoji: "🗡️",
    description: "Forje uma faca para caça e corte",
    category: "forja",
    requiredLevel: 1,
    input: { resourceId: RESOURCE_IDS.PEDRAS_SOLTAS, quantity: 1 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 1 },
    output: { resourceId: "eq-tool-6f789012-3456-7890-f123-456789012345", quantity: 1 }, // EQUIPMENT_IDS.FACA
    processingTime: 25,
    efficiency: 95,
    experienceGained: 20
  },
  {
    id: "proc-vara-pesca-001",
    name: "Vara de Pesca",
    emoji: "🎣",
    description: "Monte uma vara de pesca",
    category: "madeira",
    requiredLevel: 3,
    input: { resourceId: RESOURCE_IDS.GRAVETOS, quantity: 3 },
    fuel: { resourceId: RESOURCE_IDS.FIBRA, quantity: 2 },
    output: { resourceId: "eq-tool-4d5e6f78-9012-3456-def1-234567890123", quantity: 1 }, // EQUIPMENT_IDS.VARA_PESCA
    processingTime: 45,
    efficiency: 85,
    experienceGained: 40
  },
  {
    id: "proc-foice-001",
    name: "Foice",
    emoji: "🔪",
    description: "Forje uma foice para colheita",
    category: "forja",
    requiredLevel: 2,
    input: { resourceId: RESOURCE_IDS.PEDRA, quantity: 1 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 2 },
    output: { resourceId: "eq-tool-5e6f7890-1234-5678-ef12-345678901234", quantity: 1 }, // EQUIPMENT_IDS.FOICE
    processingTime: 40,
    efficiency: 90,
    experienceGained: 35
  },

  // ARMAS
  {
    id: "proc-arco-flecha-001",
    name: "Arco e Flecha",
    emoji: "🏹",
    description: "Crie um arco para caça à distância",
    category: "madeira",
    requiredLevel: 5,
    input: { resourceId: RESOURCE_IDS.GRAVETOS, quantity: 2 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 2 },
    output: { resourceId: "eq-weap-a1b2c3d4-5e6f-7890-abcd-ef1234567890", quantity: 1 }, // EQUIPMENT_IDS.ARCO_FLECHA
    processingTime: 60,
    efficiency: 70,
    experienceGained: 60
  },
  {
    id: "proc-lanca-001",
    name: "Lança",
    emoji: "🔱",
    description: "Forje uma lança para combate",
    category: "forja",
    requiredLevel: 4,
    input: { resourceId: RESOURCE_IDS.GRAVETOS, quantity: 2 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 4 },
    output: { resourceId: "eq-weap-b2c3d4e5-6f78-9012-bcde-f12345678901", quantity: 1 }, // EQUIPMENT_IDS.LANCA
    processingTime: 50,
    efficiency: 80,
    experienceGained: 50
  },

  // UTENSÍLIOS
  {
    id: "proc-balde-madeira-001",
    name: "Balde de Madeira",
    emoji: "🪣",
    description: "Construa um balde para transportar água",
    category: "madeira",
    requiredLevel: 2,
    input: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 1 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 2 },
    output: { resourceId: "eq-tool-7890123a-4567-8901-1234-567890123456", quantity: 1 }, // EQUIPMENT_IDS.BALDE_MADEIRA
    processingTime: 40,
    efficiency: 90,
    experienceGained: 35
  },
  {
    id: "proc-garrafa-bambu-001",
    name: "Garrafa de Bambu",
    emoji: "🧴",
    description: "Crie uma garrafa para armazenar líquidos",
    category: "madeira",
    requiredLevel: 3,
    input: { resourceId: RESOURCE_IDS.BAMBU, quantity: 1 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 1 },
    output: { resourceId: "eq-tool-890123ab-5678-9012-2345-678901234567", quantity: 1 }, // EQUIPMENT_IDS.GARRAFA_BAMBU
    processingTime: 35,
    efficiency: 90,
    experienceGained: 30
  },
  {
    id: "proc-mochila-001",
    name: "Mochila",
    emoji: "🎒",
    description: "Costure uma mochila para mais capacidade",
    category: "bancada",
    requiredLevel: 5,
    input: { resourceId: RESOURCE_IDS.COURO, quantity: 2 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 5 },
    output: { resourceId: "eq-util-78901234-5678-9012-1234-567890123456", quantity: 1 }, // EQUIPMENT_IDS.MOCHILA
    processingTime: 60,
    efficiency: 80,
    experienceGained: 50
  },
  {
    id: "proc-corda-001",
    name: "Corda",
    emoji: "🪢",
    description: "Trança barbante em corda resistente",
    category: "bancada",
    requiredLevel: 2,
    input: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 3 },
    output: { resourceId: "eq-tool-0123abcd-789a-1234-4567-89012345678a", quantity: 1 }, // EQUIPMENT_IDS.CORDA
    processingTime: 20,
    efficiency: 90,
    experienceGained: 15
  },

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

  // BANCADA (CRIAÇÃO DE ITENS)
  {
    id: "proc-fibra-processada-001",
    name: "Fibra Processada",
    emoji: "🌾",
    description: "Processe fibras brutas em material têxtil",
    category: "bancada",
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
    category: "bancada", 
    requiredLevel: 5,
    input: { resourceId: RESOURCE_IDS.COURO, quantity: 2 },
    output: { resourceId: RESOURCE_IDS.COURO, quantity: 3 },
    processingTime: 60,
    efficiency: 110,
    experienceGained: 30
  },

  // FORJA (METAIS)
  {
    id: "proc-ferro-fundido-001",
    name: "Fundição de Ferro",
    emoji: "🔩",
    description: "Processe pedras em ferro fundido usando madeira como combustível",
    category: "forja",
    requiredLevel: 6,
    input: { resourceId: RESOURCE_IDS.PEDRA, quantity: 6 },
    fuel: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 2 },
    output: { resourceId: RESOURCE_IDS.FERRO_FUNDIDO, quantity: 2 },
    processingTime: 90,
    efficiency: 70,
    experienceGained: 40
  },
  {
    id: "proc-ferro-avancado-001",
    name: "Ferro Refinado",
    emoji: "⚙️",
    description: "Refine ferro fundido em ferro de alta qualidade",
    category: "forja",
    requiredLevel: 8,
    input: { resourceId: RESOURCE_IDS.FERRO_FUNDIDO, quantity: 3 },
    fuel: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 3 },
    output: { resourceId: RESOURCE_IDS.FERRO_FUNDIDO, quantity: 4 },
    processingTime: 120,
    efficiency: 85,
    experienceGained: 60
  },

  // FOGUEIRA (ALIMENTOS)
  {
    id: "proc-conservas-001",
    name: "Conservas de Carne",
    emoji: "🥩",
    description: "Processe carne fresca usando gravetos como combustível",
    category: "fogueira",
    requiredLevel: 4,
    input: { resourceId: RESOURCE_IDS.CARNE, quantity: 3 },
    fuel: { resourceId: RESOURCE_IDS.GRAVETOS, quantity: 2 },
    output: { resourceId: RESOURCE_IDS.CARNE_ASSADA, quantity: 4 },
    processingTime: 50,
    efficiency: 105,
    experienceGained: 22
  },
  {
    id: "proc-cogumelos-secos-001",
    name: "Cogumelos Secos",
    emoji: "🍄",
    description: "Desidrate cogumelos usando gravetos como combustível",
    category: "fogueira",
    requiredLevel: 3,
    input: { resourceId: RESOURCE_IDS.COGUMELOS, quantity: 5 },
    fuel: { resourceId: RESOURCE_IDS.GRAVETOS, quantity: 1 },
    output: { resourceId: RESOURCE_IDS.COGUMELOS_ASSADOS, quantity: 6 },
    processingTime: 35,
    efficiency: 115,
    experienceGained: 18
  },
  {
    id: "proc-peixe-defumado-001",
    name: "Peixe Defumado",
    emoji: "🐟",
    description: "Defume peixe para preservação prolongada",
    category: "fogueira",
    requiredLevel: 5,
    input: { resourceId: RESOURCE_IDS.PEIXE_PEQUENO, quantity: 2 },
    fuel: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 1 },
    output: { resourceId: RESOURCE_IDS.PEIXE_GRELHADO, quantity: 3 },
    processingTime: 45,
    efficiency: 110,
    experienceGained: 25
  }
];

export default function WorkshopsTab({ resources, playerLevel, playerId, isBlocked = false }: WorkshopTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<string>("bancada");
  const [selectedProcess, setSelectedProcess] = useState<WorkshopProcess | null>(null);
  const [processQuantity, setProcessQuantity] = useState<number>(1);
  const [processingInProgress, setProcessingInProgress] = useState<boolean>(false);
  const [outputItems, setOutputItems] = useState<Array<{resourceId: string, quantity: number}>>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");

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
        return result;
      } catch (error) {
        console.error("Workshop Process Error Details:", error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Erro de conexão com o servidor");
      }
    },
    onSuccess: (response) => {
      const data = response.data || response;
      const quantity = data?.quantity || processQuantity;
      const processName = selectedProcess?.name || "Item";

      // Add to output
      const outputResource = selectedProcess?.output;
      if (outputResource) {
        setOutputItems(prev => [
          ...prev,
          { resourceId: outputResource.resourceId, quantity: outputResource.quantity * quantity }
        ]);
      }

      toast({
        title: "Processamento Concluído!",
        description: `${quantity}x ${processName} foi processado com sucesso!`,
      });

      setProcessingInProgress(false);
      setProcessQuantity(1);

      // Force cache invalidation
      queryClient.removeQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player", playerId] });
    },
    onError: (error: any) => {
      console.error("Workshop process error:", error);
      setProcessingInProgress(false);
      
      toast({
        title: "Erro no Processamento",
        description: error.message || "Não foi possível processar o recurso",
        variant: "destructive",
      });
    },
  });

  // Store output items mutation
  const storeOutputMutation = useMutation({
    mutationFn: async (items: Array<{resourceId: string, quantity: number}>) => {
      for (const item of items) {
        const response = await fetch("/api/v2/storage/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            playerId, 
            resourceId: item.resourceId, 
            quantity: item.quantity 
          }),
        });
        if (!response.ok) throw new Error("Falha ao armazenar item");
      }
    },
    onSuccess: () => {
      setOutputItems([]);
      toast({
        title: "Itens Armazenados!",
        description: "Todos os itens foram transferidos para o armazém",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
    },
    onError: () => {
      toast({
        title: "Erro ao Armazenar",
        description: "Não foi possível transferir os itens para o armazém",
        variant: "destructive",
      });
    }
  });

  // Get resource data
  const getResourceData = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (resource) return resource;

    const fallbackNames: Record<string, { name: string; emoji: string }> = {
      [RESOURCE_IDS.GRAVETOS]: { name: "Gravetos", emoji: "🪵" },
      [RESOURCE_IDS.MADEIRA]: { name: "Madeira", emoji: "🪵" },
      [RESOURCE_IDS.PEDRAS_SOLTAS]: { name: "Pedras Pequenas", emoji: "🪨" },
      [RESOURCE_IDS.PEDRA]: { name: "Pedra", emoji: "🪨" },
      [RESOURCE_IDS.FIBRA]: { name: "Fibra", emoji: "🌾" },
      [RESOURCE_IDS.BARBANTE]: { name: "Barbante", emoji: "🧵" },
      [RESOURCE_IDS.FERRO_FUNDIDO]: { name: "Ferro Fundido", emoji: "🔩" },
      [RESOURCE_IDS.CARNE]: { name: "Carne", emoji: "🥩" },
      [RESOURCE_IDS.CARNE_ASSADA]: { name: "Carne Assada", emoji: "🍖" },
      [RESOURCE_IDS.COGUMELOS]: { name: "Cogumelos", emoji: "🍄" },
      [RESOURCE_IDS.COGUMELOS_ASSADOS]: { name: "Cogumelos Assados", emoji: "🍄" },
      [RESOURCE_IDS.PEIXE_PEQUENO]: { name: "Peixe", emoji: "🐟" },
      [RESOURCE_IDS.PEIXE_GRELHADO]: { name: "Peixe Grelhado", emoji: "🐟" }
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
    const inputLimit = Math.floor(availableInput / process.input.quantity);
    
    if (process.fuel) {
      const availableFuel = getStorageQuantity(process.fuel.resourceId);
      const fuelLimit = Math.floor(availableFuel / process.fuel.quantity);
      return Math.min(inputLimit, fuelLimit);
    }
    
    return inputLimit;
  };

  // Check if process can be executed
  const canProcess = (process: WorkshopProcess) => {
    if (playerLevel < process.requiredLevel) return false;
    return getMaxProcessable(process) > 0;
  };

  // Handle process action
  const handleProcess = () => {
    if (!selectedProcess || isBlocked || !canProcess(selectedProcess) || processingInProgress) return;
    
    setProcessingInProgress(true);
    processMutation.mutate({ processId: selectedProcess.id, quantity: processQuantity });
  };

  // Render slot component
  const renderSlot = (
    title: string, 
    resourceId: string | null, 
    quantity: number, 
    onClick?: () => void,
    isEmpty: boolean = false,
    isOutput: boolean = false
  ) => {
    const resourceData = resourceId ? getResourceData(resourceId) : null;
    const availableQuantity = resourceId ? getStorageQuantity(resourceId) : 0;

    return (
      <div className="flex flex-col items-center">
        <Label className="text-sm font-medium mb-2">{title}</Label>
        <div 
          className={`w-20 h-20 border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isEmpty 
              ? "border-dashed border-gray-300 bg-gray-50" 
              : isOutput
                ? "border-green-400 bg-green-50"
                : availableQuantity >= quantity 
                  ? "border-blue-400 bg-blue-50" 
                  : "border-red-400 bg-red-50"
          }`}
          onClick={onClick}
        >
          {resourceData ? (
            <>
              <span className="text-2xl">{resourceData.emoji}</span>
              <span className="text-xs text-center font-medium">{quantity}</span>
              {!isOutput && (
                <span className={`text-xs ${availableQuantity >= quantity ? "text-green-600" : "text-red-500"}`}>
                  {availableQuantity}/{quantity}
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-400 text-xs text-center">Vazio</span>
          )}
        </div>
      </div>
    );
  };

  // Categorize processes
  const categorizedProcesses = WORKSHOP_PROCESSES.reduce((acc, process) => {
    if (!acc[process.category]) acc[process.category] = [];
    acc[process.category].push(process);
    return acc;
  }, {} as Record<string, WorkshopProcess[]>);

  const categoryInfo = {
    bancada: { name: "Bancada", emoji: "🔨", color: "bg-blue-50 border-blue-200", description: "Criação de itens e equipamentos" },
    madeira: { name: "Madeira", emoji: "🪵", color: "bg-amber-50 border-amber-200", description: "Processamento de materiais de madeira" },
    pedras: { name: "Pedras", emoji: "🪨", color: "bg-gray-50 border-gray-200", description: "Processamento de minerais e pedras" },
    forja: { name: "Forja", emoji: "🔥", color: "bg-red-50 border-red-200", description: "Fundição e trabalho com metais" },
    fogueira: { name: "Fogueira", emoji: "🏕️", color: "bg-orange-50 border-orange-200", description: "Cozimento e preservação de alimentos" }
  };

  const maxProcessable = selectedProcess ? getMaxProcessable(selectedProcess) : 0;
  const canProcessSelected = selectedProcess ? canProcess(selectedProcess) : false;

  // Filtros por tipo de item
  const itemFilters = {
    all: { name: "Todos", emoji: "📋", description: "Todos os processos" },
    tools: { name: "Ferramentas", emoji: "🔧", description: "Machados, picaretas, etc." },
    weapons: { name: "Armas", emoji: "⚔️", description: "Espadas, arcos, etc." },
    metals: { name: "Metais", emoji: "🔩", description: "Barras e ligas metálicas" },
    equipment: { name: "Equipamentos", emoji: "🎒", description: "Mochilas e equipamentos" },
    materials: { name: "Materiais", emoji: "🧵", description: "Materiais básicos" }
  };

  // Função para determinar o tipo de item baseado no ID do resultado
  const getItemType = (process: WorkshopProcess): string => {
    const outputId = process.output.resourceId;
    
    // Ferramentas
    if (outputId.includes("machado") || outputId.includes("picareta") || outputId.includes("pá")) {
      return "tools";
    }
    
    // Armas
    if (outputId.includes("espada") || outputId.includes("arco") || outputId.includes("flecha")) {
      return "weapons";
    }
    
    // Metais
    if (outputId.includes("barra") || outputId.includes("liga") || outputId.includes("metal") || outputId.includes("ferro") || outputId.includes("cobre")) {
      return "metals";
    }
    
    // Equipamentos
    if (outputId.includes("mochila") || outputId.includes("equipamento")) {
      return "equipment";
    }
    
    // Materiais básicos
    if (outputId.includes("barbante") || outputId.includes("corda") || outputId.includes("fibra") || outputId.includes("couro")) {
      return "materials";
    }
    
    return "materials"; // Default
  };

  // Filtrar processos por categoria e tipo
  const getFilteredProcesses = () => {
    const categoryProcesses = categorizedProcesses[activeCategory] || [];
    
    if (activeFilter === "all") {
      return categoryProcesses;
    }
    
    return categoryProcesses.filter(process => getItemType(process) === activeFilter);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          🏭 Oficinas de Processamento
        </h3>
        <p className="text-gray-600">
          Processe recursos brutos em materiais refinados
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
              onClick={() => {
                setActiveCategory(categoryKey);
                setSelectedProcess(null);
                setProcessQuantity(1);
                setOutputItems([]);
              }}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Process Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Processos Disponíveis</CardTitle>
            
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
                {/* Slots */}
                <div className="flex justify-center items-center gap-8">
                  {/* Input Slot */}
                  {renderSlot(
                    "Recurso",
                    selectedProcess.input.resourceId,
                    selectedProcess.input.quantity * processQuantity,
                    undefined,
                    false
                  )}

                  {/* Fuel Slot (only for forja and fogueira) */}
                  {selectedProcess.fuel && renderSlot(
                    "Combustível",
                    selectedProcess.fuel.resourceId,
                    selectedProcess.fuel.quantity * processQuantity,
                    undefined,
                    false
                  )}

                  {/* Arrow */}
                  <div className="text-center">
                    <div className="text-2xl">→</div>
                    <div className="text-xs text-gray-500">{selectedProcess.processingTime}s</div>
                  </div>

                  {/* Output Slot */}
                  {renderSlot(
                    "Resultado",
                    selectedProcess.output.resourceId,
                    selectedProcess.output.quantity * processQuantity,
                    undefined,
                    false,
                    true
                  )}
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

                {/* Process Info */}
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>Eficiência: {selectedProcess.efficiency}%</div>
                  <div>XP: +{selectedProcess.experienceGained * processQuantity}</div>
                </div>

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

                {/* Output Items */}
                {outputItems.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Itens Produzidos:</Label>
                    <div className="space-y-2">
                      {outputItems.map((item, index) => {
                        const resourceData = getResourceData(item.resourceId);
                        return (
                          <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                            <div className="flex items-center gap-2">
                              <span>{resourceData.emoji}</span>
                              <span className="text-sm">{resourceData.name}</span>
                              <span className="text-sm font-medium">x{item.quantity}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <Button
                      onClick={() => storeOutputMutation.mutate(outputItems)}
                      disabled={storeOutputMutation.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {storeOutputMutation.isPending ? "Armazenando..." : "Armazenar no Armazém"}
                    </Button>
                  </div>
                )}
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
