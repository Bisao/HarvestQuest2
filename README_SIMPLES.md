# 🎮 Coletor Adventures - Guia Simples

## 📁 ESTRUTURA DO PROJETO (SUPER SIMPLES)

```
🎮 JOGO/
├── 🖥️ FRONTEND (client/src/)
│   ├── 📄 pages/
│   │   └── game.tsx ← PÁGINA PRINCIPAL DO JOGO
│   └── 🧩 components/game/
│       ├── core/ ← COMPONENTES BÁSICOS
│       │   ├── game-header.tsx ← CABEÇALHO DO JOGO
│       │   ├── player-settings.tsx ← CONFIGURAÇÕES DO JOGADOR
│       │   └── equipment-selector-modal.tsx ← SELETOR DE EQUIPAMENTOS
│       ├── tabs/ ← ABAS DO JOGO
│       │   ├── biomes-tab.tsx ← ABA DOS BIOMAS
│       │   ├── inventory-tab.tsx ← ABA DO INVENTÁRIO
│       │   ├── storage-tab.tsx ← ABA DO ARMAZÉM
│       │   └── crafting-tab.tsx ← ABA DE CRAFTING
│       └── systems/ ← SISTEMAS DO JOGO
│           ├── expedition-system.tsx ← SISTEMA DE EXPEDIÇÕES
│           └── expedition-modal.tsx ← MODAL DE EXPEDIÇÕES
│
├── 🔧 BACKEND (server/)
│   ├── index.ts ← SERVIDOR PRINCIPAL
│   ├── routes.ts ← ROTAS DA API
│   ├── storage.ts ← SISTEMA DE ARMAZENAMENTO
│   ├── data/ ← DADOS DO JOGO
│   │   ├── resources.ts ← RECURSOS (MADEIRA, PEDRA, ETC)
│   │   ├── equipment.ts ← EQUIPAMENTOS (FERRAMENTAS, ARMAS)
│   │   ├── biomes.ts ← BIOMAS (FLORESTA, DESERTO, ETC)
│   │   └── recipes.ts ← RECEITAS DE CRAFTING
│   └── services/ ← SERVIÇOS DO JOGO
│       ├── game-service.ts ← LÓGICA PRINCIPAL
│       └── expedition-service.ts ← LÓGICA DE EXPEDIÇÕES
│
└── 🔗 SHARED (shared/)
    └── schema.ts ← TIPOS E ESQUEMAS COMPARTILHADOS
```

## 🎯 COMO O JOGO FUNCIONA

### 1. 🏠 TELA PRINCIPAL (game.tsx)
- Mostra estatísticas do jogador (fome, sede, nível)
- Tem 4 abas: Biomas, Inventário, Armazém, Crafting

### 2. 🌍 BIOMAS (biomes-tab.tsx)
- Jogador escolhe onde explorar
- Cada bioma tem recursos diferentes
- Requer nível mínimo para acessar

### 3. 🚶‍♂️ EXPEDIÇÕES (expedition-system.tsx)
- Jogador vai coletar recursos
- Leva tempo para completar
- Consome fome e sede
- Retorna com recursos coletados

### 4. 🎒 INVENTÁRIO (inventory-tab.tsx)
- Mostra itens que o jogador carrega
- Sistema tipo Minecraft com slots
- Pode equipar ferramentas e armaduras

### 5. 🏪 ARMAZÉM (storage-tab.tsx)
- Armazena itens infinitamente
- Pode mover itens do inventário para cá
- Organizado por categorias

### 6. 🔨 CRAFTING (crafting-tab.tsx)
- Combina recursos para criar itens
- Sistema evolutivo (Básico → Ferro → Avançado)
- Requer nível mínimo para algumas receitas

## 🔧 COMO MEXER NO CÓDIGO

### Para adicionar novo recurso:
1. Vá em `server/data/resources.ts`
2. Adicione o novo recurso na lista
3. Defina nome, emoji, peso, valor

### Para adicionar nova receita:
1. Vá em `server/data/recipes.ts`
2. Adicione a receita com ingredientes e resultado
3. Defina nível mínimo necessário

### Para mexer na interface:
1. Cada aba está em `client/src/components/game/tabs/`
2. Cada arquivo é uma aba diferente
3. Mudanças aparecem automaticamente no navegador

## 🚀 COMO EXECUTAR

```bash
npm run dev  # Inicia o jogo
```

Abre no navegador: http://localhost:5000

## 📝 REGRAS SIMPLES

- **Fome e sede** diminuem durante expedições
- **Inventário** tem limite de peso
- **Expedições** precisam de ferramentas para alguns recursos
- **Crafting** precisa de materiais no armazém
- **Nível** aumenta coletando recursos

É isso! Super simples! 🎉