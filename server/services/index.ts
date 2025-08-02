// Server Services Barrel Export - Business Logic Layer
// This file centralizes all service exports for clean dependency injection

// === CORE GAME SERVICES ===
export { GameService } from './game-service';
export { ExpeditionService } from './expedition-service';
export { QuestService } from './quest-service';

// === PLAYER MANAGEMENT SERVICES ===
export { StorageService } from './storage-service';
export { OfflineActivityService } from './offline-activity-service';

// === SYSTEM SERVICES ===
export { AutoConsumeService } from './auto-consume-service';
export { HungerThirstService } from './hunger-thirst-service';

// === SERVICE FACTORY ===
import type { IStorage } from '../storage';

export interface ServiceContainer {
  gameService: GameService;
  expeditionService: ExpeditionService;
  questService: QuestService;
  storageService: StorageService;
  offlineActivityService: OfflineActivityService;
  autoConsumeService: AutoConsumeService;
  hungerThirstService: HungerThirstService;
}

/**
 * Creates and initializes all services with proper dependencies
 */
export function createServiceContainer(storage: IStorage): ServiceContainer {
  const gameService = new GameService(storage);
  const expeditionService = new ExpeditionService(storage);
  const questService = new QuestService(storage);
  const storageService = new StorageService(storage);
  const offlineActivityService = new OfflineActivityService(storage);
  const autoConsumeService = new AutoConsumeService(storage);
  const hungerThirstService = new HungerThirstService(storage);

  return {
    gameService,
    expeditionService,
    questService,
    storageService,
    offlineActivityService,
    autoConsumeService,
    hungerThirstService
  };
}