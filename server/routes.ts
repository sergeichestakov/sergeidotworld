import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLocationSchema, insertSettingSchema } from "@shared/schema";
import { parseFlightCSV, getUniqueDestinations } from "./flight-parser";
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



  // Get flight routes for visualization
  app.get("/api/flights/routes", async (req, res) => {
    try {
      const flightyFileName = process.env.FLIGHTY_EXPORT_FILE_NAME;
      
      if (!flightyFileName) {
        return res.json([]);
      }

      const csvUrl = `https://static.sergei.com/${flightyFileName}`;
      
      // Fetch CSV from Cloudflare R2
      const response = await fetch(csvUrl);
      if (!response.ok) {
        return res.json([]);
      }
      
      const csvContent = await response.text();
      if (!csvContent.trim()) {
        return res.json([]);
      }

      const flights = parseFlightCSV(csvContent);
      
      // Return flight routes for globe visualization
      const routes = flights.map(flight => ({
        id: flight.id,
        from: {
          code: flight.from,
          name: flight.fromAirport?.city,
          latitude: flight.fromAirport?.latitude,
          longitude: flight.fromAirport?.longitude
        },
        to: {
          code: flight.to,
          name: flight.toAirport?.city,
          latitude: flight.toAirport?.latitude,
          longitude: flight.toAirport?.longitude
        },
        date: flight.date,
        airline: flight.airline,
        flightNumber: flight.flightNumber
      })).filter(route => 
        route.from.latitude && route.from.longitude && 
        route.to.latitude && route.to.longitude
      );

      res.json(routes);
    } catch (error) {
      console.error("Flight routes error:", error);
      res.status(500).json({ message: "Failed to get flight routes" });
    }
  });

  // Settings API routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        res.status(404).json({ message: "Setting not found" });
        return;
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.put("/api/settings/:key", async (req, res) => {
    try {
      // Simple password check for admin operations
      const adminPassword = process.env.ADMIN_DASHBOARD_PASSWORD || 'admin123';
      const providedPassword = req.body.password;
      
      if (providedPassword !== adminPassword) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { value } = req.body;
      if (!value) {
        res.status(400).json({ message: "Value is required" });
        return;
      }

      const setting = await storage.setSetting(req.params.key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Middleware to check admin authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.session?.isAdminAuthenticated) {
      next();
    } else {
      res.status(401).json({ message: "Authentication required" });
    }
  };

  // Check current auth status
  app.get("/api/admin/status", (req: any, res) => {
    res.json({ authenticated: !!req.session?.isAdminAuthenticated });
  });

  // Admin authentication endpoint
  app.post("/api/admin/auth", (req: any, res) => {
    const adminPassword = process.env.ADMIN_DASHBOARD_PASSWORD || 'admin123';
    const providedPassword = req.body.password;
    
    if (providedPassword === adminPassword) {
      req.session.isAdminAuthenticated = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "Invalid password" });
    }
  });

  // Admin logout endpoint
  app.post("/api/admin/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        res.status(500).json({ message: "Failed to logout" });
      } else {
        res.json({ success: true });
      }
    });
  });



  const httpServer = createServer(app);
  return httpServer;
}
