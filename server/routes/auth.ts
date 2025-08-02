
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import type { IStorage } from "../storage";

const router = express.Router();

// JWT Secret (em produção, use uma variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || "coletor-adventures-secret-key-2024";

// Schemas de validação
const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  isAdmin?: boolean;
}

export function createAuthRoutes(storage: IStorage) {
  // Registrar usuário
  router.post("/register", async (req, res) => {
    try {
      const { username, email, password } = registerSchema.parse(req.body);

      // Verificar se usuário já existe
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Usuário já existe" });
      }

      // Verificar se email já existe
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email já está em uso" });
      }

      // Hash da senha
      const passwordHash = await bcrypt.hash(password, 10);

      // Criar usuário
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const user: User = {
        id: userId,
        username,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
        isAdmin: false
      };

      await storage.createUser(user);

      // Gerar token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Retornar dados sem senha
      const { passwordHash: _, ...userResponse } = user;
      res.json({
        user: userResponse,
        token
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Login
  router.post("/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);

      // Buscar usuário
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Usuário ou senha inválidos" });
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Usuário ou senha inválidos" });
      }

      // Gerar token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Retornar dados sem senha
      const { passwordHash: _, ...userResponse } = user;
      res.json({
        user: userResponse,
        token
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Verificar token
  router.get("/verify", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token não fornecido" });
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      const user = await storage.getUserById(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: "Usuário não encontrado" });
      }

      const { passwordHash: _, ...userResponse } = user;
      res.json({ user: userResponse });

    } catch (error) {
      res.status(401).json({ error: "Token inválido" });
    }
  });

  return router;
}

export default router;
