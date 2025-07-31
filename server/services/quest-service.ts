import type { IStorage } from "../storage-memory";

export class QuestService {
  constructor(private storage: IStorage) {}

  async checkQuestObjectives(playerId: string, questId: string): Promise<{ completed: boolean; progress: any }> {
    const quest = await this.storage.getQuest(questId);
    if (!quest) {
      throw new Error("Quest not found");
    }

    const playerQuest = await this.storage.getPlayerQuest(playerId, questId);
    if (!playerQuest || playerQuest.status !== 'active') {
      return { completed: false, progress: {} };
    }

    const objectives = quest.objectives as any[];
    const progress: any = {};
    let allCompleted = true;

    for (const objective of objectives) {
      switch (objective.type) {
        case 'collect': {
          // Only use stored progress, not current inventory/storage counts
          // to prevent retroactive quest completion
          const collectProgress = (playerQuest.progress as any)?.[objective.type + '_' + objective.resourceId] || { current: 0 };
          const required = objective.quantity || 1;
          
          progress[objective.type + '_' + objective.resourceId] = {
            current: collectProgress.current,
            required: required,
            completed: collectProgress.current >= required
          };
          
          if (collectProgress.current < required) {
            allCompleted = false;
          }
          break;
        }
        
        case 'craft': {
          // For craft objectives, we need to track when items are crafted
          // This would require updating the crafting system to track quest progress
          const craftProgress = (playerQuest.progress as any)?.[objective.type + '_' + objective.itemId] || { current: 0 };
          const required = objective.quantity || 1;
          
          progress[objective.type + '_' + objective.itemId] = {
            current: craftProgress.current,
            required: required,
            completed: craftProgress.current >= required
          };
          
          if (craftProgress.current < required) {
            allCompleted = false;
          }
          break;
        }
        
        case 'kill': {
          // For kill objectives, we need to track when creatures are killed during expeditions
          const killProgress = (playerQuest.progress as any)?.[objective.type + '_' + objective.creatureId] || { current: 0 };
          const required = objective.quantity || 1;
          
          progress[objective.type + '_' + objective.creatureId] = {
            current: killProgress.current,
            required: required,
            completed: killProgress.current >= required
          };
          
          if (killProgress.current < required) {
            allCompleted = false;
          }
          break;
        }
        
        case 'level': {
          const player = await this.storage.getPlayer(playerId);
          const required = objective.level || 1;
          
          progress[objective.type] = {
            current: player?.level || 1,
            required: required,
            completed: (player?.level || 1) >= required
          };
          
          if ((player?.level || 1) < required) {
            allCompleted = false;
          }
          break;
        }
        
        case 'expedition': {
          const expeditionProgress = (playerQuest.progress as any)?.[objective.type + '_' + objective.biomeId] || { current: 0 };
          const required = objective.amount || objective.quantity || 1;
          
          progress[objective.type + '_' + objective.biomeId] = {
            current: expeditionProgress.current,
            required: required,
            completed: expeditionProgress.current >= required
          };
          
          if (expeditionProgress.current < required) {
            allCompleted = false;
          }
          break;
        }
      }
    }

    // Update quest progress
    await this.storage.updatePlayerQuest(playerQuest.id, { progress });

    return { completed: allCompleted, progress };
  }

  async updateQuestProgress(playerId: string, action: string, data: any): Promise<void> {
    const activeQuests = await this.storage.getPlayerQuests(playerId);
    const activePlayerQuests = activeQuests.filter(pq => pq.status === 'active');

    for (const playerQuest of activePlayerQuests) {
      const quest = await this.storage.getQuest(playerQuest.questId);
      if (!quest) continue;

      // Processing quest objectives

      const objectives = quest.objectives as any[];
      let progressUpdated = false;
      const currentProgress: any = playerQuest.progress || {};

      for (const objective of objectives) {
        const progressKey = objective.type + '_' + (objective.resourceId || objective.itemId || objective.creatureId || objective.biomeId);
        
        switch (action) {
          case 'collect':
            if (objective.type === 'collect' && objective.resourceId === data.resourceId) {
              // Found matching collect objective
              if (!currentProgress[progressKey]) {
                currentProgress[progressKey] = { current: 0, required: objective.quantity };
              }
              const previousCurrent = currentProgress[progressKey].current;
              currentProgress[progressKey].current = Math.min(
                currentProgress[progressKey].current + (data.quantity || 1), 
                objective.quantity
              );
              currentProgress[progressKey].completed = currentProgress[progressKey].current >= objective.quantity;
              // Progress updated successfully
              progressUpdated = true;
            }
            break;
            
          case 'craft':
            if (objective.type === 'craft' && objective.itemId === data.itemId) {
              // Found matching craft objective
              if (!currentProgress[progressKey]) {
                currentProgress[progressKey] = { current: 0, required: objective.quantity };
              }
              const previousCurrent = currentProgress[progressKey].current;
              currentProgress[progressKey].current = Math.min(
                currentProgress[progressKey].current + (data.quantity || 1),
                objective.quantity
              );
              currentProgress[progressKey].completed = currentProgress[progressKey].current >= objective.quantity;
              // Craft progress updated successfully
              progressUpdated = true;
            }
            break;
            
          case 'expedition':
            if (objective.type === 'expedition' && objective.biomeId === data.biomeId) {
              const required = objective.amount || objective.quantity || 1;
              if (!currentProgress[progressKey]) {
                currentProgress[progressKey] = { current: 0, required: required };
              }
              const previousCurrent = currentProgress[progressKey].current;
              currentProgress[progressKey].current = Math.min(
                currentProgress[progressKey].current + 1,
                required
              );
              currentProgress[progressKey].completed = currentProgress[progressKey].current >= required;
              console.log(`[QUEST DEBUG] Expedition progress updated for quest ${quest.name}: ${previousCurrent} -> ${currentProgress[progressKey].current}/${required} (biome: ${data.biomeId})`);
              progressUpdated = true;
            }
            break;
            
          case 'kill':
            if (objective.type === 'kill' && objective.creatureId === data.creatureId) {
              if (!currentProgress[progressKey]) {
                currentProgress[progressKey] = { current: 0, required: objective.quantity };
              }
              currentProgress[progressKey].current = Math.min(
                currentProgress[progressKey].current + (data.quantity || 1),
                objective.quantity
              );
              currentProgress[progressKey].completed = currentProgress[progressKey].current >= objective.quantity;
              progressUpdated = true;
            }
            break;
        }
      }

      if (progressUpdated) {
        console.log(`[QUEST DEBUG] Saving progress for quest ${quest.name}:`, currentProgress);
        await this.storage.updatePlayerQuest(playerQuest.id, { progress: currentProgress });
      }
    }
  }

  // Complete a quest and distribute rewards
  async completeQuest(playerId: string, questId: string): Promise<void> {
    const quest = await this.storage.getQuest(questId);
    if (!quest) {
      throw new Error("Quest not found");
    }

    const playerQuest = await this.storage.getPlayerQuest(playerId, questId);
    if (!playerQuest || playerQuest.status !== 'active') {
      throw new Error("Quest not active");
    }

    const player = await this.storage.getPlayer(playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    // Mark quest as completed
    await this.storage.updatePlayerQuest(playerQuest.id, {
      status: 'completed',
      completedAt: Math.floor(Date.now() / 1000)
    });

    // Distribute rewards
    if (quest.rewards) {
      const rewards = quest.rewards as any;
      
      // Give experience points
      if (rewards.experience) {
        const newExp = player.experience + rewards.experience;
        const levelData = await this.calculateLevelUp(player.experience, rewards.experience);
        await this.storage.updatePlayer(playerId, {
          experience: levelData.newExp,
          level: levelData.newLevel
        });
        console.log(`[QUEST REWARD] Player ${playerId} gained ${rewards.experience} XP from quest ${quest.name}`);
      }

      // Give coins
      if (rewards.coins) {
        await this.storage.updatePlayer(playerId, {
          coins: player.coins + rewards.coins
        });
        console.log(`[QUEST REWARD] Player ${playerId} gained ${rewards.coins} coins from quest ${quest.name}`);
      }

      // Give items to storage
      if (rewards.items && typeof rewards.items === 'object') {
        const storageItems = await this.storage.getPlayerStorage(playerId);
        
        for (const [resourceId, quantity] of Object.entries(rewards.items)) {
          const existingStorageItem = storageItems.find(item => item.resourceId === resourceId);
          
          if (existingStorageItem) {
            await this.storage.updateStorageItem(existingStorageItem.id, {
              quantity: existingStorageItem.quantity + Number(quantity)
            });
          } else {
            await this.storage.addStorageItem({
              playerId,
              resourceId,
              quantity: Number(quantity),
              itemType: 'resource'
            });
          }
          
          console.log(`[QUEST REWARD] Player ${playerId} received ${quantity}x ${resourceId} from quest ${quest.name}`);
        }
      }
    }

    console.log(`[QUEST COMPLETE] Player ${playerId} completed quest: ${quest.name}`);
  }

  // Calculate level up from experience gain
  private async calculateLevelUp(currentExp: number, expGain: number): Promise<{newExp: number, newLevel: number}> {
    const newExp = currentExp + expGain;
    let newLevel = 1;
    let requiredExp = 100; // Base experience for level 2
    
    while (newExp >= requiredExp) {
      newLevel++;
      requiredExp += newLevel * 50; // Increasing experience requirement
    }
    
    return { newExp, newLevel };
  }
}