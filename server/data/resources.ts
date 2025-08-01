// Resource data management module
import type { InsertResource } from "@shared/types";
import { RESOURCE_IDS } from "@shared/constants/game-ids";
import { EQUIPMENT_IDS } from "@shared/constants/game-ids"; // Assuming EQUIPMENT_IDS is also defined in game-ids

export function createResourcesWithIds(): InsertResource[] {
  return [
    // Basic resources
    { id: RESOURCE_IDS.FIBRA, name: "Fibra", emoji: "🌾", weight: 1, sellPrice: 2, buyPrice: 4, type: "basic", rarity: "common", experienceValue: 1 },
    { id: RESOURCE_IDS.PEDRA, name: "Pedra", emoji: "🪨", weight: 3, sellPrice: 3, buyPrice: 6, type: "basic", rarity: "common", requiredTool: "pickaxe", experienceValue: 2 },
    { id: RESOURCE_IDS.PEDRAS_SOLTAS, name: "Pedras Pequenas", emoji: "🪨", weight: 1, sellPrice: 1, buyPrice: 2, type: "basic", rarity: "common", experienceValue: 1 },
    { id: RESOURCE_IDS.GRAVETOS, name: "Gravetos", emoji: "🪵", weight: 2, sellPrice: 2, buyPrice: 4, type: "basic", rarity: "common", experienceValue: 1 },
    { id: RESOURCE_IDS.AGUA_FRESCA, name: "Água Fresca", emoji: "💧", weight: 1, sellPrice: 1, buyPrice: 2, type: "basic", rarity: "common", requiredTool: "bucket", experienceValue: 1 },
    { id: RESOURCE_IDS.BAMBU, name: "Bambu", emoji: "🎋", weight: 2, sellPrice: 4, buyPrice: 8, type: "basic", rarity: "common", requiredTool: "axe", experienceValue: 2 },
    { id: RESOURCE_IDS.MADEIRA, name: "Madeira", emoji: "🪵", weight: 3, sellPrice: 5, buyPrice: 10, type: "basic", rarity: "common", requiredTool: "axe", experienceValue: 6 },
    { id: RESOURCE_IDS.ARGILA, name: "Argila", emoji: "🧱", weight: 2, sellPrice: 3, buyPrice: 6, type: "basic", rarity: "common", experienceValue: 2 },
    { id: RESOURCE_IDS.FERRO_FUNDIDO, name: "Ferro Fundido", emoji: "🔩", weight: 4, sellPrice: 15, buyPrice: 30, type: "basic", rarity: "uncommon", requiredTool: "pickaxe", experienceValue: 5 },
    { id: RESOURCE_IDS.COURO, name: "Couro", emoji: "🦫", weight: 2, sellPrice: 8, buyPrice: 16, type: "basic", rarity: "common", requiredTool: "knife", experienceValue: 3 },

    // CONSUMABLES & FISHING
    { id: RESOURCE_IDS.ISCA_PESCA, name: "Isca para Pesca", emoji: "🪱", weight: 1, sellPrice: 3, buyPrice: 6, type: "basic", rarity: "common", experienceValue: 2 },

    // ANIMAL PRODUCTS
    { id: RESOURCE_IDS.CARNE, name: "Carne", emoji: "🥩", weight: 2, sellPrice: 12, buyPrice: 24, type: "basic", rarity: "common", experienceValue: 4 },
    { id: RESOURCE_IDS.OSSOS, name: "Ossos", emoji: "🦴", weight: 1, sellPrice: 5, buyPrice: 10, type: "basic", rarity: "common", experienceValue: 2 },
    { id: RESOURCE_IDS.PELO, name: "Pelo", emoji: "🧶", weight: 1, sellPrice: 3, buyPrice: 6, type: "basic", rarity: "common", experienceValue: 1 },
    { id: RESOURCE_IDS.BARBANTE, name: "Barbante", emoji: "🧵", weight: 1, sellPrice: 1, buyPrice: 2, type: "basic", rarity: "common", experienceValue: 1 },

    // Animals
    { id: RESOURCE_IDS.COELHO, name: "Coelho", emoji: "🐰", weight: 3, sellPrice: 15, buyPrice: 30, type: "unique", rarity: "common", requiredTool: "knife", experienceValue: 5 },
    { id: RESOURCE_IDS.VEADO, name: "Veado", emoji: "🦌", weight: 8, sellPrice: 35, buyPrice: 70, type: "unique", rarity: "uncommon", requiredTool: "weapon_and_knife", experienceValue: 8 },
    { id: RESOURCE_IDS.JAVALI, name: "Javali", emoji: "🐗", weight: 12, sellPrice: 50, buyPrice: 100, type: "unique", rarity: "rare", requiredTool: "weapon_and_knife", experienceValue: 12 },
    { id: RESOURCE_IDS.PEIXE_PEQUENO, name: "Peixe Pequeno", emoji: "🐟", weight: 1, sellPrice: 8, buyPrice: 16, type: "unique", rarity: "common", requiredTool: "fishing_rod", experienceValue: 2 },
    { id: RESOURCE_IDS.PEIXE_GRANDE, name: "Peixe Grande", emoji: "🐠", weight: 3, sellPrice: 18, buyPrice: 36, type: "unique", rarity: "uncommon", requiredTool: "fishing_rod", experienceValue: 4 },
    { id: RESOURCE_IDS.SALMAO, name: "Salmão", emoji: "🍣", weight: 4, sellPrice: 25, buyPrice: 50, type: "unique", rarity: "rare", requiredTool: "fishing_rod", experienceValue: 6 },
    { id: RESOURCE_IDS.COGUMELOS, name: "Cogumelos", emoji: "🍄", weight: 1, sellPrice: 6, buyPrice: 12, type: "unique", rarity: "common", experienceValue: 2 },
    { id: RESOURCE_IDS.FRUTAS_SILVESTRES, name: "Frutas Silvestres", emoji: "🫐", weight: 1, sellPrice: 4, buyPrice: 8, type: "unique", rarity: "common", experienceValue: 1 },

    // Specialized Fibers
    { id: RESOURCE_IDS.LINHO, name: "Linho", emoji: "🌾", weight: 1, sellPrice: 8, buyPrice: 16, type: "basic", rarity: "uncommon", experienceValue: 3 },
    { id: RESOURCE_IDS.ALGODAO, name: "Algodão", emoji: "☁️", weight: 1, sellPrice: 10, buyPrice: 20, type: "basic", rarity: "uncommon", experienceValue: 3 },
    { id: RESOURCE_IDS.JUTA, name: "Juta", emoji: "🌾", weight: 1, sellPrice: 6, buyPrice: 12, type: "basic", rarity: "common", experienceValue: 2 },
    { id: RESOURCE_IDS.SISAL, name: "Sisal", emoji: "🌾", weight: 1, sellPrice: 7, buyPrice: 14, type: "basic", rarity: "common", experienceValue: 2 },
    { id: RESOURCE_IDS.CANAMO, name: "Cânhamo", emoji: "🌾", weight: 1, sellPrice: 12, buyPrice: 24, type: "basic", rarity: "uncommon", experienceValue: 4 },

    // Specialized Woods
    { id: RESOURCE_IDS.MADEIRA_CARVALHO, name: "Madeira de Carvalho", emoji: "🌳", weight: 4, sellPrice: 25, buyPrice: 50, type: "basic", rarity: "rare", requiredTool: "axe", experienceValue: 8 },
    { id: RESOURCE_IDS.MADEIRA_PINHO, name: "Madeira de Pinho", emoji: "🌳", weight: 3, sellPrice: 8, buyPrice: 16, type: "basic", rarity: "common", requiredTool: "axe", experienceValue: 3 },
    { id: RESOURCE_IDS.MADEIRA_CEDRO, name: "Madeira de Cedro", emoji: "🌳", weight: 4, sellPrice: 30, buyPrice: 60, type: "basic", rarity: "rare", requiredTool: "axe", experienceValue: 10 },
    { id: RESOURCE_IDS.MADEIRA_EUCALIPTO, name: "Madeira de Eucalipto", emoji: "🌳", weight: 3, sellPrice: 12, buyPrice: 24, type: "basic", rarity: "uncommon", requiredTool: "axe", experienceValue: 4 },
    { id: RESOURCE_IDS.MADEIRA_MOGNO, name: "Madeira de Mogno", emoji: "🌳", weight: 5, sellPrice: 50, buyPrice: 100, type: "basic", rarity: "epic", requiredTool: "axe", experienceValue: 15 },

    // Stones and Construction Materials
    { id: RESOURCE_IDS.PEDRA_CALCARIA, name: "Pedra Calcária", emoji: "🪨", weight: 4, sellPrice: 8, buyPrice: 16, type: "basic", rarity: "common", requiredTool: "pickaxe", experienceValue: 3 },
    { id: RESOURCE_IDS.PEDRA_GRANITO, name: "Pedra Granito", emoji: "🪨", weight: 5, sellPrice: 12, buyPrice: 24, type: "basic", rarity: "uncommon", requiredTool: "pickaxe", experienceValue: 4 },
    { id: RESOURCE_IDS.PEDRA_ARDOSIA, name: "Pedra Ardósia", emoji: "🪨", weight: 3, sellPrice: 10, buyPrice: 20, type: "basic", rarity: "uncommon", requiredTool: "pickaxe", experienceValue: 4 },
    { id: RESOURCE_IDS.PEDRA_MARMORE, name: "Pedra Mármore", emoji: "🪨", weight: 4, sellPrice: 25, buyPrice: 50, type: "basic", rarity: "rare", requiredTool: "pickaxe", experienceValue: 8 },

    // Gems and Crystals
    { id: RESOURCE_IDS.QUARTZO, name: "Quartzo", emoji: "💎", weight: 1, sellPrice: 40, buyPrice: 80, type: "basic", rarity: "rare", requiredTool: "pickaxe", experienceValue: 10 },
    { id: RESOURCE_IDS.AMETISTA, name: "Ametista", emoji: "💜", weight: 1, sellPrice: 100, buyPrice: 200, type: "basic", rarity: "epic", requiredTool: "pickaxe", experienceValue: 20 },
    { id: RESOURCE_IDS.TOPAZIO, name: "Topázio", emoji: "💛", weight: 1, sellPrice: 80, buyPrice: 160, type: "basic", rarity: "rare", requiredTool: "pickaxe", experienceValue: 15 },
    { id: RESOURCE_IDS.ESMERALDA, name: "Esmeralda", emoji: "💚", weight: 1, sellPrice: 150, buyPrice: 300, type: "basic", rarity: "epic", requiredTool: "pickaxe", experienceValue: 25 },
    { id: RESOURCE_IDS.RUBI, name: "Rubi", emoji: "❤️", weight: 1, sellPrice: 120, buyPrice: 240, type: "basic", rarity: "epic", requiredTool: "pickaxe", experienceValue: 22 },
    { id: RESOURCE_IDS.DIAMANTE, name: "Diamante", emoji: "💎", weight: 1, sellPrice: 500, buyPrice: 1000, type: "basic", rarity: "legendary", requiredTool: "pickaxe", experienceValue: 50 },

    // Metals and Minerals
    { id: RESOURCE_IDS.MINERAL_FERRO, name: "Mineral de Ferro", emoji: "⚙️", weight: 3, sellPrice: 10, buyPrice: 20, type: "basic", rarity: "common", requiredTool: "pickaxe", experienceValue: 4 },
    { id: RESOURCE_IDS.MINERAL_COBRE, name: "Mineral de Cobre", emoji: "🟠", weight: 3, sellPrice: 15, buyPrice: 30, type: "basic", rarity: "uncommon", requiredTool: "pickaxe", experienceValue: 5 },
    { id: RESOURCE_IDS.MINERAL_ESTANHO, name: "Mineral de Estanho", emoji: "⚪", weight: 3, sellPrice: 18, buyPrice: 36, type: "basic", rarity: "uncommon", requiredTool: "pickaxe", experienceValue: 5 },
    { id: RESOURCE_IDS.MINERAL_CHUMBO, name: "Mineral de Chumbo", emoji: "⚫", weight: 5, sellPrice: 12, buyPrice: 24, type: "basic", rarity: "common", requiredTool: "pickaxe", experienceValue: 4 },
    { id: RESOURCE_IDS.MINERAL_ZINCO, name: "Mineral de Zinco", emoji: "🔘", weight: 3, sellPrice: 16, buyPrice: 32, type: "basic", rarity: "uncommon", requiredTool: "pickaxe", experienceValue: 5 },
    { id: RESOURCE_IDS.MINERAL_PRATA, name: "Mineral de Prata", emoji: "⚪", weight: 2, sellPrice: 60, buyPrice: 120, type: "basic", rarity: "rare", requiredTool: "pickaxe", experienceValue: 12 },
    { id: RESOURCE_IDS.MINERAL_OURO, name: "Mineral de Ouro", emoji: "🟡", weight: 2, sellPrice: 100, buyPrice: 200, type: "basic", rarity: "rare", requiredTool: "pickaxe", experienceValue: 20 },
    { id: RESOURCE_IDS.MINERAL_PLATINA, name: "Mineral de Platina", emoji: "⚪", weight: 2, sellPrice: 200, buyPrice: 400, type: "basic", rarity: "epic", requiredTool: "pickaxe", experienceValue: 30 },
    { id: RESOURCE_IDS.CARVAO, name: "Carvão", emoji: "🖤", weight: 2, sellPrice: 8, buyPrice: 16, type: "basic", rarity: "common", requiredTool: "pickaxe", experienceValue: 3 },
    { id: RESOURCE_IDS.CARVAO_VEGETAL, name: "Carvão Vegetal", emoji: "🔥", weight: 1, sellPrice: 12, buyPrice: 24, type: "basic", rarity: "uncommon", experienceValue: 4 },
    { id: RESOURCE_IDS.ENXOFRE, name: "Enxofre", emoji: "🟡", weight: 2, sellPrice: 20, buyPrice: 40, type: "basic", rarity: "uncommon", requiredTool: "pickaxe", experienceValue: 6 },
    { id: RESOURCE_IDS.SALITRE, name: "Salitre", emoji: "🤍", weight: 1, sellPrice: 25, buyPrice: 50, type: "basic", rarity: "uncommon", experienceValue: 7 },

    // Small Animals
    { id: RESOURCE_IDS.LEBRE, name: "Lebre", emoji: "🐰", weight: 3, sellPrice: 18, buyPrice: 36, type: "unique", rarity: "common", requiredTool: "weapon_and_knife", experienceValue: 6 },
    { id: RESOURCE_IDS.RAPOSA, name: "Raposa", emoji: "🦊", weight: 4, sellPrice: 25, buyPrice: 50, type: "unique", rarity: "uncommon", requiredTool: "weapon_and_knife", experienceValue: 8 },
    { id: RESOURCE_IDS.ESQUILO, name: "Esquilo", emoji: "🐿️", weight: 1, sellPrice: 8, buyPrice: 16, type: "unique", rarity: "common", requiredTool: "weapon_and_knife", experienceValue: 3 },
    { id: RESOURCE_IDS.CASTOR, name: "Castor", emoji: "🦫", weight: 6, sellPrice: 30, buyPrice: 60, type: "unique", rarity: "uncommon", requiredTool: "weapon_and_knife", experienceValue: 10 },
    { id: RESOURCE_IDS.LONTRA, name: "Lontra", emoji: "🦦", weight: 4, sellPrice: 22, buyPrice: 44, type: "unique", rarity: "uncommon", requiredTool: "weapon_and_knife", experienceValue: 7 },

    // Medium Animals
    { id: RESOURCE_IDS.CERVO, name: "Cervo", emoji: "🦌", weight: 10, sellPrice: 60, buyPrice: 120, type: "unique", rarity: "uncommon", requiredTool: "weapon_and_knife", experienceValue: 12 },
    { id: RESOURCE_IDS.PORCO_SELVAGEM, name: "Porco Selvagem", emoji: "🐗", weight: 15, sellPrice: 55, buyPrice: 110, type: "unique", rarity: "uncommon", requiredTool: "weapon_and_knife", experienceValue: 11 },
    { id: RESOURCE_IDS.CABRA_MONTANHA, name: "Cabra da Montanha", emoji: "🐐", weight: 8, sellPrice: 40, buyPrice: 80, type: "unique", rarity: "uncommon", requiredTool: "weapon_and_knife", experienceValue: 9 },
    { id: RESOURCE_IDS.OVELHA_SELVAGEM, name: "Ovelha Selvagem", emoji: "🐑", weight: 7, sellPrice: 35, buyPrice: 70, type: "unique", rarity: "common", requiredTool: "weapon_and_knife", experienceValue: 8 },

    // Large Animals
    { id: RESOURCE_IDS.ALCE, name: "Alce", emoji: "🫎", weight: 30, sellPrice: 120, buyPrice: 240, type: "unique", rarity: "rare", requiredTool: "weapon_and_knife", experienceValue: 20 },
    { id: RESOURCE_IDS.RENA, name: "Rena", emoji: "🦌", weight: 25, sellPrice: 100, buyPrice: 200, type: "unique", rarity: "rare", requiredTool: "weapon_and_knife", experienceValue: 18 },
    { id: RESOURCE_IDS.BISAO, name: "Bisão", emoji: "🦬", weight: 40, sellPrice: 200, buyPrice: 400, type: "unique", rarity: "epic", requiredTool: "weapon_and_knife", experienceValue: 30 },
    { id: RESOURCE_IDS.BOI_SELVAGEM, name: "Boi Selvagem", emoji: "🐂", weight: 35, sellPrice: 150, buyPrice: 300, type: "unique", rarity: "rare", requiredTool: "weapon_and_knife", experienceValue: 25 },

    // Birds
    { id: RESOURCE_IDS.PATO, name: "Pato", emoji: "🦆", weight: 2, sellPrice: 15, buyPrice: 30, type: "unique", rarity: "common", requiredTool: "weapon_and_knife", experienceValue: 5 },
    { id: RESOURCE_IDS.GANSO, name: "Ganso", emoji: "🪿", weight: 3, sellPrice: 20, buyPrice: 40, type: "unique", rarity: "common", requiredTool: "weapon_and_knife", experienceValue: 6 },
    { id: RESOURCE_IDS.CISNE, name: "Cisne", emoji: "🦢", weight: 4, sellPrice: 40, buyPrice: 80, type: "unique", rarity: "rare", requiredTool: "weapon_and_knife", experienceValue: 10 },
    { id: RESOURCE_IDS.GALINHA_ANGOLA, name: "Galinha d'Angola", emoji: "🐓", weight: 2, sellPrice: 12, buyPrice: 24, type: "unique", rarity: "common", requiredTool: "weapon_and_knife", experienceValue: 4 },
    { id: RESOURCE_IDS.PERDIZ, name: "Perdiz", emoji: "🐦", weight: 1, sellPrice: 18, buyPrice: 36, type: "unique", rarity: "uncommon", requiredTool: "weapon_and_knife", experienceValue: 5 },
    { id: RESOURCE_IDS.CODORNA, name: "Codorna", emoji: "🐦", weight: 1, sellPrice: 10, buyPrice: 20, type: "unique", rarity: "common", requiredTool: "weapon_and_knife", experienceValue: 3 },
    { id: RESOURCE_IDS.FAISAO, name: "Faisão", emoji: "🐦", weight: 2, sellPrice: 25, buyPrice: 50, type: "unique", rarity: "uncommon", requiredTool: "weapon_and_knife", experienceValue: 7 },
    { id: RESOURCE_IDS.POMBO, name: "Pombo", emoji: "🕊️", weight: 1, sellPrice: 5, buyPrice: 10, type: "unique", rarity: "common", requiredTool: "weapon_and_knife", experienceValue: 2 },
    { id: RESOURCE_IDS.ROLINHA, name: "Rolinha", emoji: "🕊️", weight: 1, sellPrice: 8, buyPrice: 16, type: "unique", rarity: "common", requiredTool: "weapon_and_knife", experienceValue: 3 },
    { id: RESOURCE_IDS.CORUJA, name: "Coruja", emoji: "🦉", weight: 2, sellPrice: 30, buyPrice: 60, type: "unique", rarity: "rare", requiredTool: "weapon_and_knife", experienceValue: 8 },
    { id: RESOURCE_IDS.FALCAO, name: "Falcão", emoji: "🦅", weight: 2, sellPrice: 50, buyPrice: 100, type: "unique", rarity: "rare", requiredTool: "weapon_and_knife", experienceValue: 12 },
    { id: RESOURCE_IDS.AGUIA, name: "Águia", emoji: "🦅", weight: 3, sellPrice: 80, buyPrice: 160, type: "unique", rarity: "epic", requiredTool: "weapon_and_knife", experienceValue: 18 },

    // Freshwater Fish
    { id: RESOURCE_IDS.CARPA, name: "Carpa", emoji: "🐟", weight: 2, sellPrice: 12, buyPrice: 24, type: "unique", rarity: "common", requiredTool: "fishing_rod", experienceValue: 3 },
    { id: RESOURCE_IDS.BAGRE, name: "Bagre", emoji: "🐟", weight: 3, sellPrice: 15, buyPrice: 30, type: "unique", rarity: "common", requiredTool: "fishing_rod", experienceValue: 4 },
    { id: RESOURCE_IDS.LUCIO, name: "Lúcio", emoji: "🐟", weight: 4, sellPrice: 22, buyPrice: 44, type: "unique", rarity: "uncommon", requiredTool: "fishing_rod", experienceValue: 6 },
    { id: RESOURCE_IDS.PERCA, name: "Perca", emoji: "🐟", weight: 2, sellPrice: 18, buyPrice: 36, type: "unique", rarity: "uncommon", requiredTool: "fishing_rod", experienceValue: 5 },
    { id: RESOURCE_IDS.DOURADO, name: "Dourado", emoji: "🐟", weight: 5, sellPrice: 35, buyPrice: 70, type: "unique", rarity: "rare", requiredTool: "fishing_rod", experienceValue: 8 },
    { id: RESOURCE_IDS.PINTADO, name: "Pintado", emoji: "🐟", weight: 6, sellPrice: 40, buyPrice: 80, type: "unique", rarity: "rare", requiredTool: "fishing_rod", experienceValue: 10 },
    { id: RESOURCE_IDS.SURUBIM, name: "Surubim", emoji: "🐟", weight: 8, sellPrice: 50, buyPrice: 100, type: "unique", rarity: "rare", requiredTool: "fishing_rod", experienceValue: 12 },
    { id: RESOURCE_IDS.TRAIRA, name: "Traíra", emoji: "🐟", weight: 3, sellPrice: 20, buyPrice: 40, type: "unique", rarity: "uncommon", requiredTool: "fishing_rod", experienceValue: 5 },
    { id: RESOURCE_IDS.TAMBAQUI, name: "Tambaqui", emoji: "🐟", weight: 10, sellPrice: 60, buyPrice: 120, type: "unique", rarity: "rare", requiredTool: "fishing_rod", experienceValue: 15 },
    { id: RESOURCE_IDS.PIRARUCU, name: "Pirarucu", emoji: "🐟", weight: 20, sellPrice: 150, buyPrice: 300, type: "unique", rarity: "epic", requiredTool: "fishing_rod", experienceValue: 25 },

    // Saltwater Fish
    { id: RESOURCE_IDS.ATUM, name: "Atum", emoji: "🐟", weight: 15, sellPrice: 80, buyPrice: 160, type: "unique", rarity: "rare", requiredTool: "fishing_rod", experienceValue: 18 },
    { id: RESOURCE_IDS.SARDINHA, name: "Sardinha", emoji: "🐟", weight: 1, sellPrice: 6, buyPrice: 12, type: "unique", rarity: "common", requiredTool: "fishing_rod", experienceValue: 2 },
    { id: RESOURCE_IDS.ANCHOVA, name: "Anchova", emoji: "🐟", weight: 1, sellPrice: 8, buyPrice: 16, type: "unique", rarity: "common", requiredTool: "fishing_rod", experienceValue: 2 },
    { id: RESOURCE_IDS.BACALHAU, name: "Bacalhau", emoji: "🐟", weight: 8, sellPrice: 45, buyPrice: 90, type: "unique", rarity: "uncommon", requiredTool: "fishing_rod", experienceValue: 12 },
    { id: RESOURCE_IDS.LINGUADO, name: "Linguado", emoji: "🐟", weight: 3, sellPrice: 25, buyPrice: 50, type: "unique", rarity: "uncommon", requiredTool: "fishing_rod", experienceValue: 7 },
    { id: RESOURCE_IDS.ROBALO, name: "Robalo", emoji: "🐟", weight: 4, sellPrice: 30, buyPrice: 60, type: "unique", rarity: "uncommon", requiredTool: "fishing_rod", experienceValue: 8 },
    { id: RESOURCE_IDS.DOURADA_MARINHA, name: "Dourada Marinha", emoji: "🐟", weight: 5, sellPrice: 40, buyPrice: 80, type: "unique", rarity: "rare", requiredTool: "fishing_rod", experienceValue: 10 },
    { id: RESOURCE_IDS.PREGADO, name: "Pregado", emoji: "🐟", weight: 6, sellPrice: 50, buyPrice: 100, type: "unique", rarity: "rare", requiredTool: "fishing_rod", experienceValue: 12 },
    { id: RESOURCE_IDS.MERO, name: "Mero", emoji: "🐟", weight: 12, sellPrice: 70, buyPrice: 140, type: "unique", rarity: "rare", requiredTool: "fishing_rod", experienceValue: 16 },
    { id: RESOURCE_IDS.GAROUPA, name: "Garoupa", emoji: "🐟", weight: 8, sellPrice: 55, buyPrice: 110, type: "unique", rarity: "rare", requiredTool: "fishing_rod", experienceValue: 14 },

    // Seafood
    { id: RESOURCE_IDS.CAMARAO, name: "Camarão", emoji: "🦐", weight: 1, sellPrice: 15, buyPrice: 30, type: "unique", rarity: "common", requiredTool: "fishing_rod", experienceValue: 4 },
    { id: RESOURCE_IDS.LAGOSTA, name: "Lagosta", emoji: "🦞", weight: 2, sellPrice: 60, buyPrice: 120, type: "unique", rarity: "rare", requiredTool: "fishing_rod", experienceValue: 15 },
    { id: RESOURCE_IDS.CARANGUEJO, name: "Caranguejo", emoji: "🦀", weight: 1, sellPrice: 12, buyPrice: 24, type: "unique", rarity: "common", requiredTool: "fishing_rod", experienceValue: 3 },
    { id: RESOURCE_IDS.SIRI, name: "Siri", emoji: "🦀", weight: 1, sellPrice: 10, buyPrice: 20, type: "unique", rarity: "common", requiredTool: "fishing_rod", experienceValue: 3 },
    { id: RESOURCE_IDS.OSTRA, name: "Ostra", emoji: "🦪", weight: 1, sellPrice: 20, buyPrice: 40, type: "unique", rarity: "uncommon", experienceValue: 5 },
    { id: RESOURCE_IDS.MEXILHAO, name: "Mexilhão", emoji: "🦪", weight: 1, sellPrice: 8, buyPrice: 16, type: "unique", rarity: "common", experienceValue: 2 },
    { id: RESOURCE_IDS.VIEIRA, name: "Vieira", emoji: "🐚", weight: 1, sellPrice: 25, buyPrice: 50, type: "unique", rarity: "uncommon", experienceValue: 6 },
    { id: RESOURCE_IDS.LULA, name: "Lula", emoji: "🦑", weight: 2, sellPrice: 18, buyPrice: 36, type: "unique", rarity: "common", requiredTool: "fishing_rod", experienceValue: 4 },
    { id: RESOURCE_IDS.POLVO, name: "Polvo", emoji: "🐙", weight: 3, sellPrice: 35, buyPrice: 70, type: "unique", rarity: "uncommon", requiredTool: "fishing_rod", experienceValue: 8 },

    // Additional Plants and Vegetables
    { id: RESOURCE_IDS.COGUMELOS_SHIITAKE, name: "Cogumelos Shiitake", emoji: "🍄", weight: 1, sellPrice: 15, buyPrice: 30, type: "unique", rarity: "uncommon", experienceValue: 5 },
    { id: RESOURCE_IDS.COGUMELOS_OSTRA, name: "Cogumelos Ostra", emoji: "🍄", weight: 1, sellPrice: 12, buyPrice: 24, type: "unique", rarity: "uncommon", experienceValue: 4 },
    { id: RESOURCE_IDS.AMORAS, name: "Amoras", emoji: "🫐", weight: 1, sellPrice: 6, buyPrice: 12, type: "unique", rarity: "common", experienceValue: 2 },
    { id: RESOURCE_IDS.FRAMBOESAS, name: "Framboesas", emoji: "🫐", weight: 1, sellPrice: 8, buyPrice: 16, type: "unique", rarity: "common", experienceValue: 2 },
    { id: RESOURCE_IDS.MIRTILOS, name: "Mirtilos", emoji: "🫐", weight: 1, sellPrice: 10, buyPrice: 20, type: "unique", rarity: "uncommon", experienceValue: 3 },
    { id: RESOURCE_IDS.MORANGOS_SELVAGENS, name: "Morangos Selvagens", emoji: "🍓", weight: 1, sellPrice: 12, buyPrice: 24, type: "unique", rarity: "uncommon", experienceValue: 3 },
    { id: RESOURCE_IDS.MACAS_SELVAGENS, name: "Maçãs Selvagens", emoji: "🍎", weight: 1, sellPrice: 5, buyPrice: 10, type: "unique", rarity: "common", experienceValue: 2 },
    { id: RESOURCE_IDS.NOZES, name: "Nozes", emoji: "🥜", weight: 1, sellPrice: 15, buyPrice: 30, type: "unique", rarity: "uncommon", experienceValue: 4 },
    { id: RESOURCE_IDS.AVELAS, name: "Avelãs", emoji: "🥜", weight: 1, sellPrice: 12, buyPrice: 24, type: "unique", rarity: "uncommon", experienceValue: 3 },
    { id: RESOURCE_IDS.CASTANHAS, name: "Castanhas", emoji: "🌰", weight: 1, sellPrice: 10, buyPrice: 20, type: "unique", rarity: "common", experienceValue: 3 },
    { id: RESOURCE_IDS.PINHOES, name: "Pinhões", emoji: "🌰", weight: 1, sellPrice: 18, buyPrice: 36, type: "unique", rarity: "uncommon", experienceValue: 4 },
    { id: RESOURCE_IDS.RAIZES_COMESTIVEIS, name: "Raízes Comestíveis", emoji: "🥕", weight: 2, sellPrice: 8, buyPrice: 16, type: "unique", rarity: "common", experienceValue: 3 },
    { id: RESOURCE_IDS.FOLHAS_CHA, name: "Folhas de Chá", emoji: "🍃", weight: 1, sellPrice: 20, buyPrice: 40, type: "unique", rarity: "uncommon", experienceValue: 5 },
    { id: RESOURCE_IDS.FLORES_COMESTIVEIS, name: "Flores Comestíveis", emoji: "🌸", weight: 1, sellPrice: 25, buyPrice: 50, type: "unique", rarity: "rare", experienceValue: 6 },

    // Unique resources
    { id: RESOURCE_IDS.MADEIRA_FLORESTA, name: "Madeira", emoji: "🌳", weight: 5, sellPrice: 8, buyPrice: 16, type: "unique", rarity: "common", requiredTool: "axe", experienceValue: 3 },
    { id: RESOURCE_IDS.AREIA, name: "Areia", emoji: "⏳", weight: 2, sellPrice: 5, buyPrice: 10, type: "unique", rarity: "common", requiredTool: "shovel", experienceValue: 2 },
    { id: RESOURCE_IDS.CRISTAIS, name: "Cristais", emoji: "💎", weight: 1, sellPrice: 20, buyPrice: 40, type: "unique", rarity: "rare", requiredTool: "pickaxe", experienceValue: 10 },
    { id: RESOURCE_IDS.CONCHAS, name: "Conchas", emoji: "🐚", weight: 1, sellPrice: 12, buyPrice: 24, type: "unique", rarity: "uncommon", experienceValue: 4 },

    // Food resources (consumables)
    { id: RESOURCE_IDS.SUCO_FRUTAS, name: "Suco de Frutas", emoji: "🧃", weight: 1, sellPrice: 5, buyPrice: 10, type: "basic", rarity: "common", experienceValue: 2 },
    { id: RESOURCE_IDS.COGUMELOS_ASSADOS, name: "Cogumelos Assados", emoji: "🍄‍🟫", weight: 1, sellPrice: 6, buyPrice: 12, type: "basic", rarity: "common", experienceValue: 3 },
    { id: RESOURCE_IDS.PEIXE_GRELHADO, name: "Peixe Grelhado", emoji: "🐟", weight: 2, sellPrice: 12, buyPrice: 24, type: "basic", rarity: "common", experienceValue: 4 },
    { id: RESOURCE_IDS.CARNE_ASSADA, name: "Carne Assada", emoji: "🍖", weight: 2, sellPrice: 15, buyPrice: 30, type: "basic", rarity: "common", experienceValue: 5 },
    { id: RESOURCE_IDS.ENSOPADO_CARNE, name: "Ensopado de Carne", emoji: "🍲", weight: 3, sellPrice: 25, buyPrice: 50, type: "basic", rarity: "uncommon", experienceValue: 8 },
  ];
}

// Legacy exports for backward compatibility (now deprecated)
export const BASIC_RESOURCES = createResourcesWithIds().filter(r => r.type === "basic");
export const UNIQUE_RESOURCES = createResourcesWithIds().filter(r => r.type === "unique");
export const ANIMAL_RESOURCES = createResourcesWithIds().filter(r => ["🐰", "🦌", "🐗", "🐟", "🐠", "🍣", "🍄", "🫐"].includes(r.emoji));
export const FOOD_RESOURCES = createResourcesWithIds().filter(r => r.type === "food");

export const ALL_RESOURCES = createResourcesWithIds();

// Resource categories for better organization
export const RESOURCE_CATEGORIES = {
  BASIC: "basic",
  FOREST_UNIQUE: "forest_unique",
  ANIMALS: "animals",
  FISH: "fish",
  PLANTS: "plants",
} as const;

export function getResourcesByCategory(category: string, resources: any[]): any[] {
  switch (category) {
    case RESOURCE_CATEGORIES.BASIC:
      return resources.filter(r => 
        ["Fibra", "Pedra", "Pedras Soltas", "Gravetos", "Água Fresca", "Bambu", "Madeira", "Argila", "Ferro Fundido", "Couro", "Carne", "Ossos", "Pelo", "Barbante"].includes(r.name)
      );
    case RESOURCE_CATEGORIES.ANIMALS:
      return resources.filter(r => ["Coelho", "Veado", "Javali"].includes(r.name));
    case RESOURCE_CATEGORIES.FISH:
      return resources.filter(r => ["Peixe Pequeno", "Peixe Grande", "Salmão"].includes(r.name));
    case RESOURCE_CATEGORIES.PLANTS:
      return resources.filter(r => ["Cogumelos", "Frutas Silvestres"].includes(r.name));
    default:
      return resources;
  }
}