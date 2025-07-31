

# Coletor Adventures - PostgreSQL Database Setup

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=postgresql://username:password@hostname:port/database
NODE_ENV=development
PORT=5000
```

## Database Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate database migrations:**
   ```bash
   npm run db:generate
   ```

3. **Push schema to database:**
   ```bash
   npm run db:push
   ```

4. **Start the application:**
   ```bash
   npm run dev
   ```

The application will automatically initialize the database with all game data on first startup.

## Database Commands

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:push` - Push schema directly to database (development)
- `npm run db:migrate` - Run pending migrations (production)
- `npm run db:studio` - Open Drizzle Studio for database inspection

## Database Schema

The game uses the following main tables:

- **players** - Player profiles and stats
- **resources** - All collectible game resources
- **equipment** - Tools, weapons, and armor
- **biomes** - Explorable game areas
- **recipes** - Crafting formulas
- **inventory_items** - Player inventory contents
- **storage_items** - Player storage/warehouse contents
- **expeditions** - Active and completed expeditions
- **quests** - Available game quests
- **player_quests** - Player quest progress

All existing game functionality continues to work with database persistence, including:
- Resource collection and expeditions
- Inventory and storage management
- Crafting system
- Quest progression
- Player stats and equipment

