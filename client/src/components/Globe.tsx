import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Globe from 'globe.gl';
import * as THREE from 'three';
import { Location } from '@shared/schema';

interface GlobeProps {
  locations: Location[];
  onLocationClick: (location: Location) => void;
  showFlights?: boolean;
}

export interface GlobeRef {
  zoomIn: () => void;
  zoomOut: () => void;
  focusOnLocation: (lat: number, lng: number, altitude?: number) => void;
  resetView: () => void;
}

const Globe3D = forwardRef<GlobeRef, GlobeProps>(({ locations, onLocationClick, showFlights = false }, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize Globe.gl with original textures
    const globe = new Globe(mountRef.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .width(window.innerWidth)
      .height(window.innerHeight)
      .backgroundColor('rgba(0,0,0,0)')
      .showAtmosphere(true)
      .atmosphereColor('#87ceeb')
      .atmosphereAltitude(0.1)
      .enablePointerInteraction(true)
      .pointOfView({ lat: 0, lng: 0, altitude: 2.5 });

    // Day/night overlay using hex bins for night areas
    const updateDayNightOverlay = () => {
      const now = new Date();
      const sunLng = (now.getUTCHours() + now.getUTCMinutes() / 60) * 15 - 180;
      const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
      const sunLat = -23.44 * Math.cos(2 * Math.PI * dayOfYear / 365.25);
      
      // Create night overlay points
      const nightPoints = [];
      for (let lat = -85; lat <= 85; lat += 8) {
        for (let lng = -175; lng <= 175; lng += 8) {
          // Calculate solar elevation angle
          const latRad = lat * Math.PI / 180;
          const lngRad = lng * Math.PI / 180;
          const sunLatRad = sunLat * Math.PI / 180;
          const sunLngRad = sunLng * Math.PI / 180;
          
          const solarElevation = Math.asin(
            Math.sin(latRad) * Math.sin(sunLatRad) +
            Math.cos(latRad) * Math.cos(sunLatRad) * Math.cos(lngRad - sunLngRad)
          );
          
          // If sun is below horizon, add to night overlay
          if (solarElevation < 0) {
            const darkness = Math.min(Math.abs(solarElevation) * 1.5, 0.8);
            nightPoints.push({
              lat: lat,
              lng: lng,
              weight: darkness
            });
          }
        }
      }
      
      // Apply night overlay using hex bins
      globe
        .hexBinPointsData(nightPoints)
        .hexBinPointLat(d => d.lat)
        .hexBinPointLng(d => d.lng)
        .hexBinPointWeight(d => d.weight)
        .hexBinResolution(4)
        .hexTopColor(() => 'rgba(0, 0, 0, 0.6)')
        .hexSideColor(() => 'rgba(0, 0, 0, 0.4)')
        .hexAltitude(0.01);
    };

    // Initial overlay and periodic updates
    updateDayNightOverlay();
    const dayNightInterval = setInterval(updateDayNightOverlay, 5 * 60 * 1000);

    // Configure controls for auto-rotation
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = true;
    controls.minDistance = 200;
    controls.maxDistance = 800;

    globeRef.current = globe;

    // Handle window resize
    const handleResize = () => {
      if (globeRef.current) {
        globeRef.current
          .width(window.innerWidth)
          .height(window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(dayNightInterval);
      if (globeRef.current) {
        globeRef.current._destructor();
      }
    };
  }, []);

  useEffect(() => {
    if (!globeRef.current || !locations.length) return;

    // Prepare points data
    const pointsData = locations.map(location => ({
      lat: location.latitude,
      lng: location.longitude,
      size: getMarkerSize(location.type),
      color: getMarkerColor(location.type),
      location: location
    }));

    // Set points on globe
    globeRef.current
      .pointsData(pointsData)
      .pointAltitude(0.01)
      .pointRadius('size')
      .pointColor('color')
      .pointsMerge(false)
      .pointLabel(d => `
        <div style="
          background: rgba(0,0,0,0.8); 
          color: white; 
          padding: 8px 12px; 
          border-radius: 8px; 
          font-size: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ">
          <div style="font-weight: bold; margin-bottom: 4px;">${getLocationTypeLabel(d.location.type)}</div>
          <div>${d.location.name}</div>
          <div style="font-size: 10px; color: #ccc; margin-top: 4px;">
            ${d.lat.toFixed(4)}°, ${d.lng.toFixed(4)}°
          </div>
        </div>
      `)
      .onPointClick((point) => {
        if (point && point.location) {
          onLocationClick(point.location);
        }
      });

    // Handle flight routes
    if (showFlights && locations.length > 0) {
      // Get flight data from the server
      fetch('/api/flights/routes')
        .then(res => res.json())
        .then(flights => {
          if (flights && flights.length > 0) {
            // Calculate distance between two points using Haversine formula
            const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
              const R = 6371; // Earth's radius in km
              const dLat = (lat2 - lat1) * Math.PI / 180;
              const dLon = (lon2 - lon1) * Math.PI / 180;
              const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                        Math.sin(dLon/2) * Math.sin(dLon/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              return R * c;
            };

            const arcsData = flights
              .filter(flight => 
                flight.from && 
                flight.to && 
                typeof flight.from.latitude === 'number' && 
                typeof flight.from.longitude === 'number' &&
                typeof flight.to.latitude === 'number' && 
                typeof flight.to.longitude === 'number' &&
                !isNaN(flight.from.latitude) &&
                !isNaN(flight.from.longitude) &&
                !isNaN(flight.to.latitude) &&
                !isNaN(flight.to.longitude)
              )
              .map(flight => {
                const distance = calculateDistance(
                  flight.from.latitude, flight.from.longitude,
                  flight.to.latitude, flight.to.longitude
                );
                
                // Normalize distance to altitude range [0.05, 0.4]
                // Max typical flight distance is about 20,000 km (around the world)
                const maxDistance = 20000;
                const minAltitude = 0.05;
                const maxAltitude = 0.4;
                const normalizedDistance = Math.min(distance / maxDistance, 1);
                const altitude = minAltitude + (normalizedDistance * (maxAltitude - minAltitude));
                
                return {
                  startLat: flight.from.latitude,
                  startLng: flight.from.longitude,
                  endLat: flight.to.latitude,
                  endLng: flight.to.longitude,
                  altitude: altitude
                };
              });

            console.log(`Loading ${arcsData.length} valid flight routes out of ${flights.length} total`);
            
            if (arcsData.length > 0) {
              globeRef.current
                .arcsData(arcsData)
                .arcColor(() => '#87ceeb')
                .arcAltitude((arc: any) => arc.altitude)
                .arcStroke(0.8)
                .arcDashLength(0.9)
                .arcDashGap(4)
                .arcDashAnimateTime(0)
                .arcsTransitionDuration(1000);
            }
          }
        })
        .catch(err => console.warn('Failed to load flight data:', err));
    } else {
      // Clear flight routes when toggled off
      globeRef.current?.arcsData([]);
    }

    // Focus on current location initially
    const currentLocationPoint = pointsData.find(p => p.location.type === 'current');
    if (currentLocationPoint) {
      globeRef.current.pointOfView({
        lat: currentLocationPoint.lat,
        lng: currentLocationPoint.lng,
        altitude: 2
      }, 1000);
    }
  }, [locations, onLocationClick, showFlights]);

  const getMarkerSize = (type: string): number => {
    switch (type) {
      case 'current':
        return 0.6;
      case 'home':
        return 0.5;
      case 'visited':
        return 0.3;
      default:
        return 0.3;
    }
  };

  const getMarkerColor = (type: string): string => {
    switch (type) {
      case 'current':
        return '#10b981'; // Green
      case 'home':
        return '#f59e0b'; // Amber
      case 'visited':
        return '#06b6d4'; // Cyan
      default:
        return '#6b7280'; // Gray
    }
  };

  const getLocationTypeLabel = (type: string): string => {
    switch (type) {
      case 'current':
        return 'Currently In';
      case 'home':
        return 'Home Base';
      case 'visited':
        return 'Visited Location';
      default:
        return 'Location';
    }
  };

  // Expose control methods via ref
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (globeRef.current) {
        const currentPov = globeRef.current.pointOfView();
        const newAltitude = Math.max(currentPov.altitude * 0.8, 0.5);
        globeRef.current.pointOfView({ 
          lat: currentPov.lat, 
          lng: currentPov.lng, 
          altitude: newAltitude 
        }, 300);
      }
    },
    zoomOut: () => {
      if (globeRef.current) {
        const currentPov = globeRef.current.pointOfView();
        const newAltitude = Math.min(currentPov.altitude * 1.25, 4);
        globeRef.current.pointOfView({ 
          lat: currentPov.lat, 
          lng: currentPov.lng, 
          altitude: newAltitude 
        }, 300);
      }
    },
    focusOnLocation: (lat: number, lng: number, altitude: number = 2) => {
      if (globeRef.current) {
        globeRef.current.pointOfView({ lat, lng, altitude }, 1000);
      }
    },
    resetView: () => {
      if (globeRef.current) {
        globeRef.current.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 1000);
      }
    }
  }));

  return <div ref={mountRef} className="absolute inset-0" />;
});

Globe3D.displayName = 'Globe3D';

export default Globe3D;