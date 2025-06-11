import fs from 'fs';
import path from 'path';
import { parseFlightCSV, getUniqueDestinations } from './flight-parser';
import { storage } from './storage';

export async function importFlightDataOnStartup() {
  try {
    const csvPath = path.join(process.cwd(), 'attached_assets', 'FlightyExport-2025-06-11_1749659322224.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log('Flight CSV file not found, skipping auto-import');
      return;
    }

    // Check if we already have flight destinations imported
    const existingLocations = await storage.getVisitedLocations();
    const hasFlightDestinations = existingLocations.some(loc => 
      loc.notes && loc.notes.includes('Flight destination')
    );

    if (hasFlightDestinations) {
      console.log('Flight destinations already imported');
      return;
    }

    console.log('Auto-importing flight destinations...');
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const flights = parseFlightCSV(csvContent);
    const destinations = getUniqueDestinations(flights);
    
    // Import unique destinations as visited locations
    let importedCount = 0;
    for (const dest of destinations) {
      // Check if location already exists by coordinates
      const existingLocations = await storage.getLocations();
      const exists = existingLocations.some(loc => 
        Math.abs(loc.latitude - dest.latitude) < 0.01 && 
        Math.abs(loc.longitude - dest.longitude) < 0.01
      );
      
      if (!exists) {
        await storage.createLocation({
          name: `${dest.city}, ${dest.country}`,
          latitude: dest.latitude,
          longitude: dest.longitude,
          type: "visited",
          visitDate: null,
          notes: `Flight destination: ${dest.code} (${dest.visitCount} visit${dest.visitCount > 1 ? 's' : ''})`
        });
        importedCount++;
      }
    }
    
    console.log(`Successfully imported ${importedCount} flight destinations from ${flights.length} flights`);
    
  } catch (error) {
    console.error('Failed to auto-import flight data:', error);
  }
}