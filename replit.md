# Project Overview

This is a full-stack web application for a resource collection adventure game called "Coletor Adventures". The application uses a modern TypeScript stack with a React frontend and Express backend, featuring real-time game mechanics like expeditions, inventory management, and crafting systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**January 26, 2025**
- Successfully migrated project from Replit Agent to Replit environment
- **Fixed Auto-Repeat Expedition System** - Completely rebuilt timer management to prevent stuck countdown and properly restart after expedition completion
- **Energy System Completely Removed** - Removed all references to energy from codebase, now using only hunger and thirst
- Updated expedition requirements to use minimum 30 hunger and thirst instead of energy checks
- **Project Migration Completed** - All systems verified and fully functional
- **Enhanced Knife Detection System** - Fixed complete collection system to recognize knife as both tool and weapon
- **Improved Equipment Verification** - Enhanced hasRequiredTool() function to check both tool and weapon slots
- **Updated Expedition UI** - Frontend now shows both equipped tool and weapon status with knife detection
- **Fixed TypeScript Errors** - Resolved all LSP diagnostics for production-ready code
- **Fixed "Guardar Tudo" button** - Store all inventory items functionality working correctly
- **Animal Processing System Verified** - Coelho, Javali, Veado correctly generate Carne, Couro, Ossos, Pelo resources
- **Faca confirmed in Tools category** - Equipment properly categorized  
- **Inventory/Storage transfers working** - Items can be moved between inventory and storage seamlessly
- **Consumables system functional** - Food items can be consumed from both inventory and storage
- **Fixed Barbante as Material** - Moved from equipment to resources for proper crafting material categorization
- **Enhanced Crafting System** - Now properly handles both resources and equipment outputs, uses materials from storage
- Updated biome level requirements: Floresta (1), Deserto (20), Montanha (50), Oceano (75) 
- Reset player to start at level 1 with no items or resources for proper game progression
- Fixed all TypeScript and CSS errors for production-ready code
- Enhanced UI with custom animations and improved styling
- **Completely rebuilt expedition system from scratch** with new ExpeditionSystem component
- New streamlined expedition flow: setup → resource selection → confirmation → progress → completion
- Removed equipment selection from expeditions (equipment now managed through player inventory)
- **Created Minecraft-style inventory system** with dedicated equipment slots (helmet, chestplate, leggings, boots, weapon, tool)
- New 9x4 grid inventory layout similar to Minecraft with visual item management
- Added equipment slot system for better item organization and character progression
- Improved expedition UI with progress indicators, better visual feedback, and smoother user experience
- Added real-time expedition progress simulation with automatic completion detection
- **Enhanced crafting and equipment systems** - crafted items now go directly to storage for better item management
- **Implemented equipment selection modal** - clicking equipment slots opens modal with storage-filtered items by category
- Added unequip functionality - clicking equipped items removes them from slots
- Verified all game systems are fully functional: expeditions, inventory, storage, crafting

**January 26, 2025 - Database Migration and Main Menu System**
- **Added "Pedras Soltas" resource** - collectible without tools in all biomes
- **Added "Argila" (clay) resource** - collectible without tools in Floresta biome for crafting
- **Enhanced hunting system** - coelhos can be hunted with knife only, larger animals require weapon + knife
- **Implemented pickaxe bonus** - mining stone now also generates loose stones automatically
- **Added XP display** - all resources now show experience points gained per item collected
- **Added Faca (knife) equipment** - required for skinning hunted animals
- **Updated resource experience values** - balanced XP rewards across all resource types
- **Enhanced resource collection logic** - proper tool/weapon requirement checking with combined requirements
- **Updated UI displays** - expedition system and biome views now show XP information
- **Simplified rabbit hunting** - coelhos now require only knife (tool or weapon slot), not weapon + knife
- **MAJOR: Migrated to PostgreSQL Database** - complete transition from in-memory to persistent database storage
- **Created Main Menu System** - new game, continue game, and settings options with player profile management
- **Implemented Auto-Save Functionality** - all game progress automatically saved to database
- **Fixed Dynamic Player Loading** - game now properly handles different player usernames instead of hardcoded "Player1"
- **Enhanced Error Handling** - better loading states and error messages for player authentication
- **Removed Storage Configuration Panel** - simplified warehouse interface per user request

**January 26, 2025 - Modular Architecture Update**
- **Completely restructured backend into modular architecture** for better maintainability and content addition
- Created separate data modules for resources, equipment, biomes, and recipes in `server/data/` directory
- **Added hunting and fishing mechanics** to the Floresta biome with new animal resources: Coelho, Veado, Javali
- **Added fishing system** with new fish resources: Peixe Pequeno, Peixe Grande, Salmão
- **Added plant gathering** with Cogumelos and Frutas Silvestres as collectible resources
- **Created modular service layer** with GameService and ExpeditionService for business logic separation
- **Enhanced equipment system** with new weapons (Arco e Flecha, Lança) and tools (Vara de Pesca, Foice)
- **Improved API endpoints** using services for better error handling and data validation
- Added resource categorization endpoints for better UI organization (animals, fish, plants, basic, unique)
- Added biome details endpoint with categorized resource display
- Added equipment requirement checking for resource collection
- **Enhanced expedition system** with proper tool/weapon requirements for hunting and fishing
- All game data now properly organized and easily extensible for future content additions

**January 26, 2025 - Recipe Updates and Storage Management**
- **Completely overhauled crafting system** with new recipes per user specifications:
  - **NEW: Barbante** - 5 Fibras (basic crafting material)
  - **Machado** - 1 Pedra Solta + 2 Barbantes + 1 Graveto
  - **Picareta** - 2 Pedras Soltas + 2 Barbantes + 1 Graveto  
  - **Foice** - 1 Pedra + 2 Barbantes + 1 Graveto
  - **Balde de Madeira** - 1 Madeira + 2 Barbantes (requer machado ou faca)
  - **Arco e Flecha** - 2 Gravetos + 2 Barbantes + 1 Pedra Solta
  - **Lança** - 2 Gravetos + 4 Barbantes + 1 Pedra Solta
  - **Faca** - 1 Pedra Solta + 1 Barbante + 1 Graveto
- **Added new resources**: Argila, Ferro Fundido, Couro for advanced crafting
- **Enhanced equipment system** with new items:
  - **Mochila** - 2 Couros + 4 Barbantes (aumenta inventário)
  - **Isca para Pesca** - 1 Fibra + 1 Fruta Silvestre
  - **Corda** - 2 Couros (requer machado ou faca)
  - **Panela de Barro** - 10 Argilas
  - **Panela** - 2 Ferro Fundido
  - **Garrafa de Bambu** - 2 Bambus (requer machado ou faca)
- **Updated food recipes**:
  - **Suco de Frutas** - 1 Água Fresca + 1 Garrafa de Bambu (não consome garrafa)
  - **Cogumelos Assados** - 3 Cogumelos + 1 Graveto
  - **Peixe Grelhado** - 1 Carne + 1 Graveto
  - **Carne Assada** - 1 Carne + 1 Graveto
  - **Ensopado de Carne** - 1 Panela de Barro + 2 Carnes + 3 Águas (não consome panela)
- **Enhanced storage system configuration**: Added player preference for crafted items destination
- **Created player settings interface** with storage management options:
  - Auto-storage toggle for expedition rewards
  - Crafted items destination choice (inventory vs storage)
- **Updated crafting system** to respect player's preferred destination for crafted items
- Added settings button to game header for easy access to player preferences
- Improved API with player settings endpoint for real-time configuration updates
- **Fixed inventory TypeScript errors** - resolved issues with mixed resource/equipment types causing crashes
- **Enhanced type safety** in inventory component with proper type checking for resources vs equipment

**January 26, 2025 - Animal Processing System Implementation**
- **Implemented comprehensive animal processing system** - animals now yield multiple resources instead of single items
- **Added new basic resources for animal processing**:
  - **Carne** 🥩 - meat from all animals and fish (weight: 2, value: 12, XP: 4)
  - **Ossos** 🦴 - bones from animals and fish (weight: 1, value: 5, XP: 2)  
  - **Pelo** 🧶 - fur from land animals (weight: 1, value: 3, XP: 1)
  - **Couro** 🦫 - leather from land animals (weight: 2, value: 8, XP: 3)
- **Updated expedition system** with automatic animal processing logic:
  - **Coelho**: 1 Carne + 1 Couro + 2 Ossos + 2 Pelos
  - **Veado**: 3 Carnes + 2 Couros + 4 Ossos + 1 Pelo
  - **Javali**: 4 Carnes + 3 Couros + 6 Ossos + 1 Pelo
  - **Peixe Pequeno**: 1 Carne + 1 Osso
  - **Peixe Grande**: 2 Carnes + 2 Ossos
  - **Salmão**: 3 Carnes + 2 Ossos
- **Updated food recipes** to use processed "Carne" instead of whole animals
- **Enhanced expedition service** with intelligent resource processing for better gameplay mechanics
- **Improved resource economy** with multiple uses for animal-derived materials in crafting and cooking

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React Query (TanStack Query) for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for development and building

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints under `/api` prefix
- **Error Handling**: Centralized error middleware with structured responses
- **Development Tools**: Hot reloading with Vite integration
- **Modular Data Layer**: Separate data modules in `server/data/` for resources, equipment, biomes, and recipes
- **Service Layer**: Business logic separated into GameService and ExpeditionService classes
- **Game Mechanics**: Hunting, fishing, and plant gathering systems with tool/weapon requirements

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema generation
- **Connection**: Neon serverless driver for PostgreSQL

## Key Components

### Game Data Models
- **Players**: User profiles with level, experience, hunger, thirst, and inventory limits
- **Resources**: Collectible items with weight, value, and rarity properties (basic, animals, fish, plants, unique)
- **Biomes**: Explorable areas with level requirements and categorized available resources
- **Inventory/Storage**: Player item management with weight restrictions and easy transfer systems
- **Expeditions**: Time-based resource gathering missions with tool/weapon requirements
- **Equipment**: Tools, weapons, and armor that enhance gameplay (hunting, fishing, mining, protection)
- **Recipes**: Crafting formulas for creating tools, weapons, and consumables

### Frontend Components
- **Game Header**: Displays player stats (level, hunger, thirst, coins)
- **Tab System**: Biomes, Inventory, Storage, and Crafting interfaces
- **Expedition Modal**: Multi-step expedition planning and execution
- **Resource Management**: Inventory and storage item manipulation
- **Crafting Interface**: Recipe browsing and item creation

### API Endpoints
- Player management (`/api/player/:username`)
- Resource and biome data (`/api/resources`, `/api/biomes`, `/api/resources/category/:category`)
- Enhanced biome details (`/api/biomes/:id/details`)
- Inventory operations (`/api/inventory/:playerId`)
- Storage management with services (`/api/storage/*`)
- Expedition system with services (`/api/expeditions`, `/api/expeditions/:id/complete`)
- Equipment and crafting (`/api/equipment`, `/api/recipes`)
- Player abilities (`/api/player/:playerId/can-collect/:resourceId`)
- Active expedition tracking (`/api/player/:playerId/active-expedition`)

## Data Flow

1. **Client Initialization**: React app loads and queries player data
2. **Game State**: React Query manages server state caching and synchronization
3. **User Actions**: UI interactions trigger API calls through React Query mutations
4. **Server Processing**: Express routes handle business logic and database operations
5. **Database Updates**: Drizzle ORM executes type-safe database queries
6. **State Synchronization**: React Query automatically refetches related data after mutations

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm & drizzle-kit**: Database ORM and migration tools
- **@tanstack/react-query**: Server state management
- **express**: Backend web framework
- **react & react-dom**: Frontend framework
- **vite**: Build tool and development server

### UI Dependencies
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **typescript**: Type safety across the stack
- **@replit/vite-plugin-***: Replit-specific development enhancements
- **esbuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with hot module replacement
- **Backend**: tsx for TypeScript execution with auto-restart
- **Database**: Drizzle Kit for schema management and migrations

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Serving**: Express serves both API routes and static frontend assets
- **Database**: Environment variable `DATABASE_URL` for connection configuration

### Key Build Commands
- `npm run dev`: Start development servers
- `npm run build`: Build both frontend and backend for production
- `npm run start`: Run production server
- `npm run db:push`: Apply database schema changes

The application follows a monorepo structure with shared TypeScript types between client and server, ensuring type safety across the full stack. The game mechanics are designed around hunger and thirst-based expedition systems with inventory management and crafting progression.