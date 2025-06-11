import { useRef, useEffect } from 'react';
import Globe from 'globe.gl';
import { Location } from '@shared/schema';

interface GlobeProps {
  locations: Location[];
  onLocationClick: (location: Location) => void;
}

export default function Globe3D({ locations, onLocationClick }: GlobeProps) {
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
      if (mountRef.current && mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
    };
  }, []);

  // Update markers and flight routes when locations change
  useEffect(() => {
    if (!globeRef.current) return;

    // Prepare points data for Globe.gl
    const pointsData = locations.map(location => ({
      lat: location.latitude,
      lng: location.longitude,
      size: getMarkerSize(location.type),
      color: getMarkerColor(location.type),
      label: location.name,
      location: location
    }));

    // Add points to globe
    globeRef.current
      .pointsData(pointsData)
      .pointAltitude(0.01)
      .pointRadius('size')
      .pointColor('color')
      .pointLabel((d: any) => `
        <div style="
          background: rgba(0, 0, 0, 0.8); 
          color: white; 
          padding: 8px 12px; 
          border-radius: 6px; 
          font-size: 14px;
          max-width: 200px;
        ">
          <strong>${d.label}</strong><br/>
          <span style="color: ${d.color};">${getLocationTypeLabel(d.location.type)}</span><br/>
          <small>${d.lat.toFixed(4)}°, ${d.lng.toFixed(4)}°</small>
        </div>
      `)
      .onPointClick((point: any) => {
        onLocationClick(point.location);
      })
      .onPointHover((point: any) => {
        if (point) {
          document.body.style.cursor = 'pointer';
        } else {
          document.body.style.cursor = 'auto';
        }
      });

    // Load and display flight routes
    fetch('/api/flights/routes')
      .then(response => response.json())
      .then(routes => {
        const validRoutes = routes.filter((route: any) => 
          route.from.latitude && route.from.longitude && 
          route.to.latitude && route.to.longitude
        );

        // Add flight paths as arcs
        globeRef.current
          .arcsData(validRoutes)
          .arcStartLat((d: any) => d.from.latitude)
          .arcStartLng((d: any) => d.from.longitude)
          .arcEndLat((d: any) => d.to.latitude)
          .arcEndLng((d: any) => d.to.longitude)
          .arcColor(() => '#ff6b35')
          .arcAltitude(0.3)
          .arcStroke(2)
          .arcDashLength(0.4)
          .arcDashGap(0.2)
          .arcDashAnimateTime(3000)
          .arcLabel((d: any) => `
            <div style="
              background: rgba(0, 0, 0, 0.8); 
              color: white; 
              padding: 8px 12px; 
              border-radius: 6px; 
              font-size: 14px;
              max-width: 250px;
            ">
              <strong>${d.airline} ${d.flightNumber}</strong><br/>
              <span style="color: #ff6b35;">${d.from.name} → ${d.to.name}</span><br/>
              <small>${d.date}</small>
            </div>
          `);
      })
      .catch(error => {
        console.log('Flight routes not available:', error);
      });

    // Focus on current location initially
    const currentLocationPoint = pointsData.find(p => p.location.type === 'current');
    if (currentLocationPoint) {
      globeRef.current.pointOfView({
        lat: currentLocationPoint.lat,
        lng: currentLocationPoint.lng,
        altitude: 2
      }, 1000);
    }
  }, [locations, onLocationClick]);

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
        return '#ef4444'; // Red
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
        return 'Current Location';
      case 'home':
        return 'Home Base';
      case 'visited':
        return 'Visited Location';
      default:
        return 'Location';
    }
  };

  return <div ref={mountRef} className="absolute inset-0" />;
}
