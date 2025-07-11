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
  'FLL': { code: 'FLL', name: 'Fort Lauderdale-Hollywood International Airport', city: 'Fort Lauderdale', country: 'USA', latitude: 29.1806, longitude: -80.1676 },
  'MIA': { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'USA', latitude: 25.7933, longitude: -80.2906 },
  'MCO': { code: 'MCO', name: 'Orlando International Airport', city: 'Orlando', country: 'USA', latitude: 28.4294, longitude: -81.3089 },
  'HNL': { code: 'HNL', name: 'Daniel K. Inouye International Airport', city: 'Honolulu', country: 'USA', latitude: 21.3099, longitude: -157.8581 },
  'LIH': { code: 'LIH', name: 'Lihue Airport', city: 'Lihue', country: 'USA', latitude: 21.9760, longitude: -159.3390 },
  'OGG': { code: 'OGG', name: 'Kahului Airport', city: 'Kahului', country: 'USA', latitude: 20.8986, longitude: -156.4304 },
  'LBB': { code: 'LBB', name: 'Lubbock Preston Smith International Airport', city: 'Lubbock', country: 'USA', latitude: 33.6636, longitude: -101.8228 },
  'BOI': { code: 'BOI', name: 'Boise Airport', city: 'Boise', country: 'USA', latitude: 43.5644, longitude: -116.2228 },
  'JAC': { code: 'JAC', name: 'Jackson Hole Airport', city: 'Jackson', country: 'USA', latitude: 43.6073, longitude: -110.7377 },
  'RNO': { code: 'RNO', name: 'Reno-Tahoe International Airport', city: 'Reno', country: 'USA', latitude: 39.4991, longitude: -119.7681 },
  'SAV': { code: 'SAV', name: 'Savannah/Hilton Head International Airport', city: 'Savannah', country: 'USA', latitude: 32.1276, longitude: -81.2021 },
  'SBA': { code: 'SBA', name: 'Santa Barbara Airport', city: 'Santa Barbara', country: 'USA', latitude: 34.4262, longitude: -119.8403 },
  'SLC': { code: 'SLC', name: 'Salt Lake City International Airport', city: 'Salt Lake City', country: 'USA', latitude: 40.7884, longitude: -111.9778 },
  'SNA': { code: 'SNA', name: 'John Wayne Airport', city: 'Orange County', country: 'USA', latitude: 33.6757, longitude: -117.8682 },

  // European Airports
  'LHR': { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', latitude: 51.4700, longitude: -0.4543 },
  'LGW': { code: 'LGW', name: 'Gatwick Airport', city: 'London', country: 'United Kingdom', latitude: 51.1481, longitude: -0.1903 },
  'CDG': { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', latitude: 49.0097, longitude: 2.5479 },
  'AMS': { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', latitude: 52.3105, longitude: 4.7683 },
  'FRA': { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', latitude: 50.0379, longitude: 8.5622 },
  'ZRH': { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', latitude: 47.4647, longitude: 8.5492 },
  'GVA': { code: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland', latitude: 46.2380, longitude: 6.1090 },
  'BCN': { code: 'BCN', name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain', latitude: 41.2971, longitude: 2.0833 },
  'MXP': { code: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy', latitude: 45.6306, longitude: 8.7231 },
  'LIN': { code: 'LIN', name: 'Milan Linate Airport', city: 'Milan', country: 'Italy', latitude: 45.4451, longitude: 9.2767 },
  'ATH': { code: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece', latitude: 37.9364, longitude: 23.9445 },
  'SKG': { code: 'SKG', name: 'Thessaloniki Airport', city: 'Thessaloniki', country: 'Greece', latitude: 40.5197, longitude: 22.9709 },
  'BRU': { code: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium', latitude: 50.9014, longitude: 4.4844 },
  'LED': { code: 'LED', name: 'Pulkovo Airport', city: 'St. Petersburg', country: 'Russia', latitude: 59.8003, longitude: 30.2625 },
  'VKO': { code: 'VKO', name: 'Vnukovo International Airport', city: 'Moscow', country: 'Russia', latitude: 55.5914, longitude: 37.2615 },
  'WAW': { code: 'WAW', name: 'Warsaw Chopin Airport', city: 'Warsaw', country: 'Poland', latitude: 52.1657, longitude: 20.9671 },
  'KRK': { code: 'KRK', name: 'John Paul II International Airport Kraków–Balice', city: 'Kraków', country: 'Poland', latitude: 50.0777, longitude: 19.7848 },
  'POZ': { code: 'POZ', name: 'Poznań–Ławica Airport', city: 'Poznań', country: 'Poland', latitude: 52.4213, longitude: 16.8263 },
  'PRG': { code: 'PRG', name: 'Václav Havel Airport Prague', city: 'Prague', country: 'Czech Republic', latitude: 50.1008, longitude: 14.2632 },
  'NCE': { code: 'NCE', name: 'Nice Côte d\'Azur Airport', city: 'Nice', country: 'France', latitude: 43.6584, longitude: 7.2159 },
  'IST': { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', latitude: 41.2753, longitude: 28.7519 },

  // Asian Airports  
  'NRT': { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', latitude: 35.7720, longitude: 140.3929 },
  'HND': { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan', latitude: 35.5494, longitude: 139.7798 },
  'KIX': { code: 'KIX', name: 'Kansai International Airport', city: 'Osaka', country: 'Japan', latitude: 34.4273, longitude: 135.2444 },
  'ICN': { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', latitude: 37.4691, longitude: 126.4505 },
  'PEK': { code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', latitude: 39.5098, longitude: 116.4105 },
  'PKX': { code: 'PKX', name: 'Beijing Daxing International Airport', city: 'Beijing', country: 'China', latitude: 39.5098, longitude: 116.4105 },
  'PVG': { code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', latitude: 31.1443, longitude: 121.8083 },  
  'SHA': { code: 'SHA', name: 'Shanghai Hongqiao International Airport', city: 'Shanghai', country: 'China', latitude: 31.1979, longitude: 121.3364 },
  'CAN': { code: 'CAN', name: 'Guangzhou Baiyun International Airport', city: 'Guangzhou', country: 'China', latitude: 23.3924, longitude: 113.2988 },
  'SZX': { code: 'SZX', name: 'Shenzhen Bao\'an International Airport', city: 'Shenzhen', country: 'China', latitude: 22.6393, longitude: 113.8108 },
  'CTU': { code: 'CTU', name: 'Chengdu Shuangliu International Airport', city: 'Chengdu', country: 'China', latitude: 30.5785, longitude: 103.9470 },
  'XIY': { code: 'XIY', name: 'Xi\'an Xianyang International Airport', city: 'Xi\'an', country: 'China', latitude: 34.4471, longitude: 108.7519 },
  'NKG': { code: 'NKG', name: 'Nanjing Lukou International Airport', city: 'Nanjing', country: 'China', latitude: 31.7420, longitude: 118.8622 },
  'CGO': { code: 'CGO', name: 'Zhengzhou Xinzheng International Airport', city: 'Zhengzhou', country: 'China', latitude: 34.5197, longitude: 113.8413 },
  'WUH': { code: 'WUH', name: 'Wuhan Tianhe International Airport', city: 'Wuhan', country: 'China', latitude: 30.7838, longitude: 114.2081 },
  'TSN': { code: 'TSN', name: 'Tianjin Binhai International Airport', city: 'Tianjin', country: 'China', latitude: 39.1244, longitude: 117.3464 },
  'HGH': { code: 'HGH', name: 'Hangzhou Xiaoshan International Airport', city: 'Hangzhou', country: 'China', latitude: 30.2295, longitude: 120.4347 },
  'HKG': { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', latitude: 22.3080, longitude: 113.9185 },
  'TPE': { code: 'TPE', name: 'Taiwan Taoyuan International Airport', city: 'Taipei', country: 'Taiwan', latitude: 25.0797, longitude: 121.2342 },
  'SIN': { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', latitude: 1.3644, longitude: 103.9915 },
  'BKK': { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', latitude: 13.6900, longitude: 100.7501 },
  'DEL': { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', latitude: 28.5665, longitude: 77.1031 },
  'BOM': { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', latitude: 19.0896, longitude: 72.8656 },
  'BLR': { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India', latitude: 13.1979, longitude: 77.7063 },
  'MAA': { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India', latitude: 12.9941, longitude: 80.1811 },
  'CCU': { code: 'CCU', name: 'Netaji Subhas Chandra Bose International Airport', city: 'Kolkata', country: 'India', latitude: 22.6546, longitude: 88.4467 },
  'HYD': { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', latitude: 17.2403, longitude: 78.4294 },
  'PNQ': { code: 'PNQ', name: 'Pune Airport', city: 'Pune', country: 'India', latitude: 18.5822, longitude: 73.9197 },

  // Middle Eastern Airports
  'DXB': { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', latitude: 25.2532, longitude: 55.3657 },
  'DOH': { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', latitude: 25.2731, longitude: 51.6081 },
  'CAI': { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', latitude: 30.1219, longitude: 31.4056 },

  // African Airports
  'JNB': { code: 'JNB', name: 'O. R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', latitude: -26.1367, longitude: 28.2411 },
  'CPT': { code: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa', latitude: -33.9648, longitude: 18.6017 },
  'DUR': { code: 'DUR', name: 'King Shaka International Airport', city: 'Durban', country: 'South Africa', latitude: -29.6144, longitude: 31.1197 },
  'LOS': { code: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos', country: 'Nigeria', latitude: 6.5774, longitude: 3.3212 },
  'ABV': { code: 'ABV', name: 'Nnamdi Azikiwe International Airport', city: 'Abuja', country: 'Nigeria', latitude: 9.0068, longitude: 7.2631 },
  'ACC': { code: 'ACC', name: 'Kotoka International Airport', city: 'Accra', country: 'Ghana', latitude: 5.6052, longitude: -0.1719 },
  'ADD': { code: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia', latitude: 8.9806, longitude: 38.7992 },
  'NBO': { code: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya', latitude: -1.3192, longitude: 36.9278 },
  'DED': { code: 'DED', name: 'Jolly Grant Airport', city: 'Dehradun', country: 'India', latitude: 30.1897, longitude: 78.1803 },

  // Australian/Oceania Airports
  'SYD': { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', latitude: -33.9399, longitude: 151.1753 },
  'MEL': { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', latitude: -37.6690, longitude: 144.8410 },

  // South American Airports
  'GRU': { code: 'GRU', name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', latitude: -23.4356, longitude: -46.4731 },
  'GIG': { code: 'GIG', name: 'Rio de Janeiro/Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil', latitude: -22.8099, longitude: -43.2506 },
  'CGH': { code: 'CGH', name: 'São Paulo/Congonhas Airport', city: 'São Paulo', country: 'Brazil', latitude: -23.6266, longitude: -46.6556 },
  'SDU': { code: 'SDU', name: 'Santos Dumont Airport', city: 'Rio de Janeiro', country: 'Brazil', latitude: -22.9105, longitude: -43.1631 },
  'SCL': { code: 'SCL', name: 'Santiago International Airport', city: 'Santiago', country: 'Chile', latitude: -33.3927, longitude: -70.7854 },
  'LIM': { code: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru', latitude: -12.0219, longitude: -77.1143 },
  'CUZ': { code: 'CUZ', name: 'Alejandro Velasco Astete International Airport', city: 'Cusco', country: 'Peru', latitude: -13.5358, longitude: -71.9389 },
  'BOG': { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia', latitude: 4.7016, longitude: -74.1469 },
  'MDE': { code: 'MDE', name: 'José María Córdova International Airport', city: 'Medellín', country: 'Colombia', latitude: 6.1644, longitude: -75.4231 },
  'EOH': { code: 'EOH', name: 'Olaya Herrera Airport', city: 'Medellín', country: 'Colombia', latitude: 6.2205, longitude: -75.5906 },
  'PTY': { code: 'PTY', name: 'Tocumen International Airport', city: 'Panama City', country: 'Panama', latitude: 9.0714, longitude: -79.3835 },
  'AEP': { code: 'AEP', name: 'Jorge Newbery Airfield', city: 'Buenos Aires', country: 'Argentina', latitude: -34.5592, longitude: -58.4156 },
  'MVD': { code: 'MVD', name: 'Montevideo Airport', city: 'Montevideo', country: 'Uruguay', latitude: -34.8384, longitude: -56.0308 },

  // Central American and Caribbean Airports
  'MEX': { code: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico', latitude: 19.4363, longitude: -99.0721 },
  'CUN': { code: 'CUN', name: 'Cancún International Airport', city: 'Cancún', country: 'Mexico', latitude: 20.5218, longitude: -86.9264 },
  'PVR': { code: 'PVR', name: 'Puerto Vallarta International Airport', city: 'Puerto Vallarta', country: 'Mexico', latitude: 20.6801, longitude: -105.2544 },
  'GOX': { code: 'GOX', name: 'Manohar International Airport', city: 'Goa', country: 'India', latitude: 15.3808, longitude: 73.8314 }
};

export function getAirportByCode(code: string): Airport | undefined {
  return airportData[code.toUpperCase()];
}

export function getAllAirports(): Airport[] {
  return Object.values(airportData);
}