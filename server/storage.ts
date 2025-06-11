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

    // Current location (initially same as home)
    const current: Location = {
      id: this.currentId++,
      name: "San Francisco, CA",
      latitude: 37.7749,
      longitude: -122.4194,
      type: "current",
      visitDate: null,
      notes: "Current location",
      updatedAt: new Date(),
    };
    this.locations.set(current.id, current);
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
