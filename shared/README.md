# Shared Module - Coletor Adventures

Este módulo contém todos os tipos, constantes, utilitários e validações compartilhadas entre o frontend e backend.

## Estrutura Consolidada

### 📁 `/constants`
- `game-ids.ts` - IDs centralizados para recursos, equipamentos, receitas, biomas e quests
- `creature-ids.ts` - IDs específicos para criaturas (separados dos recursos)

### 📁 `/types`
- `../types.ts` - **ARQUIVO PRINCIPAL** - Todos os tipos core do jogo
- `inventory-types.ts` - Tipos específicos do inventário
- `skill-types.ts` - Sistema de habilidades e doenças
- `time-types.ts` - Sistema de tempo do jogo
- `storage-types.ts` - Tipos do sistema de armazenamento
- `index.ts` - Barrel export organizado

### 📁 `/utils`
- **ID Management**: `id-validation.ts`, `id-resolver.ts`, `id-auto-correction.ts`
- **UUID System**: `uuid-generator.ts`, `uuid-enforcement.ts`
- **Game Mechanics**: `item-calculations.ts`, `consumable-utils.ts`
- **Data Management**: `cache-manager.ts`, `storage-manager.ts`
- `index.ts` - Barrel export consolidado

### 📁 `/config`
- `game-config.ts` - Configurações gerais do jogo
- `time-config.ts` - Configurações do sistema de tempo
- `consumption-config.ts` - Configurações de consumo

## Melhorias Implementadas

### ✅ Eliminação de Duplicatas
- Removidas definições duplicadas de `Player`, `PlayerSkill`, `InventoryItem`
- Consolidados os sistemas de validação de ID
- Unificados os exports em barrel files

### ✅ Separação Clara de Responsabilidades
- **Recursos vs Criaturas**: IDs separados para evitar conflitos
- **Tipos Centralizados**: Um arquivo principal (`types.ts`) com re-exports organizados
- **Validação Modular**: Funções específicas para cada tipo de validação

### ✅ Sistema de IDs Limpo
- `RESOURCE_IDS`: Recursos coletáveis/craftáveis
- `CREATURE_IDS`: Criaturas do mundo (animais, monstros)
- `EQUIPMENT_IDS`: Ferramentas, armas, armaduras
- Auto-correção e migração de IDs legados

### 🔧 Padrão de Import Recomendado
```typescript
// ✅ Correto - Use sempre o barrel export
import { Player, Resource, isValidGameId } from '@shared/types';
import { RESOURCE_IDS, EQUIPMENT_IDS } from '@shared/constants/game-ids';

// ❌ Evitar - Imports diretos dos arquivos internos
import { Player } from '@shared/types/types';
```

## Compatibilidade

- ✅ Mantém compatibilidade com código existente
- ✅ Migração automática de IDs legados
- ✅ Validação robusta com mensagens de erro claras
- ✅ Performance otimizada com cache e validação lazy