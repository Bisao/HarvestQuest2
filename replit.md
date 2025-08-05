# Overview

Coletor Adventures is a web-based survival/adventure game built with modern web technologies. The application features a complex game system with players, inventory management, expeditions, quests, skills, and a time-based progression system. Players can explore different biomes, collect resources, craft equipment, and complete quests while managing survival stats like hunger, thirst, and health.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (Updated: 05/08/2025)

## ✅ Major Cleanup & Consolidation Completed
- **Shared Directory**: Complete reorganization and cleanup of duplicate types and utilities
- **ID System**: Clear separation between RESOURCE_IDS (collectibles) and CREATURE_IDS (living entities)
- **Type Safety**: Consolidated all core types into shared/types.ts as single source of truth
- **Performance**: Eliminated duplicate exports and optimized barrel files
- **Documentation**: Created comprehensive README and cleanup reports

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and building
- **UI Components**: Shadcn/UI component library with Radix UI primitives for accessible, modern interfaces
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe forms

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules for modern JavaScript features
- **Data Storage**: File-based JSON storage system (data.json) with plans for database migration
- **API Design**: RESTful APIs with comprehensive validation using Zod schemas
- **Error Handling**: Centralized error handling with custom error classes and proper HTTP status codes
- **Authentication**: Session-based authentication with JWT support infrastructure
- **Caching**: In-memory caching system for performance optimization

## Data Management
- **Storage Pattern**: Repository pattern with IStorage interface for future database abstraction
- **ID System**: UUID-based identification system for all game entities with validation enforcement
- **Validation**: Comprehensive data validation using Zod schemas on both client and server
- **Type Safety**: Shared TypeScript types between frontend and backend in `/shared` directory

## Game Systems Architecture
- **Service Layer**: Modular services for different game aspects (GameService, QuestService, ExpeditionService, etc.)
- **Time System**: Configurable game time with multiple speed settings and day/night cycles
- **Equipment System**: Slot-based equipment with effects and bonuses
- **Skill System**: Experience-based progression with skill trees and achievements
- **Quest System**: Dynamic quest tracking with automatic completion options
- **Combat System**: Turn-based combat encounters with animals and creatures

## Performance Optimizations
- **Caching Strategy**: Multi-layer caching with different TTL values for various data types
- **Async Operations**: Parallelized database operations and batched requests
- **Memory Management**: Cleanup routines and garbage collection optimization
- **Database Indexes**: Strategic indexing for frequently queried data

## Code Organization
- **Monorepo Structure**: Client, server, and shared code in organized directories
- **Module Pattern**: Feature-based organization with barrel exports
- **Middleware**: Layered middleware for validation, authentication, and error handling
- **Route Organization**: Feature-based routing with proper separation of concerns
- **Scripts Architecture**: Consolidated utility scripts with modular core functions for maintenance and migration

# External Dependencies

## Frontend Dependencies
- **React Ecosystem**: React 18 with modern hooks, React DOM, and development tools
- **UI Framework**: Radix UI components for accessibility and Shadcn/UI for design system
- **Animation**: Framer Motion for smooth animations and transitions
- **Development**: Vite with plugins for runtime error handling and development experience
- **Utilities**: Class variance authority for component variants, CLSX for conditional classes

## Backend Dependencies
- **Core Framework**: Express.js with TypeScript support and session management
- **Validation**: Zod for runtime type checking and schema validation
- **Development Tools**: TSX for TypeScript execution, ESBuild for production builds
- **Utilities**: Date-fns for date manipulation, UUID generation for unique identifiers

## Build and Development Tools
- **TypeScript**: Strict type checking with modern ES features and path mapping
- **Build System**: Vite for frontend builds, ESBuild for backend bundling
- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer
- **Package Management**: NPM with lockfile for consistent dependencies

## Planned Integrations
- **Database**: Drizzle ORM ready for PostgreSQL integration when scaling beyond file storage
- **Authentication**: JWT infrastructure prepared for user authentication system
- **Monitoring**: Health check endpoints and performance monitoring ready for production deployment