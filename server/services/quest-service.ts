import type { IStorage } from "../storage";

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
          const storageItems = await this.storage.getPlayerStorage(playerId);
          const inventoryItems = await this.storage.getPlayerInventory(playerId);
          
          // Count items in both storage and inventory
          const storageItem = storageItems.find(item => item.resourceId === objective.resourceId);
          const inventoryItem = inventoryItems.find(item => item.resourceId === objective.resourceId);
          
          const totalQuantity = (storageItem?.quantity || 0) + (inventoryItem?.quantity || 0);
          const required = objective.quantity || 1;
          
          progress[objective.type + '_' + objective.resourceId] = {
            current: Math.min(totalQuantity, required),
            required: required,
            completed: totalQuantity >= required
          };
          
          if (totalQuantity < required) {
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
          const required = objective.quantity || 1;
          
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
    console.log(`[QUEST DEBUG] Updating quest progress: playerId=${playerId}, action=${action}, data=`, data);
    
    const activeQuests = await this.storage.getPlayerQuests(playerId);
    const activePlayerQuests = activeQuests.filter(pq => pq.status === 'active');

    console.log(`[QUEST DEBUG] Found ${activePlayerQuests.length} active quests for player`);

    for (const playerQuest of activePlayerQuests) {
      const quest = await this.storage.getQuest(playerQuest.questId);
      if (!quest) continue;

      console.log(`[QUEST DEBUG] Processing quest: ${quest.name}`);

      const objectives = quest.objectives as any[];
      let progressUpdated = false;
      const currentProgress: any = playerQuest.progress || {};

      for (const objective of objectives) {
        const progressKey = objective.type + '_' + (objective.resourceId || objective.itemId || objective.creatureId || objective.biomeId);
        
        switch (action) {
          case 'collect':
            if (objective.type === 'collect' && objective.resourceId === data.resourceId) {
              console.log(`[QUEST DEBUG] Found matching collect objective: ${objective.resourceId}, quantity: ${data.quantity}`);
              if (!currentProgress[progressKey]) {
                currentProgress[progressKey] = { current: 0, required: objective.quantity };
              }
              const previousCurrent = currentProgress[progressKey].current;
              currentProgress[progressKey].current = Math.min(
                currentProgress[progressKey].current + (data.quantity || 1), 
                objective.quantity
              );
              currentProgress[progressKey].completed = currentProgress[progressKey].current >= objective.quantity;
              console.log(`[QUEST DEBUG] Progress updated: ${previousCurrent} → ${currentProgress[progressKey].current}/${objective.quantity}`);
              progressUpdated = true;
            }
            break;
            
          case 'craft':
            if (objective.type === 'craft' && objective.itemId === data.itemId) {
              console.log(`[QUEST DEBUG] Found matching craft objective: ${objective.itemId}, quantity: ${data.quantity}`);
              if (!currentProgress[progressKey]) {
                currentProgress[progressKey] = { current: 0, required: objective.quantity };
              }
              const previousCurrent = currentProgress[progressKey].current;
              currentProgress[progressKey].current = Math.min(
                currentProgress[progressKey].current + (data.quantity || 1),
                objective.quantity
              );
              currentProgress[progressKey].completed = currentProgress[progressKey].current >= objective.quantity;
              console.log(`[QUEST DEBUG] Craft progress updated: ${previousCurrent} → ${currentProgress[progressKey].current}/${objective.quantity}`);
              progressUpdated = true;
            }
            break;
            
          case 'expedition':
            if (objective.type === 'expedition' && objective.biomeId === data.biomeId) {
              if (!currentProgress[progressKey]) {
                currentProgress[progressKey] = { current: 0, required: objective.quantity };
              }
              currentProgress[progressKey].current = Math.min(
                currentProgress[progressKey].current + 1,
                objective.quantity
              );
              currentProgress[progressKey].completed = currentProgress[progressKey].current >= objective.quantity;
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
}