# 🧹 PLANO DE LIMPEZA E ORGANIZAÇÃO MODULAR

## ❌ ARQUIVOS DUPLICADOS PARA REMOVER
- expedition-system-old.tsx ❌ (antigo, não usado)
- expedition-system.tsx ❌ (conflito com simple)
- distance-expedition-system.tsx ❌ (não usado atualmente)
- crafting-tab.tsx ❌ (antigo, substituído por evolutionary)
- enhanced-crafting-tab.tsx ❌ (antigo)
- evolutionary-crafting-tab.tsx ❌ (antigo)
- enhanced-inventory.tsx ❌ (conflito com minecraft-inventory)
- inventory-tab.tsx ❌ (antigo)

## ✅ ARQUIVOS LIMPOS PARA MANTER
- simple-expedition-system.tsx ✅ (sistema atual de expedições)
- evolutionary-crafting-system.tsx ✅ (sistema de crafting atual)
- minecraft-inventory.tsx ✅ (inventário atual)
- game-header.tsx ✅
- biomes-tab.tsx ✅
- storage-tab.tsx ✅
- equipment-selector-modal.tsx ✅
- player-settings.tsx ✅

## 🎯 ESTRUTURA MODULAR FINAL
```
components/
├── game/
│   ├── core/           # Componentes essenciais
│   │   ├── game-header.tsx
│   │   ├── player-settings.tsx
│   │   └── equipment-selector-modal.tsx
│   ├── tabs/           # Abas do jogo
│   │   ├── biomes-tab.tsx
│   │   ├── inventory-tab.tsx (minecraft-inventory.tsx)
│   │   ├── storage-tab.tsx
│   │   └── crafting-tab.tsx (evolutionary-crafting-system.tsx)
│   └── systems/        # Sistemas de jogo
│       └── expedition-system.tsx (simple-expedition-system.tsx)
```

## 📝 PRÓXIMOS PASSOS
1. Remover arquivos duplicados ❌
2. Reorganizar em estrutura modular 📁
3. Verificar imports e corrigir referências 🔧
4. Testar funcionamento 🧪
5. Atualizar replit.md 📝