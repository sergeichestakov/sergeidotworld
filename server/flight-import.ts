import { parseFlightCSV, getUniqueDestinations } from './flight-parser';
import { storage } from './storage';

export async function importFlightDataOnStartup() {
  try {
    const flightyFileName = process.env.FLIGHTY_EXPORT_FILE_NAME;
    
    if (!flightyFileName) {
      console.log('FLIGHTY_EXPORT_FILE_NAME environment variable not set, skipping auto-import');
      return;
    }

    const csvUrl = `https://static.sergei.com/${flightyFileName}`;
    
    console.log('Fetching flight data from Cloudflare R2...');
    
    // Fetch CSV from Cloudflare R2
    const response = await fetch(csvUrl);
    if (!response.ok) {
      console.log(`Failed to fetch flight data from ${csvUrl} (${response.status}), skipping auto-import`);
      return;
    }
    
    const csvContent = await response.text();
    if (!csvContent.trim()) {
      console.log('Empty CSV file received, skipping auto-import');
      return;
    }

    // Remove existing flight destinations to force re-import with updated data
    const existingLocations = await storage.getVisitedLocations();
    const flightDestinations = existingLocations.filter(loc => 
      loc.notes && loc.notes.includes('Flight destination')
    );
    
    for (const dest of flightDestinations) {
      await storage.deleteLocation(dest.id);
    }
    
    console.log(`Cleared ${flightDestinations.length} existing flight destinations`);

    console.log('Auto-importing flight destinations...');
    
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