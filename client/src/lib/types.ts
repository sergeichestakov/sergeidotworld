export interface LocationStats {
  totalVisits: number;
  countries: number;
  lastUpdate: string;
}

export interface GlobeControls {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  followCurrentLocation: () => void;
}
