# Project Overview

This is a full-stack web application for a resource collection adventure game called "Coletor Adventures". The application uses a modern TypeScript stack with a React frontend and Express backend, featuring real-time game mechanics like expeditions, inventory management, and crafting systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**January 26, 2025**
- Successfully migrated project from Replit Agent to Replit environment
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

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema generation
- **Connection**: Neon serverless driver for PostgreSQL

## Key Components

### Game Data Models
- **Players**: User profiles with level, experience, energy, and inventory limits
- **Resources**: Collectible items with weight, value, and rarity properties
- **Biomes**: Explorable areas with level requirements and available resources
- **Inventory/Storage**: Player item management with weight restrictions
- **Expeditions**: Time-based resource gathering missions
- **Equipment**: Tools that enhance expedition effectiveness
- **Recipes**: Crafting formulas for creating new items

### Frontend Components
- **Game Header**: Displays player stats (level, energy, coins)
- **Tab System**: Biomes, Inventory, Storage, and Crafting interfaces
- **Expedition Modal**: Multi-step expedition planning and execution
- **Resource Management**: Inventory and storage item manipulation
- **Crafting Interface**: Recipe browsing and item creation

### API Endpoints
- Player management (`/api/player/:username`)
- Resource and biome data (`/api/resources`, `/api/biomes`)
- Inventory operations (`/api/inventory/:playerId`)
- Storage management (`/api/storage/*`)
- Expedition system (`/api/expeditions`)
- Equipment and crafting (`/api/equipment`, `/api/recipes`)

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

The application follows a monorepo structure with shared TypeScript types between client and server, ensuring type safety across the full stack. The game mechanics are designed around energy-based expedition systems with inventory management and crafting progression.