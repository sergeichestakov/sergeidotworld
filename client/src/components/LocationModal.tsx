import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Location } from "@shared/schema";

interface LocationModalProps {
  location: Location;
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationModal({ location, isOpen, onClose }: LocationModalProps) {
  const formatCoordinates = (lat: number, lng: number) => {
    const latDirection = lat >= 0 ? 'N' : 'S';
    const lngDirection = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDirection}, ${Math.abs(lng).toFixed(4)}° ${lngDirection}`;
  };

  const getLocationTypeLabel = (type: string) => {
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

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'current':
        return 'text-red-500';
      case 'home':
        return 'text-amber-500';
      case 'visited':
        return 'text-cyan-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-space-light/95 backdrop-blur-md border-gray-600/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center justify-between">
            {location.name}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1"
            >
              <X size={20} />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">Type</p>
            <p className={`font-medium ${getLocationTypeColor(location.type)}`}>
              {getLocationTypeLabel(location.type)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-400">Coordinates</p>
            <p className="font-mono text-sm text-white">
              {formatCoordinates(location.latitude, location.longitude)}
            </p>
          </div>
          
          {location.visitDate && (
            <div>
              <p className="text-sm text-gray-400">Visit Date</p>
              <p className="text-white">{location.visitDate}</p>
            </div>
          )}
          
          {location.notes && (
            <div>
              <p className="text-sm text-gray-400">Notes</p>
              <p className="text-sm text-white">{location.notes}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-400">Last Updated</p>
            <p className="text-xs text-gray-500">
              {new Date(location.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
