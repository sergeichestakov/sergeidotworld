import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Globe, Settings, Plus, Minus, Home, Crosshair, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Globe3D, { type GlobeRef } from "@/components/Globe";
import LocationModal from "@/components/LocationModal";
import type { Location, Setting } from "@shared/schema";
import type { LocationStats } from "@/lib/types";

export default function GlobePage() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showFlights, setShowFlights] = useState(false);
  const globeRef = useRef<GlobeRef>(null);

  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const { data: currentLocation } = useQuery<Location>({
    queryKey: ["/api/locations/current"],
  });

  const { data: settings = [] } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  const visitedLocations = locations.filter(loc => loc.type === 'visited');
  const homeLocation = locations.find(loc => loc.type === 'home');

  const countriesVisitedSetting = settings.find(s => s.key === 'countries_visited');
  const stats: LocationStats = {
    totalVisits: visitedLocations.length,
    countries: parseInt(countriesVisitedSetting?.value || "37"),
    lastUpdate: currentLocation ? 
      new Date(currentLocation.updatedAt).toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit', 
        hour12: true
      }) : 'Never'
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
      <header className="absolute top-0 left-0 right-0 z-30 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <span className="text-2xl md:text-3xl">🌍</span>
            <h1 className="text-lg md:text-2xl font-bold">sergei.world</h1>
          </div>
          
          <Button
            onClick={() => window.location.href = '/admin'}
            variant="outline"
            size="sm"
            className="bg-space-light hover:bg-gray-700 transition-colors border-gray-600 text-white md:text-base text-sm"
          >
            <Settings className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Admin</span>
          </Button>
        </div>
      </header>

      {/* Main Globe Container */}
      <main className="relative w-full h-screen globe-container">
        <Globe3D 
          ref={globeRef}
          locations={locations} 
          onLocationClick={handleLocationClick}
          showFlights={showFlights}
        />
        
        {/* Globe Controls - Mobile & Desktop */}
        <div className="fixed bottom-4 right-4 z-50 pointer-events-auto">
          <div className="bg-gray-800 rounded-xl p-3 border border-gray-600 shadow-xl">
            {/* Desktop Layout (vertical) */}
            <div className="hidden md:flex flex-col space-y-3">
              <button 
                className="control-btn" 
                title="Zoom In"
                onClick={() => globeRef.current?.zoomIn()}
              >
                <Plus size={16} />
              </button>
              <button 
                className="control-btn" 
                title="Zoom Out"
                onClick={() => globeRef.current?.zoomOut()}
              >
                <Minus size={16} />
              </button>
              <div className="border-t border-gray-600 my-2"></div>
              <button 
                className="control-btn" 
                title="Focus on Home Base"
                onClick={() => {
                  if (homeLocation) {
                    globeRef.current?.focusOnLocation(homeLocation.latitude, homeLocation.longitude);
                  }
                }}
              >
                <Home size={16} />
              </button>
              <button 
                className="control-btn" 
                title="Focus on Current Location"
                onClick={() => {
                  if (currentLocation) {
                    globeRef.current?.focusOnLocation(currentLocation.latitude, currentLocation.longitude);
                  }
                }}
              >
                <Crosshair size={16} className="text-green-500" />
              </button>
              <div className="border-t border-gray-600 my-2"></div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="flight-toggle"
                  checked={showFlights}
                  onCheckedChange={setShowFlights}
                  className="data-[state=checked]:bg-orange-500"
                />
                <Label htmlFor="flight-toggle" className="text-xs text-gray-300 cursor-pointer">
                  <Plane size={14} />
                </Label>
              </div>
            </div>
            
            {/* Mobile Layout (vertical) */}
            <div className="block md:hidden">
              <div className="flex flex-col space-y-3">
                <button 
                  className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg border border-gray-500 transition-colors" 
                  title="Zoom In"
                  onClick={() => globeRef.current?.zoomIn()}
                >
                  <Plus size={18} />
                </button>
                <button 
                  className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg border border-gray-500 transition-colors" 
                  title="Zoom Out"
                  onClick={() => globeRef.current?.zoomOut()}
                >
                  <Minus size={18} />
                </button>
                <div className="border-t border-gray-500 my-1"></div>
                <button 
                  className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg border border-gray-500 transition-colors" 
                  title="Focus on Home Base"
                  onClick={() => {
                    if (homeLocation) {
                      globeRef.current?.focusOnLocation(homeLocation.latitude, homeLocation.longitude);
                    }
                  }}
                >
                  <Home size={18} />
                </button>
                <button 
                  className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg border border-gray-500 transition-colors" 
                  title="Focus on Current Location"
                  onClick={() => {
                    if (currentLocation) {
                      globeRef.current?.focusOnLocation(currentLocation.latitude, currentLocation.longitude);
                    }
                  }}
                >
                  <Crosshair size={18} className="text-green-400" />
                </button>
                <div className="border-t border-gray-500 my-1"></div>
                <button 
                  className={`p-3 rounded-lg border border-gray-500 transition-colors ${showFlights ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                  title="Toggle Flights"
                  onClick={() => setShowFlights(!showFlights)}
                >
                  <Plane size={18} className={showFlights ? 'text-white' : 'text-gray-300'} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Location Legend - Desktop only */}
        <div className="absolute top-20 left-4 md:left-6 z-20 hidden md:block">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 border border-gray-600 shadow-xl max-w-sm">
            <h3 className="font-semibold text-lg mb-3">Location Types</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-slow"></div>
                <span className="text-sm">Currently In</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-sm">Home Base</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
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

        {/* Mobile Stats Bar */}
        <div className="absolute bottom-4 left-4 z-20 md:hidden">
          <div className="bg-space-light/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-gray-700/50">
            <div className="flex items-center space-x-4 text-xs text-gray-300">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span>{stats.totalVisits}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>🌍</span>
                <span>{stats.countries}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Location Info - Desktop Only */}
        {currentLocation && (
          <div className="absolute bottom-6 left-6 z-20 hidden md:block">
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
