// Centralized ID management system for all game items and resources
// This ensures consistent IDs across backend and frontend systems

export const RESOURCE_IDS = {
  // Basic resources
  FIBRA: "res-8bd33b18-a241-4859-ae9f-870fab5673d0",
  PEDRA: "res-7c2a1f95-b8e3-4d72-9a01-6f5d8e4c9b12",
  PEDRAS_SOLTAS: "res-5e9d8c7a-3f2b-4e61-8a90-1c4b7e5f9d23",
  GRAVETOS: "res-2a8f5c1e-9b7d-4a63-8e52-9c1a6f8e4b37",
  AGUA_FRESCA: "res-4b7e1a9c-5d8f-4e32-9a76-8c2e5f1b9d48",
  BAMBU: "res-6d3a8e5c-1f9b-4e72-8a05-4c7e9f2b1d59",
  MADEIRA: "res-8e5c2a9f-7b1d-4e63-9a84-6f1c8e5a2b6a",
  ARGILA: "res-1c9e5a7b-3f8d-4e52-9a73-8e2c6f9b1d7b",
  FERRO_FUNDIDO: "res-9f7b3e1a-5d8c-4e41-9a62-2c6e8f1b5d8c",
  COURO: "res-3e1a9f7b-8d5c-4e30-9a51-6c8e2f9b3d9d",
  CARNE: "res-7b5e3a1f-1d9c-4e29-9a40-8c2e6f7b5dae",
  OSSOS: "res-5a3f7b1e-9d8c-4e18-9a39-2c6e8f3b7dbf",
  PELO: "res-1f7b5a3e-8c9d-4e17-9a28-6c2e8f5b1dc0",
  BARBANTE: "res-9d5a1f3e-7b8c-4e16-9a27-8c6e2f9b5dd1",
  
  // Animals 
  COELHO: "res-a1e5c9f7-3b8d-4e15-9a26-2c8e6f1b9de2",
  VEADO: "res-c9f7a1e5-8d3b-4e14-9a25-6c2e8f7b1df3",
  JAVALI: "res-f7a1c9e5-3d8b-4e13-9a24-8c6e2f9b7de4",
  PEIXE_PEQUENO: "res-a1c9f7e5-8b3d-4e12-9a23-2c8e6f5b9df5",
  PEIXE_GRANDE: "res-c9e5a1f7-3d8b-4e11-9a22-6c2e8f9b5de6",
  SALMAO: "res-e5a1c9f7-8b3d-4e10-9a21-8c6e2f7b9df7",
  COGUMELOS: "res-a1f7c9e5-3b8d-4e09-9a20-2c8e6f9b5de8",
  FRUTAS_SILVESTRES: "res-f7c9a1e5-8d3b-4e08-9a19-6c2e8f5b9df9",
  
  // Unique resources
  MADEIRA_FLORESTA: "res-c9a1f7e5-3d8b-4e07-9a18-8c6e2f9b7dea",
  AREIA: "res-a1e5f7c9-8b3d-4e06-9a17-2c8e6f7b5deb",
  CRISTAIS: "res-e5f7a1c9-3d8b-4e05-9a16-6c2e8f9b7dec",
  CONCHAS: "res-f7a1e5c9-8b3d-4e04-9a15-8c6e2f5b9ded",
  
  // Food resources
  SUCO_FRUTAS: "res-a1c9e5f7-3b8d-4e03-9a14-2c8e6f9b7dee",
  COGUMELOS_ASSADOS: "res-c9e5a1f7-8d3b-4e02-9a13-6c2e8f7b5def",
  PEIXE_GRELHADO: "res-e5a1c9f7-3d8b-4e01-9a12-8c6e2f9b7de0",
  CARNE_ASSADA: "res-a1f7e5c9-8b3d-4e00-9a11-2c8e6f5b9df1",
  ENSOPADO_CARNE: "res-f7e5a1c9-3d8b-4e99-9a10-6c2e8f9b7df2"
} as const;

export const EQUIPMENT_IDS = {
  // Tools
  PICARETA: "eq-tool-1a2b3c4d-5e6f-7890-abcd-ef1234567890",
  MACHADO: "eq-tool-2b3c4d5e-6f78-9012-bcde-f12345678901",
  PA: "eq-tool-3c4d5e6f-7890-1234-cdef-123456789012",
  VARA_PESCA: "eq-tool-4d5e6f78-9012-3456-def1-234567890123",
  FOICE: "eq-tool-5e6f7890-1234-5678-ef12-345678901234",
  FACA: "eq-tool-6f789012-3456-7890-f123-456789012345",
  BALDE_MADEIRA: "eq-tool-7890123a-4567-8901-1234-567890123456",
  GARRAFA_BAMBU: "eq-tool-890123ab-5678-9012-2345-678901234567",
  ISCA_PESCA: "eq-tool-bait-fishing-001",
  CORDA: "eq-tool-0123abcd-789a-1234-4567-89012345678a",
  PANELA_BARRO: "eq-tool-clay-pot-001",
  PANELA: "eq-tool-metal-pot-001",
  
  // Weapons
  ARCO_FLECHA: "eq-weap-a1b2c3d4-5e6f-7890-abcd-ef1234567890",
  LANCA: "eq-weap-b2c3d4e5-6f78-9012-bcde-f12345678901",
  ESPADA_PEDRA: "eq-weap-stone-sword-001",
  
  // Armor
  CAPACETE_COURO: "eq-armor-c3d4e5f6-7890-1234-cdef-123456789012",
  PEITORAL_COURO: "eq-armor-d4e5f678-9012-3456-def1-234567890123",
  CALCAS_COURO: "eq-armor-e5f67890-1234-5678-ef12-345678901234",
  BOTAS_COURO: "eq-armor-f6789012-3456-7890-f123-456789012345",
  CAPACETE_FERRO: "eq-armor-iron-helmet-001",
  
  // Storage/Utility
  MOCHILA: "eq-util-78901234-5678-9012-1234-567890123456",
} as const;

export const BIOME_IDS = {
  FLORESTA: "biome-150d2ded-b2d1-46c1-ad0d-8cc12732f9f9",
  DESERTO: "biome-2a5e3b7c-9d1f-4e8a-b2c6-f93845672abc",
  MONTANHA: "biome-3b6f4c8d-ae20-5f9b-c3d7-0a4956783bcd",
  OCEANO: "biome-4c7e5d9e-bf31-60ac-d4e8-1b5067894cde"
} as const;

export const QUEST_IDS = {
  PRIMEIRO_EXPLORADOR: "quest-61a0f187-0b75-4e53-a96e-ae5a0e26dde2",
  COLETOR_INICIANTE: "quest-72b1f298-1c86-5f64-ba7f-bf6b1f37ee3",
  ARTESAO_NOVATO: "quest-83c2f3a9-2d97-6075-cb80-c07c2048ff4",
  INTRODUCAO_CACA: "quest-94d3f4ba-3ea8-7186-dc91-d18d3159005",
  INTRODUCAO_PESCA: "quest-a5e4f5cb-4fb9-8297-eda2-e29e4260116"
} as const;

export const RECIPE_IDS = {
  BARBANTE: "recipe-barbante-001",
  MACHADO: "recipe-machado-001", 
  PICARETA: "recipe-picareta-001",
  FOICE: "recipe-foice-001",
  BALDE_MADEIRA: "recipe-balde-001",
  FACA: "recipe-faca-001",
  VARA_PESCA: "recipe-vara-001",
  ARCO_FLECHA: "recipe-arco-001",
  LANCA: "recipe-lanca-001",
  MOCHILA: "recipe-mochila-001",
  CORDA: "recipe-corda-001",
  ISCA_PESCA: "recipe-isca-001",
  PANELA_BARRO: "recipe-panela-barro-001",
  PANELA: "recipe-panela-001",
  GARRAFA_BAMBU: "recipe-garrafa-001",
  SUCO_FRUTAS: "recipe-suco-001",
  COGUMELOS_ASSADOS: "recipe-cogumelos-001",
  PEIXE_GRELHADO: "recipe-peixe-001",
  CARNE_ASSADA: "recipe-carne-001",
  ENSOPADO_CARNE: "recipe-ensopado-001"
} as const;

// Helper functions for type safety
export function isResourceId(id: string): boolean {
  return id.startsWith('res-');
}

export function isEquipmentId(id: string): boolean {
  return id.startsWith('eq-');
}

export function isBiomeId(id: string): boolean {
  return id.startsWith('biome-');
}

export function isQuestId(id: string): boolean {
  return id.startsWith('quest-');
}

export function isRecipeId(id: string): boolean {
  return id.startsWith('recipe-');
}

// Get all IDs for validation
export const ALL_RESOURCE_IDS = Object.values(RESOURCE_IDS);
export const ALL_EQUIPMENT_IDS = Object.values(EQUIPMENT_IDS);
export const ALL_BIOME_IDS = Object.values(BIOME_IDS);
export const ALL_QUEST_IDS = Object.values(QUEST_IDS);
export const ALL_RECIPE_IDS = Object.values(RECIPE_IDS);

// Master ID validation
export function isValidGameId(id: string): boolean {
  return [...ALL_RESOURCE_IDS, ...ALL_EQUIPMENT_IDS, ...ALL_BIOME_IDS, ...ALL_QUEST_IDS, ...ALL_RECIPE_IDS].includes(id);
}