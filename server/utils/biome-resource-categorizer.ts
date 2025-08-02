// Sistema avançado de categorização de recursos para biomas
import type { Resource, Biome } from '@shared/types';

export interface ResourceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  priority: number; // Para ordenação
}

// Categorias de recursos detalhadas
export const RESOURCE_CATEGORIES: Record<string, ResourceCategory> = {
  basic: {
    id: 'basic',
    name: 'Recursos Básicos',
    description: 'Materiais coletáveis à mão',
    icon: '🌿',
    color: 'bg-green-100 text-green-800 border-green-200',
    priority: 1
  },
  wood: {
    id: 'wood',
    name: 'Madeiras',
    description: 'Tipos de madeira e materiais lenhosos',
    icon: '🌳',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    priority: 2
  },
  stone: {
    id: 'stone',
    name: 'Pedras e Minerais',
    description: 'Rochas, minerais e metais',
    icon: '🪨',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    priority: 3
  },
  fiber: {
    id: 'fiber',
    name: 'Fibras Naturais',
    description: 'Fibras vegetais para artesanato',
    icon: '🧵',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    priority: 4
  },
  animals: {
    id: 'animals',
    name: 'Animais de Caça',
    description: 'Fauna para caça e processamento',
    icon: '🦌',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    priority: 5
  },
  fish: {
    id: 'fish',
    name: 'Peixes',
    description: 'Recursos aquáticos e pesca',
    icon: '🐟',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    priority: 6
  },
  plants: {
    id: 'plants',
    name: 'Plantas e Ervas',
    description: 'Flora medicinal e alimentar',
    icon: '🌱',
    color: 'bg-green-100 text-green-800 border-green-200',
    priority: 7
  },
  rare: {
    id: 'rare',
    name: 'Recursos Raros',
    description: 'Materiais preciosos e únicos',
    icon: '💎',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    priority: 8
  },
  processed: {
    id: 'processed',
    name: 'Processados',
    description: 'Materiais refinados e trabalhados',
    icon: '⚙️',
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    priority: 9
  },
  special: {
    id: 'special',
    name: 'Especiais',
    description: 'Recursos únicos de bioma',
    icon: '✨',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    priority: 10
  }
};

// Sistema inteligente de categorização baseado em padrões de nome
export class BiomeResourceCategorizer {
  private static categorizeByName(resourceName: string): string {
    const name = resourceName.toLowerCase().trim();
    
    // Madeiras
    if (name.includes('madeira') || 
        name.includes('tronco') || 
        name.includes('galho') ||
        name.includes('carvalho') ||
        name.includes('pinho') ||
        name.includes('cedro') ||
        name.includes('eucalipto') ||
        name.includes('mogno') ||
        name.includes('bambu')) {
      return 'wood';
    }
    
    // Pedras e minerais
    if (name.includes('pedra') || 
        name.includes('mineral') || 
        name.includes('ferro') || 
        name.includes('cobre') ||
        name.includes('granito') ||
        name.includes('calcaria') ||
        name.includes('quartzo') ||
        name.includes('argila')) {
      return 'stone';
    }
    
    // Fibras
    if (name.includes('fibra') ||
        name.includes('linho') ||
        name.includes('algodao') ||
        name.includes('algodão') ||
        name.includes('juta') ||
        name.includes('sisal') ||
        name.includes('canamo') ||
        name.includes('cânamo')) {
      return 'fiber';
    }
    
    // Animais
    if (name.includes('coelho') || 
        name.includes('veado') || 
        name.includes('urso') ||
        name.includes('javali') ||
        name.includes('cervo') ||
        name.includes('raposa') ||
        name.includes('esquilo') ||
        name.includes('castor') ||
        name.includes('lontra') ||
        name.includes('cabra') ||
        name.includes('ovelha') ||
        name.includes('alce') ||
        name.includes('rena') ||
        name.includes('bisao') ||
        name.includes('bisão') ||
        name.includes('boi') ||
        name.includes('carne')) {
      return 'animals';
    }
    
    // Peixes
    if (name.includes('peixe') || 
        name.includes('salmao') ||
        name.includes('salmão') ||
        name.includes('truta') || 
        name.includes('carpa') ||
        name.includes('bagre') ||
        name.includes('dourado') ||
        name.includes('pintado') ||
        name.includes('tucunare') ||
        name.includes('tucunaré') ||
        name.includes('piranha') ||
        name.includes('lambari') ||
        name.includes('tilapia') ||
        name.includes('tilápia')) {
      return 'fish';
    }
    
    // Plantas e ervas
    if (name.includes('erva') || 
        name.includes('flor') || 
        name.includes('cogumelo') || 
        name.includes('planta') ||
        name.includes('folha') ||
        name.includes('raiz') ||
        name.includes('semente') ||
        name.includes('fruto') ||
        name.includes('baga')) {
      return 'plants';
    }
    
    // Recursos raros
    if (name.includes('cristal') || 
        name.includes('gema') || 
        name.includes('ouro') || 
        name.includes('prata') ||
        name.includes('diamante') ||
        name.includes('rubi') ||
        name.includes('safira') ||
        name.includes('esmeralda') ||
        name.includes('ametista')) {
      return 'rare';
    }
    
    // Processados
    if (name.includes('processado') || 
        name.includes('refinado') || 
        name.includes('trabalhado') ||
        name.includes('fundido') ||
        name.includes('forjado') ||
        name.includes('polido') ||
        name.includes('lapidado')) {
      return 'processed';
    }
    
    // Recursos especiais únicos
    if (name.includes('raro') ||
        name.includes('lendario') ||
        name.includes('lendário') ||
        name.includes('épico') ||
        name.includes('epico') ||
        name.includes('mistico') ||
        name.includes('místico') ||
        name.includes('sagrado')) {
      return 'special';
    }
    
    // Padrão: básico
    return 'basic';
  }
  
  public static categorizeResource(resource: Resource): ResourceCategory {
    const categoryId = this.categorizeByName(resource.name);
    return RESOURCE_CATEGORIES[categoryId] || RESOURCE_CATEGORIES.basic;
  }
  
  public static categorizeResourcesForBiome(biome: Biome, resources: Resource[]): Record<string, Resource[]> {
    const resourceIds = biome.availableResources as string[];
    const biomeResources = resourceIds
      .map(id => resources.find(r => r.id === id))
      .filter(Boolean) as Resource[];
    
    const categorized: Record<string, Resource[]> = {};
    
    biomeResources.forEach(resource => {
      const category = this.categorizeResource(resource);
      if (!categorized[category.id]) {
        categorized[category.id] = [];
      }
      categorized[category.id].push(resource);
    });
    
    // Ordenar recursos dentro de cada categoria por raridade/nome
    Object.keys(categorized).forEach(categoryId => {
      categorized[categoryId].sort((a, b) => {
        // Primeiro por raridade implícita (baseada no nome)
        const aRare = a.name.toLowerCase().includes('raro') || a.name.toLowerCase().includes('especial');
        const bRare = b.name.toLowerCase().includes('raro') || b.name.toLowerCase().includes('especial');
        
        if (aRare && !bRare) return -1;
        if (!aRare && bRare) return 1;
        
        // Depois por nome alfabético
        return a.name.localeCompare(b.name);
      });
    });
    
    return categorized;
  }
  
  public static getBiomeResourceStats(biome: Biome, resources: Resource[]) {
    const categorized = this.categorizeResourcesForBiome(biome, resources);
    
    return {
      total: Object.values(categorized).reduce((sum, resources) => sum + resources.length, 0),
      byCategory: Object.entries(categorized).reduce((acc, [categoryId, resources]) => {
        acc[categoryId] = {
          count: resources.length,
          category: RESOURCE_CATEGORIES[categoryId],
          resources: resources.slice(0, 3) // Preview dos primeiros 3
        };
        return acc;
      }, {} as Record<string, any>),
      categories: Object.keys(categorized).length,
      diversity: Math.round((Object.keys(categorized).length / Object.keys(RESOURCE_CATEGORIES).length) * 100)
    };
  }
  
  public static getBiomeComplexity(biome: Biome, resources: Resource[]): 'baixa' | 'media' | 'alta' | 'extrema' {
    const stats = this.getBiomeResourceStats(biome, resources);
    
    if (stats.total < 10) return 'baixa';
    if (stats.total < 25) return 'media';
    if (stats.total < 50) return 'alta';
    return 'extrema';
  }
}

// Utilitários para ordenação e filtragem
export class BiomeUtilities {
  public static sortBiomesByDifficulty(biomes: Biome[]): Biome[] {
    return [...biomes].sort((a, b) => a.requiredLevel - b.requiredLevel);
  }
  
  public static filterBiomesByAccessibility(biomes: Biome[], playerLevel: number) {
    return {
      unlocked: biomes.filter(b => b.requiredLevel <= playerLevel),
      locked: biomes.filter(b => b.requiredLevel > playerLevel),
      nextToUnlock: biomes
        .filter(b => b.requiredLevel > playerLevel)
        .sort((a, b) => a.requiredLevel - b.requiredLevel)[0] || null
    };
  }
  
  public static searchBiomes(biomes: Biome[], searchTerm: string): Biome[] {
    if (!searchTerm.trim()) return biomes;
    
    const term = searchTerm.toLowerCase();
    return biomes.filter(biome => 
      biome.name.toLowerCase().includes(term) ||
      biome.description?.toLowerCase().includes(term)
    );
  }
  
  public static getBiomeRecommendations(biomes: Biome[], player: any, resources: Resource[]) {
    const accessible = biomes.filter(b => b.requiredLevel <= player.level);
    
    return accessible.map(biome => {
      const stats = BiomeResourceCategorizer.getBiomeResourceStats(biome, resources);
      const complexity = BiomeResourceCategorizer.getBiomeComplexity(biome, resources);
      
      let score = 0;
      
      // Pontuação baseada na diversidade de recursos
      score += stats.diversity * 0.3;
      
      // Pontuação baseada na quantidade total
      score += Math.min(stats.total / 50, 1) * 0.3;
      
      // Pontuação baseada no nível do jogador vs. nível do bioma
      const levelDiff = player.level - biome.requiredLevel;
      score += Math.max(0, 1 - (levelDiff / 20)) * 0.4;
      
      return {
        biome,
        score: Math.round(score * 100),
        stats,
        complexity,
        recommendation: this.getRecommendationText(score, complexity)
      };
    }).sort((a, b) => b.score - a.score);
  }
  
  private static getRecommendationText(score: number, complexity: string): string {
    if (score >= 80) {
      return complexity === 'extrema' ? 'Altamente recomendado - Rico em recursos únicos' : 'Altamente recomendado';
    } else if (score >= 60) {
      return 'Recomendado - Boa variedade de recursos';
    } else if (score >= 40) {
      return 'Adequado - Recursos básicos disponíveis';
    } else {
      return 'Limitado - Poucos recursos únicos';
    }
  }
}