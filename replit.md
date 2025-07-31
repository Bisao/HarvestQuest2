# Project Overview

"Coletor Adventures" is a full-stack web application designed as a resource collection adventure game. It features real-time game mechanics including expeditions, inventory management, crafting, and character progression centered around hunger and thirst. The game aims to provide an engaging experience with resource gathering, processing, and item creation within various biomes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript.
- **UI Framework**: shadcn/ui built on Radix UI primitives.
- **Styling**: Tailwind CSS with CSS variables.
- **State Management**: React Query for server state, React hooks for local state.
- **Routing**: Wouter for lightweight client-side routing.
- **Build Tool**: Vite for development and building.
- **UI/UX Decisions**: Redesigned expedition interface for unified minimized window system, enhanced inventory with sub-tabs, and implemented dynamic visual feedback for game states like auto-repeat and water levels.

### Backend Architecture
- **Runtime**: Node.js with Express framework.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful endpoints.
- **Error Handling**: Centralized error middleware.
- **Data Layer**: Pure in-memory storage (MemStorage class) for all game data, replacing traditional databases for maintenance-free operation and performance. Game data (resources, equipment, biomes, recipes, quests) is organized in separate data modules.
- **Service Layer**: Business logic separated into `GameService` and `ExpeditionService` classes.
- **Game Mechanics**: Includes hunting, fishing, and plant gathering systems with specific tool/weapon requirements, animal processing, and a dynamic crafting system.
- **Security**: Robust security measures including UUID validation, rate limiting, CORS, security headers, and Zod validation for all routes.

### System Design Choices
- **Real-time Synchronization**: Focus on instant UI updates and system synchronization across all game mechanics (consumption, inventory transfers, crafting, expeditions).
- **Performance Optimization**: In-memory storage provides extremely fast response times (0-2ms API calls) and advanced caching system for performance improvements.
- **Modular Architecture**: Backend restructured into modular components for maintainability and extensibility of game content.
- **UUID System**: Centralized and consistent UUID management for all game data (resources, equipment, biomes, recipes, quests) ensuring reliable cross-system referencing.
- **Streamlined Workflow**: Automated expedition repetition with real-time status monitoring and safety shutdowns based on player hunger/thirst.
- **User Interface**: Emphasis on intuitive design with features like auto-minimize modals, expandable progress windows, and clear visual indicators.
- **Item Management**: Automated transfer of crafted items to storage, and clear rules for equipment handling (equip/unequip only).
- **Game Progression**: Hunger/thirst mechanics for expeditions, balanced resource and XP rewards, and a progressive quest system.

## External Dependencies

- **@tanstack/react-query**: Server state management for the frontend.
- **express**: Core backend web framework for Node.js.
- **react & react-dom**: Primary libraries for building the user interface.
- **vite**: Frontend build tool and development server.
- **@radix-ui/***: Headless UI component primitives used for UI building blocks.
- **tailwindcss**: Utility-first CSS framework for styling.
- **class-variance-authority**: Utility for managing component variants in React.
- **lucide-react**: Icon library for UI elements.
- **typescript**: Programming language providing type safety across the full stack.
- **@replit/vite-plugin-***: Replit-specific development enhancements for Vite.
- **esbuild**: Fast JavaScript bundler used for production builds.
- **wouter**: Lightweight client-side routing library.
- **zod**: Schema validation library used for input validation on API routes.