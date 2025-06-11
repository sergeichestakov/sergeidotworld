import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLocationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all locations
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Get current location
  app.get("/api/locations/current", async (req, res) => {
    try {
      const currentLocation = await storage.getCurrentLocation();
      if (!currentLocation) {
        return res.status(404).json({ message: "Current location not found" });
      }
      res.json(currentLocation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch current location" });
    }
  });

  // Get home location
  app.get("/api/locations/home", async (req, res) => {
    try {
      const homeLocation = await storage.getHomeLocation();
      if (!homeLocation) {
        return res.status(404).json({ message: "Home location not found" });
      }
      res.json(homeLocation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch home location" });
    }
  });

  // Get visited locations
  app.get("/api/locations/visited", async (req, res) => {
    try {
      const visitedLocations = await storage.getVisitedLocations();
      res.json(visitedLocations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visited locations" });
    }
  });

  // Create new location
  app.post("/api/locations", async (req, res) => {
    try {
      const validatedData = insertLocationSchema.parse(req.body);
      const newLocation = await storage.createLocation(validatedData);
      res.status(201).json(newLocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid location data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create location" });
    }
  });

  // Update current location
  app.put("/api/locations/current", async (req, res) => {
    try {
      const updateSchema = insertLocationSchema.omit({ type: true });
      const validatedData = updateSchema.parse(req.body);
      const updatedLocation = await storage.updateCurrentLocation(validatedData);
      res.json(updatedLocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid location data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update current location" });
    }
  });

  // Update location by ID
  app.put("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertLocationSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      const updatedLocation = await storage.updateLocation(id, validatedData);
      if (!updatedLocation) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      res.json(updatedLocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid location data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  // Delete location
  app.delete("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteLocation(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete location" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
