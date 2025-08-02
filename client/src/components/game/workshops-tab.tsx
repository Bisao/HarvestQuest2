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

// SISTEMA ROBUSTO DE OFICINAS - INTEGRADO COM ITENS MODERNOS
const ROBUST_WORKSHOP_PROCESSES: WorkshopProcess[] = [
  // ===== BANCADA - MATERIAIS E COMPONENTES =====
  {
    id: "proc-barbante-001",
    name: "Barbante",
    emoji: "🧵",
    description: "Processar fibras em barbante resistente",
    category: "bancada",
    requiredLevel: 1,
    input: { resourceId: RESOURCE_IDS.FIBRA, quantity: 4 },
    output: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 3 },
    processingTime: 15,
    efficiency: 85,
    experienceGained: 5
  },
  {
    id: "proc-corda-resistente-001",
    name: "Corda Resistente",
    emoji: "🪢",
    description: "Trançar barbante em corda resistente",
    category: "bancada",
    requiredLevel: 2,
    input: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 6 },
    output: { resourceId: RESOURCE_IDS.CORDA_RESIS, quantity: 2 },
    processingTime: 25,
    efficiency: 80,
    experienceGained: 12
  },
  {
    id: "proc-linho-processado-001",
    name: "Linho Processado",
    emoji: "🌾",
    description: "Processe linho bruto em fibra de qualidade",
    category: "bancada",
    requiredLevel: 3,
    input: { resourceId: RESOURCE_IDS.LINHO, quantity: 3 },
    output: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 5 },
    processingTime: 20,
    efficiency: 90,
    experienceGained: 15
  },
  {
    id: "proc-algodao-processado-001",
    name: "Algodão Processado",
    emoji: "☁️",
    description: "Processe algodão em fibra macia",
    category: "bancada",
    requiredLevel: 2,
    input: { resourceId: RESOURCE_IDS.ALGODAO, quantity: 4 },
    output: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 6 },
    processingTime: 18,
    efficiency: 95,
    experienceGained: 12
  },
  {
    id: "proc-canamo-processado-001",
    name: "Cânhamo Processado",
    emoji: "🌿",
    description: "Processe cânhamo em corda resistente",
    category: "bancada",
    requiredLevel: 3,
    input: { resourceId: RESOURCE_IDS.CANAMO, quantity: 2 },
    output: { resourceId: RESOURCE_IDS.CORDA_RESIS, quantity: 3 },
    processingTime: 30,
    efficiency: 88,
    experienceGained: 18
  },
  {
    id: "proc-couro-curtido-001",
    name: "Couro Curtido",
    emoji: "🦫",
    description: "Curta couro bruto em material utilizável",
    category: "bancada",
    requiredLevel: 4,
    input: { resourceId: RESOURCE_IDS.COURO, quantity: 2 },
    secondary: { resourceId: RESOURCE_IDS.FIBRA, quantity: 3 },
    output: { resourceId: RESOURCE_IDS.COURO_CURTIDO, quantity: 1 },
    processingTime: 45,
    efficiency: 85,
    experienceGained: 25
  },
  {
    id: "proc-machado-improvisado-001",
    name: "Machado Improvisado",
    emoji: "🪓",
    description: "Monte uma ferramenta básica para cortar madeira",
    category: "bancada",
    requiredLevel: 1,
    input: { resourceId: RESOURCE_IDS.PEDRA, quantity: 2 },
    secondary: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 1 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 3 },
    output: { resourceId: RESOURCE_IDS.MACHADO_IMPROVISADO, quantity: 1 },
    processingTime: 25,
    efficiency: 80,
    experienceGained: 15
  },
  {
    id: "proc-picareta-improvisada-001",
    name: "Picareta Improvisada",
    emoji: "⛏️",
    description: "Construa uma ferramenta rústica para quebrar pedras",
    category: "bancada",
    requiredLevel: 1,
    input: { resourceId: RESOURCE_IDS.PEDRA, quantity: 3 },
    secondary: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 1 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 2 },
    output: { resourceId: RESOURCE_IDS.PICARETA_IMPROVISADA, quantity: 1 },
    processingTime: 30,
    efficiency: 75,
    experienceGained: 18
  },

  // ===== MADEIRA - PROCESSAMENTO E PARTES =====
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
  {
    id: "proc-carvalho-processado-001",
    name: "Carvalho Processado",
    emoji: "🌳",
    description: "Processe madeira de carvalho premium",
    category: "madeira",
    requiredLevel: 5,
    input: { resourceId: RESOURCE_IDS.MADEIRA_CARVALHO, quantity: 1 },
    output: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 3 },
    processingTime: 40,
    efficiency: 85,
    experienceGained: 30
  },
  {
    id: "proc-cedro-processado-001",
    name: "Cedro Processado",
    emoji: "🌲",
    description: "Processe madeira de cedro aromática",
    category: "madeira",
    requiredLevel: 6,
    input: { resourceId: RESOURCE_IDS.MADEIRA_CEDRO, quantity: 1 },
    output: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 4 },
    processingTime: 35,
    efficiency: 90,
    experienceGained: 35
  },
  {
    id: "proc-cabo-machado-001",
    name: "Cabo de Machado",
    emoji: "🪓",
    description: "Talhe madeira em cabo ergonômico para machado",
    category: "madeira",
    requiredLevel: 3,
    input: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 2 },
    output: { resourceId: RESOURCE_IDS.CABO_MACHADO, quantity: 1 },
    processingTime: 35,
    efficiency: 85,
    experienceGained: 18
  },
  {
    id: "proc-cabo-espada-001",
    name: "Cabo de Espada",
    emoji: "⚔️",
    description: "Esculpa empunhadura ergonômica para espada",
    category: "madeira",
    requiredLevel: 4,
    input: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 1 },
    secondary: { resourceId: RESOURCE_IDS.COURO_CURTIDO, quantity: 1 },
    output: { resourceId: RESOURCE_IDS.CABO_ESPADA, quantity: 1 },
    processingTime: 40,
    efficiency: 90,
    experienceGained: 22
  },

  // ===== PEDRAS - PROCESSAMENTO DE MINERAIS E GEMAS =====
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
  {
    id: "proc-quartzo-lapidado-001",
    name: "Quartzo Lapidado",
    emoji: "💎",
    description: "Lapide quartzo bruto em cristal puro",
    category: "pedras",
    requiredLevel: 6,
    input: { resourceId: RESOURCE_IDS.QUARTZO, quantity: 2 },
    output: { resourceId: RESOURCE_IDS.QUARTZO, quantity: 3 },
    processingTime: 60,
    efficiency: 110,
    experienceGained: 40
  },
  {
    id: "proc-ametista-polida-001",
    name: "Ametista Polida",
    emoji: "🔮",
    description: "Polir ametista bruta revelando seu brilho místico",
    category: "pedras",
    requiredLevel: 8,
    input: { resourceId: RESOURCE_IDS.AMETISTA, quantity: 1 },
    output: { resourceId: RESOURCE_IDS.AMETISTA, quantity: 2 },
    processingTime: 90,
    efficiency: 150,
    experienceGained: 60
  },

  // ===== FORJA - METAIS E COMPONENTES =====
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
    id: "proc-barra-ferro-001",
    name: "Barra de Ferro",
    emoji: "🔗",
    description: "Forje ferro fundido em barras utilizáveis",
    category: "forja",
    requiredLevel: 7,
    input: { resourceId: RESOURCE_IDS.FERRO_FUNDIDO, quantity: 2 },
    fuel: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 1 },
    output: { resourceId: RESOURCE_IDS.BARRA_FERRO, quantity: 1 },
    processingTime: 60,
    efficiency: 85,
    experienceGained: 35
  },
  {
    id: "proc-cabeca-machado-001",
    name: "Cabeça de Machado",
    emoji: "🔨",
    description: "Forje cabeça cortante para machado",
    category: "forja",
    requiredLevel: 8,
    input: { resourceId: RESOURCE_IDS.BARRA_FERRO, quantity: 2 },
    fuel: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 2 },
    output: { resourceId: RESOURCE_IDS.CABECA_MACHADO, quantity: 1 },
    processingTime: 75,
    efficiency: 80,
    experienceGained: 45
  },
  {
    id: "proc-lamina-espada-001",
    name: "Lâmina de Espada",
    emoji: "⚔️",
    description: "Forje lâmina afiada e equilibrada",
    category: "forja",
    requiredLevel: 9,
    input: { resourceId: RESOURCE_IDS.BARRA_FERRO, quantity: 3 },
    fuel: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 3 },
    output: { resourceId: RESOURCE_IDS.LAMINA_ESPADA, quantity: 1 },
    processingTime: 90,
    efficiency: 75,
    experienceGained: 55
  },

  // ===== FOGUEIRA - ALIMENTOS E TRATAMENTOS =====
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
  },
  {
    id: "proc-coelho-assado-001",
    name: "Coelho Assado",
    emoji: "🐰",
    description: "Asse coelho fresco para refeição nutritiva",
    category: "fogueira",
    requiredLevel: 2,
    input: { resourceId: RESOURCE_IDS.COELHO, quantity: 1 },
    fuel: { resourceId: RESOURCE_IDS.GRAVETOS, quantity: 1 },
    output: { resourceId: RESOURCE_IDS.CARNE_ASSADA, quantity: 2 },
    processingTime: 30,
    efficiency: 100,
    experienceGained: 15
  },
  {
    id: "proc-truta-grelhada-001",
    name: "Truta Grelhada",
    emoji: "🍣",
    description: "Grelhe truta fresca para prato saboroso",
    category: "fogueira",
    requiredLevel: 3,
    input: { resourceId: RESOURCE_IDS.TRUTA, quantity: 2 },
    fuel: { resourceId: RESOURCE_IDS.GRAVETOS, quantity: 1 },
    output: { resourceId: RESOURCE_IDS.PEIXE_GRELHADO, quantity: 3 },
    processingTime: 25,
    efficiency: 105,
    experienceGained: 18
  },
  {
    id: "proc-salmao-defumado-001",
    name: "Salmão Defumado",
    emoji: "🐟",
    description: "Defume salmão para preservação de longo prazo",
    category: "fogueira",
    requiredLevel: 6,
    input: { resourceId: RESOURCE_IDS.SALMAO, quantity: 1 },
    fuel: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 2 },
    output: { resourceId: RESOURCE_IDS.PEIXE_GRELHADO, quantity: 4 },
    processingTime: 60,
    efficiency: 120,
    experienceGained: 35
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
    materials: { name: "Materiais", emoji: "🧵", description: "Barbante, corda, couro processado" },
    resources: { name: "Recursos", emoji: "🪵", description: "Madeira, pedras, materiais básicos" },
    components: { name: "Componentes", emoji: "🔧", description: "Cabos, cabeças, lâminas" },
    gems: { name: "Gemas", emoji: "💎", description: "Quartzo, ametista, diamantes" },
    metals: { name: "Metais", emoji: "🔩", description: "Ferro, barras metálicas" },
    food: { name: "Alimentos", emoji: "🍖", description: "Carnes, peixes, plantas processadas" },
    premium: { name: "Premium", emoji: "⭐", description: "Materiais de alta qualidade" }
  };

  // Função para determinar o tipo de item - ATUALIZADA
  const getItemType = (process: WorkshopProcess): string => {
    const outputId = process?.output?.resourceId;

    if (!outputId || typeof outputId !== 'string') {
      return "materials"; // Default seguro
    }

    // Componentes e partes
    if (outputId.includes("cabo-") || outputId.includes("cabeca-") || outputId.includes("lamina-") || 
        outputId.includes("empunhadura") || outputId.includes("haste-")) {
      return "components";
    }

    // Gemas e minerais preciosos
    if (outputId.includes("quartzo") || outputId.includes("ametista") || outputId.includes("diamante")) {
      return "gems";
    }

    // Materiais premium
    if (outputId.includes("carvalho") || outputId.includes("cedro") || outputId.includes("mogno") ||
        outputId.includes("resistente") || outputId.includes("curtido")) {
      return "premium";
    }

    // Materiais básicos
    if (outputId.includes("barbante") || outputId.includes("corda") || outputId.includes("couro") ||
        outputId.includes("linho") || outputId.includes("algodao") || outputId.includes("canamo")) {
      return "materials";
    }

    // Recursos processados
    if (outputId.includes("madeira") || outputId.includes("pedra") || outputId.includes("argila") ||
        outputId.includes("bambu") || outputId.includes("fibra")) {
      return "resources";
    }

    // Metais
    if (outputId.includes("ferro") || outputId.includes("metal") || outputId.includes("barra") ||
        outputId.includes("fundido")) {
      return "metals";
    }

    // Alimentos
    if (outputId.includes("carne") || outputId.includes("peixe") || outputId.includes("cogumelo") ||
        outputId.includes("assada") || outputId.includes("grelhado") || outputId.includes("truta") ||
        outputId.includes("salmao") || outputId.includes("coelho") || outputId.includes("frutas")) {
      return "food";
    }

    return "materials"; // Default
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

    return categoryProcesses.filter(process => {
      try {
        return getItemType(process) === activeFilter;
      } catch (error) {
        console.error("Erro ao filtrar processo:", process, error);
        return false;
      }
    });
  };

  // Get resource data safely
  const getResourceData = (resourceId: string) => {
    if (!resourceId) return { id: "unknown", name: "Recurso Desconhecido", emoji: "📦" };

    const resource = resources.find(r => r.id === resourceId);
    if (resource) return resource;

    const fallbackNames: Record<string, { name: string; emoji: string }> = {
      // Recursos Básicos
      [RESOURCE_IDS.GRAVETOS]: { name: "Gravetos", emoji: "🪵" },
      [RESOURCE_IDS.MADEIRA]: { name: "Madeira", emoji: "🪵" },
      [RESOURCE_IDS.PEDRAS_SOLTAS]: { name: "Pedras Pequenas", emoji: "🪨" },
      [RESOURCE_IDS.PEDRA]: { name: "Pedra", emoji: "🪨" },
      [RESOURCE_IDS.FIBRA]: { name: "Fibra", emoji: "🌾" },
      [RESOURCE_IDS.BAMBU]: { name: "Bambu", emoji: "🎋" },
      [RESOURCE_IDS.ARGILA]: { name: "Argila", emoji: "🧱" },
      
      // Fibras Especializadas
      [RESOURCE_IDS.LINHO]: { name: "Linho", emoji: "🌾" },
      [RESOURCE_IDS.ALGODAO]: { name: "Algodão", emoji: "☁️" },
      [RESOURCE_IDS.CANAMO]: { name: "Cânhamo", emoji: "🌿" },
      
      // Madeiras Premium
      [RESOURCE_IDS.MADEIRA_CARVALHO]: { name: "Madeira de Carvalho", emoji: "🌳" },
      [RESOURCE_IDS.MADEIRA_CEDRO]: { name: "Madeira de Cedro", emoji: "🌲" },
      [RESOURCE_IDS.MADEIRA_MOGNO]: { name: "Madeira de Mogno", emoji: "🌴" },
      
      // Gemas e Minerais
      [RESOURCE_IDS.QUARTZO]: { name: "Quartzo", emoji: "💎" },
      [RESOURCE_IDS.AMETISTA]: { name: "Ametista", emoji: "🔮" },
      [RESOURCE_IDS.DIAMANTE]: { name: "Diamante", emoji: "💍" },
      
      // Materiais Processados
      [RESOURCE_IDS.BARBANTE]: { name: "Barbante", emoji: "🧵" },
      [RESOURCE_IDS.CORDA_RESIS]: { name: "Corda Resistente", emoji: "🪢" },
      [RESOURCE_IDS.COURO_CURTIDO]: { name: "Couro Curtido", emoji: "🦫" },
      
      // Metais
      [RESOURCE_IDS.FERRO_FUNDIDO]: { name: "Ferro Fundido", emoji: "🔩" },
      [RESOURCE_IDS.BARRA_FERRO]: { name: "Barra de Ferro", emoji: "🔗" },
      
      // Componentes
      [RESOURCE_IDS.CABO_MACHADO]: { name: "Cabo de Machado", emoji: "🪓" },
      [RESOURCE_IDS.CABO_ESPADA]: { name: "Cabo de Espada", emoji: "⚔️" },
      [RESOURCE_IDS.CABECA_MACHADO]: { name: "Cabeça de Machado", emoji: "🔨" },
      [RESOURCE_IDS.LAMINA_ESPADA]: { name: "Lâmina de Espada", emoji: "⚔️" },
      
      // Animais e Carne
      [RESOURCE_IDS.CARNE]: { name: "Carne", emoji: "🥩" },
      [RESOURCE_IDS.CARNE_ASSADA]: { name: "Carne Assada", emoji: "🍖" },
      [RESOURCE_IDS.COELHO]: { name: "Coelho", emoji: "🐰" },
      [RESOURCE_IDS.RAPOSA]: { name: "Raposa", emoji: "🦊" },
      [RESOURCE_IDS.VEADO]: { name: "Veado", emoji: "🦌" },
      [RESOURCE_IDS.JAVALI]: { name: "Javali", emoji: "🐗" },
      [RESOURCE_IDS.URSO]: { name: "Urso", emoji: "🐻" },
      
      // Peixes
      [RESOURCE_IDS.PEIXE_PEQUENO]: { name: "Peixe Pequeno", emoji: "🐟" },
      [RESOURCE_IDS.PEIXE_GRELHADO]: { name: "Peixe Grelhado", emoji: "🍣" },
      [RESOURCE_IDS.TRUTA]: { name: "Truta", emoji: "🐟" },
      [RESOURCE_IDS.SALMAO]: { name: "Salmão", emoji: "🍣" },
      [RESOURCE_IDS.ATUM]: { name: "Atum", emoji: "🐟" },
      
      // Plantas e Consumíveis
      [RESOURCE_IDS.COGUMELOS]: { name: "Cogumelos", emoji: "🍄" },
      [RESOURCE_IDS.COGUMELOS_ASSADOS]: { name: "Cogumelos Assados", emoji: "🍄" },
      [RESOURCE_IDS.FRUTAS_SILVESTRES]: { name: "Frutas Silvestres", emoji: "🫐" },
      [RESOURCE_IDS.ERVAS_MEDICINAIS]: { name: "Ervas Medicinais", emoji: "🌿" }
    };

    return {
      id: resourceId,
      name: fallbackNames[resourceId]?.name || "Recurso Desconhecido",
      emoji: fallbackNames[resourceId]?.emoji || "📦"
    };
  };

  // Get available quantity in storage
  const getStorageQuantity = (resourceId: string) => {
    if (!resourceId) return 0;
    const storageItem = storageItems.find(item => item.resourceId === resourceId);
    return storageItem ? storageItem.quantity : 0;
  };

  // Calculate max processable quantity
  const getMaxProcessable = (process: WorkshopProcess) => {
    if (!process) return 0;

    const availableInput = getStorageQuantity(process.input?.resourceId);
    const inputLimit = Math.floor(availableInput / (process.input?.quantity || 1));

    if (process.secondary) {
      const availableSecondary = getStorageQuantity(process.secondary.resourceId);
      const secondaryLimit = Math.floor(availableSecondary / process.secondary.quantity);
      return Math.min(inputLimit, secondaryLimit);
    }

    if (process.fuel) {
      const availableFuel = getStorageQuantity(process.fuel.resourceId);
      const fuelLimit = Math.floor(availableFuel / process.fuel.quantity);
      return Math.min(inputLimit, fuelLimit);
    }

    return inputLimit;
  };

  // Check if process can be executed
  const canProcess = (process: WorkshopProcess) => {
    if (!process || playerLevel < process.requiredLevel) return false;
    return getMaxProcessable(process) > 0;
  };

  // Process mutation
  const processMutation = useMutation({
    mutationFn: async ({ processId, quantity = 1 }: { processId: string; quantity?: number }) => {
      const response = await fetch("/api/v2/workshop/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, processId, quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro no servidor" }));
        throw new Error(errorData.message || `Erro HTTP ${response.status}`);
      }

      return await response.json();
    },
    onSuccess: (response) => {
      const quantity = processQuantity;
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

      // Invalidate queries
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

  // Handle process action
  const handleProcess = () => {
    if (!selectedProcess || isBlocked || !canProcess(selectedProcess) || processingInProgress) return;

    setProcessingInProgress(true);
    processMutation.mutate({ processId: selectedProcess.id, quantity: processQuantity });
  };

  const maxProcessable = selectedProcess ? getMaxProcessable(selectedProcess) : 0;
  const canProcessSelected = selectedProcess ? canProcess(selectedProcess) : false;

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
                {/* Slots */}
                <div className="flex justify-center items-center gap-8">
                  {/* Input Slot */}
                  {renderSlot(
                    "Recurso",
                    selectedProcess.input?.resourceId,
                    (selectedProcess.input?.quantity || 0) * processQuantity,
                    undefined,
                    false
                  )}

                  {/* Secondary Slot */}
                  {selectedProcess.secondary && renderSlot(
                    "Material",
                    selectedProcess.secondary.resourceId,
                    selectedProcess.secondary.quantity * processQuantity,
                    undefined,
                    false
                  )}

                  {/* Fuel Slot */}
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
                    selectedProcess.output?.resourceId,
                    (selectedProcess.output?.quantity || 0) * processQuantity,
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

                {/* Output Items Display */}
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
                      onClick={() => setOutputItems([])}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Confirmar
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