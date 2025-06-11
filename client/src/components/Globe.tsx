import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Globe from 'globe.gl';
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

    // Initialize Globe.gl
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
      fetch('/api/flights')
        .then(res => res.json())
        .then(flights => {
          if (flights && flights.length > 0) {
            const arcsData = flights
              .filter(flight => flight.fromAirport && flight.toAirport)
              .map(flight => ({
                startLat: flight.fromAirport.latitude,
                startLng: flight.fromAirport.longitude,
                endLat: flight.toAirport.latitude,
                endLng: flight.toAirport.longitude
              }));

            globeRef.current
              .arcsData(arcsData)
              .arcColor('#ffab91')
              .arcAltitude(0.1)
              .arcStroke(0.5)
              .arcDashLength(0.9)
              .arcDashGap(4)
              .arcDashAnimateTime(0)
              .arcsTransitionDuration(0);
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
        const controls = globeRef.current.controls();
        const currentDistance = controls.getDistance();
        controls.setDistance(Math.max(currentDistance * 0.8, controls.minDistance));
      }
    },
    zoomOut: () => {
      if (globeRef.current) {
        const controls = globeRef.current.controls();
        const currentDistance = controls.getDistance();
        controls.setDistance(Math.min(currentDistance * 1.25, controls.maxDistance));
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