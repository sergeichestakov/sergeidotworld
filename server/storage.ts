import { locations, type Location, type InsertLocation } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private locations: Map<number, Location>;
  private currentId: number;

  constructor() {
    this.locations = new Map();
    this.currentId = 1;
    
    // Initialize with some default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Home location
    const home: Location = {
      id: this.currentId++,
      name: "San Francisco, CA",
      latitude: 37.7749,
      longitude: -122.4194,
      type: "home",
      visitDate: null,
      notes: "Home base",
      updatedAt: new Date(),
    };
    this.locations.set(home.id, home);

    // Current location
    const current: Location = {
      id: this.currentId++,
      name: "Tokyo, Japan",
      latitude: 35.6762,
      longitude: 139.6503,
      type: "current",
      visitDate: null,
      notes: "Currently traveling",
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
}

export const storage = new MemStorage();
