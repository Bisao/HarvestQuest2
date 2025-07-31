# Project Summary

## Overview
"Coletor Adventures" is a full-stack web application for a resource collection adventure game. It features real-time game mechanics including expeditions, inventory management, crafting, and a quest system. The project's vision is to provide an engaging simulation of survival and resource management, offering players a dynamic and evolving gameplay experience focused on exploration and progression.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application is built with a modern TypeScript stack.
### Frontend Architecture
- **Framework**: React with TypeScript.
- **UI Framework**: shadcn/ui components built on Radix UI primitives.
- **Styling**: Tailwind CSS with CSS variables for theming.
- **State Management**: React Query (TanStack Query) for server state; React hooks for local state.
- **Routing**: Wouter for lightweight client-side routing.
- **Build Tool**: Vite for development and building.
- **UI/UX Decisions**: The interface emphasizes a streamlined, intuitive experience with unified minimized windows for expedition progress, dynamic display of item properties, and consistent visual styling across sub-tabs. Expeditions feature an auto-repeat option with real-time hunger/thirst monitoring. Storage includes a three-tab interface with a vertical water tank visualization.

### Backend Architecture
- **Runtime**: Node.js with Express framework.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful endpoints under `/api` prefix with Zod validation.
- **Error Handling**: Centralized error middleware with structured responses.
- **Data Layer**: Pure in-memory storage using a `MemStorage` class, eliminating database dependencies for high performance and simplified maintenance. Game data (resources, equipment, biomes, recipes, quests) is organized into separate TypeScript data modules.
- **Service Layer**: Business logic is separated into `GameService` and `ExpeditionService` classes.
- **Game Mechanics**: Implements hunting, fishing, and plant gathering systems with specific tool/weapon requirements, dynamic item consumption, and animal processing. Quests are structured for progressive skill development.

### Core System Design Choices
- **Unified ID System**: Centralized ID management (`shared/constants/game-ids.ts`) for consistent referencing across all game data.
- **Performance Optimization**: Achieved through in-memory storage, advanced caching with intelligent TTL management, and optimized Promise.all operations.
- **Security**: Robust middleware for authentication (UUID validation), rate limiting, CORS, and security headers, with Zod validation on all API routes.
- **Modular Architecture**: Backend restructured into modular components for maintainability and extensibility of game content.
- **Crafting System**: Features a slider for quantity selection, dynamic ingredient requirement updates, and player-configurable destination for crafted items (inventory vs. storage). All crafted items go to storage.
- **Inventory/Storage**: Comprehensive item management with weight restrictions, proper item classification (resources vs. equipment), and seamless transfer systems. Equipment items can only be equipped/unequipped, not withdrawn.
- **Expedition System**: Redesigned for a unified minimized window experience, real-time progress display, and automatic completion detection. Auto-repeat functionality with safety shutdowns based on player status.
- **Resource Management**: Implemented detailed animal processing (e.g., animals yield multiple resources), proper tool validation for collection (e.g., bucket for water), and dynamic XP display.

## External Dependencies
- **@neondatabase/serverless**: (Note: While previous logs mention PostgreSQL/Neon, the latest architecture described explicitly states a "Complete Database Removal" and "Pure In-Memory Storage." This dependency is listed in the original but contradicts the System Architecture description of an in-memory system. Assuming the in-memory system is current, this dependency may be vestigial or for future consideration).
- **drizzle-orm & drizzle-kit**: (Same note as above regarding database presence).
- **@tanstack/react-query**: Server state management.
- **express**: Backend web framework.
- **react & react-dom**: Frontend framework.
- **vite**: Build tool and development server.
- **@radix-ui/*** Headless UI component primitives.
- **tailwindcss**: Utility-first CSS framework.
- **class-variance-authority**: Component variant management.
- **lucide-react**: Icon library.
- **typescript**: Type safety across the stack.
- **@replit/vite-plugin-***: Replit-specific development enhancements.
- **esbuild**: Fast JavaScript bundler for production builds.