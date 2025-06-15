import { db } from "./db";
import { locations, settings } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function initializeDatabase() {
  console.log("Initializing database with default data...");
  
  try {
    // Check if home location exists
    const existingHome = await db.select().from(locations).where(eq(locations.type, 'home')).limit(1);
    
    if (existingHome.length === 0) {
      // Create home location
      await db.insert(locations).values({
        name: "Brooklyn, NY",
        latitude: 40.7128,
        longitude: -74.0060,
        type: "home",
        notes: "Home base in Brooklyn"
      });
      console.log("Created home location");
    }
    
    // Check if current location exists
    const existingCurrent = await db.select().from(locations).where(eq(locations.type, 'current')).limit(1);
    
    if (existingCurrent.length === 0) {
      // Create current location
      await db.insert(locations).values({
        name: "Brooklyn, NY",
        latitude: 40.7128,
        longitude: -74.0060,
        type: "current",
        notes: "Currently in Brooklyn"
      });
      console.log("Created current location");
    }
    
    // Check if countries_visited setting exists
    const existingSetting = await db.select().from(settings).where(eq(settings.key, 'countries_visited')).limit(1);
    
    if (existingSetting.length === 0) {
      await db.insert(settings).values({
        key: "countries_visited",
        value: "37"
      });
      console.log("Created countries_visited setting");
    }
    
    console.log("Database initialization complete");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}