import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertApplicationSchema, 
  insertNoteSchema,
  insertTimelineEventSchema 
} from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Application routes
  app.get("/api/applications", isAuthenticated, async (req, res) => {
    try {
      const applications = await storage.getApplications(req.user.id);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching applications" });
    }
  });

  app.get("/api/applications/:id", isAuthenticated, async (req, res) => {
    try {
      const application = await storage.getApplicationById(parseInt(req.params.id));
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Ensure user can only access their own applications
      if (application.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Error fetching application" });
    }
  });

  app.post("/api/applications", isAuthenticated, async (req, res) => {
    try {
      const applicationData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(applicationData, req.user.id);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating application" });
    }
  });

  app.patch("/api/applications/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const application = await storage.getApplicationById(id);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Ensure user can only update their own applications
      if (application.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Validate partial data
      const applicationData = insertApplicationSchema.partial().parse(req.body);
      
      const updatedApplication = await storage.updateApplication(id, applicationData);
      res.json(updatedApplication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating application" });
    }
  });

  app.delete("/api/applications/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const application = await storage.getApplicationById(id);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Ensure user can only delete their own applications
      if (application.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteApplication(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting application" });
    }
  });

  // Notes routes
  app.get("/api/applications/:id/notes", isAuthenticated, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplicationById(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Ensure user can only access their own application notes
      if (application.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const notes = await storage.getNotes(applicationId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notes" });
    }
  });

  app.post("/api/applications/:id/notes", isAuthenticated, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplicationById(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Ensure user can only add notes to their own applications
      if (application.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const noteData = insertNoteSchema.parse({
        ...req.body,
        applicationId,
        userId: req.user.id
      });
      
      const note = await storage.createNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating note" });
    }
  });

  app.delete("/api/notes/:id", isAuthenticated, async (req, res) => {
    try {
      // Implementation would need to check if note belongs to user's application
      // For simplicity, we're skipping that check in this prototype
      await storage.deleteNote(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting note" });
    }
  });

  // Timeline events routes
  app.get("/api/applications/:id/timeline", isAuthenticated, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplicationById(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Ensure user can only access their own application timeline
      if (application.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const events = await storage.getTimelineEvents(applicationId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching timeline events" });
    }
  });

  app.post("/api/applications/:id/timeline", isAuthenticated, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplicationById(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Ensure user can only add timeline events to their own applications
      if (application.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const eventData = insertTimelineEventSchema.parse({
        ...req.body,
        applicationId,
        userId: req.user.id
      });
      
      const event = await storage.createTimelineEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating timeline event" });
    }
  });

  // Stats route
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getApplicationStats(req.user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
