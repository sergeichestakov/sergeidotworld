import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Location } from '@shared/schema';

interface GlobeProps {
  locations: Location[];
  onLocationClick: (location: Location) => void;
}

export default function Globe3D({ locations, onLocationClick }: GlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const earthRef = useRef<THREE.Mesh>();
  const markersRef = useRef<{ location: Location; mesh: THREE.Mesh }[]>([]);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Earth sphere
    const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: createEarthTexture(),
      bumpScale: 0.05,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Position camera
    camera.position.set(0, 0, 15);

    // Store refs
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    earthRef.current = earth;

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !earthRef.current) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };

      earthRef.current.rotation.y += deltaMove.x * 0.01;
      earthRef.current.rotation.x += deltaMove.y * 0.01;

      // Update marker rotations
      markersRef.current.forEach(({ mesh }) => {
        mesh.rotation.y = earthRef.current!.rotation.y;
        mesh.rotation.x = earthRef.current!.rotation.x;
      });

      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
      camera.position.multiplyScalar(zoomFactor);
      camera.position.clampLength(8, 30);
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      if (!isDragging && earthRef.current) {
        earthRef.current.rotation.y += 0.002;
        markersRef.current.forEach(({ mesh }) => {
          mesh.rotation.y = earthRef.current!.rotation.y;
        });
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(({ mesh }) => {
      sceneRef.current!.remove(mesh);
    });
    markersRef.current = [];

    // Add new markers
    locations.forEach(location => {
      const marker = createLocationMarker(location);
      if (marker) {
        sceneRef.current!.add(marker);
        markersRef.current.push({ location, mesh: marker });
      }
    });
  }, [locations]);

  const createEarthTexture = (): THREE.Texture => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const context = canvas.getContext('2d')!;

    // Create a simple blue and green earth texture
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e40af'); // Blue
    gradient.addColorStop(0.3, '#059669'); // Green
    gradient.addColorStop(0.7, '#059669'); // Green
    gradient.addColorStop(1, '#1e40af'); // Blue

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Add some landmass-like patterns
    context.fillStyle = '#065f46';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const width = Math.random() * 100 + 50;
      const height = Math.random() * 50 + 25;
      context.fillRect(x, y, width, height);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  const createLocationMarker = (location: Location): THREE.Mesh | null => {
    const phi = (90 - location.latitude) * (Math.PI / 180);
    const theta = (location.longitude + 180) * (Math.PI / 180);

    const x = -5.1 * Math.sin(phi) * Math.cos(theta);
    const y = 5.1 * Math.cos(phi);
    const z = 5.1 * Math.sin(phi) * Math.sin(theta);

    let color: number;
    let size: number;
    
    switch (location.type) {
      case 'current':
        color = 0xef4444; // Red
        size = 0.15;
        break;
      case 'home':
        color = 0xf59e0b; // Amber
        size = 0.12;
        break;
      case 'visited':
        color = 0x06b6d4; // Cyan
        size = 0.08;
        break;
      default:
        return null;
    }

    const geometry = new THREE.SphereGeometry(size, 8, 8);
    const material = new THREE.MeshBasicMaterial({ 
      color,
      transparent: location.type === 'current',
      opacity: location.type === 'current' ? 0.8 : 1,
    });
    
    const marker = new THREE.Mesh(geometry, material);
    marker.position.set(x, y, z);
    
    // Add click handler
    marker.userData = { location, onClick: () => onLocationClick(location) };

    return marker;
  };

  return <div ref={mountRef} className="absolute inset-0" />;
}
