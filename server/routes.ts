import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertLocationSchema, insertSettingSchema } from "@shared/schema";
import { parseFlightCSV, getUniqueDestinations } from "./flight-parser";
import { z } from "zod";
import fs from "fs";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV files are allowed'));
      }
    },
  });
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

  // Upload and parse flight data
  app.post("/api/flights/upload", async (req, res) => {
    try {
      const csvContent = req.body.csvContent;
      if (!csvContent) {
        return res.status(400).json({ message: "CSV content is required" });
      }

      const flights = parseFlightCSV(csvContent);
      const destinations = getUniqueDestinations(flights);
      
      // Add destinations as visited locations
      for (const dest of destinations) {
        await storage.createLocation({
          name: `${dest.city}, ${dest.country}`,
          latitude: dest.latitude,
          longitude: dest.longitude,
          type: "visited",
          visitDate: null,
          notes: `Visited ${dest.visitCount} time${dest.visitCount > 1 ? 's' : ''} via flights`
        });
      }

      res.json({ 
        message: "Flight data processed successfully",
        flightsProcessed: flights.length,
        destinationsAdded: destinations.length,
        flights: flights.slice(0, 10) // Return first 10 for preview
      });
    } catch (error) {
      console.error("Flight upload error:", error);
      res.status(500).json({ message: "Failed to process flight data" });
    }
  });

  // Get flight routes for visualization
  app.get("/api/flights/routes", async (req, res) => {
    try {
      // Try to read the uploaded CSV file
      const csvPath = path.join(process.cwd(), 'attached_assets', 'FlightyExport-2025-06-11_1749659322224.csv');
      
      if (fs.existsSync(csvPath)) {
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
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
        }));
        
        res.json(routes);
      } else {
        res.json([]);
      }
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

  // CSV flight data upload endpoint
  app.post("/api/flights/upload", requireAuth, upload.single('csvFile'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file provided" });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const newFlights = parseFlightCSV(csvContent);
      
      if (newFlights.length === 0) {
        return res.status(400).json({ message: "No valid flight data found in CSV" });
      }

      // Get existing flight data for deduplication
      const existingFlightData = fs.readFileSync(path.join(process.cwd(), 'attached_assets', 'FlightyExport-2025-06-11_1749659322224.csv'), 'utf-8');
      const existingFlights = parseFlightCSV(existingFlightData);
      
      // Create a set of existing flight identifiers for deduplication
      const existingFlightIds = new Set(
        existingFlights.map(flight => `${flight.date}_${flight.airline}_${flight.flightNumber}_${flight.from}_${flight.to}`)
      );

      // Filter out duplicate flights
      const uniqueNewFlights = newFlights.filter(flight => {
        const flightId = `${flight.date}_${flight.airline}_${flight.flightNumber}_${flight.from}_${flight.to}`;
        return !existingFlightIds.has(flightId);
      });

      if (uniqueNewFlights.length === 0) {
        return res.json({ 
          message: `All ${newFlights.length} flights already exist in the system. No new flights added.`,
          processed: newFlights.length,
          added: 0,
          duplicates: newFlights.length
        });
      }

      // Combine existing and new flights
      const allFlights = [...existingFlights, ...uniqueNewFlights];
      
      // Update the CSV file with combined data
      const csvHeader = "Date,Departure Airport,Arrival Airport,Departure Time (scheduled),Departure Time (actual),Arrival Time (scheduled),Arrival Time (actual),Airline,Flight #,Aircraft Type,Registration";
      const csvRows = allFlights.map(flight => {
        return [
          flight.date,
          flight.from,
          flight.to,
          flight.departureScheduled || '',
          flight.departureActual || '',
          flight.arrivalScheduled || '',
          flight.arrivalActual || '',
          flight.airline,
          flight.flightNumber,
          flight.aircraft || '',
          '' // Registration (not in our data structure)
        ].join(',');
      });
      
      const updatedCsvContent = [csvHeader, ...csvRows].join('\n');
      fs.writeFileSync(path.join(process.cwd(), 'attached_assets', 'FlightyExport-2025-06-11_1749659322224.csv'), updatedCsvContent);

      // Get unique destinations from all flights and update storage
      const destinations = getUniqueDestinations(allFlights);
      
      // Clear existing visited locations (keeping home and current)
      const locations = await storage.getLocations();
      const visitedLocations = locations.filter(loc => loc.type === 'visited');
      for (const location of visitedLocations) {
        await storage.deleteLocation(location.id);
      }

      // Add new destinations as visited locations
      let addedCount = 0;
      for (const dest of destinations) {
        try {
          await storage.createLocation({
            name: dest.city,
            latitude: dest.latitude,
            longitude: dest.longitude,
            type: 'visited',
            visitDate: null,
            notes: `${dest.name} (${dest.code}) - ${dest.visitCount} visit${dest.visitCount > 1 ? 's' : ''} - ${dest.country}`
          });
          addedCount++;
        } catch (error) {
          console.error(`Failed to add destination ${dest.city}:`, error);
        }
      }

      // Update countries visited count
      const uniqueCountries = new Set(destinations.map(d => d.country)).size;
      await storage.setSetting('countries_visited', uniqueCountries.toString());

      res.json({ 
        message: `Successfully processed ${newFlights.length} flights. Added ${uniqueNewFlights.length} new flights and ${addedCount} destinations. Updated ${uniqueCountries} countries visited.`,
        processed: newFlights.length,
        added: uniqueNewFlights.length,
        duplicates: newFlights.length - uniqueNewFlights.length,
        destinations: addedCount,
        countries: uniqueCountries
      });

    } catch (error) {
      console.error('CSV upload error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to process CSV file" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
