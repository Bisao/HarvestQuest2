// Skill API Routes - RESTful APIs para o sistema de skills

import { Router } from 'express';
import type { IStorage } from '../storage.ts';
import { SkillService } from '../services/skill-service.ts';
import { z } from 'zod';

const router = Router();

// Validation schemas
const skillPointsSchema = z.object({
  skillId: z.string(),
  points: z.number().min(1).max(10)
});

const skillExperienceSchema = z.object({
  skillId: z.string(),
  experience: z.number().min(1),
  context: z.string().optional()
});

const skillResetSchema = z.object({
  confirm: z.boolean().refine(val => val === true, {
    message: "Must confirm skill reset"
  })
});

export function createSkillRoutes(storage: IStorage) {
  const skillService = new SkillService(storage);

  // GET /api/skills/:playerId - Get player's skill tree
  router.get('/:playerId', async (req, res) => {
    try {
      const { playerId } = req.params;
      
      const skillTree = await skillService.getPlayerSkillTree(playerId);
      
      res.json({
        success: true,
        data: skillTree
      });
    } catch (error) {
      console.error('Error fetching skill tree:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch skill tree'
      });
    }
  });

  // POST /api/skills/:playerId/level-up - Spend skill points to level up a skill
  router.post('/:playerId/level-up', async (req, res) => {
    try {
      const { playerId } = req.params;
      const body = skillPointsSchema.parse(req.body);
      
      const success = await skillService.spendSkillPoints(
        playerId, 
        body.skillId, 
        body.points
      );
      
      if (!success) {
        return res.status(400).json({
          success: false,
          error: 'Cannot level up skill - insufficient points or requirements not met'
        });
      }
      
      // Return updated skill tree
      const skillTree = await skillService.getPlayerSkillTree(playerId);
      
      res.json({
        success: true,
        data: skillTree,
        message: `Successfully leveled up skill`
      });
    } catch (error) {
      console.error('Error leveling up skill:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to level up skill'
      });
    }
  });

  // POST /api/skills/:playerId/add-experience - Add experience to a skill (for game systems)
  router.post('/:playerId/add-experience', async (req, res) => {
    try {
      const { playerId } = req.params;
      const body = skillExperienceSchema.parse(req.body);
      
      await skillService.addSkillExperience(
        playerId,
        body.skillId,
        body.experience
      );
      
      if (body.context) {
        await skillService.recordSkillUsage(playerId, body.skillId, body.context);
      }
      
      res.json({
        success: true,
        message: 'Experience added successfully'
      });
    } catch (error) {
      console.error('Error adding skill experience:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add skill experience'
      });
    }
  });

  // GET /api/skills/:playerId/bonuses - Get current skill bonuses
  router.get('/:playerId/bonuses', async (req, res) => {
    try {
      const { playerId } = req.params;
      
      const bonuses = await skillService.getSkillBonuses(playerId);
      
      res.json({
        success: true,
        data: bonuses
      });
    } catch (error) {
      console.error('Error fetching skill bonuses:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch skill bonuses'
      });
    }
  });

  // POST /api/skills/:playerId/reset - Reset all skills (with cost)
  router.post('/:playerId/reset', async (req, res) => {
    try {
      const { playerId } = req.params;
      const body = skillResetSchema.parse(req.body);
      
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({
          success: false,
          error: 'Player not found'
        });
      }
      
      // Calculate reset cost based on total skill points spent
      const resetCost = Math.floor((player.totalSkillPoints || 0) * 100); // 100 coins per skill point
      
      const success = await skillService.resetPlayerSkills(playerId, resetCost);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          error: `Insufficient coins for reset (cost: ${resetCost})`
        });
      }
      
      // Return updated skill tree
      const skillTree = await skillService.getPlayerSkillTree(playerId);
      
      res.json({
        success: true,
        data: skillTree,
        message: `Successfully reset skills (cost: ${resetCost} coins)`
      });
    } catch (error) {
      console.error('Error resetting skills:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reset skills'
      });
    }
  });

  // POST /api/skills/:playerId/unlock-check - Check for new skill unlocks
  router.post('/:playerId/unlock-check', async (req, res) => {
    try {
      const { playerId } = req.params;
      
      await skillService.checkSkillUnlocks(playerId);
      
      const skillTree = await skillService.getPlayerSkillTree(playerId);
      
      res.json({
        success: true,
        data: skillTree,
        message: 'Skill unlocks checked'
      });
    } catch (error) {
      console.error('Error checking skill unlocks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check skill unlocks'
      });
    }
  });

  return router;
}