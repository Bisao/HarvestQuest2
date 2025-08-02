// Game Components Barrel Export - Organized by Category
// This file centralizes all game component exports for clean imports

// === CORE GAME COMPONENTS ===
export { default as GameHeader } from './game-header';
export { default as LoadingScreen } from './loading-screen';
export { default as StatusTab } from './status-tab';

// === INVENTORY & STORAGE ===
export { default as EnhancedInventory } from './enhanced-inventory';
export { default as EnhancedStorageTab } from './enhanced-storage-tab';
export { EnhancedItemModal } from './enhanced-item-modal';
export { ItemDetailsModal } from './item-details-modal';

// === CRAFTING & WORKSHOPS ===
export { default as UnifiedWorkshops } from './unified-workshops';
export { default as UnifiedInventory } from './unified-inventory';
export { default as ModernGameLayout } from './modern-game-layout';

// === EQUIPMENT ===
export { default as EquipmentTab } from './equipment-tab';
export { default as EquipmentSelectorModal } from './equipment-selector-modal';

// === EXPEDITIONS & EXPLORATION ===
export { default as ExpeditionSystem } from './expedition-system';
export { default as ExpeditionPanel } from './expedition-panel';
export { default as ExpeditionModal } from './expedition-modal';
export { default as BiomesTabNew } from './biomes-tab-new';

// === QUESTS & PROGRESSION ===
export { default as QuestsTab } from './quests-tab';

// === PLAYER MANAGEMENT ===
export { default as PlayerSettings } from './player-settings';
export { OfflineActivityReport } from './offline-activity-report';
export { OfflineConfigModal } from './offline-config-modal';