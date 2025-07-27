# Coletor Adventures - API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

## Authentication
Currently using simple player ID validation. In production, implement proper JWT or session-based authentication.

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { /* optional error details */ }
}
```

## Error Codes
- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Resource not found
- `INSUFFICIENT_RESOURCES` - Not enough resources
- `INVALID_OPERATION` - Operation not allowed
- `DATABASE_ERROR` - Database operation failed
- `INTERNAL_ERROR` - Unexpected server error

## Rate Limiting
- API routes: 100 requests per minute per IP
- Returns 429 status when limit exceeded

## Endpoints

### Health & Monitoring

#### GET /health
System health check
```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T...",
  "version": "1.0.0",
  "environment": "development",
  "uptime": 3600,
  "memory": { "used": 45.2, "total": 128.0, "rss": 67.8 },
  "cache": { "totalItems": 15, "activeItems": 12, "expiredItems": 3, "hitRate": 85.3 },
  "database": "connected"
}
```

#### GET /api/status
API status
```json
{
  "api": "Coletor Adventures API",
  "status": "operational",
  "version": "1.0.0",
  "timestamp": "2025-01-27T..."
}
```

### Enhanced Player Routes (v2)

#### GET /api/v2/player/:username
Get player by username
- **Parameters**: `username` (string, 3-20 chars, alphanumeric + underscore)
- **Response**: Player object with caching

#### PATCH /api/v2/player/:playerId/settings
Update player settings
- **Parameters**: `playerId` (UUID)
- **Body**:
```json
{
  "autoStorage": true,
  "craftedItemsDestination": "storage"
}
```

### Enhanced Resource Routes (v2)

#### GET /api/v2/resources
Get all resources with filtering
- **Query Parameters**:
  - `type`: "basic" | "unique"
  - `rarity`: "common" | "uncommon" | "rare"
  - `category`: string
- **Response**: Filtered resources array with caching

### Enhanced Crafting (v2)

#### POST /api/v2/craft
Craft items with full validation
- **Body**:
```json
{
  "playerId": "uuid",
  "recipeId": "uuid",
  "quantity": 1
}
```
- **Validation**:
  - Player level requirement
  - Ingredient availability
  - Inventory capacity (if destination is inventory)
- **Response**:
```json
{
  "success": true,
  "data": {
    "recipe": "Item Name",
    "quantity": 1,
    "items": [{"itemId": "uuid", "quantity": 1}],
    "destination": "storage"
  },
  "message": "Successfully crafted 1x Item Name"
}
```

### Enhanced Expeditions (v2)

#### POST /api/v2/expeditions
Start expedition with validation
- **Body**:
```json
{
  "playerId": "uuid",
  "biomeId": "uuid",
  "selectedResources": ["uuid1", "uuid2"],
  "selectedEquipment": ["uuid1"]
}
```
- **Validation**:
  - Hunger/thirst >= 30
  - Level requirement for biome
  - No active expedition
- **Response**: Expedition object

### Enhanced Consumption (v2)

#### POST /api/v2/player/:playerId/consume
Consume items with validation
- **Parameters**: `playerId` (UUID)
- **Body**:
```json
{
  "itemId": "uuid",
  "quantity": 1
}
```
- **Validation**:
  - Item availability
  - Item is consumable
- **Response**:
```json
{
  "success": true,
  "data": {
    "consumed": 1,
    "item": "Item Name",
    "effects": {
      "hunger": 85,
      "thirst": 90
    }
  }
}
```

### Legacy Routes (v1)
All existing routes remain available for backward compatibility:
- `/api/player/:username`
- `/api/resources`
- `/api/biomes`
- `/api/equipment`
- `/api/recipes`
- `/api/craft`
- `/api/expeditions`
- etc.

### Development Routes
Available only in development mode:

#### GET /api/admin/stats
System statistics

#### POST /api/admin/player/:playerId/reset
Reset player data

#### GET /api/admin/db/health
Database health check

#### DELETE /api/admin/cache/clear
Clear cache

## Rate Limits
- API routes: 100 requests/minute
- Admin routes: 20 requests/minute

## Caching Strategy
- Static data (resources, biomes, equipment): 15 minutes
- Player data: 2 minutes
- Inventory/storage: 1 minute
- Active expeditions: 30 seconds

## Security Features
- CORS protection
- Request size limits (1MB)
- Security headers
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

## Performance Optimizations
- Memory caching for frequently accessed data
- Optimized database queries
- Response compression
- Cache invalidation strategies

## Error Handling
- Centralized error middleware
- Structured error responses
- Request logging
- Error code standardization