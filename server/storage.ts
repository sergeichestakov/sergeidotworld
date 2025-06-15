import { locations, settings, type Location, type InsertLocation, type Setting, type InsertSetting } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getLocations(): Promise<Location[]>;
  getLocationById(id: number): Promise<Location | undefined>;
  getCurrentLocation(): Promise<Location | undefined>;
  getHomeLocation(): Promise<Location | undefined>;
  getVisitedLocations(): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;
  updateCurrentLocation(location: Omit<InsertLocation, 'type'>): Promise<Location>;
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(key: string, value: string): Promise<Setting>;
  getSettings(): Promise<Setting[]>;
}

export class MemStorage implements IStorage {
  private locations: Map<number, Location>;
  private settings: Map<string, Setting>;
  private currentId: number;
  private settingsId: number;

  constructor() {
    this.locations = new Map();
    this.settings = new Map();
    this.currentId = 1;
    this.settingsId = 1;
    
    // Initialize with some default data
    this.initializeDefaultData();
    this.initializeSettings();
  }

  private initializeDefaultData() {
    // Home location
    const home: Location = {
      id: this.currentId++,
      name: "Brooklyn, NY",
      latitude: 40.7033,
      longitude: -73.9625,
      type: "home",
      visitDate: null,
      notes: "Home base near Domino Park",
      updatedAt: new Date(),
    };
    this.locations.set(home.id, home);

    // Current location
    const current: Location = {
      id: this.currentId++,
      name: "Brooklyn, NY",
      latitude: 40.7033,
      longitude: -73.9625,
      type: "current",
      visitDate: null,
      notes: "Currently in Brooklyn near Domino Park",
      updatedAt: new Date(),
    };
    this.locations.set(current.id, current);

    // Visited locations
    const visitedLocations = [
      {
        name: "Paris, France",
        latitude: 48.8566,
        longitude: 2.3522,
        visitDate: "2024-03",
        notes: "Amazing architecture and food"
      },
      {
        name: "New York, NY",
        latitude: 40.7128,
        longitude: -74.0060,
        visitDate: "2024-01",
        notes: "Business trip"
      },
      {
        name: "London, UK",
        latitude: 51.5074,
        longitude: -0.1278,
        visitDate: "2023-11",
        notes: "Great museums"
      },
      {
        name: "Sydney, Australia",
        latitude: -33.8688,
        longitude: 151.2093,
        visitDate: "2023-09",
        notes: "Beautiful harbor views"
      },
      {
        name: "Dubai, UAE",
        latitude: 25.2048,
        longitude: 55.2708,
        visitDate: "2023-07",
        notes: "Incredible skyline"
      }
    ];

    visitedLocations.forEach(location => {
      const visitedLocation: Location = {
        id: this.currentId++,
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        type: "visited",
        visitDate: location.visitDate || null,
        notes: location.notes || null,
        updatedAt: new Date(),
      };
      this.locations.set(visitedLocation.id, visitedLocation);
    });
  }

  async getLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }

  async getLocationById(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async getCurrentLocation(): Promise<Location | undefined> {
    return Array.from(this.locations.values()).find(loc => loc.type === 'current');
  }

  async getHomeLocation(): Promise<Location | undefined> {
    return Array.from(this.locations.values()).find(loc => loc.type === 'home');
  }

  async getVisitedLocations(): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(loc => loc.type === 'visited');
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentId++;
    const location: Location = {
      ...insertLocation,
      id,
      visitDate: insertLocation.visitDate || null,
      notes: insertLocation.notes || null,
      updatedAt: new Date(),
    };
    this.locations.set(id, location);
    return location;
  }

  async updateLocation(id: number, updateData: Partial<InsertLocation>): Promise<Location | undefined> {
    const existingLocation = this.locations.get(id);
    if (!existingLocation) {
      return undefined;
    }

    const updatedLocation: Location = {
      ...existingLocation,
      ...updateData,
      updatedAt: new Date(),
    };
    this.locations.set(id, updatedLocation);
    return updatedLocation;
  }

  async deleteLocation(id: number): Promise<boolean> {
    return this.locations.delete(id);
  }

  async updateCurrentLocation(locationData: Omit<InsertLocation, 'type'>): Promise<Location> {
    // Find existing current location and update it
    const currentLocation = await this.getCurrentLocation();
    if (currentLocation) {
      return await this.updateLocation(currentLocation.id, {
        ...locationData,
        type: 'current',
      }) as Location;
    } else {
      // Create new current location if none exists
      return await this.createLocation({
        ...locationData,
        type: 'current',
      });
    }
  }

  private initializeSettings() {
    // Initialize default settings
    const countriesVisited: Setting = {
      id: this.settingsId++,
      key: 'countries_visited',
      value: '37',
      updatedAt: new Date(),
    };
    this.settings.set('countries_visited', countriesVisited);
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async setSetting(key: string, value: string): Promise<Setting> {
    const existingSetting = this.settings.get(key);
    if (existingSetting) {
      const updated: Setting = {
        ...existingSetting,
        value,
        updatedAt: new Date(),
      };
      this.settings.set(key, updated);
      return updated;
    } else {
      const newSetting: Setting = {
        id: this.settingsId++,
        key,
        value,
        updatedAt: new Date(),
      };
      this.settings.set(key, newSetting);
      return newSetting;
    }
  }

  async getSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }
}

export class DatabaseStorage implements IStorage {
  async getLocations(): Promise<Location[]> {
    return await db.select().from(locations);
  }

  async getLocationById(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location || undefined;
  }

  async getCurrentLocation(): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.type, 'current'));
    return location || undefined;
  }

  async getHomeLocation(): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.type, 'home'));
    return location || undefined;
  }

  async getVisitedLocations(): Promise<Location[]> {
    return await db.select().from(locations).where(eq(locations.type, 'visited'));
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db
      .insert(locations)
      .values(insertLocation)
      .returning();
    return location;
  }

  async updateLocation(id: number, updateData: Partial<InsertLocation>): Promise<Location | undefined> {
    const [location] = await db
      .update(locations)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(locations.id, id))
      .returning();
    return location || undefined;
  }

  async deleteLocation(id: number): Promise<boolean> {
    const result = await db.delete(locations).where(eq(locations.id, id));
    return (result.rowCount || 0) > 0;
  }

  async updateCurrentLocation(locationData: Omit<InsertLocation, 'type'>): Promise<Location> {
    // Check if current location exists
    const currentLocation = await this.getCurrentLocation();
    
    if (currentLocation) {
      // Update existing current location
      const [updated] = await db
        .update(locations)
        .set({ ...locationData, updatedAt: new Date() })
        .where(eq(locations.id, currentLocation.id))
        .returning();
      return updated;
    } else {
      // Create new current location
      const [created] = await db
        .insert(locations)
        .values({ ...locationData, type: 'current' })
        .returning();
      return created;
    }
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting || undefined;
  }

  async setSetting(key: string, value: string): Promise<Setting> {
    const existingSetting = await this.getSetting(key);
    
    if (existingSetting) {
      const [updated] = await db
        .update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(settings)
        .values({ key, value })
        .returning();
      return created;
    }
  }

  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }
}

export const storage = new DatabaseStorage();
