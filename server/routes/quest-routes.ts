// Quest management routes - centralized and organized
import { Express } from 'express';
import type { IStorage } from '../storage';
import { QuestService } from '../services/quest-service';
import { GameService } from '../services/game-service';

export function setupQuestRoutes(app: Express, storage: IStorage, questService: QuestService, gameService: GameService) {
  
  // ===== QUEST DISCOVERY ROUTES =====
  
  // Get all quests available in the game
  app.get("/api/quests", async (req, res) => {
    try {
      const quests = await storage.getAllQuests();
      res.json(quests);
    } catch (error) {
      console.error("Get all quests error:", error);
      res.status(500).json({ message: "Failed to get quests" });
    }
  });

  // Get player's quests with real-time progress
  app.get("/api/player/:playerId/quests", async (req, res) => {
    try {
      const { playerId } = req.params;
      const allQuests = await storage.getAllQuests();
      const playerQuests = await storage.getPlayerQuests(playerId);
      
      // Get player for level checking
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      // Combine quest data with player progress and check objectives in parallel
      const questsWithProgress = await Promise.all(
        allQuests
          .filter(quest => quest.isActive && quest.requiredLevel <= player.level)
          .map(async (quest) => {
            const playerQuest = playerQuests.find(pq => pq.questId === quest.id);
            let questProgress = { completed: false, progress: {} };
            
            // Check quest objectives if quest is active
            if (playerQuest && playerQuest.status === 'active') {
              questProgress = await questService.checkQuestObjectives(playerId, quest.id);
              
              // Auto-complete quest if all objectives are met and auto-complete is enabled
              if (questProgress.completed && playerQuest.status === 'active' && player.autoCompleteQuests !== false) {
                console.log(`[QUEST AUTO-COMPLETE] Quest ${quest.name} completed for player ${playerId}`);
                await questService.completeQuest(playerId, quest.id);
                // Update playerQuest status
                const updatedPlayerQuest = await storage.getPlayerQuest(playerId, quest.id);
                if (updatedPlayerQuest) {
                  playerQuest.status = updatedPlayerQuest.status;
                  playerQuest.completedAt = updatedPlayerQuest.completedAt;
                }
              }
            }
            
            return {
              ...quest,
              playerQuest: playerQuest || null,
              status: playerQuest?.status || 'available',
              progress: questProgress.progress,
              canComplete: questProgress.completed && playerQuest?.status === 'active' && player.autoCompleteQuests === false
            };
          })
      );

      // Invalidate cache for real-time updates
      const { invalidatePlayerCache } = await import("../cache/memory-cache");
      invalidatePlayerCache(playerId);

      res.json(questsWithProgress);
    } catch (error) {
      console.error("Get player quests error:", error);
      res.status(500).json({ message: "Failed to get player quests" });
    }
  });

  
  // ===== QUEST MANAGEMENT ROUTES =====

  // Start a quest
  app.post("/api/player/:playerId/quests/:questId/start", async (req, res) => {
    try {
      const { playerId, questId } = req.params;
      
      // Check if player already has this quest
      const existingPlayerQuest = await storage.getPlayerQuest(playerId, questId);
      if (existingPlayerQuest) {
        return res.status(400).json({ message: "Quest already started or completed" });
      }

      // Check active quest limit (maximum 5 active quests)
      const allPlayerQuests = await storage.getPlayerQuests(playerId);
      const activeQuests = allPlayerQuests.filter(pq => pq.status === 'active');
      if (activeQuests.length >= 5) {
        return res.status(400).json({ message: "Maximum 5 active quests allowed. Complete or cancel an existing quest first." });
      }

      // Get quest to validate
      const quest = await storage.getQuest(questId);
      if (!quest) {
        return res.status(404).json({ message: "Quest not found" });
      }

      // Check player level requirement
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      if (player.level < quest.requiredLevel) {
        return res.status(400).json({ message: `Required level: ${quest.requiredLevel}. Current level: ${player.level}` });
      }

      // Create player quest
      const playerQuest = await storage.createPlayerQuest({
        playerId,
        questId,
        status: "active",
        progress: {}
      });

      // Update with timestamp
      const updatedPlayerQuest = await storage.updatePlayerQuest(playerQuest.id, {
        startedAt: Math.floor(Date.now() / 1000)
      });

      // Invalidate cache
      const { invalidatePlayerCache } = await import("../cache/memory-cache");
      invalidatePlayerCache(playerId);

      console.log(`[QUEST START] Player ${playerId} started quest: ${quest.name}`);
      res.json({ message: "Quest started successfully", playerQuest: updatedPlayerQuest });
    } catch (error) {
      console.error("Start quest error:", error);
      res.status(500).json({ message: "Failed to start quest" });
    }
  });

  // Complete a quest manually
  app.post("/api/player/:playerId/quests/:questId/complete", async (req, res) => {
    try {
      const { playerId, questId } = req.params;
      
      // Get player quest
      const playerQuest = await storage.getPlayerQuest(playerId, questId);
      if (!playerQuest || playerQuest.status !== 'active') {
        return res.status(400).json({ message: "Quest not active or doesn't exist" });
      }

      // Check if quest objectives are completed
      const questProgress = await questService.checkQuestObjectives(playerId, questId);
      if (!questProgress.completed) {
        return res.status(400).json({ message: "Quest objectives not completed yet" });
      }

      // Complete the quest using service
      await questService.completeQuest(playerId, questId);

      // Invalidate cache
      const { invalidatePlayerCache } = await import("../cache/memory-cache");
      invalidatePlayerCache(playerId);

      res.json({ message: "Quest completed successfully!" });
    } catch (error) {
      console.error("Complete quest error:", error);
      res.status(500).json({ message: "Failed to complete quest" });
    }
  });

  // Cancel/abandon a quest
  app.post("/api/player/:playerId/quests/:questId/cancel", async (req, res) => {
    try {
      const { playerId, questId } = req.params;
      
      // Get player quest
      const playerQuest = await storage.getPlayerQuest(playerId, questId);
      if (!playerQuest || playerQuest.status !== 'active') {
        return res.status(400).json({ message: "Quest not active or doesn't exist" });
      }

      // Update quest status to cancelled
      await storage.updatePlayerQuest(playerQuest.id, {
        status: 'cancelled',
        completedAt: Math.floor(Date.now() / 1000)
      });

      // Invalidate cache
      const { invalidatePlayerCache } = await import("../cache/memory-cache");
      invalidatePlayerCache(playerId);

      res.json({ message: "Quest cancelled successfully" });
    } catch (error) {
      console.error("Cancel quest error:", error);
      res.status(500).json({ message: "Failed to cancel quest" });
    }
  });

  
  // ===== QUEST PROGRESS ROUTES =====

  // Get specific quest progress
  app.get("/api/player/:playerId/quests/:questId/progress", async (req, res) => {
    try {
      const { playerId, questId } = req.params;
      
      const questProgress = await questService.checkQuestObjectives(playerId, questId);
      res.json(questProgress);
    } catch (error) {
      console.error("Get quest progress error:", error);
      res.status(500).json({ message: "Failed to get quest progress" });
    }
  });

  // Force update quest progress (for testing/debugging)
  app.post("/api/player/:playerId/quests/update-progress", async (req, res) => {
    try {
      const { playerId } = req.params;
      const { action, data } = req.body;
      
      await questService.updateQuestProgress(playerId, action, data);
      
      // Invalidate cache
      const { invalidatePlayerCache } = await import("../cache/memory-cache");
      invalidatePlayerCache(playerId);
      
      res.json({ message: "Quest progress updated successfully" });
    } catch (error) {
      console.error("Update quest progress error:", error);
      res.status(500).json({ message: "Failed to update quest progress" });
    }
  });

  
  // ===== QUEST UTILITY ROUTES =====

  // Reset a completed quest (for testing)
  app.post("/api/player/:playerId/quests/:questId/reset", async (req, res) => {
    try {
      const { playerId, questId } = req.params;
      
      // Get player quest
      const playerQuest = await storage.getPlayerQuest(playerId, questId);
      if (!playerQuest || playerQuest.status !== 'completed') {
        return res.status(400).json({ message: "Quest not completed or doesn't exist" });
      }

      // Get quest to validate
      const quest = await storage.getQuest(questId);
      if (!quest) {
        return res.status(404).json({ message: "Quest not found" });
      }

      // Reset the quest to active status with empty progress
      const resetPlayerQuest = await storage.updatePlayerQuest(playerQuest.id, {
        status: 'active',
        progress: {},
        startedAt: Math.floor(Date.now() / 1000),
        completedAt: null
      });

      // Invalidate cache
      const { invalidatePlayerCache } = await import("../cache/memory-cache");
      invalidatePlayerCache(playerId);

      res.json({ message: "Quest reset successfully", playerQuest: resetPlayerQuest });
    } catch (error) {
      console.error("Reset quest error:", error);
      res.status(500).json({ message: "Failed to reset quest" });
    }
  });

  // Reset all completed quests (for testing)
  app.post("/api/player/:playerId/quests/reset-all", async (req, res) => {
    try {
      const { playerId } = req.params;
      
      const allPlayerQuests = await storage.getPlayerQuests(playerId);
      const completedQuests = allPlayerQuests.filter(pq => pq.status === 'completed');

      // Reset all completed quests to active status with empty progress
      for (const playerQuest of completedQuests) {
        await storage.updatePlayerQuest(playerQuest.id, {
          status: 'active',
          progress: {},
          startedAt: Math.floor(Date.now() / 1000),
          completedAt: null
        });
      }

      // Invalidate cache
      const { invalidatePlayerCache } = await import("../cache/memory-cache");
      invalidatePlayerCache(playerId);

      res.json({ 
        message: `${completedQuests.length} quests reset successfully`,
        resetQuestCount: completedQuests.length
      });
    } catch (error) {
      console.error("Reset all completed quests error:", error);
      res.status(500).json({ message: "Failed to reset completed quests" });
    }
  });
}