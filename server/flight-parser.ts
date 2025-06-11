import { getAirportByCode } from './airport-data';

export interface FlightData {
  id: string;
  date: string;
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  fromAirport?: {
    code: string;
    name: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  toAirport?: {
    code: string;
    name: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  departureScheduled?: string;
  departureActual?: string;
  arrivalScheduled?: string;
  arrivalActual?: string;
  aircraft?: string;
}

export function parseFlightCSV(csvContent: string): FlightData[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  const flights: FlightData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length < headers.length) continue;
    
    const flight: FlightData = {
      id: `flight-${i}`,
      date: values[0] || '',
      airline: values[1] || '',
      flightNumber: values[2] || '',
      from: values[3] || '',
      to: values[4] || '',
      departureScheduled: values[11] || undefined,
      departureActual: values[12] || undefined,
      arrivalScheduled: values[16] || undefined,
      arrivalActual: values[17] || undefined,
      aircraft: values[19] || undefined,
    };
    
    // Add airport data if available
    const fromAirport = getAirportByCode(flight.from);
    const toAirport = getAirportByCode(flight.to);
    
    if (fromAirport) {
      flight.fromAirport = fromAirport;
    }
    
    if (toAirport) {
      flight.toAirport = toAirport;
    }
    
    // Only add flights where we have both airport coordinates
    if (flight.fromAirport && flight.toAirport) {
      flights.push(flight);
    }
  }
  
  return flights;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export function getUniqueDestinations(flights: FlightData[]): Array<{code: string, name: string, city: string, country: string, latitude: number, longitude: number, visitCount: number}> {
  const destinations = new Map();
  
  flights.forEach(flight => {
    if (flight.toAirport) {
      const key = flight.toAirport.code;
      if (destinations.has(key)) {
        destinations.get(key).visitCount++;
      } else {
        destinations.set(key, {
          ...flight.toAirport,
          visitCount: 1
        });
      }
    }
  });
  
  return Array.from(destinations.values());
}