// Resource service for managing collectible resources and processing logic
import type { Resource } from "@shared/schema";

export class ResourceService {
  
  // Resources that should NOT appear in expedition selection (processed/crafted items)
  private static readonly NON_COLLECTIBLE_TYPES = ['processed', 'crafted', 'food'];
  
  // Resources that have special drop mechanics
  private static readonly RARE_DROP_CHANCES = {
    'Cristais': 0.05, // 5% chance when mining stone
  };

  /**
   * Filter resources to only show collectible ones (excludes processed materials)
   */
  static getCollectibleResources(allResources: Resource[]): Resource[] {
    return allResources.filter(resource => 
      !this.NON_COLLECTIBLE_TYPES.includes(resource.type)
    );
  }

  /**
   * Check if a resource can be collected directly (not processed from animals)
   */
  static isDirectlyCollectable(resource: Resource): boolean {
    return !this.NON_COLLECTIBLE_TYPES.includes(resource.type);
  }

  /**
   * Get rare drop chance for a resource
   */
  static getRareDropChance(resourceName: string): number {
    return (this.RARE_DROP_CHANCES as Record<string, number>)[resourceName] || 0;
  }

  /**
   * Process animal hunting results into materials
   */
  static processAnimalDrops(animalName: string): Record<string, number> {
    const drops: Record<string, number> = {};
    
    switch (animalName) {
      case 'Coelho':
        drops['Carne'] = 1;
        drops['Couro'] = 1;
        drops['Ossos'] = 2;
        drops['Pelo'] = 2;
        break;
      case 'Veado':
        drops['Carne'] = 3;
        drops['Couro'] = 2;
        drops['Ossos'] = 4;
        drops['Pelo'] = 1;
        break;
      case 'Javali':
        drops['Carne'] = 4;
        drops['Couro'] = 3;
        drops['Ossos'] = 6;
        drops['Pelo'] = 1;
        break;
      case 'Peixe Pequeno':
        drops['Carne'] = 1;
        drops['Ossos'] = 1;
        break;
      case 'Peixe Grande':
        drops['Carne'] = 2;
        drops['Ossos'] = 2;
        break;
      case 'Salmão':
        drops['Carne'] = 3;
        drops['Ossos'] = 2;
        break;
    }
    
    return drops;
  }

  /**
   * Check for rare drops when collecting certain resources
   */
  static checkRareDrops(resourceName: string, quantity: number): Record<string, number> {
    const rareDrops: Record<string, number> = {};
    
    // Crystal drops from stone mining
    if (resourceName === 'Pedra') {
      const crystalChance = this.getRareDropChance('Cristais');
      for (let i = 0; i < quantity; i++) {
        if (Math.random() < crystalChance) {
          rareDrops['Cristais'] = (rareDrops['Cristais'] || 0) + 1;
        }
      }
    }
    
    // Auto-generate loose stones when mining with pickaxe
    if (resourceName === 'Pedra') {
      rareDrops['Pedras Soltas'] = quantity; // 1:1 ratio
    }
    
    return rareDrops;
  }

  /**
   * Get resources by category for UI organization
   */
  static categorizeResources(resources: Resource[]): Record<string, Resource[]> {
    const categories: Record<string, Resource[]> = {
      basic: [],
      animals: [],
      fish: [],
      plants: [],
      unique: [],
      materials: [],
      food: []
    };

    resources.forEach(resource => {
      if (resource.type === 'basic') {
        categories.basic.push(resource);
      } else if (['Coelho', 'Veado', 'Javali'].includes(resource.name)) {
        categories.animals.push(resource);
      } else if (['Peixe Pequeno', 'Peixe Grande', 'Salmão'].includes(resource.name)) {
        categories.fish.push(resource);
      } else if (['Cogumelos', 'Frutas Silvestres'].includes(resource.name)) {
        categories.plants.push(resource);
      } else if (resource.type === 'unique') {
        categories.unique.push(resource);
      } else if (['processed', 'crafted'].includes(resource.type)) {
        categories.materials.push(resource);
      } else if (resource.type === 'food') {
        categories.food.push(resource);
      }
    });

    return categories;
  }
}