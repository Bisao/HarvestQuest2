
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
  
  // Animais (mantidos para compatibilidade)
  COELHO: "res-a1e5c9f7-3b8d-4e15-9a26-2c8e6f1b9de2",
  VEADO: "res-c9f7a1e5-8d3b-4e14-9a25-6c2e8f7b1df3", 
  JAVALI: "res-f7a1c9e5-3d8b-4e13-9a24-8c6e2f9b7de4",
  
  // Peixes
  PEIXE_PEQUENO: "res-a1c9f7e5-8b3d-4e12-9a23-2c8e6f5b9df5",
  PEIXE_GRANDE: "res-c9e5a1f7-3d8b-4e11-9a22-6c2e8f9b5de6",
  SALMAO: "res-e5a1c9f7-8b3d-4e10-9a21-8c6e2f7b9df7",
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
  FERRO_FUNDIDO: "res-o6p7q8r9-s0t1-2345-9012-678901234567"
} as const;

// ===================== EQUIPMENT IDs =====================
export const EQUIPMENT_IDS = {
  // Ferramentas
  MACHADO: "eq-p7q8r9s0-t1u2-3456-0123-789012345678",
  PICARETA: "eq-q8r9s0t1-u2v3-4567-1234-890123456789",
  VARA_PESCA: "eq-r9s0t1u2-v3w4-5678-2345-901234567890",
  
  // Armas
  FACA: "eq-s0t1u2v3-w4x5-6789-3456-012345678901",
  LANCA: "eq-t1u2v3w4-x5y6-7890-4567-123456789012",
  ARCO: "eq-u2v3w4x5-y6z7-8901-5678-234567890123",
  
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
  
  // Ferramentas
  MACHADO_MADEIRA: "rec-machado-001",
  PICARETA_PEDRA: "rec-picareta-001",
  VARA_PESCA_BAMBU: "rec-vara-001",
  
  // Alimentos
  COGUMELOS_ASSADOS: "rec-cogumelos-001",
  CARNE_ASSADA: "rec-carne-001",
  PEIXE_GRELHADO: "rec-peixe-001",
  ENSOPADO_CARNE: "rec-ensopado-001",
  SUCO_FRUTAS: "rec-suco-001",
  
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

export function getAllValidIds(): string[] {
  return [
    ...Object.values(RESOURCE_IDS),
    ...Object.values(EQUIPMENT_IDS),
    ...Object.values(RECIPE_IDS),
    ...Object.values(BIOME_IDS),
    ...Object.values(QUEST_IDS)
  ];
}

// ===================== EXPORTS =====================
export const ALL_GAME_IDS = {
  RESOURCES: RESOURCE_IDS,
  EQUIPMENT: EQUIPMENT_IDS,
  RECIPES: RECIPE_IDS,
  BIOMES: BIOME_IDS,
  QUESTS: QUEST_IDS
} as const;
