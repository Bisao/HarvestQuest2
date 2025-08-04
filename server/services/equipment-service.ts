
import type { Player, Equipment, InventoryItem } from '@shared/types';
import { storage } from '../storage';

export class EquipmentService {
  /**
   * Equipar um item em um slot específico
   */
  async equipItem(playerId: string, equipmentId: string, slot: string): Promise<boolean> {
    try {
      const player = await storage.getPlayer(playerId);
      if (!player) return false;

      // Verificar se o jogador tem o item no inventário
      const inventoryItem = await storage.getInventoryItem(playerId, equipmentId);
      if (!inventoryItem || inventoryItem.quantity < 1) {
        return false;
      }

      // Verificar se já existe um item equipado no slot
      const currentEquipped = this.getEquippedInSlot(player, slot);
      if (currentEquipped) {
        // Desequipar item atual primeiro
        await this.unequipItem(playerId, slot);
      }

      // Equipar novo item
      const updateData: Partial<Player> = {};
      switch (slot) {
        case 'helmet':
          updateData.equippedHelmet = equipmentId;
          break;
        case 'chestplate':
          updateData.equippedChestplate = equipmentId;
          break;
        case 'leggings':
          updateData.equippedLeggings = equipmentId;
          break;
        case 'boots':
          updateData.equippedBoots = equipmentId;
          break;
        case 'weapon':
          updateData.equippedWeapon = equipmentId;
          break;
        case 'tool':
          updateData.equippedTool = equipmentId;
          break;
        default:
          return false;
      }

      await storage.updatePlayer(playerId, updateData);

      // Remover 1 unidade do inventário
      await storage.updateInventoryItem(playerId, equipmentId, inventoryItem.quantity - 1);

      console.log(`⚔️ EQUIPMENT: Player ${playerId} equipped ${equipmentId} in slot ${slot}`);
      return true;
    } catch (error) {
      console.error('❌ EQUIPMENT: Error equipping item:', error);
      return false;
    }
  }

  /**
   * Desequipar um item de um slot específico
   */
  async unequipItem(playerId: string, slot: string): Promise<boolean> {
    try {
      const player = await storage.getPlayer(playerId);
      if (!player) return false;

      const equippedId = this.getEquippedInSlot(player, slot);
      if (!equippedId) return false;

      // Adicionar item de volta ao inventário
      const currentInventory = await storage.getInventoryItem(playerId, equippedId);
      const newQuantity = currentInventory ? currentInventory.quantity + 1 : 1;
      await storage.updateInventoryItem(playerId, equippedId, newQuantity);

      // Remover do slot de equipamento
      const updateData: Partial<Player> = {};
      switch (slot) {
        case 'helmet':
          updateData.equippedHelmet = null;
          break;
        case 'chestplate':
          updateData.equippedChestplate = null;
          break;
        case 'leggings':
          updateData.equippedLeggings = null;
          break;
        case 'boots':
          updateData.equippedBoots = null;
          break;
        case 'weapon':
          updateData.equippedWeapon = null;
          break;
        case 'tool':
          updateData.equippedTool = null;
          break;
        default:
          return false;
      }

      await storage.updatePlayer(playerId, updateData);

      console.log(`⚔️ EQUIPMENT: Player ${playerId} unequipped ${equippedId} from slot ${slot}`);
      return true;
    } catch (error) {
      console.error('❌ EQUIPMENT: Error unequipping item:', error);
      return false;
    }
  }

  /**
   * Obter todos os equipamentos do jogador
   */
  async getPlayerEquipment(playerId: string): Promise<Record<string, string | null>> {
    const player = await storage.getPlayer(playerId);
    if (!player) return {};

    return {
      helmet: player.equippedHelmet || null,
      chestplate: player.equippedChestplate || null,
      leggings: player.equippedLeggings || null,
      boots: player.equippedBoots || null,
      weapon: player.equippedWeapon || null,
      tool: player.equippedTool || null,
    };
  }

  /**
   * Verificar se o jogador pode equipar um item
   */
  async canEquipItem(playerId: string, equipmentId: string): Promise<boolean> {
    const equipment = await storage.getAllEquipment();
    const equipmentItem = equipment.find(e => e.id === equipmentId);
    
    if (!equipmentItem) return false;

    const inventoryItem = await storage.getInventoryItem(playerId, equipmentId);
    return inventoryItem !== null && inventoryItem.quantity > 0;
  }

  /**
   * Obter item equipado em um slot específico
   */
  private getEquippedInSlot(player: Player, slot: string): string | null {
    switch (slot) {
      case 'helmet': return player.equippedHelmet || null;
      case 'chestplate': return player.equippedChestplate || null;
      case 'leggings': return player.equippedLeggings || null;
      case 'boots': return player.equippedBoots || null;
      case 'weapon': return player.equippedWeapon || null;
      case 'tool': return player.equippedTool || null;
      default: return null;
    }
  }

  /**
   * Calcular bônus total de equipamentos
   */
  async calculateEquipmentBonuses(playerId: string): Promise<Record<string, number>> {
    const playerEquipment = await this.getPlayerEquipment(playerId);
    const allEquipment = await storage.getAllEquipment();
    
    const bonuses: Record<string, number> = {
      protection: 0,
      resourceBoost: 0,
      inventoryBonus: 0
    };

    for (const [slot, equipmentId] of Object.entries(playerEquipment)) {
      if (!equipmentId) continue;

      const equipment = allEquipment.find(e => e.id === equipmentId);
      if (!equipment || !equipment.effects) continue;

      for (const effect of equipment.effects) {
        switch (effect.type) {
          case 'stat_boost':
            if (effect.target === 'protection') {
              bonuses.protection += effect.value;
            } else if (effect.target === 'inventory') {
              bonuses.inventoryBonus += effect.value;
            }
            break;
          case 'resource_boost':
            bonuses.resourceBoost += effect.value - 1; // Convert multiplier to bonus
            break;
        }
      }
    }

    return bonuses;
  }

  /**
   * Verificar se o jogador tem a ferramenta necessária para coletar um recurso
   */
  async hasRequiredTool(playerId: string, resourceId: string): Promise<boolean> {
    const playerEquipment = await this.getPlayerEquipment(playerId);
    const equippedTool = playerEquipment.tool;
    
    if (!equippedTool) return true; // Recursos básicos não precisam de ferramenta

    // Aqui você pode implementar lógica específica para cada recurso
    // Por exemplo, pedra precisa de picareta, madeira precisa de machado, etc.
    return true; // Simplificado por agora
  }
}

export const equipmentService = new EquipmentService();
