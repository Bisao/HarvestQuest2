# Plano de Modularização - Coletor Adventures

## 🎯 Objetivo
Implementar um sistema modular robusto onde mudanças em um componente não quebram outros, usando padrões similares ao sistema de IDs unificado já existente.

## 📊 Status Atual
- ✅ Correção da template string malformada (parcial)
- ✅ Sistema de IDs centralizado implementado
- ✅ WebSocket funcional (com reconexões frequentes)
- ❌ Componentes duplicados ainda existem
- ❌ Configurações hardcoded espalhadas
- ❌ Falta validação centralizada

## 🏗️ Arquitetura Modular Proposta

### 1. Sistema de Configuração Centralizado
```typescript
// shared/config/game-config.ts
export const GAME_CONFIG = {
  WEBSOCKET: {
    HEARTBEAT_INTERVAL: 30000,
    RECONNECT_DELAY: 5000,
    MAX_RECONNECT_ATTEMPTS: 10
  },
  HUNGER_THIRST: {
    HUNGER_DECAY_RATE: 1,
    THIRST_DECAY_RATE: 1,
    UPDATE_INTERVAL: 60000
  },
  EXPEDITIONS: {
    MIN_DURATION: 10000,
    MAX_DURATION: 300000,
    PROGRESS_UPDATE_INTERVAL: 1000
  },
  API: {
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    CACHE_TTL: 300000
  }
} as const;
```

### 2. Sistema de Validação Centralizado
```typescript
// shared/validators/game-validators.ts
export const GameValidators = {
  playerId: (id: string): boolean => /^[a-f0-9-]{36}$/.test(id),
  resourceId: (id: string): boolean => id.startsWith('res-'),
  equipmentId: (id: string): boolean => id.startsWith('eq-'),
  biomeId: (id: string): boolean => id.startsWith('biome-'),
  questId: (id: string): boolean => id.startsWith('quest-'),
  quantity: (qty: number): boolean => qty > 0 && qty <= 999999,
  level: (level: number): boolean => level >= 1 && level <= 100
};

export const validateApiRequest = (type: string, data: any): boolean => {
  switch (type) {
    case 'consume':
      return GameValidators.playerId(data.playerId) && 
             GameValidators.quantity(data.quantity);
    case 'equip':
      return GameValidators.playerId(data.playerId) && 
             GameValidators.equipmentId(data.equipmentId);
    default:
      return false;
  }
};
```

### 3. Sistema de Eventos Centralizado
```typescript
// shared/events/game-events.ts
export type GameEvent = 
  | { type: 'PLAYER_UPDATE'; payload: Player }
  | { type: 'INVENTORY_CHANGE'; payload: { playerId: string; items: InventoryItem[] } }
  | { type: 'EXPEDITION_COMPLETE'; payload: { expeditionId: string; rewards: any } }
  | { type: 'QUEST_COMPLETE'; payload: { questId: string; playerId: string } };

export class GameEventManager {
  private static instance: GameEventManager;
  private listeners: Map<string, Function[]> = new Map();

  static getInstance(): GameEventManager {
    if (!GameEventManager.instance) {
      GameEventManager.instance = new GameEventManager();
    }
    return GameEventManager.instance;
  }

  emit(event: GameEvent): void {
    const listeners = this.listeners.get(event.type) || [];
    listeners.forEach(listener => listener(event.payload));
  }

  on(eventType: string, listener: Function): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType) || [];
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
}
```

### 4. Sistema de Cache Modular
```typescript
// server/cache/cache-manager.ts
export class CacheManager {
  private static instance: CacheManager;
  private caches: Map<string, Map<string, { data: any; expiry: number }>> = new Map();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(namespace: string, key: string, data: any, ttl: number = GAME_CONFIG.API.CACHE_TTL): void {
    if (!this.caches.has(namespace)) {
      this.caches.set(namespace, new Map());
    }
    
    this.caches.get(namespace)!.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  get(namespace: string, key: string): any | null {
    const cache = this.caches.get(namespace);
    if (!cache) return null;

    const item = cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      cache.delete(key);
      return null;
    }

    return item.data;
  }

  invalidate(namespace: string, key?: string): void {
    if (key) {
      this.caches.get(namespace)?.delete(key);
    } else {
      this.caches.delete(namespace);
    }
  }
}
```

### 5. Sistema de Logs Estruturado
```typescript
// shared/utils/logger.ts
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private static level = process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG;

  static setLevel(level: LogLevel): void {
    Logger.level = level;
  }

  private static log(level: LogLevel, module: string, message: string, data?: any): void {
    if (level < Logger.level) return;

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const prefix = `${timestamp} [${levelName}] [${module}]`;

    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  static debug(module: string, message: string, data?: any): void {
    Logger.log(LogLevel.DEBUG, module, message, data);
  }

  static info(module: string, message: string, data?: any): void {
    Logger.log(LogLevel.INFO, module, message, data);
  }

  static warn(module: string, message: string, data?: any): void {
    Logger.log(LogLevel.WARN, module, message, data);
  }

  static error(module: string, message: string, data?: any): void {
    Logger.log(LogLevel.ERROR, module, message, data);
  }
}
```

## 🔧 Implementação Gradual

### Fase 1: Correções Críticas (URGENTE)
1. ✅ Corrigir todas as template strings malformadas
2. ⏳ Estabilizar WebSocket (reduzir reconexões)
3. ⏳ Remover componentes obsoletos
4. ⏳ Consolidar dados duplicados

### Fase 2: Modularização Base (1-2 dias)
1. Implementar sistema de configuração centralizado
2. Criar sistema de validação unificado
3. Implementar logger estruturado
4. Criar cache manager

### Fase 3: Refatoração de Componentes (2-3 dias)
1. Migrar componentes para usar configuração centralizada
2. Implementar validação em todas as APIs
3. Padronizar tratamento de erros
4. Implementar sistema de eventos

### Fase 4: Otimizações (1-2 dias)
1. Otimizar queries do React Query
2. Implementar lazy loading
3. Melhorar performance do WebSocket
4. Adicionar métricas de performance

## 📋 Checklist de Arquivos para Limpeza

### Componentes Obsoletos para Remover
- [ ] `client/src/components/game/biomes-tab-old.tsx`
- [ ] `client/src/components/game/biomes-tab.tsx` (versão antiga)
- [ ] `client/src/pages/game-old.tsx`
- [ ] `client/src/pages/game-simple.tsx`
- [ ] `client/src/components/game/simple-inventory.tsx`
- [ ] `client/src/components/game/minecraft-inventory.tsx`
- [ ] `client/src/components/game/equipment-tab.tsx` (se não usado)
- [ ] `client/src/components/game/inventory-tab.tsx` (se não usado)

### Screenshots para Arquivar
- [ ] Mover 100+ screenshots para pasta `archived_assets/`
- [ ] Manter apenas screenshots relevantes em `attached_assets/`

### Dados Duplicados para Consolidar
- [ ] Unificar `server/data/items-modern.ts` e outros
- [ ] Consolidar `shared/types.ts` e `shared/types-new.ts`
- [ ] Revisar `server/data/recipes.ts` vs `server/data/recipes-modern.ts`

## 🛡️ Padrões de Segurança

### Validação de Entrada
```typescript
// Exemplo de uso do sistema de validação
app.post('/api/player/consume', (req, res) => {
  if (!validateApiRequest('consume', req.body)) {
    return res.status(400).json({ error: 'Invalid request data' });
  }
  // Prosseguir com lógica...
});
```

### Rate Limiting Granular
```typescript
// server/middleware/rate-limiting.ts
export const createRateLimit = (namespace: string, max: number, windowMs: number) => {
  return rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => `${namespace}:${req.ip}:${req.user?.id || 'anonymous'}`,
    message: { error: `Too many ${namespace} requests` }
  });
};
```

## 📊 Métricas de Sucesso

### Performance
- [ ] Tempo de resposta API < 1ms
- [ ] Reconexões WebSocket < 1 por minuto
- [ ] Tempo de carregamento < 2s
- [ ] Zero erros de template string

### Qualidade
- [ ] 100% dos componentes obsoletos removidos
- [ ] 90% redução de código duplicado
- [ ] Validação centralizada em 100% das APIs
- [ ] Logs estruturados em todos os módulos

### Robustez
- [ ] Mudanças em um módulo não quebram outros
- [ ] Sistema de fallback para falhas
- [ ] Recovery automático de erros
- [ ] Monitoramento de health em tempo real

## 🚀 Benefícios Esperados

1. **Manutenibilidade**: Mudanças isoladas não quebram o sistema
2. **Performance**: Cache otimizado e queries eficientes
3. **Debuggabilidade**: Logs estruturados facilitam troubleshooting
4. **Escalabilidade**: Arquitetura preparada para crescimento
5. **Confiabilidade**: Validação e tratamento de erros robustos
6. **Produtividade**: Desenvolvimento mais rápido com componentes reutilizáveis

## 📅 Timeline

- **Semana 1**: Correções críticas + Base modular
- **Semana 2**: Refatoração de componentes + Limpeza
- **Semana 3**: Otimizações + Testes + Documentação
- **Semana 4**: Polimento + Deploy + Monitoramento

## 🎯 Próximo Passo Imediato

Implementar o sistema de configuração centralizado e corrigir as últimas template strings malformadas para estabilizar o projeto antes de prosseguir com a modularização completa.