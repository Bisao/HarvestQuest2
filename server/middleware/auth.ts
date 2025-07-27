import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

// Simple session-based auth for now
// In production, this should use proper JWT or database sessions
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
      };
    }
  }
}

// Validation schemas
export const playerIdSchema = z.string().uuid().describe("Player ID must be a valid UUID");
export const usernameSchema = z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).describe("Username must be 3-20 characters, alphanumeric and underscores only");

// Middleware to validate player access
export function validatePlayerAccess(req: Request, res: Response, next: NextFunction) {
  try {
    const { playerId } = req.params;
    
    // Validate UUID format
    const validatedId = playerIdSchema.parse(playerId);
    
    // For now, we'll allow access if the ID is valid
    // In production, this should check against authenticated user
    req.user = {
      id: validatedId,
      username: `Player_${validatedId.slice(0, 8)}`
    };
    
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid player ID",
        details: error.errors
      });
    }
    res.status(400).json({ error: "Invalid request" });
  }
}

// Middleware to validate username
export function validateUsername(req: Request, res: Response, next: NextFunction) {
  try {
    const { username } = req.params;
    usernameSchema.parse(username);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid username format",
        details: error.errors
      });
    }
    res.status(400).json({ error: "Invalid request" });
  }
}

// Rate limiting (simple in-memory implementation)
const rateLimits = new Map<string, number[]>();

export function rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    if (!rateLimits.has(clientId)) {
      rateLimits.set(clientId, []);
    }
    
    const requests = rateLimits.get(clientId)!;
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        error: "Too many requests",
        retryAfter: windowMs
      });
    }
    
    validRequests.push(now);
    rateLimits.set(clientId, validRequests);
    
    next();
  };
}