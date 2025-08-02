import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { corsMiddleware, securityHeaders } from "./middleware/cors";
import { errorHandler, requestLogger } from "./middleware/error-handler";
import { rateLimit } from "./middleware/auth";

// Import consumption routes
import { createConsumptionRoutes } from "./routes/consumption";
import { ALL_MODERN_RECIPES } from "./data/recipes-modern";
import { GameService } from "./services/game-service";
import { validateRecipeIngredients, validateGameDataConsistency } from "@shared/utils/id-validation";

// Import routes
import { createAuthRoutes } from "./routes/auth";
import gameRoutes from "./routes/game";
import { createSaveRoutes } from "./routes/saves";
import { registerAdminRoutes } from "./routes/admin";

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
const recipes = ALL_MODERN_RECIPES;
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

// Rate limiting only for API routes (not for Vite assets)
app.use('/api', rateLimit(200, 60000)); // 200 requests per minute for API

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

  // UUID Enforcement System - moved imports to top level
  app.use((req, res, next) => {
    // Skip UUID enforcement for now to avoid blocking startup
    next();
  });

  // Register routes (remove duplicates)
  app.use("/api/auth", createAuthRoutes(storage));
  app.use("/api/game", gameRoutes);
  app.use("/api/saves", createSaveRoutes());
  registerRoutes(app);
  registerAdminRoutes(app);

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