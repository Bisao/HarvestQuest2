import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExpeditionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize game data
  await storage.initializeGameData();

  // Get player data
  app.get("/api/player/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const player = await storage.getPlayerByUsername(username);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: "Failed to get player" });
    }
  });

  // Get all resources
  app.get("/api/resources", async (req, res) => {
    try {
      const resources = await storage.getAllResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to get resources" });
    }
  });

  // Get all biomes
  app.get("/api/biomes", async (req, res) => {
    try {
      const biomes = await storage.getAllBiomes();
      res.json(biomes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get biomes" });
    }
  });

  // Get player inventory
  app.get("/api/inventory/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      const inventory = await storage.getPlayerInventory(playerId);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to get inventory" });
    }
  });

  // Get player storage
  app.get("/api/storage/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      const storageItems = await storage.getPlayerStorage(playerId);
      res.json(storageItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to get storage" });
    }
  });

  // Get all equipment
  app.get("/api/equipment", async (req, res) => {
    try {
      const equipment = await storage.getAllEquipment();
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to get equipment" });
    }
  });

  // Get all recipes
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getAllRecipes();
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recipes" });
    }
  });

  // Start expedition
  app.post("/api/expeditions", async (req, res) => {
    try {
      console.log('Received expedition data:', req.body);
      
      // Validate the expedition data
      const expeditionData = insertExpeditionSchema.parse(req.body);
      console.log('Validated expedition data:', expeditionData);
      
      const expedition = await storage.createExpedition(expeditionData);
      console.log('Created expedition:', expedition);
      
      res.json(expedition);
    } catch (error) {
      console.error('Expedition creation error:', error);
      if (error instanceof z.ZodError) {
        console.error('Zod validation errors:', error.errors);
        return res.status(400).json({ 
          message: "Invalid expedition data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create expedition" });
    }
  });

  // Update expedition
  app.patch("/api/expeditions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const expedition = await storage.updateExpedition(id, updates);
      res.json(expedition);
    } catch (error) {
      res.status(500).json({ message: "Failed to update expedition" });
    }
  });

  // Complete expedition and collect resources
  app.post("/api/expeditions/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      const expedition = await storage.getExpedition(id);
      
      if (!expedition) {
        return res.status(404).json({ message: "Expedition not found" });
      }

      const player = await storage.getPlayer(expedition.playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      // Simulate resource collection
      const selectedResourceIds = expedition.selectedResources as string[];
      const collectedResources: Record<string, number> = {};
      let totalWeight = 0;

      for (const resourceId of selectedResourceIds) {
        const resource = await storage.getResource(resourceId);
        if (!resource) continue;

        // Generate random amount (1-8 based on resource type)
        const baseAmount = resource.type === "basic" ? Math.floor(Math.random() * 6) + 3 : Math.floor(Math.random() * 4) + 1;
        const amount = Math.min(baseAmount, Math.floor((player.maxInventoryWeight - player.inventoryWeight - totalWeight) / resource.weight));
        
        if (amount > 0) {
          collectedResources[resourceId] = amount;
          totalWeight += resource.weight * amount;
        }
      }

      // Add resources to inventory
      for (const [resourceId, quantity] of Object.entries(collectedResources)) {
        const existingItem = (await storage.getPlayerInventory(expedition.playerId))
          .find(item => item.resourceId === resourceId);

        if (existingItem) {
          await storage.updateInventoryItem(existingItem.id, {
            quantity: existingItem.quantity + quantity
          });
        } else {
          await storage.addInventoryItem({
            playerId: expedition.playerId,
            resourceId,
            quantity
          });
        }
      }

      // Update player weight and energy
      await storage.updatePlayer(expedition.playerId, {
        inventoryWeight: player.inventoryWeight + totalWeight,
        energy: Math.max(0, player.energy - 10)
      });

      // Mark expedition as completed
      await storage.updateExpedition(id, {
        status: "completed",
        collectedResources,
        endTime: Date.now()
      });

      res.json({ collectedResources, totalWeight });
    } catch (error) {
      res.status(500).json({ message: "Failed to complete expedition" });
    }
  });

  // Store all inventory items
  app.post("/api/storage/store-all/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      const inventory = await storage.getPlayerInventory(playerId);
      const storageItems = await storage.getPlayerStorage(playerId);

      for (const invItem of inventory) {
        const existingStorageItem = storageItems.find(
          (s) => s.resourceId === invItem.resourceId,
        );

        if (existingStorageItem) {
          await storage.updateStorageItem(existingStorageItem.id, {
            quantity: existingStorageItem.quantity + invItem.quantity,
          });
        } else {
          await storage.addStorageItem({
            playerId,
            resourceId: invItem.resourceId,
            quantity: invItem.quantity,
          });
        }

        await storage.removeInventoryItem(invItem.id);
      }

      // Update player inventory weight
      await storage.updatePlayer(playerId, { inventoryWeight: 0 });

      res.json({ message: "All items stored successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to store items" });
    }
  });

  // Transfer from storage to inventory
  app.post("/api/storage/withdraw", async (req, res) => {
    try {
      const { playerId, resourceId, quantity } = req.body;
      
      const storageItems = await storage.getPlayerStorage(playerId);
      const storageItem = storageItems.find((s) => s.resourceId === resourceId);
      
      if (!storageItem || storageItem.quantity < quantity) {
        return res.status(400).json({ message: "Insufficient resources in storage" });
      }

      const resource = await storage.getResource(resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      const totalWeight = resource.weight * quantity;
      if (player.inventoryWeight + totalWeight > player.maxInventoryWeight) {
        return res.status(400).json({ message: "Not enough inventory space" });
      }

      // Update storage
      if (storageItem.quantity === quantity) {
        await storage.removeStorageItem(storageItem.id);
      } else {
        await storage.updateStorageItem(storageItem.id, {
          quantity: storageItem.quantity - quantity,
        });
      }

      // Add to inventory
      const inventory = await storage.getPlayerInventory(playerId);
      const existingInvItem = inventory.find((i) => i.resourceId === resourceId);

      if (existingInvItem) {
        await storage.updateInventoryItem(existingInvItem.id, {
          quantity: existingInvItem.quantity + quantity,
        });
      } else {
        await storage.addInventoryItem({
          playerId,
          resourceId,
          quantity,
        });
      }

      // Update player weight
      await storage.updatePlayer(playerId, {
        inventoryWeight: player.inventoryWeight + totalWeight,
      });

      res.json({ message: "Items withdrawn successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to withdraw items" });
    }
  });

  // Update player auto storage setting
  app.patch("/api/player/:id/auto-storage", async (req, res) => {
    try {
      const { id } = req.params;
      const { autoStorage } = req.body;
      const player = await storage.updatePlayer(id, { autoStorage });
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: "Failed to update auto storage setting" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
