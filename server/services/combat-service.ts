import { v4 as uuidv4 } from 'uuid';
import type { IStorage } from '../storage';
import type { 
  CombatEncounter, 
  CombatAction, 
  CombatResult,
  PlayerCombatStats,
  AnimalCombatStats,
  CombatActionRecord
} from '../../shared/types/combat-types';
import type { Player } from '../../shared/types';
import type { AnimalRegistryEntry } from '../../shared/types/animal-registry-types';
import { ANIMAL_REGISTRY } from '../data/animal-registry';

export class CombatService {
  constructor(private storage: IStorage) {}

  private getBiomeName(biomeId: string): string {
    // Mapear IDs de bioma para nomes
    const biomeMap: { [key: string]: string } = {
      '61b1e6d2-b284-4c11-a5e0-dbc4d46ebd47': 'Floresta',
      'biome-floresta': 'Floresta',
      'floresta': 'Floresta',
      'Floresta': 'Floresta'
    };
    
    return biomeMap[biomeId] || 'Floresta'; // Default para floresta
  }

  // ===================== ENCOUNTER GENERATION =====================

  async tryGenerateEncounter(expeditionId: string, playerId: string, biomeId: string): Promise<CombatEncounter | null> {
    // 30% chance de encontrar uma criatura durante a expedição
    if (Math.random() > 0.3) return null;

    // Filtrar animais do bioma (melhorar correspondência)
    const biomeName = this.getBiomeName(biomeId);
    const biomeAnimals = ANIMAL_REGISTRY.filter(animal => 
      animal.habitat?.some(h => h.toLowerCase().includes(biomeName.toLowerCase())) || 
      animal.discoveryLocation?.some(l => l.toLowerCase().includes(biomeName.toLowerCase())) ||
      animal.habitat?.includes('Floresta') // Fallback para floresta
    );

    console.log(`🎯 COMBAT: Found ${biomeAnimals.length} animals for biome ${biomeName}:`, 
      biomeAnimals.map(a => `${a.emoji} ${a.commonName} (${a.rarity})`));

    if (biomeAnimals.length === 0) return null;

    // Selecionar animal aleatório
    const selectedAnimal = biomeAnimals[Math.floor(Math.random() * biomeAnimals.length)];

    const player = await this.storage.getPlayer(playerId);
    if (!player) throw new Error('Player not found');

    // Criar encontro de combate
    const encounter: CombatEncounter = {
      id: uuidv4(),
      playerId,
      animalId: selectedAnimal.id,
      expeditionId,
      status: 'active',
      playerHealth: player.health || 100,
      animalHealth: selectedAnimal.combat.health,
      turn: 1,
      playerTurn: true,
      startTime: Date.now(),
      actions: []
    };

    console.log(`⚔️ COMBAT: Player ${playerId} encountered ${selectedAnimal.commonName} during expedition ${expeditionId}`);
    return encounter;
  }

  // ===================== COMBAT MECHANICS =====================

  async executePlayerAction(encounterId: string, action: CombatAction): Promise<CombatResult> {
    const encounter = await this.getEncounter(encounterId);
    if (!encounter || encounter.status !== 'active') {
      throw new Error('Combat encounter not found or not active');
    }

    const player = await this.storage.getPlayer(encounter.playerId);
    if (!player) throw new Error('Player not found');

    const animal = ANIMAL_REGISTRY.find(a => a.id === encounter.animalId);
    if (!animal) throw new Error('Animal not found');

    // Executar ação do jogador
    const playerStats = this.getPlayerCombatStats(player);
    const animalStats = this.getAnimalCombatStats(animal);

    let playerDamage = 0;
    let animalDamage = 0;
    let actionLog: CombatActionRecord[] = [...encounter.actions];

    // Processar ação do jogador
    switch (action) {
      case 'attack':
        playerDamage = this.calculateDamage(playerStats, animalStats);
        encounter.animalHealth = Math.max(0, encounter.animalHealth - playerDamage);

        actionLog.push({
          turn: encounter.turn,
          actor: 'player',
          action: 'attack',
          damage: playerDamage,
          effect: `Você atacou causando ${playerDamage} de dano!`,
          timestamp: Date.now()
        });
        break;

      case 'defend':
        // Reduz dano recebido pela metade no próximo turno
        actionLog.push({
          turn: encounter.turn,
          actor: 'player',
          action: 'defend',
          effect: 'Você se defendeu, reduzindo o próximo dano pela metade',
          timestamp: Date.now()
        });
        break;

      case 'analyze':
        // Analisar revela informações e termina o combate
        await this.addAnimalToRegistry(encounter.playerId, encounter.animalId);
        encounter.status = 'analyzed';

        actionLog.push({
          turn: encounter.turn,
          actor: 'player',
          action: 'analyze',
          effect: `Você analisou ${animal.commonName} e adicionou ao bestiário!`,
          timestamp: Date.now()
        });

        const analyzeResult: CombatResult = {
          winner: 'player',
          playerHealth: encounter.playerHealth,
          animalHealth: encounter.animalHealth,
          rewards: {
            resources: {},
            experience: Math.floor(animal.combat.health * 0.1),
            discoveryBonus: true
          },
          actionLog
        };

        await this.storage.updatePlayer(encounter.playerId, {
          experience: player.experience + analyzeResult.rewards!.experience
        });

        return analyzeResult;

      case 'flee':
        // 70% chance de fugir com sucesso
        if (Math.random() < 0.7) {
          encounter.status = 'fled';
          actionLog.push({
            turn: encounter.turn,
            actor: 'player',
            action: 'flee',
            effect: 'Você conseguiu fugir com segurança!',
            timestamp: Date.now()
          });

          return {
            winner: 'fled',
            playerHealth: encounter.playerHealth,
            animalHealth: encounter.animalHealth,
            actionLog
          };
        } else {
          actionLog.push({
            turn: encounter.turn,
            actor: 'player',
            action: 'flee',
            effect: 'Você não conseguiu fugir! O animal atacou!',
            timestamp: Date.now()
          });
        }
        break;
    }

    // Verificar se o animal foi derrotado
    if (encounter.animalHealth <= 0) {
      encounter.status = 'victory';
      const rewards = this.calculateRewards(animal);

      await this.storage.updatePlayer(encounter.playerId, {
        experience: player.experience + rewards.experience
      });

      // Adicionar recursos ao inventário
      for (const [resourceId, quantity] of Object.entries(rewards.resources)) {
        await this.storage.addPlayerResource(encounter.playerId, resourceId, quantity);
      }

      return {
        winner: 'player',
        playerHealth: encounter.playerHealth,
        animalHealth: encounter.animalHealth,
        rewards,
        actionLog
      };
    }

    // Turno do animal (se ainda estiver vivo e jogador não fugiu)
    if (encounter.status === 'active') {
      animalDamage = this.calculateAnimalDamage(animalStats, playerStats);

      // Aplicar defesa se o jogador se defendeu
      if (action === 'defend') {
        animalDamage = Math.floor(animalDamage / 2);
      }

      encounter.playerHealth = Math.max(0, encounter.playerHealth - animalDamage);

      const animalAttack = animal.combat.attacks[Math.floor(Math.random() * animal.combat.attacks.length)];
      actionLog.push({
        turn: encounter.turn,
        actor: 'animal',
        action: animalAttack.name,
        damage: animalDamage,
        effect: `${animal.commonName} usou ${animalAttack.name} e causou ${animalDamage} de dano!`,
        timestamp: Date.now()
      });

      // Verificar se o jogador foi derrotado
      if (encounter.playerHealth <= 0) {
        encounter.status = 'defeat';

        // Aplicar penalidade por derrota
        await this.storage.updatePlayer(encounter.playerId, {
          health: 1, // Deixa com 1 HP
          hunger: Math.max(20, player.hunger - 20),
          thirst: Math.max(20, player.thirst - 20)
        });

        return {
          winner: 'animal',
          playerHealth: 1,
          animalHealth: encounter.animalHealth,
          actionLog
        };
      }
    }

    // Próximo turno
    encounter.turn++;
    encounter.actions = actionLog;

    return {
      winner: encounter.status === 'active' ? 'player' : 'animal',
      playerHealth: encounter.playerHealth,
      animalHealth: encounter.animalHealth,
      actionLog
    };
  }

  // ===================== COMBAT CALCULATIONS =====================

  private getPlayerCombatStats(player: Player): PlayerCombatStats {
    const baseAttack = 10 + Math.floor(player.level * 2);
    const baseDefense = 5 + Math.floor(player.level * 1.5);

    return {
      health: player.health || 100,
      maxHealth: player.maxHealth || 100,
      attack: baseAttack,
      defense: baseDefense,
      speed: 50 + player.level,
      accuracy: 80 + player.level,
      weaponBonus: player.equippedWeapon ? 5 : 0,
      armorBonus: (player.equippedChestplate ? 3 : 0) + (player.equippedHelmet ? 2 : 0),
      level: player.level,
      experience: player.experience
    };
  }

  private getAnimalCombatStats(animal: AnimalRegistryEntry): AnimalCombatStats {
    return {
      health: animal.combat.health,
      maxHealth: animal.combat.health,
      attack: animal.combat.attacks[0]?.damage || 5,
      defense: animal.combat.defense,
      speed: 50,
      accuracy: 75,
      attacks: animal.combat.attacks,
      behavior: 'aggressive',
      fleeChance: 0.1
    };
  }

  private calculateDamage(attacker: PlayerCombatStats, defender: AnimalCombatStats): number {
    const baseDamage = attacker.attack + attacker.weaponBonus;
    const defense = defender.defense;
    const randomFactor = 0.8 + Math.random() * 0.4; // 80% a 120%

    const damage = Math.max(1, Math.floor((baseDamage - defense * 0.5) * randomFactor));
    return damage;
  }

  private calculateAnimalDamage(attacker: AnimalCombatStats, defender: PlayerCombatStats): number {
    const baseDamage = attacker.attack;
    const defense = defender.defense + defender.armorBonus;
    const randomFactor = 0.8 + Math.random() * 0.4;

    const damage = Math.max(1, Math.floor((baseDamage - defense * 0.3) * randomFactor));
    return damage;
  }

  private calculateRewards(animal: AnimalRegistryEntry): { resources: Record<string, number>; experience: number } {
    const rewards: Record<string, number> = {};
    let totalExperience = animal.combat.health * 2;

    // Aplicar drops do animal
    for (const drop of animal.drops) {
      if (Math.random() * 100 < drop.dropRate) {
        const quantity = Math.floor(Math.random() * (drop.maxQuantity - drop.minQuantity + 1)) + drop.minQuantity;
        rewards[drop.itemId] = (rewards[drop.itemId] || 0) + quantity;
      }
    }

    return {
      resources: rewards,
      experience: totalExperience
    };
  }

  // ===================== UTILITY METHODS =====================

  private async addAnimalToRegistry(playerId: string, animalId: string): Promise<void> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) return;

    // Adicionar animal à lista de descobertos (implementar quando tiver campo no Player)
    console.log(`📚 DISCOVERY: Player ${playerId} discovered animal ${animalId} through combat analysis`);
  }

  private encounters: Map<string, CombatEncounter> = new Map();

  async getEncounter(encounterId: string): Promise<CombatEncounter | null> {
    return this.encounters.get(encounterId) || null;
  }

  async createEncounter(encounter: CombatEncounter): Promise<CombatEncounter> {
    this.encounters.set(encounter.id, encounter);
    console.log(`⚔️ COMBAT: Created encounter ${encounter.id}`);
    return encounter;
  }
}