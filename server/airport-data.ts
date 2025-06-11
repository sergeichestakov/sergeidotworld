// Airport coordinates database
export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export const airportData: Record<string, Airport> = {
  // US Airports
  'SJC': { code: 'SJC', name: 'Norman Y. Mineta San José International Airport', city: 'San Jose', country: 'USA', latitude: 37.3626, longitude: -121.9291 },
  'SFO': { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'USA', latitude: 37.6213, longitude: -122.3790 },
  'OAK': { code: 'OAK', name: 'Oakland International Airport', city: 'Oakland', country: 'USA', latitude: 37.7214, longitude: -122.2208 },
  'LAX': { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', latitude: 33.9425, longitude: -118.4081 },
  'JFK': { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', latitude: 40.6398, longitude: -73.7789 },
  'LGA': { code: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'USA', latitude: 40.7769, longitude: -73.8740 },
  'EWR': { code: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark', country: 'USA', latitude: 40.6925, longitude: -74.1687 },
  'ORD': { code: 'ORD', name: 'O\'Hare International Airport', city: 'Chicago', country: 'USA', latitude: 41.9786, longitude: -87.9048 },
  'MDW': { code: 'MDW', name: 'Chicago Midway International Airport', city: 'Chicago', country: 'USA', latitude: 41.7868, longitude: -87.7522 },
  'SEA': { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'USA', latitude: 47.4502, longitude: -122.3088 },
  'DEN': { code: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'USA', latitude: 39.8561, longitude: -104.6737 },
  'PHX': { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'USA', latitude: 33.4373, longitude: -112.0078 },
  'LAS': { code: 'LAS', name: 'McCarran International Airport', city: 'Las Vegas', country: 'USA', latitude: 36.0840, longitude: -115.1537 },
  'AUS': { code: 'AUS', name: 'Austin-Bergstrom International Airport', city: 'Austin', country: 'USA', latitude: 30.1945, longitude: -97.6699 },
  'DFW': { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'USA', latitude: 32.8998, longitude: -97.0403 },
  'MCI': { code: 'MCI', name: 'Kansas City International Airport', city: 'Kansas City', country: 'USA', latitude: 39.2976, longitude: -94.7139 },
  'CLE': { code: 'CLE', name: 'Cleveland Hopkins International Airport', city: 'Cleveland', country: 'USA', latitude: 41.4117, longitude: -81.8498 },
  'PWM': { code: 'PWM', name: 'Portland International Jetport', city: 'Portland', country: 'USA', latitude: 43.6462, longitude: -70.3093 },
  'BOI': { code: 'BOI', name: 'Boise Airport', city: 'Boise', country: 'USA', latitude: 43.5644, longitude: -116.2228 },
  'JAC': { code: 'JAC', name: 'Jackson Hole Airport', city: 'Jackson', country: 'USA', latitude: 43.6073, longitude: -110.7377 },
  'RNO': { code: 'RNO', name: 'Reno-Tahoe International Airport', city: 'Reno', country: 'USA', latitude: 39.4991, longitude: -119.7681 },
  'SBA': { code: 'SBA', name: 'Santa Barbara Airport', city: 'Santa Barbara', country: 'USA', latitude: 34.4262, longitude: -119.8406 },
  'SNA': { code: 'SNA', name: 'John Wayne Airport', city: 'Orange County', country: 'USA', latitude: 33.6757, longitude: -117.8681 },
  'SLC': { code: 'SLC', name: 'Salt Lake City International Airport', city: 'Salt Lake City', country: 'USA', latitude: 40.7884, longitude: -111.9778 },
  'LBB': { code: 'LBB', name: 'Lubbock Preston Smith International Airport', city: 'Lubbock', country: 'USA', latitude: 33.6636, longitude: -101.8227 },
  'SAV': { code: 'SAV', name: 'Savannah/Hilton Head International Airport', city: 'Savannah', country: 'USA', latitude: 32.1276, longitude: -81.2021 },
  'FLL': { code: 'FLL', name: 'Fort Lauderdale-Hollywood International Airport', city: 'Fort Lauderdale', country: 'USA', latitude: 25.7959, longitude: -80.2870 },

  // Hawaii
  'OGG': { code: 'OGG', name: 'Kahului Airport', city: 'Maui', country: 'USA', latitude: 20.8986, longitude: -156.4307 },
  'HNL': { code: 'HNL', name: 'Daniel K. Inouye International Airport', city: 'Honolulu', country: 'USA', latitude: 21.3099, longitude: -157.8581 },
  'LIH': { code: 'LIH', name: 'Lihue Airport', city: 'Kauai', country: 'USA', latitude: 21.9760, longitude: -159.3390 },

  // Mexico
  'PVR': { code: 'PVR', name: 'Puerto Vallarta International Airport', city: 'Puerto Vallarta', country: 'Mexico', latitude: 20.6801, longitude: -105.2544 },
  'CUN': { code: 'CUN', name: 'Cancun International Airport', city: 'Cancun', country: 'Mexico', latitude: 21.0365, longitude: -86.8771 },
  'MEX': { code: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico', latitude: 19.4363, longitude: -99.0721 },

  // Europe
  'LHR': { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK', latitude: 51.4700, longitude: -0.4543 },
  'LGW': { code: 'LGW', name: 'Gatwick Airport', city: 'London', country: 'UK', latitude: 51.1481, longitude: -0.1903 },
  'CDG': { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', latitude: 49.0097, longitude: 2.5479 },
  'FRA': { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', latitude: 50.0379, longitude: 8.5622 },
  'AMS': { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', latitude: 52.3105, longitude: 4.7683 },
  'MXP': { code: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy', latitude: 45.6306, longitude: 8.7231 },
  'LIN': { code: 'LIN', name: 'Milan Linate Airport', city: 'Milan', country: 'Italy', latitude: 45.4454, longitude: 9.2816 },
  'BCN': { code: 'BCN', name: 'Barcelona Airport', city: 'Barcelona', country: 'Spain', latitude: 41.2974, longitude: 2.0833 },
  'LED': { code: 'LED', name: 'Pulkovo Airport', city: 'St. Petersburg', country: 'Russia', latitude: 59.8003, longitude: 30.2625 },
  'ATH': { code: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece', latitude: 37.9364, longitude: 23.9445 },
  'SKG': { code: 'SKG', name: 'Thessaloniki Airport', city: 'Thessaloniki', country: 'Greece', latitude: 40.5197, longitude: 22.9709 },
  'BRU': { code: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium', latitude: 50.9014, longitude: 4.4844 },
  'ZRH': { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', latitude: 47.4647, longitude: 8.5492 },
  'GVA': { code: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland', latitude: 46.2380, longitude: 6.1090 },
  'IST': { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', latitude: 41.2619, longitude: 28.7279 },
  'VKO': { code: 'VKO', name: 'Vnukovo Airport', city: 'Moscow', country: 'Russia', latitude: 55.5914, longitude: 37.2615 },

  // Asia
  'ICN': { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', latitude: 37.4602, longitude: 126.4407 },
  'DXB': { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', latitude: 25.2532, longitude: 55.3657 },

  // South America
  'GIG': { code: 'GIG', name: 'Rio de Janeiro-Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil', latitude: -22.8099, longitude: -43.2505 },
  'SDU': { code: 'SDU', name: 'Santos Dumont Airport', city: 'Rio de Janeiro', country: 'Brazil', latitude: -22.9105, longitude: -43.1635 },
  'GRU': { code: 'GRU', name: 'São Paulo-Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', latitude: -23.4356, longitude: -46.4731 },
  'CGH': { code: 'CGH', name: 'São Paulo-Congonhas Airport', city: 'São Paulo', country: 'Brazil', latitude: -23.6262, longitude: -46.6565 },
  'MVD': { code: 'MVD', name: 'Montevideo Airport', city: 'Montevideo', country: 'Uruguay', latitude: -34.8384, longitude: -56.0308 },
  'SCL': { code: 'SCL', name: 'Santiago International Airport', city: 'Santiago', country: 'Chile', latitude: -33.3927, longitude: -70.7854 },
  'LIM': { code: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru', latitude: -12.0219, longitude: -77.1143 },
  'CUZ': { code: 'CUZ', name: 'Alejandro Velasco Astete International Airport', city: 'Cusco', country: 'Peru', latitude: -13.5358, longitude: -71.9389 },
  'BOG': { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia', latitude: 4.7016, longitude: -74.1469 },
  'MDE': { code: 'MDE', name: 'José María Córdova International Airport', city: 'Medellín', country: 'Colombia', latitude: 6.1644, longitude: -75.4231 },
  'PTY': { code: 'PTY', name: 'Tocumen International Airport', city: 'Panama City', country: 'Panama', latitude: 9.0714, longitude: -79.3835 },
  'AEP': { code: 'AEP', name: 'Jorge Newbery Airfield', city: 'Buenos Aires', country: 'Argentina', latitude: -34.5592, longitude: -58.4156 },
  'EOH': { code: 'EOH', name: 'Olaya Herrera Airport', city: 'Medellín', country: 'Colombia', latitude: 6.2205, longitude: -75.5906 }
};

export function getAirportByCode(code: string): Airport | undefined {
  return airportData[code.toUpperCase()];
}

export function getAllAirports(): Airport[] {
  return Object.values(airportData);
}