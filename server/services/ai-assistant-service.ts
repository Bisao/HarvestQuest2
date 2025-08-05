import OpenAI from "openai";
import type { IStorage } from '../storage';
import type { Player } from '@shared/types';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export interface StrategyRecommendation {
  category: 'immediate' | 'short_term' | 'long_term';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reasoning: string;
  actionSteps: string[];
  expectedBenefits: string[];
  requiredResources?: string[];
  estimatedTimeMinutes?: number;
}

export interface GameStateAnalysis {
  playerLevel: number;
  survivalStatus: 'critical' | 'low' | 'moderate' | 'good' | 'excellent';
  resourceStatus: 'scarce' | 'limited' | 'adequate' | 'abundant';
  skillDevelopment: 'beginner' | 'developing' | 'intermediate' | 'advanced';
  currentFocus: string[];
  recommendations: StrategyRecommendation[];
}

export class AIAssistantService {
  constructor(private storage: IStorage) {}

  async getStrategyRecommendations(playerId: string): Promise<GameStateAnalysis> {
    if (!process.env.OPENAI_API_KEY || !openai) {
      console.warn('OpenAI API key not configured, using fallback recommendations');
      // Fall back to rule-based recommendations immediately
      const player = await this.storage.getPlayer(playerId);
      if (!player) {
        throw new Error('Player not found');
      }
      const inventory = await this.storage.getInventoryForPlayer(playerId);
      const storage = await this.storage.getStorageForPlayer(playerId);
      return this.getFallbackRecommendations(player, inventory, storage);
    }

    // Get current game state
    const player = await this.storage.getPlayer(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const inventory = await this.storage.getInventoryForPlayer(playerId);
    const storage = await this.storage.getStorageForPlayer(playerId);
    const quests = await this.storage.getQuestsForPlayer(playerId);

    // Prepare game state for AI analysis
    const gameState = {
      player: {
        level: player.level,
        experience: player.experience,
        hunger: player.hunger,
        thirst: player.thirst,
        health: player.health,
        coins: player.coins,
        skills: player.skills || {},
        autoStorage: player.autoStorage,
        craftedItemsDestination: player.craftedItemsDestination
      },
      inventory: {
        items: inventory.length,
        totalWeight: player.inventoryWeight,
        maxWeight: player.maxInventoryWeight,
        utilization: (player.inventoryWeight / player.maxInventoryWeight * 100).toFixed(1)
      },
      storage: {
        items: storage.length,
        hasStorage: storage.length > 0
      },
      quests: {
        active: quests.length,
        autoComplete: player.autoCompleteQuests
      }
    };

    const prompt = `
You are an expert strategy advisor for "Coletor Adventures", a survival and crafting game. Analyze the player's current situation and provide strategic recommendations.

CURRENT GAME STATE:
${JSON.stringify(gameState, null, 2)}

GAME MECHANICS:
- Survival stats: Hunger (${player.hunger}/100), Thirst (${player.thirst}/100), Health (${player.health}/100)
- Player Level: ${player.level} (Experience: ${player.experience})
- Inventory: ${inventory.length} items (${player.inventoryWeight}/${player.maxInventoryWeight} kg)
- Resources: Wood, Stone, Fiber, Food, Tools, Equipment
- Activities: Crafting, Expeditions, Skill Development, Resource Gathering
- Auto-features: Storage (${player.autoStorage ? 'ON' : 'OFF'}), Quest completion (${player.autoCompleteQuests ? 'ON' : 'OFF'})

Provide strategic recommendations in JSON format with this structure:
{
  "playerLevel": number,
  "survivalStatus": "critical|low|moderate|good|excellent",
  "resourceStatus": "scarce|limited|adequate|abundant", 
  "skillDevelopment": "beginner|developing|intermediate|advanced",
  "currentFocus": ["area1", "area2"],
  "recommendations": [
    {
      "category": "immediate|short_term|long_term",
      "priority": "high|medium|low",
      "title": "Clear action title",
      "description": "What to do",
      "reasoning": "Why this is important now",
      "actionSteps": ["Step 1", "Step 2"],
      "expectedBenefits": ["Benefit 1", "Benefit 2"],
      "requiredResources": ["Resource if needed"],
      "estimatedTimeMinutes": 15
    }
  ]
}

Focus on practical, actionable advice based on the current game state. Consider survival needs, progression efficiency, and resource optimization.
`;

    try {
      const response = await openai!.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert game strategist. Provide practical, actionable advice in valid JSON format only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1500
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return analysis as GameStateAnalysis;

    } catch (error) {
      console.error('AI Assistant error:', error);
      // Fallback to rule-based recommendations
      return this.getFallbackRecommendations(player, inventory, storage);
    }
  }

  private getFallbackRecommendations(player: Player, inventory: any[], storage: any[]): GameStateAnalysis {
    const recommendations: StrategyRecommendation[] = [];

    // Survival analysis
    if (player.hunger < 30 || player.thirst < 30) {
      recommendations.push({
        category: 'immediate',
        priority: 'high',
        title: 'Address Survival Needs',
        description: 'Your hunger or thirst is getting low. Find food and water immediately.',
        reasoning: 'Low survival stats can lead to health loss and death',
        actionSteps: [
          'Look for fruits or cook available food',
          'Find fresh water sources or drink stored water',
          'Enable auto-consumption if available'
        ],
        expectedBenefits: ['Prevent health loss', 'Maintain optimal performance'],
        estimatedTimeMinutes: 5
      });
    }

    // Inventory management
    if (player.inventoryWeight / player.maxInventoryWeight > 0.8) {
      recommendations.push({
        category: 'immediate',
        priority: 'medium',
        title: 'Manage Inventory Space',
        description: 'Your inventory is nearly full. Consider storage or crafting options.',
        reasoning: 'Full inventory prevents collecting new resources',
        actionSteps: [
          'Move items to storage if available',
          'Craft useful items from raw materials',
          'Enable auto-storage if not active'
        ],
        expectedBenefits: ['Free up inventory space', 'Better resource management'],
        estimatedTimeMinutes: 10
      });
    }

    // Early game progression
    if (player.level < 5) {
      recommendations.push({
        category: 'short_term',
        priority: 'high',
        title: 'Focus on Basic Resource Gathering',
        description: 'Collect essential materials to build your foundation.',
        reasoning: 'Early game requires establishing basic resource stockpiles',
        actionSteps: [
          'Gather fiber, wood, and stone',
          'Craft basic tools if possible',
          'Explore nearby biomes for resources'
        ],
        expectedBenefits: ['Build resource foundation', 'Enable crafting progression'],
        requiredResources: ['Basic gathering stamina'],
        estimatedTimeMinutes: 20
      });
    }

    return {
      playerLevel: player.level,
      survivalStatus: player.hunger > 70 && player.thirst > 70 && player.health > 80 ? 'good' : 
                     player.hunger > 30 && player.thirst > 30 ? 'moderate' : 'low',
      resourceStatus: inventory.length > 10 ? 'adequate' : inventory.length > 5 ? 'limited' : 'scarce',
      skillDevelopment: player.level > 10 ? 'intermediate' : player.level > 5 ? 'developing' : 'beginner',
      currentFocus: player.level < 5 ? ['Resource Gathering', 'Survival'] : ['Crafting', 'Exploration'],
      recommendations
    };
  }
}