import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Globe, Settings, Plus, Minus, Home, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import Globe3D from "@/components/Globe";
import AdminDashboard from "@/components/AdminDashboard";
import LocationModal from "@/components/LocationModal";
import type { Location } from "@shared/schema";
import type { LocationStats } from "@/lib/types";

export default function GlobePage() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const { data: currentLocation } = useQuery<Location>({
    queryKey: ["/api/locations/current"],
  });

  const visitedLocations = locations.filter(loc => loc.type === 'visited');
  const homeLocation = locations.find(loc => loc.type === 'home');

  const stats: LocationStats = {
    totalVisits: visitedLocations.length,
    countries: new Set(visitedLocations.map(loc => loc.name.split(',').pop()?.trim())).size,
    lastUpdate: currentLocation ? 
      new Date(currentLocation.updatedAt).toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit', 
        hour12: true
      }) + ' ago' : 'Never'
  };

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-space-dark flex items-center justify-center">
        <div className="text-white">Loading globe...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-dark text-white overflow-hidden font-sans">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-amber-500 rounded-full flex items-center justify-center">
              <Globe className="text-white text-lg" size={20} />
            </div>
            <h1 className="text-2xl font-bold">sergei.world</h1>
          </div>
          
          <Button
            onClick={() => setIsAdminOpen(true)}
            variant="outline"
            className="bg-space-light hover:bg-gray-700 transition-colors border-gray-600 text-white"
          >
            <Settings className="mr-2 h-4 w-4" />
            Admin
          </Button>
        </div>
      </header>

      {/* Main Globe Container */}
      <main className="relative w-full h-screen globe-container">
        <Globe3D 
          locations={locations} 
          onLocationClick={handleLocationClick}
        />
        
        {/* Globe Controls */}
        <div className="absolute bottom-6 right-6 z-20">
          <div className="bg-space-light/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="flex flex-col space-y-3">
              <button className="control-btn" title="Zoom In">
                <Plus size={16} />
              </button>
              <button className="control-btn" title="Zoom Out">
                <Minus size={16} />
              </button>
              <div className="border-t border-gray-600 my-2"></div>
              <button className="control-btn" title="Reset View">
                <Home size={16} />
              </button>
              <button className="control-btn" title="Follow Current Location">
                <Crosshair size={16} className="text-red-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Location Legend */}
        <div className="absolute top-20 left-6 z-20">
          <div className="bg-space-light/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 max-w-sm">
            <h3 className="font-semibold text-lg mb-3">Location Types</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-location-current rounded-full animate-pulse-slow"></div>
                <span className="text-sm">Current Location</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-location-home rounded-full"></div>
                <span className="text-sm">Home Base</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-location-visited rounded-full"></div>
                <span className="text-sm">Places Visited</span>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-600">
              <div className="text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Total Visits:</span>
                  <span>{stats.totalVisits}</span>
                </div>
                <div className="flex justify-between">
                  <span>Countries:</span>
                  <span>{stats.countries}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Update:</span>
                  <span>{stats.lastUpdate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Location Info */}
        {currentLocation && (
          <div className="absolute bottom-6 left-6 z-20">
            <div className="bg-space-light/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 min-w-72">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-4 h-4 bg-location-current rounded-full animate-pulse-slow"></div>
                <h3 className="font-semibold">Currently in</h3>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-medium">{currentLocation.name}</p>
                <p className="text-sm text-gray-400">
                  {currentLocation.latitude.toFixed(4)}° N, {Math.abs(currentLocation.longitude).toFixed(4)}° {currentLocation.longitude > 0 ? 'E' : 'W'}
                </p>
                <p className="text-xs text-gray-500">
                  Updated {new Date(currentLocation.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Admin Dashboard */}
      <AdminDashboard 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Location Modal */}
      {selectedLocation && (
        <LocationModal 
          location={selectedLocation}
          isOpen={!!selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      )}
    </div>
  );
}
