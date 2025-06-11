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
      .pointOfView({ lat: 0, lng: 0, altitude: 2.5 })
      // Add country and city labels
      .labelsData([
        // Countries
        { lat: 39.0, lng: 105.0, text: 'CHINA', size: 1.2, type: 'country' },
        { lat: 20.0, lng: 77.0, text: 'INDIA', size: 1.2, type: 'country' },
        { lat: 60.0, lng: 100.0, text: 'RUSSIA', size: 1.2, type: 'country' },
        { lat: 39.0, lng: -98.0, text: 'UNITED STATES', size: 1.2, type: 'country' },
        { lat: -15.0, lng: -55.0, text: 'BRAZIL', size: 1.2, type: 'country' },
        { lat: -25.0, lng: 135.0, text: 'AUSTRALIA', size: 1.2, type: 'country' },
        { lat: 54.0, lng: 15.0, text: 'EUROPE', size: 1.2, type: 'country' },
        { lat: 0.0, lng: 20.0, text: 'AFRICA', size: 1.2, type: 'country' },
        { lat: 36.0, lng: 138.0, text: 'JAPAN', size: 1.0, type: 'country' },
        { lat: 56.0, lng: -106.0, text: 'CANADA', size: 1.2, type: 'country' },
        
        // Major Cities
        { lat: 39.9042, lng: 116.4074, text: 'Beijing', size: 0.7, type: 'city' },
        { lat: 35.6762, lng: 139.6503, text: 'Tokyo', size: 0.7, type: 'city' },
        { lat: 40.7128, lng: -74.0060, text: 'New York', size: 0.7, type: 'city' },
        { lat: 51.5074, lng: -0.1278, text: 'London', size: 0.7, type: 'city' },
        { lat: 48.8566, lng: 2.3522, text: 'Paris', size: 0.7, type: 'city' },
        { lat: 37.7749, lng: -122.4194, text: 'San Francisco', size: 0.7, type: 'city' },
        { lat: -33.8688, lng: 151.2093, text: 'Sydney', size: 0.7, type: 'city' },
        { lat: 25.2048, lng: 55.2708, text: 'Dubai', size: 0.7, type: 'city' },
        { lat: 55.7558, lng: 37.6176, text: 'Moscow', size: 0.7, type: 'city' },
        { lat: -23.5505, lng: -46.6333, text: 'São Paulo', size: 0.7, type: 'city' },
        { lat: 19.0760, lng: 72.8777, text: 'Mumbai', size: 0.7, type: 'city' },
        { lat: 31.2304, lng: 121.4737, text: 'Shanghai', size: 0.7, type: 'city' },
        { lat: 34.0522, lng: -118.2437, text: 'Los Angeles', size: 0.7, type: 'city' },
        { lat: 52.5200, lng: 13.4050, text: 'Berlin', size: 0.7, type: 'city' },
        { lat: 41.9028, lng: 12.4964, text: 'Rome', size: 0.7, type: 'city' },
        { lat: 40.4168, lng: -3.7038, text: 'Madrid', size: 0.7, type: 'city' },
        { lat: -34.6037, lng: -58.3816, text: 'Buenos Aires', size: 0.7, type: 'city' },
        { lat: 1.3521, lng: 103.8198, text: 'Singapore', size: 0.7, type: 'city' },
        { lat: 13.7563, lng: 100.5018, text: 'Bangkok', size: 0.7, type: 'city' }
      ])
      .labelText('text')
      .labelSize('size')
      .labelDotRadius((d: any) => d.type === 'country' ? 0.2 : 0.4)
      .labelColor((d: any) => d.type === 'country' ? '#ffd700' : '#ffffff')
      .labelResolution(2)
      .labelIncludeDot(true)
      .labelAltitude(0.01);

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

  // Update markers when locations change
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
