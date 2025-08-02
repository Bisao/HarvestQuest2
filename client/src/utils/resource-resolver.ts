/**
 * RESOURCE RESOLVER UTILITY
 * 
 * Centralized utility for resolving resource IDs to display names and emojis
 * Uses exact IDs from game-ids.ts for consistency
 */

import { RESOURCE_IDS } from '@shared/constants/game-ids';

export interface ResourceInfo {
  id: string;
  name: string;
  emoji: string;
}

// Master resource mapping using exact IDs from game-ids.ts
export const RESOURCE_DISPLAY_MAP: Record<string, { name: string; emoji: string }> = {
  // Basic resources
  [RESOURCE_IDS.FIBRA]: { name: "Fibra", emoji: "🌾" },
  [RESOURCE_IDS.PEDRA]: { name: "Pedra", emoji: "🪨" },
  [RESOURCE_IDS.PEDRAS_SOLTAS]: { name: "Pedras Soltas", emoji: "🪨" },
  [RESOURCE_IDS.GRAVETOS]: { name: "Gravetos", emoji: "🪵" },
  [RESOURCE_IDS.AGUA_FRESCA]: { name: "Água Fresca", emoji: "💧" },
  [RESOURCE_IDS.BAMBU]: { name: "Bambu", emoji: "🎋" },
  [RESOURCE_IDS.MADEIRA]: { name: "Madeira", emoji: "🌳" },
  [RESOURCE_IDS.ARGILA]: { name: "Argila", emoji: "🧱" },
  [RESOURCE_IDS.FERRO_FUNDIDO]: { name: "Ferro Fundido", emoji: "⚙️" },
  [RESOURCE_IDS.COURO]: { name: "Couro", emoji: "🦫" },
  [RESOURCE_IDS.CARNE]: { name: "Carne", emoji: "🥩" },
  [RESOURCE_IDS.OSSOS]: { name: "Ossos", emoji: "🦴" },
  [RESOURCE_IDS.PELO]: { name: "Pelo", emoji: "🧶" },
  [RESOURCE_IDS.BARBANTE]: { name: "Barbante", emoji: "🧵" },

  // Extended resources
  [RESOURCE_IDS.LINHO]: { name: "Linho", emoji: "🌾" },
  [RESOURCE_IDS.ALGODAO]: { name: "Algodão", emoji: "☁️" },
  [RESOURCE_IDS.JUTA]: { name: "Juta", emoji: "🌾" },
  [RESOURCE_IDS.SISAL]: { name: "Sisal", emoji: "🌾" },
  [RESOURCE_IDS.CANAMO]: { name: "Cânhamo", emoji: "🌾" },

  // Wood types
  [RESOURCE_IDS.MADEIRA_CARVALHO]: { name: "Madeira de Carvalho", emoji: "🌳" },
  [RESOURCE_IDS.MADEIRA_PINHO]: { name: "Madeira de Pinho", emoji: "🌲" },
  [RESOURCE_IDS.MADEIRA_CEDRO]: { name: "Madeira de Cedro", emoji: "🌲" },
  [RESOURCE_IDS.MADEIRA_EUCALIPTO]: { name: "Madeira de Eucalipto", emoji: "🌿" },
  [RESOURCE_IDS.MADEIRA_MOGNO]: { name: "Madeira de Mogno", emoji: "🌳" },

  // Stones and minerals
  [RESOURCE_IDS.PEDRA_CALCARIA]: { name: "Pedra Calcária", emoji: "⚪" },
  [RESOURCE_IDS.PEDRA_GRANITO]: { name: "Granito", emoji: "⚫" },
  [RESOURCE_IDS.PEDRA_ARDOSIA]: { name: "Ardósia", emoji: "⬛" },
  [RESOURCE_IDS.PEDRA_MARMORE]: { name: "Mármore", emoji: "🤍" },
  [RESOURCE_IDS.QUARTZO]: { name: "Quartzo", emoji: "💎" },
  [RESOURCE_IDS.AMETISTA]: { name: "Ametista", emoji: "💜" },
  [RESOURCE_IDS.TOPAZIO]: { name: "Topázio", emoji: "💛" },
  [RESOURCE_IDS.ESMERALDA]: { name: "Esmeralda", emoji: "💚" },
  [RESOURCE_IDS.RUBI]: { name: "Rubi", emoji: "❤️" },
  [RESOURCE_IDS.DIAMANTE]: { name: "Diamante", emoji: "💎" },

  // Metals
  [RESOURCE_IDS.MINERAL_FERRO]: { name: "Minério de Ferro", emoji: "🔩" },
  [RESOURCE_IDS.MINERAL_COBRE]: { name: "Minério de Cobre", emoji: "🟫" },
  [RESOURCE_IDS.MINERAL_OURO]: { name: "Minério de Ouro", emoji: "🟨" },
  [RESOURCE_IDS.MINERAL_PRATA]: { name: "Minério de Prata", emoji: "⚪" },
  [RESOURCE_IDS.CARVAO]: { name: "Carvão", emoji: "⚫" },
  [RESOURCE_IDS.CARVAO_VEGETAL]: { name: "Carvão Vegetal", emoji: "🔥" },
};

/**
 * Resolve a resource ID to display information
 */
export async function resolveResourceInfo(resourceId: string, fallbackResources?: any[]): Promise<ResourceInfo> {
  // First try direct mapping
  if (RESOURCE_DISPLAY_MAP[resourceId]) {
    return {
      id: resourceId,
      name: RESOURCE_DISPLAY_MAP[resourceId].name,
      emoji: RESOURCE_DISPLAY_MAP[resourceId].emoji,
    };
  }

  // Try to find in fallback resources array if provided
  if (fallbackResources) {
    const found = fallbackResources.find(r => r.id === resourceId);
    if (found) {
      return {
        id: resourceId,
        name: found.name || found.displayName || "Recurso",
        emoji: found.emoji || found.iconPath || "📦",
      };
    }
  }

  // Buscar nos itens modernos do servidor (se disponível)
  try {
    const modernItemResponse = await fetch(`/api/items/${resourceId}`);
    if (modernItemResponse.ok) {
      const modernItem = await modernItemResponse.json();
      if (modernItem && modernItem.emoji) {
        return {
          id: modernItem.id,
          name: modernItem.name,
          emoji: modernItem.emoji
        };
      }
    }
  } catch (error) {
    // Fallback silencioso
  }

  // Pattern-based fallback for unrecognized IDs
  console.warn(`🔍 Resource not found for ID: ${resourceId}`);
  return {
    id: resourceId,
    name: "Recurso Desconhecido",
    emoji: "📦",
  };
}

/**
 * Bulk resolve multiple resource IDs
 */
export async function resolveMultipleResources(resourceIds: string[], fallbackResources?: any[]): Promise<ResourceInfo[]> {
  return Promise.all(resourceIds.map(id => resolveResourceInfo(id, fallbackResources)));
}