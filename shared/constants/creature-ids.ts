// ⭐ ARQUIVO CENTRAL DE IDs DE CRIATURAS - SISTEMA MODULAR ⭐
// Este arquivo gerencia exclusivamente IDs de todas as criaturas do jogo
// 
// 🔥 SISTEMA MODULAR: Separação clara entre recursos e criaturas
// 📊 TODAS AS CRIATURAS: Animais, NPCs, Bestas, etc.
//
// REGRA: Todos os IDs de criaturas são UUIDs v4 no formato: creature-uuid

export const CREATURE_IDS = {
  // ===================== ANIMAIS TERRESTRES =====================

  // Pequenos Mamíferos
  COELHO: "cre-12345678-90ab-cdef-1234-567890abcdef",
  ESQUILO: "cre-23456789-01bc-def2-3456-789012bcdef0",
  RATO_SILVESTRE: "cre-34567890-12cd-ef34-5678-90123cdef012",

  // Médios Mamíferos
  VEADO: "cre-45678901-23de-f456-789a-0234def01234",
  RAPOSA: "cre-56789012-34ef-5678-9abc-3456ef012345",
  LOBO: "cre-67890123-45f0-6789-abcd-4567f0123456",

  // Grandes Mamíferos  
  JAVALI: "cre-78901234-5601-789a-bcde-5678012345678",
  URSO_PARDO: "cre-89012345-6712-89ab-cdef-67890123456789",
  ALCE: "cre-90123456-7823-9abc-def0-7890123456789a",

  // ===================== ANIMAIS AQUÁTICOS =====================

  // Peixes de Água Doce
  PEIXE_PEQUENO: "cre-01234567-8934-abcd-ef01-890123456789ab",
  PEIXE_GRANDE: "cre-12345678-9045-bcde-f012-90123456789abc",
  SALMAO: "cre-23456789-0156-cdef-0123-0123456789abcd",
  TRUTA: "cre-34567890-1267-def0-1234-123456789abcde",
  CARPA: "cre-45678901-2378-ef01-2345-23456789abcdef",

  // Peixes de Água Salgada
  ATUM: "cre-56789012-3489-f012-3456-3456789abcdef0",
  SARDINHA: "cre-67890123-4590-0123-4567-456789abcdef01",
  BACALHAU: "cre-78901234-5601-1234-5678-56789abcdef012",

  // ===================== AVES =====================

  // Aves Pequenas
  PARDAL: "cre-89012345-6712-2345-6789-6789abcdef0123",
  BEIJA_FLOR: "cre-90123456-7823-3456-7890-7890abcdef01234",
  CANARIO: "cre-01234567-8934-4567-8901-8901abcdef012345",

  // Aves Médias
  CORVO: "cre-12345678-9045-5678-9012-9012abcdef0123456",
  POMBO: "cre-23456789-0156-6789-0123-0123abcdef01234567",
  GALINHA_DANGOLA: "cre-34567890-1267-7890-1234-1234abcdef012345678",

  // Aves Grandes
  AGUIA: "cre-45678901-2378-8901-2345-2345abcdef0123456789",
  FALCAO: "cre-56789012-3489-9012-3456-3456abcdef0123456789a",
  CONDOR: "cre-67890123-4590-0123-4567-4567abcdef0123456789ab",

  // ===================== RÉPTEIS =====================

  // Lagartos
  LAGARTO_COMUM: "cre-78901234-5601-1234-5678-5678abcdef0123456789ac",
  IGUANA: "cre-89012345-6712-2345-6789-6789abcdef0123456789ad",
  DRAGAO_BARBUDO: "cre-90123456-7823-3456-7890-7890abcdef0123456789ae",

  // Serpentes
  COBRA_COMUM: "cre-01234567-8934-4567-8901-8901abcdef0123456789af",
  JIBOIA: "cre-12345678-9045-5678-9012-9012abcdef0123456789b0",
  COBRA_VENENOSA: "cre-23456789-0156-6789-0123-0123abcdef0123456789b1",

  // ===================== INSETOS =====================

  // Insetos Comuns
  ABELHA: "cre-34567890-1267-7890-1234-1234abcdef0123456789b2",
  BORBOLETA: "cre-45678901-2378-8901-2345-2345abcdef0123456789b3",
  GRILO: "cre-56789012-3489-9012-3456-3456abcdef0123456789b4",

  // Insetos Úteis
  MINHOCA: "cre-67890123-4590-0123-4567-4567abcdef0123456789b5",
  JOANINHA: "cre-78901234-5601-1234-5678-5678abcdef0123456789b6",
  FORMIGA: "cre-89012345-6712-2345-6789-6789abcdef0123456789b7",

  // ===================== CRIATURAS FANTÁSTICAS =====================

  // Bestas Mágicas (Para futuras expansões)
  DRAGAO_MENOR: "cre-90123456-7823-3456-7890-7890abcdef0123456789b8",
  UNICORNIO: "cre-01234567-8934-4567-8901-8901abcdef0123456789b9",
  PHOENIX: "cre-12345678-9045-5678-9012-9012abcdef0123456789ba",

  // Espíritos da Natureza
  ELEMENTAL_TERRA: "cre-23456789-0156-6789-0123-0123abcdef0123456789bb",
  ELEMENTAL_AGUA: "cre-34567890-1267-7890-1234-1234abcdef0123456789bc",
  ELEMENTAL_FOGO: "cre-45678901-2378-8901-2345-2345abcdef0123456789bd",
  ELEMENTAL_AR: "cre-56789012-3489-9012-3456-3456abcdef0123456789be"
} as const;

// ===================== CATEGORIAS DE CRIATURAS =====================

export const CREATURE_CATEGORIES = {
  MAMIFEROS_PEQUENOS: [
    CREATURE_IDS.COELHO,
    CREATURE_IDS.ESQUILO,
    CREATURE_IDS.RATO_SILVESTRE
  ],

  MAMIFEROS_MEDIOS: [
    CREATURE_IDS.VEADO,
    CREATURE_IDS.RAPOSA,
    CREATURE_IDS.LOBO
  ],

  MAMIFEROS_GRANDES: [
    CREATURE_IDS.JAVALI,
    CREATURE_IDS.URSO_PARDO,
    CREATURE_IDS.ALCE
  ],

  PEIXES_AGUA_DOCE: [
    CREATURE_IDS.PEIXE_PEQUENO,
    CREATURE_IDS.PEIXE_GRANDE,
    CREATURE_IDS.SALMAO,
    CREATURE_IDS.TRUTA,
    CREATURE_IDS.CARPA
  ],

  PEIXES_AGUA_SALGADA: [
    CREATURE_IDS.ATUM,
    CREATURE_IDS.SARDINHA,
    CREATURE_IDS.BACALHAU
  ],

  AVES_PEQUENAS: [
    CREATURE_IDS.PARDAL,
    CREATURE_IDS.BEIJA_FLOR,
    CREATURE_IDS.CANARIO
  ],

  AVES_MEDIAS: [
    CREATURE_IDS.CORVO,
    CREATURE_IDS.POMBO,
    CREATURE_IDS.GALINHA_DANGOLA
  ],

  AVES_GRANDES: [
    CREATURE_IDS.AGUIA,
    CREATURE_IDS.FALCAO,
    CREATURE_IDS.CONDOR
  ],

  REPTEIS: [
    CREATURE_IDS.LAGARTO_COMUM,
    CREATURE_IDS.IGUANA,
    CREATURE_IDS.DRAGAO_BARBUDO,
    CREATURE_IDS.COBRA_COMUM,
    CREATURE_IDS.JIBOIA,
    CREATURE_IDS.COBRA_VENENOSA
  ],

  INSETOS: [
    CREATURE_IDS.ABELHA,
    CREATURE_IDS.BORBOLETA,
    CREATURE_IDS.GRILO,
    CREATURE_IDS.MINHOCA,
    CREATURE_IDS.JOANINHA,
    CREATURE_IDS.FORMIGA
  ],

  CRIATURAS_FANTASTICAS: [
    CREATURE_IDS.DRAGAO_MENOR,
    CREATURE_IDS.UNICORNIO,
    CREATURE_IDS.PHOENIX
  ],

  ELEMENTAIS: [
    CREATURE_IDS.ELEMENTAL_TERRA,
    CREATURE_IDS.ELEMENTAL_AGUA,
    CREATURE_IDS.ELEMENTAL_FOGO,
    CREATURE_IDS.ELEMENTAL_AR
  ]
} as const;

// ===================== HELPER FUNCTIONS =====================

export function isCreatureId(id: string): boolean {
  return id.startsWith('creature-');
}

export function getCreatureCategory(creatureId: string): string | null {
  for (const [category, creatures] of Object.entries(CREATURE_CATEGORIES)) {
    if (creatures.includes(creatureId as any)) {
      return category;
    }
  }
  return null;
}

export function getCreaturesByCategory(category: keyof typeof CREATURE_CATEGORIES): readonly string[] {
  return CREATURE_CATEGORIES[category];
}

export function getAllCreatureIds(): string[] {
  return Object.values(CREATURE_IDS);
}

export function isValidCreatureId(id: string): boolean {
  return getAllCreatureIds().includes(id);
}

// ===================== MIGRATION HELPERS =====================

// Mapeamento de IDs antigos para novos (para compatibilidade)
export const LEGACY_CREATURE_MAPPING = {
  // IDs antigos dos recursos que eram na verdade criaturas
  "res-a1e5c9f7-3b8d-4e15-9a26-2c8e6f1b9de2": CREATURE_IDS.COELHO,
  "res-c9f7a1e5-8d3b-4e14-9a25-6c2e8f7b1df3": CREATURE_IDS.VEADO,
  "res-f7a1c9e5-3d8b-4e13-9a24-8c6e2f9b7de4": CREATURE_IDS.JAVALI,
  "res-a1c9f7e5-8b3d-4e12-9a23-2c8e6f5b9df5": CREATURE_IDS.PEIXE_PEQUENO,
  "res-c9e5a1f7-3d8b-4e11-9a22-6c2e8f9b5de6": CREATURE_IDS.PEIXE_GRANDE,
  "res-e5a1c9f7-8b3d-4e10-9a21-8c6e2f7b9df7": CREATURE_IDS.SALMAO
} as const;

export function migrateLegacyCreatureId(legacyId: string): string {
  return LEGACY_CREATURE_MAPPING[legacyId as keyof typeof LEGACY_CREATURE_MAPPING] || legacyId;
}

// ===================== EXPORTS =====================

export const ALL_CREATURE_IDS = Object.values(CREATURE_IDS);
export const CREATURE_COUNT = ALL_CREATURE_IDS.length;

// Master validation para criaturas
export function validateCreatureData(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Verificar duplicatas
  const allIds = getAllCreatureIds();
  const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate creature IDs found: ${duplicates.join(', ')}`);
  }

  // Verificar formato UUID
  const invalidFormats = allIds.filter(id => !id.match(/^creature-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i));
  if (invalidFormats.length > 0) {
    errors.push(`Invalid UUID format in creature IDs: ${invalidFormats.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Tipo para validação
export type CreatureId = typeof CREATURE_IDS[keyof typeof CREATURE_IDS];

// Função para obter UUID por categoria baseada nas categorias definidas
export function getCreatureIdsByCategory(category: string): string[] {
  const categoryMap: Record<string, string[]> = {
    small: CREATURE_CATEGORIES.MAMIFEROS_PEQUENOS,
    medium: CREATURE_CATEGORIES.MAMIFEROS_MEDIOS,
    large: CREATURE_CATEGORIES.MAMIFEROS_GRANDES,
    fish_freshwater: CREATURE_CATEGORIES.PEIXES_AGUA_DOCE,
    fish_saltwater: CREATURE_CATEGORIES.PEIXES_AGUA_SALGADA,
    birds_small: CREATURE_CATEGORIES.AVES_PEQUENAS,
    birds_medium: CREATURE_CATEGORIES.AVES_MEDIAS,
    birds_large: CREATURE_CATEGORIES.AVES_GRANDES,
    reptiles: CREATURE_CATEGORIES.REPTEIS,
    insects: CREATURE_CATEGORIES.INSETOS,
    mystical: CREATURE_CATEGORIES.CRIATURAS_FANTASTICAS,
    elementals: CREATURE_CATEGORIES.ELEMENTAIS
  };

  return categoryMap[category] || [];
}