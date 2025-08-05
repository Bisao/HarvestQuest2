
// ⭐ ARQUIVO CENTRAL DE IDs DO JOGO - SISTEMA UNIFICADO ⭐
// Este arquivo é a fonte única da verdade para TODOS os IDs do jogo
//
// 🔥 SISTEMA MODULAR: Organização clara por categoria
// 📊 VALIDAÇÃO CENTRALIZADA: Todos os sistemas usam estes IDs
//
// REGRA: Todos os IDs são UUIDs v4 no formato apropriado

// Re-exportar IDs de criaturas
export * from './creature-ids';

// ===================== RESOURCE IDs =====================
export const RESOURCE_IDS = {
  // Materiais Básicos
  FIBRA: "res-f1b2c3d4-e5f6-7890-abcd-ef1234567890",
  PEDRA: "res-a2b3c4d5-e6f7-8901-bcde-f23456789012",
  PEDRAS_SOLTAS: "res-b3c4d5e6-f7g8-9012-cdef-345678901234",
  MADEIRA: "res-c4d5e6f7-g8h9-0123-def0-456789012345",
  GRAVETOS: "res-d5e6f7g8-h9i0-1234-ef01-567890123456",
  BAMBU: "res-e6f7g8h9-i0j1-2345-f012-678901234567",
  
  // Líquidos
  AGUA_FRESCA: "res-f7g8h9i0-j1k2-3456-0123-789012345678",
  
  // Animais como recursos (drops de caça) - diferentes dos IDs de criaturas
  CARNE_COELHO: "res-a1e5c9f7-3b8d-4e15-9a26-2c8e6f1b9de2",
  CARNE_VEADO: "res-c9f7a1e5-8d3b-4e14-9a25-6c2e8f7b1df3", 
  CARNE_JAVALI: "res-f7a1c9e5-3d8b-4e13-9a24-8c6e2f9b7de4",
  
  // Peixes como recursos (capturados)
  CARNE_PEIXE_PEQUENO: "res-a1c9f7e5-8b3d-4e12-9a23-2c8e6f5b9df5",
  CARNE_PEIXE_GRANDE: "res-c9e5a1f7-3d8b-4e11-9a22-6c2e8f9b5de6",
  CARNE_SALMAO: "res-e5a1c9f7-8b3d-4e10-9a21-8c6e2f7b9df7",
  PEIXE_GRELHADO: "res-g8h9i0j1-k2l3-4567-1234-890123456789",
  
  // Plantas Silvestres
  COGUMELOS: "res-h9i0j1k2-l3m4-5678-2345-901234567890",
  FRUTAS_SILVESTRES: "res-i0j1k2l3-m4n5-6789-3456-012345678901",
  COGUMELOS_ASSADOS: "res-j1k2l3m4-n5o6-7890-4567-123456789012",
  
  // Alimentos Processados
  CARNE_ASSADA: "res-k2l3m4n5-o6p7-8901-5678-234567890123",
  ENSOPADO_CARNE: "res-l3m4n5o6-p7q8-9012-6789-345678901234",
  SUCO_FRUTAS: "res-m4n5o6p7-q8r9-0123-7890-456789012345",
  
  // Materiais de Crafting
  BARBANTE: "res-n5o6p7q8-r9s0-1234-8901-567890123456",
  FERRO_FUNDIDO: "res-o6p7q8r9-s0t1-2345-9012-678901234567",
  CARNE: "res-p7q8r9s0-t1u2-3456-0123-789012345678",
  COURO: "res-q8r9s0t1-u2v3-4567-1234-890123456789",
  ISCA_PESCA: "res-r9s0t1u2-v3w4-5678-2345-901234567890",
  ARGILA: "res-s0t1u2v3-w4x5-6789-3456-012345678901"
} as const;

// ===================== EQUIPMENT IDs =====================
export const EQUIPMENT_IDS = {
  // Ferramentas
  MACHADO: "eq-p7q8r9s0-t1u2-3456-0123-789012345678",
  PICARETA: "eq-q8r9s0t1-u2v3-4567-1234-890123456789",
  VARA_PESCA: "eq-r9s0t1u2-v3w4-5678-2345-901234567890",
  FOICE: "eq-s0t1u2v3-w4x5-6789-3456-012345678902",
  
  // Armas
  FACA: "eq-s0t1u2v3-w4x5-6789-3456-012345678901",
  LANCA: "eq-t1u2v3w4-x5y6-7890-4567-123456789012",
  ARCO_FLECHA: "eq-u2v3w4x5-y6z7-8901-5678-234567890123",
  
  // Containers
  BALDE_MADEIRA: "eq-v3w4x5y6-z7a8-9012-6789-345678901235",
  GARRAFA_BAMBU: "eq-w4x5y6z7-a8b9-0123-7890-456789012346",
  MOCHILA: "eq-x5y6z7a8-b9c0-1234-8901-567890123457",
  CORDA: "eq-y6z7a8b9-c0d1-2345-9012-678901234568",
  
  // Utensílios de Cozinha
  PANELA_BARRO: "eq-z7a8b9c0-d1e2-3456-0123-789012345679",
  PANELA: "eq-a8b9c0d1-e2f3-4567-1234-890123456780",
  
  // Armaduras - Capacete
  CAPACETE_COURO: "eq-v3w4x5y6-z7a8-9012-6789-345678901234",
  CAPACETE_FERRO: "eq-w4x5y6z7-a8b9-0123-7890-456789012345",
  
  // Armaduras - Peitorais
  PEITORAL_COURO: "eq-x5y6z7a8-b9c0-1234-8901-567890123456",
  PEITORAL_FERRO: "eq-y6z7a8b9-c0d1-2345-9012-678901234567",
  
  // Armaduras - Pernas
  PERNEIRAS_COURO: "eq-z7a8b9c0-d1e2-3456-0123-789012345678",
  PERNEIRAS_FERRO: "eq-a8b9c0d1-e2f3-4567-1234-890123456789",
  
  // Armaduras - Botas
  BOTAS_COURO: "eq-b9c0d1e2-f3g4-5678-2345-901234567890",
  BOTAS_FERRO: "eq-c0d1e2f3-g4h5-6789-3456-012345678901"
} as const;

// ===================== RECIPE IDs =====================
export const RECIPE_IDS = {
  // Materiais Básicos
  BARBANTE: "rec-barbante-001",
  TRONCO_PARA_MADEIRA: "rec-madeira-001",
  CORDA: "rec-corda-001",
  
  // Ferramentas
  MACHADO: "rec-machado-001",
  PICARETA: "rec-picareta-001",
  VARA_PESCA: "rec-vara-001",
  FACA: "rec-faca-001",
  FOICE: "rec-foice-001",
  
  // Armas
  ARCO_FLECHA: "rec-arco-flecha-001",
  LANCA: "rec-lanca-001",
  
  // Containers
  BALDE_MADEIRA: "rec-balde-madeira-001",
  GARRAFA_BAMBU: "rec-garrafa-bambu-001",
  MOCHILA: "rec-mochila-001",
  
  // Utensílios de Cozinha
  PANELA_BARRO: "rec-panela-barro-001",
  PANELA: "rec-panela-001",
  
  // Alimentos
  COGUMELOS_ASSADOS: "rec-cogumelos-001",
  CARNE_ASSADA: "rec-carne-001",
  PEIXE_GRELHADO: "rec-peixe-001",
  ENSOPADO_CARNE: "rec-ensopado-001",
  SUCO_FRUTAS: "rec-suco-001",
  ISCA_PESCA: "rec-isca-pesca-001",
  
  // Equipamentos
  CAPACETE_COURO: "rec-capacete-couro-001",
  PEITORAL_COURO: "rec-peitoral-couro-001",
  FACA_FERRO: "rec-faca-ferro-001"
} as const;

// ===================== BIOME IDs =====================
export const BIOME_IDS = {
  FLORESTA: "biome-floresta-001",
  MONTANHA: "biome-montanha-001", 
  PRAIA: "biome-praia-001",
  LAGO: "biome-lago-001",
  CAVERNA: "biome-caverna-001",
  PLANICIE: "biome-planicie-001"
} as const;

// ===================== QUEST IDs =====================
export const QUEST_IDS = {
  TUTORIAL_COLETA: "quest-tutorial-001",
  PRIMEIRA_FERRAMENTA: "quest-ferramenta-001",
  PRIMEIRA_CACA: "quest-caca-001",
  EXPLORADOR_INICIANTE: "quest-explorador-001"
} as const;

// ===================== SKILL IDs =====================
export const SKILL_IDS = {
  // === COLETA E EXPLORAÇÃO ===
  COLETA: "skill-f1a2b3c4-d5e6-7890-abcd-123456789abc",
  MINERACAO: "skill-g2b3c4d5-e6f7-8901-bcde-234567890bcd",
  LENHADOR: "skill-h3c4d5e6-f7g8-9012-cdef-345678901cde",
  PESCA: "skill-i4d5e6f7-g8h9-0123-def0-456789012def",
  CACA: "skill-j5e6f7g8-h9i0-1234-ef01-567890123ef0",
  EXPLORACAO: "skill-k6f7g8h9-i0j1-2345-f012-678901234f01",

  // === CRIAÇÃO E ARTESANATO ===
  ARTESANATO: "skill-l7g8h9i0-j1k2-3456-0123-789012345012",
  FERRARIA: "skill-m8h9i0j1-k2l3-4567-1234-890123456123",
  CULINARIA: "skill-n9i0j1k2-l3m4-5678-2345-901234567234",
  ALQUIMIA: "skill-o0j1k2l3-m4n5-6789-3456-012345678345",

  // === COMBATE E SOBREVIVÊNCIA ===
  COMBATE: "skill-p1k2l3m4-n5o6-7890-4567-123456789456",
  DEFESA: "skill-q2l3m4n5-o6p7-8901-5678-234567890567",
  SOBREVIVENCIA: "skill-r3m4n5o6-p7q8-9012-6789-345678901678",

  // === ESPECIALIZAÇÃO ===
  RESISTENCIA: "skill-s4n5o6p7-q8r9-0123-7890-456789012789",
  AGILIDADE: "skill-t5o6p7q8-r9s0-1234-8901-567890123890",
  SORTE: "skill-u6p7q8r9-s0t1-2345-9012-678901234901"
} as const;

// ===================== VALIDATION HELPERS =====================
export function isResourceId(id: string): boolean {
  return id.startsWith('res-');
}

export function isEquipmentId(id: string): boolean {
  return id.startsWith('eq-');
}

export function isRecipeId(id: string): boolean {
  return id.startsWith('rec-');
}

export function isBiomeId(id: string): boolean {
  return id.startsWith('biome-');
}

export function isQuestId(id: string): boolean {
  return id.startsWith('quest-');
}

export function isSkillId(id: string): boolean {
  return id.startsWith('skill-');
}

export function getAllValidIds(): string[] {
  return [
    ...Object.values(RESOURCE_IDS),
    ...Object.values(EQUIPMENT_IDS),
    ...Object.values(RECIPE_IDS),
    ...Object.values(BIOME_IDS),
    ...Object.values(QUEST_IDS),
    ...Object.values(SKILL_IDS)
  ];
}

// ===================== EXPORTS =====================
export const ALL_GAME_IDS = {
  RESOURCES: RESOURCE_IDS,
  EQUIPMENT: EQUIPMENT_IDS,
  RECIPES: RECIPE_IDS,
  BIOMES: BIOME_IDS,
  QUESTS: QUEST_IDS,
  SKILLS: SKILL_IDS
} as const;
