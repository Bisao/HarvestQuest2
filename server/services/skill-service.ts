// Skill Service - Gerenciamento completo do sistema de skills
// Integrado com todos os sistemas do jogo

import type { IStorage } from '../storage.ts';
import type { Player, PlayerSkill, Skill, SkillBonus } from '@shared/types';
import { SKILL_DEFINITIONS } from '@shared/data/skill-definitions.ts';
import { SKILL_IDS } from '@shared/constants/game-ids.ts';

export class SkillService {
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  // === SKILL INITIALIZATION ===
  async initializePlayerSkills(playerId: string): Promise<void> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) throw new Error('Player not found');

    // Initialize skills if not exists
    if (!player.skills) {
      player.skills = {};
      player.skillPoints = 0;
      player.totalSkillPoints = 0;
      player.temperature = 0;
      player.fatigue = 0;
      player.morale = 50;
      player.hygiene = 100;
      player.diseases = [];
      player.immunities = [];
      player.resistances = {};
      player.skillAchievements = [];

      // Initialize basic skills
      Object.keys(SKILL_DEFINITIONS).forEach(skillId => {
        const skillDef = SKILL_DEFINITIONS[skillId];
        const isUnlocked = skillDef.prerequisites.length === 0;
        
        player.skills[skillId] = {
          level: 0,
          experience: 0,
          unlocked: isUnlocked,
          unlockedAt: isUnlocked ? Date.now() : undefined,
          totalUsageCount: 0,
          lastUsed: undefined
        };
      });

      await this.storage.updatePlayer(playerId, player);
      console.log(`🎯 SKILLS: Initialized skill system for player ${playerId}`);
    }
  }

  // === SKILL POINTS MANAGEMENT ===
  async grantSkillPoints(playerId: string, points: number): Promise<void> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) throw new Error('Player not found');

    player.skillPoints = (player.skillPoints || 0) + points;
    player.totalSkillPoints = (player.totalSkillPoints || 0) + points;

    await this.storage.updatePlayer(playerId, player);
    console.log(`🎯 SKILLS: Granted ${points} skill points to player ${playerId}`);
  }

  async spendSkillPoints(playerId: string, skillId: string, points: number): Promise<boolean> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) throw new Error('Player not found');

    if (player.skillPoints < points) return false;

    const skill = player.skills[skillId];
    if (!skill || !skill.unlocked) return false;

    // Check if can level up
    const skillDef = SKILL_DEFINITIONS[skillId];
    if (!skillDef || skill.level >= skillDef.maxLevel) return false;

    // Level up skill
    skill.level += points;
    skill.experience = 0; // Reset experience for next level
    player.skillPoints -= points;

    await this.storage.updatePlayer(playerId, player);
    
    // Check for new unlocks
    await this.checkSkillUnlocks(playerId);
    
    console.log(`🎯 SKILLS: Player ${playerId} leveled up ${skillId} to level ${skill.level}`);
    return true;
  }

  // === SKILL EXPERIENCE AND LEVELING ===
  async addSkillExperience(playerId: string, skillId: string, experience: number): Promise<void> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) throw new Error('Player not found');

    const skill = player.skills[skillId];
    if (!skill || !skill.unlocked) return;

    skill.experience += experience;
    skill.lastUsed = Date.now();
    skill.totalUsageCount = (skill.totalUsageCount || 0) + 1;

    // Auto level up based on experience
    const skillDef = SKILL_DEFINITIONS[skillId];
    if (skillDef && skill.level < skillDef.maxLevel) {
      const expNeeded = this.calculateExperienceNeeded(skill.level + 1);
      
      while (skill.experience >= expNeeded && skill.level < skillDef.maxLevel) {
        skill.level++;
        skill.experience -= expNeeded;
        console.log(`🎯 SKILLS: Player ${playerId} auto-leveled ${skillId} to level ${skill.level}`);
      }
    }

    await this.storage.updatePlayer(playerId, player);
    await this.checkSkillUnlocks(playerId);
  }

  private calculateExperienceNeeded(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  // === SKILL UNLOCKING ===
  async checkSkillUnlocks(playerId: string): Promise<void> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) return;

    let unlockedNew = false;

    for (const [skillId, skillDef] of Object.entries(SKILL_DEFINITIONS)) {
      const playerSkill = player.skills[skillId];
      if (!playerSkill || playerSkill.unlocked) continue;

      // Check prerequisites
      const canUnlock = skillDef.prerequisites.every(prereq => {
        switch (prereq.type) {
          case 'skill':
            const requiredSkill = player.skills[prereq.requirement];
            return requiredSkill && requiredSkill.level >= (prereq.value || 1);
          
          case 'level':
            return player.level >= parseInt(prereq.requirement);
          
          case 'quest':
            // TODO: Check quest completion
            return true;
          
          case 'item':
            // TODO: Check item possession
            return true;
          
          default:
            return false;
        }
      });

      if (canUnlock) {
        playerSkill.unlocked = true;
        playerSkill.unlockedAt = Date.now();
        unlockedNew = true;
        console.log(`🎯 SKILLS: Player ${playerId} unlocked skill ${skillId}`);
      }
    }

    if (unlockedNew) {
      await this.storage.updatePlayer(playerId, player);
    }
  }

  // === SKILL BONUSES APPLICATION ===
  async getSkillBonuses(playerId: string): Promise<{ [type: string]: number }> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) return {};

    const bonuses: { [type: string]: number } = {};

    for (const [skillId, playerSkill] of Object.entries(player.skills)) {
      if (!playerSkill.unlocked || playerSkill.level === 0) continue;

      const skillDef = SKILL_DEFINITIONS[skillId];
      if (!skillDef) continue;

      skillDef.bonuses.forEach(bonus => {
        const key = bonus.target ? `${bonus.type}_${bonus.target}` : bonus.type;
        const bonusValue = bonus.value * playerSkill.level;
        bonuses[key] = (bonuses[key] || 0) + bonusValue;
      });
    }

    return bonuses;
  }

  async applySkillBonus(playerId: string, bonusType: string, baseValue: number, target?: string): Promise<number> {
    const bonuses = await this.getSkillBonuses(playerId);
    const bonusKey = target ? `${bonusType}_${target}` : bonusType;
    const bonus = bonuses[bonusKey] || 0;

    return Math.floor(baseValue * (1 + bonus / 100));
  }

  // === SKILL TREE DATA ===
  async getPlayerSkillTree(playerId: string): Promise<any> {
    await this.initializePlayerSkills(playerId);
    
    const player = await this.storage.getPlayer(playerId);
    if (!player) throw new Error('Player not found');

    const skillTree = {
      skillPoints: player.skillPoints || 0,
      totalSkillPoints: player.totalSkillPoints || 0,
      skills: {} as any
    };

    for (const [skillId, playerSkill] of Object.entries(player.skills)) {
      const skillDef = SKILL_DEFINITIONS[skillId];
      if (!skillDef) continue;

      skillTree.skills[skillId] = {
        ...skillDef,
        currentLevel: playerSkill.level,
        experience: playerSkill.experience,
        experienceToNext: playerSkill.level < skillDef.maxLevel 
          ? this.calculateExperienceNeeded(playerSkill.level + 1) - playerSkill.experience
          : 0,
        unlocked: playerSkill.unlocked,
        unlockedAt: playerSkill.unlockedAt,
        totalUsageCount: playerSkill.totalUsageCount || 0
      };
    }

    return skillTree;
  }

  // === LEVEL UP INTEGRATION ===
  async handlePlayerLevelUp(playerId: string, newLevel: number): Promise<void> {
    const pointsPerLevel = 1; // 1 skill point per level
    await this.grantSkillPoints(playerId, pointsPerLevel);
    await this.checkSkillUnlocks(playerId);
    
    console.log(`🎯 SKILLS: Player ${playerId} gained ${pointsPerLevel} skill point(s) for reaching level ${newLevel}`);
  }

  // === SKILL USAGE TRACKING ===
  async recordSkillUsage(playerId: string, skillId: string, context: string): Promise<void> {
    const bonusExp = this.calculateContextualExperience(context);
    await this.addSkillExperience(playerId, skillId, bonusExp);
  }

  private calculateContextualExperience(context: string): number {
    const experienceMap: { [key: string]: number } = {
      'gathering': 5,
      'mining': 8,
      'woodcutting': 8,
      'fishing': 10,
      'hunting': 12,
      'crafting': 15,
      'cooking': 10,
      'combat': 20,
      'exploration': 25
    };

    return experienceMap[context] || 5;
  }

  // === SKILL RESET ===
  async resetPlayerSkills(playerId: string, cost?: number): Promise<boolean> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) return false;

    // Check cost if provided
    if (cost && player.coins < cost) return false;

    // Deduct cost
    if (cost) {
      player.coins -= cost;
    }

    // Reset all skills but keep unlocks
    Object.keys(player.skills).forEach(skillId => {
      const skill = player.skills[skillId];
      if (skill.unlocked) {
        skill.level = 0;
        skill.experience = 0;
      }
    });

    // Refund skill points
    player.skillPoints = player.totalSkillPoints || 0;
    player.lastSkillReset = Date.now();

    await this.storage.updatePlayer(playerId, player);
    console.log(`🎯 SKILLS: Player ${playerId} reset all skills (cost: ${cost || 0})`);
    
    return true;
  }
}