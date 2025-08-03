
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
  COELHO: "creature-a1e5c9f7-3b8d-4e15-9a26-2c8e6f1b9de2",
  ESQUILO: "creature-b2f6d8e8-4c9e-5f25-ab37-3d9f7e2c8ef3",
  RATO_SILVESTRE: "creature-c3g7e9f9-5d0f-6g36-bc48-4e0g8f3d9fg4",
  
  // Médios Mamíferos
  VEADO: "creature-c9f7a1e5-8d3b-4e14-9a25-6c2e8f7b1df3",
  RAPOSA: "creature-d4h8f0g0-6e1g-7h47-cd59-5f1h9g4e0gh5",
  LOBO: "creature-e5i9g1h1-7f2h-8i58-de6a-6g2i0h5f1hi6",
  
  // Grandes Mamíferos  
  JAVALI: "creature-f7a1c9e5-3d8b-4e13-9a24-8c6e2f9b7de4",
  URSO_PARDO: "creature-f6j0h2i2-8g3i-9j69-ef7b-7h3j1i6g2ij7",
  ALCE: "creature-g7k1i3j3-9h4j-0k7a-fg8c-8i4k2j7h3jk8",
  
  // ===================== ANIMAIS AQUÁTICOS =====================
  
  // Peixes de Água Doce
  PEIXE_PEQUENO: "creature-a1c9f7e5-8b3d-4e12-9a23-2c8e6f5b9df5",
  PEIXE_GRANDE: "creature-c9e5a1f7-3d8b-4e11-9a22-6c2e8f9b5de6",
  SALMAO: "creature-e5a1c9f7-8b3d-4e10-9a21-8c6e2f7b9df7",
  TRUTA: "creature-h8l2j4k4-0i5k-1l8b-gh9d-9j5l3k8i4kl9",
  CARPA: "creature-i9m3k5l5-1j6l-2m9c-hi0e-0k6m4l9j5lm0",
  
  // Peixes de Água Salgada
  ATUM: "creature-j0n4l6m6-2k7m-3n0d-ij1f-1l7n5m0k6mn1",
  SARDINHA: "creature-k1o5m7n7-3l8n-4o1e-jk2g-2m8o6n1l7no2",
  BACALHAU: "creature-l2p6n8o8-4m9o-5p2f-kl3h-3n9p7o2m8op3",
  
  // ===================== AVES =====================
  
  // Aves Pequenas
  PARDAL: "creature-m3q7o9p9-5n0p-6q3g-lm4i-4o0q8p3n9pq4",
  BEIJA_FLOR: "creature-n4r8p0q0-6o1q-7r4h-mn5j-5p1r9q4o0qr5",
  CANARIO: "creature-o5s9q1r1-7p2r-8s5i-no6k-6q2s0r5p1rs6",
  
  // Aves Médias
  CORVO: "creature-p6t0r2s2-8q3s-9t6j-op7l-7r3t1s6q2st7",
  POMBO: "creature-q7u1s3t3-9r4t-0u7k-pq8m-8s4u2t7r3tu8",
  GALINHA_DANGOLA: "creature-r8v2t4u4-0s5u-1v8l-qr9n-9t5v3u8s4uv9",
  
  // Aves Grandes
  AGUIA: "creature-s9w3u5v5-1t6v-2w9m-rs0o-0u6w4v9t5vw0",
  FALCAO: "creature-t0x4v6w6-2u7w-3x0n-st1p-1v7x5w0u6wx1",
  CONDOR: "creature-u1y5w7x7-3v8x-4y1o-tu2q-2w8y6x1v7xy2",
  
  // ===================== RÉPTEIS =====================
  
  // Lagartos
  LAGARTO_COMUM: "creature-v2z6x8y8-4w9y-5z2p-uv3r-3x9z7y2w8yz3",
  IGUANA: "creature-w3a7y9z9-5x0z-6a3q-vw4s-4y0a8z3x9za4",
  DRAGAO_BARBUDO: "creature-x4b8z0a0-6y1a-7b4r-wx5t-5z1b9a4y0ab5",
  
  // Serpentes
  COBRA_COMUM: "creature-y5c9a1b1-7z2b-8c5s-xy6u-6a2c0b5z1bc6",
  JIBOIA: "creature-z6d0b2c2-8a3c-9d6t-yz7v-7b3d1c6a2cd7",
  COBRA_VENENOSA: "creature-a7e1c3d3-9b4d-0e7u-za8w-8c4e2d7b3de8",
  
  // ===================== INSETOS =====================
  
  // Insetos Comuns
  ABELHA: "creature-b8f2d4e4-0c5e-1f8v-ab9x-9d5f3e8c4ef9",
  BORBOLETA: "creature-c9g3e5f5-1d6f-2g9w-bc0y-0e6g4f9d5fg0",
  GRILO: "creature-d0h4f6g6-2e7g-3h0x-cd1z-1f7h5g0e6gh1",
  
  // Insetos Úteis
  MINHOCA: "creature-e1i5g7h7-3f8h-4i1y-de2a-2g8i6h1f7hi2",
  JOANINHA: "creature-f2j6h8i8-4g9i-5j2z-ef3b-3h9j7i2g8ij3",
  FORMIGA: "creature-g3k7i9j9-5h0j-6k3a-fg4c-4i0k8j3h9jk4",
  
  // ===================== CRIATURAS FANTÁSTICAS =====================
  
  // Bestas Mágicas (Para futuras expansões)
  DRAGAO_MENOR: "creature-h4l8j0k0-6i1k-7l4b-gh5d-5j1l9k4i0kl5",
  UNICORNIO: "creature-i5m9k1l1-7j2l-8m5c-hi6e-6k2m0l5j1lm6",
  PHOENIX: "creature-j6n0l2m2-8k3m-9n6d-ij7f-7l3n1m6k2mn7",
  
  // Espíritos da Natureza
  ELEMENTAL_TERRA: "creature-k7o1m3n3-9l4n-0o7e-jk8g-8m4o2n7l3no8",
  ELEMENTAL_AGUA: "creature-l8p2n4o4-0m5o-1p8f-kl9h-9n5p3o8m4op9",
  ELEMENTAL_FOGO: "creature-m9q3o5p5-1n6p-2q9g-lm0i-0o6q4p9n5pq0",
  ELEMENTAL_AR: "creature-n0r4p6q6-2o7q-3r0h-mn1j-1p7r5q0o6qr1"
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
// Sistema de UUIDs para todas as criaturas do jogo

export const CREATURE_IDS = {
  // ANIMAIS PEQUENOS
  RABBIT: 'creature-2a8f5c1e-9b7d-4a63-8e52-9c1a6f8e4b37',
  SQUIRREL: 'creature-4f9d2e8c-1a6b-4d73-9e45-8c7b5a3f9e12',
  BIRD: 'creature-6b3e8f2a-5c9d-4e81-9a67-2f8e5c1b4a93',
  
  // ANIMAIS MÉDIOS
  DEER: 'creature-8e5c2f9a-3b7d-4a92-8e76-5c9a3f2e8b14',
  WILD_BOAR: 'creature-1c7a4f2e-9b8d-4e63-8a95-6f3e9c2a5b87',
  WOLF: 'creature-3f8e5c1a-2b9d-4e74-9a58-8c6b4f3e1a92',
  
  // ANIMAIS GRANDES
  BEAR: 'creature-5c9a3f2e-8b6d-4a83-9e47-1f8c5a3e9b25',
  MOOSE: 'creature-7e2f8c5a-4b9d-4e65-8a96-3c7f5e2a8b41',
  
  // PEIXES
  TROUT: 'creature-9a5f3e2c-6b8d-4e74-9a57-8e6c4f3a2b91',
  SALMON: 'creature-2e8c5f1a-9b7d-4a64-8e53-6f9a3c2e5b84',
  BASS: 'creature-4c7f2e9a-5b8d-4e72-9a56-1e8c6f4a3b92',
  
  // CRIATURAS MÍSTICAS
  FOREST_SPIRIT: 'creature-6f9c3e2a-8b5d-4e81-9a69-4c7f2e9a5b83',
  CRYSTAL_DEER: 'creature-8a5c2f9e-3b7d-4e64-9a58-6f3c9e2a8b75',
  
  // INSETOS E PEQUENAS CRIATURAS
  BUTTERFLY: 'creature-1f8e5c3a-2b9d-4e73-9a67-5c8f3e1a9b26',
  BEE: 'creature-3c9f2e8a-5b7d-4e82-9a48-8e6c3f2a5b94',
  BEETLE: 'creature-5e2c8f9a-4b6d-4e71-9a59-2f8e6c3a9b85',
  
  // CRIATURAS AQUÁTICAS
  TURTLE: 'creature-7c5f2e9a-8b4d-4e63-9a57-6f3e8c2a5b91',
  FROG: 'creature-9e8c5f2a-3b7d-4e74-9a68-4c7f9e2a8b52',
  
  // AVES
  EAGLE: 'creature-2a7f5e9c-8b6d-4e83-9a49-1f8c5e3a9b74',
  OWL: 'creature-4f3c8e2a-5b9d-4e72-9a58-6e7c3f2a8b95',
  HAWK: 'creature-6c9e5f2a-8b4d-4e61-9a57-3f8c6e2a5b83',
  
  // CRIATURAS NOTURNAS
  BAT: 'creature-8e6c3f9a-2b5d-4e74-9a69-5c8f3e9a2b46',
  FIREFLY: 'creature-1c5f8e3a-9b7d-4e62-9a58-6f3c8e5a2b91',
  
  // PREDADORES
  LYNX: 'creature-3f8c5e2a-6b9d-4e73-9a67-8e5c3f2a9b84',
  MOUNTAIN_LION: 'creature-5c7e9f3a-8b4d-4e61-9a56-2f8c7e3a5b92',
  
  // CRIATURAS DOMÉSTICAS/COMPANHEIROS
  DOG: 'creature-7e5c9f2a-3b8d-4e74-9a68-4c7e5f2a8b93',
  CAT: 'creature-9c3f8e5a-6b2d-4e63-9a57-1f8c3e5a9b85',
  
  // CRIATURAS DE COMBATE ESPECIAIS
  SHADOW_WOLF: 'creature-2f8c5e9a-4b7d-4e82-9a49-6c3f8e2a5b94',
  FROST_BEAR: 'creature-4e7c9f5a-8b3d-4e61-9a58-3f7c9e5a2b86',
  FIRE_SALAMANDER: 'creature-6c5f8e3a-2b9d-4e74-9a69-8e5c3f9a2b47'
} as const;

// Tipo para validação
export type CreatureId = typeof CREATURE_IDS[keyof typeof CREATURE_IDS];

// Função para validar UUIDs de criaturas
export function isValidCreatureId(id: string): id is CreatureId {
  return Object.values(CREATURE_IDS).includes(id as CreatureId);
}

// Função para obter todas as UUIDs de criaturas
export function getAllCreatureIds(): CreatureId[] {
  return Object.values(CREATURE_IDS);
}

// Função para obter UUID por categoria
export function getCreatureIdsByCategory(category: string): CreatureId[] {
  const categories: Record<string, CreatureId[]> = {
    small: [CREATURE_IDS.RABBIT, CREATURE_IDS.SQUIRREL, CREATURE_IDS.BIRD],
    medium: [CREATURE_IDS.DEER, CREATURE_IDS.WILD_BOAR, CREATURE_IDS.WOLF],
    large: [CREATURE_IDS.BEAR, CREATURE_IDS.MOOSE],
    fish: [CREATURE_IDS.TROUT, CREATURE_IDS.SALMON, CREATURE_IDS.BASS],
    mystical: [CREATURE_IDS.FOREST_SPIRIT, CREATURE_IDS.CRYSTAL_DEER],
    insects: [CREATURE_IDS.BUTTERFLY, CREATURE_IDS.BEE, CREATURE_IDS.BEETLE],
    aquatic: [CREATURE_IDS.TURTLE, CREATURE_IDS.FROG],
    birds: [CREATURE_IDS.EAGLE, CREATURE_IDS.OWL, CREATURE_IDS.HAWK],
    nocturnal: [CREATURE_IDS.BAT, CREATURE_IDS.FIREFLY],
    predators: [CREATURE_IDS.LYNX, CREATURE_IDS.MOUNTAIN_LION],
    domestic: [CREATURE_IDS.DOG, CREATURE_IDS.CAT],
    combat: [CREATURE_IDS.SHADOW_WOLF, CREATURE_IDS.FROST_BEAR, CREATURE_IDS.FIRE_SALAMANDER]
  };
  
  return categories[category] || [];
}
