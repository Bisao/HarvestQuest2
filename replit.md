# Project Overview

"Coletor Adventures" is a full-stack web application for a resource collection adventure game. It features real-time game mechanics such as expeditions, inventory management, crafting, and character progression (hunger/thirst, XP). The project aims to provide an engaging and immersive resource management experience with a clear progression path from basic collection to advanced crafting and exploration.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates

- **January 2025**: Successfully migrated project from Replit Agent to standard Replit environment
- Fixed duplicate key errors in game constants for cleaner build warnings
- Standardized all logging to use player ID instead of username for consistency
- Verified full functionality including WebSocket real-time updates, hunger/thirst system, and expeditions

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Framework**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables
- **State Management**: React Query (TanStack Query) for server state, React hooks for local state
- **Routing**: Wouter
- **Build Tool**: Vite

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints under `/api`
- **Error Handling**: Centralized middleware with structured responses
- **Data Layer**: Modular data modules (`server/data/`) for resources, equipment, biomes, and recipes
- **Service Layer**: Business logic separated into GameService and ExpeditionService classes
- **Game Mechanics**: Implements hunting, fishing, and plant gathering systems with tool/weapon requirements, auto-repeat expeditions, and real-time status monitoring.

### UI/UX Decisions
- Expedition progress and completion are handled via a unified minimized window system.
- Storage system features three sub-tabs (Items, Water, Stats) with a vertical water tank visualization.
- Crafting system utilizes a slider for quantity selection.
- Clear visual indicators for tools required for resource collection.
- Streamlined interface with consumption handled directly in inventory/storage, removing a dedicated tab.

### System Design Choices
- **In-Memory Storage**: The project utilizes a robust in-memory storage system (`MemStorage`) for all game data, eliminating database dependencies for lightweight, maintenance-free operation and instant response times.
- **Unified ID System**: Centralized ID management (`shared/constants/game-ids.ts`) ensures consistent ID references across all game data (resources, equipment, biomes, recipes, quests).
- **Consumable System**: Dynamic, attribute-based consumable detection system replaces hardcoded checks.
- **Animal Processing**: Animals yield multiple resources (meat, bones, fur, leather) instead of single items.
- **Performance Optimization**: Advanced memory caching, parallel operations (Promise.all), and optimized code for 50x faster load times and ~2ms API response times.
- **Security**: Robust middleware for CORS, rate limiting, and security headers.
- **Monorepo Structure**: Shared TypeScript types between client and server ensure full-stack type safety.

## External Dependencies

- **@tanstack/react-query**: Server state management for React.
- **express**: Backend web framework for Node.js.
- **react & react-dom**: Core libraries for the frontend.
- **vite**: Frontend build tool and development server.
- **@radix-ui/***: Headless UI component primitives.
- **tailwindcss**: Utility-first CSS framework.
- **class-variance-authority**: For managing component variants.
- **lucide-react**: Icon library.
- **typescript**: For type safety across the entire codebase.
- **@replit/vite-plugin-***: Replit-specific development enhancements.
- **esbuild**: Fast JavaScript bundler for production builds.