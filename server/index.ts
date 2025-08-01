import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { corsMiddleware, securityHeaders } from "./middleware/cors";
import { errorHandler, requestLogger } from "./middleware/error-handler";
import { rateLimit } from "./middleware/auth";

// Import consumption routes
import { createConsumptionRoutes } from "./routes/consumption";
import { createModernRecipeData } from "./data/recipes-modern";
import { GameService } from "./services/game-service";
import { validateRecipeIngredients, validateGameDataConsistency } from "@shared/utils/id-validation";

const app = express();
const port = Number(process.env.PORT) || 5000;

// Validate game data consistency on startup
console.log("🔍 Validating game data consistency...");
const consistencyCheck = validateGameDataConsistency();
if (!consistencyCheck.isValid) {
  console.error("❌ Game data consistency errors:", consistencyCheck.errors);
  process.exit(1);
}

// Validate recipe ingredients
const recipes = createModernRecipeData();
const recipeValidation = validateRecipeIngredients(recipes);
if (!recipeValidation.isValid) {
  console.error("❌ Recipe validation errors:");
  recipeValidation.errors.forEach(error => console.error(`  - ${error}`));
  console.error("❌ Invalid IDs found:", recipeValidation.invalidIds);
  process.exit(1);
}

console.log("✅ All game data validation passed!");

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Security and CORS
app.use(corsMiddleware);
app.use(securityHeaders);

// Request parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting for API routes
app.use('/api', rateLimit(100, 60000)); // 100 requests per minute

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Initialize services
  const { storage } = await import("./storage");
  const { HungerThirstService } = await import('./services/hunger-thirst-service');
  const { AutoConsumeService } = await import('./services/auto-consume-service');
  // Create services
  const gameService = new GameService(storage);
  const hungerThirstService = new HungerThirstService(storage);
  const autoConsumeService = new AutoConsumeService(storage);

  // Start degradation system
  hungerThirstService.startPassiveDegradation();

  // Start auto consume system
  autoConsumeService.startAutoConsume();

  // Use the centralized error handler
  app.use(errorHandler);

  // UUID Enforcement System
  import { 
    uuidEnforcementMiddleware, 
    validateServerStartupUUIDs,
    uuidStatsMiddleware 
  } from './middleware/uuid-enforcement-middleware';

  // Validate UUIDs on server startup
  app.use(validateServerStartupUUIDs());

  // Apply UUID enforcement to all requests
  app.use(uuidEnforcementMiddleware({
    enforceMode: 'convert',
    logViolations: true,
    rejectInvalid: false
  }));

  // Optional: UUID statistics logging
  if (process.env.NODE_ENV === 'development') {
    app.use(uuidStatsMiddleware);
  }

  // Routes
  import gameRoutes from './routes/game';
  import healthRoutes from './routes/health';
  import adminRoutes from './routes/admin';
  import savesRoutes from './routes/saves';
  import workshopRoutes from './routes/workshop';
  import storageRoutes from './routes/storage';
  import consumptionRoutes from './routes/consumption';
  import questRoutes from './routes/quest';
  
  const limiter = rateLimit(100, 60000);

  // Apply the rate limiting middleware to all requests
  app.use(limiter);

  // Routes
  app.use('/api', gameRoutes);
  app.use('/api/health', healthRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/saves', savesRoutes);
  app.use('/api/workshops', workshopRoutes);
  app.use('/api/storage', storageRoutes);
  app.use('/api/consumption', consumptionRoutes);
  app.use('/api/quests', questRoutes);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();