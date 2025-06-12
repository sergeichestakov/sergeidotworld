import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, MapPin, Plus, Edit2, Trash2, Plane, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertLocationSchema, type Location, type InsertLocation } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import LocationAutocomplete from "./LocationAutocomplete";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const currentLocationSchema = insertLocationSchema.omit({ type: true });
const addLocationSchema = insertLocationSchema;

export default function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
    enabled: isOpen,
  });

  const { data: currentLocation } = useQuery<Location>({
    queryKey: ["/api/locations/current"],
    enabled: isOpen,
  });

  const visitedLocations = locations.filter(loc => loc.type === 'visited');

  // Current location form
  const currentLocationForm = useForm<z.infer<typeof currentLocationSchema>>({
    resolver: zodResolver(currentLocationSchema),
    defaultValues: {
      name: currentLocation?.name || "",
      latitude: currentLocation?.latitude || 0,
      longitude: currentLocation?.longitude || 0,
      visitDate: currentLocation?.visitDate || null,
      notes: currentLocation?.notes || "",
    },
  });

  // Add location form
  const addLocationForm = useForm<z.infer<typeof addLocationSchema>>({
    resolver: zodResolver(addLocationSchema),
    defaultValues: {
      name: "",
      latitude: 0,
      longitude: 0,
      type: "visited",
      visitDate: "",
      notes: "",
    },
  });

  // Update current location mutation
  const updateCurrentLocationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof currentLocationSchema>) => {
      const response = await apiRequest("PUT", "/api/locations/current", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/locations/current"] });
      toast({
        title: "Location Updated",
        description: "Current location has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update current location.",
        variant: "destructive",
      });
    },
  });

  // Add location mutation
  const addLocationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addLocationSchema>) => {
      const response = await apiRequest("POST", "/api/locations", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setShowAddLocation(false);
      addLocationForm.reset();
      toast({
        title: "Location Added",
        description: "New location has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add location.",
        variant: "destructive",
      });
    },
  });

  // Delete location mutation
  const deleteLocationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/locations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({
        title: "Location Deleted",
        description: "Location has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete location.",
        variant: "destructive",
      });
    },
  });

  // Import flight destinations mutation
  const importFlightDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/flights/routes');
      const routes = await response.json();
      
      // Get unique destinations from flight data
      const destinations = new Map();
      routes.forEach((route: any) => {
        if (route.to.latitude && route.to.longitude) {
          const key = `${route.to.code}`;
          if (!destinations.has(key)) {
            destinations.set(key, {
              name: route.to.name || route.to.code,
              latitude: route.to.latitude,
              longitude: route.to.longitude,
              type: "visited",
              visitDate: null,
              notes: `Flight destination: ${route.to.code}`
            });
          }
        }
      });

      // Create locations for each destination
      const promises = Array.from(destinations.values()).map(async dest => {
        const response = await apiRequest("POST", "/api/locations", dest);
        return response.json();
      });
      
      return Promise.all(promises);
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({
        title: "Flight Data Imported",
        description: `Successfully imported ${results.length} flight destinations.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: "Failed to import flight destinations.",
        variant: "destructive",
      });
    },
  });

  const onUpdateCurrentLocation = (data: z.infer<typeof currentLocationSchema>) => {
    updateCurrentLocationMutation.mutate(data);
  };

  const onAddLocation = (data: z.infer<typeof addLocationSchema>) => {
    addLocationMutation.mutate(data);
  };

  const handleDeleteLocation = (id: number) => {
    if (confirm("Are you sure you want to delete this location?")) {
      deleteLocationMutation.mutate(id);
    }
  };

  // Update form when current location changes
  useState(() => {
    if (currentLocation) {
      currentLocationForm.reset({
        name: currentLocation.name,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        visitDate: currentLocation.visitDate,
        notes: currentLocation.notes || "",
      });
    }
  }, [currentLocation]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-space-medium border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Location Management</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Update Current Location */}
            <div className="space-light rounded-xl p-4 border border-gray-700">
              <h3 className="font-semibold mb-4 flex items-center text-white">
                <MapPin className="text-red-500 mr-2" size={20} />
                Update Current Location
              </h3>
              
              <Form {...currentLocationForm}>
                <form onSubmit={currentLocationForm.handleSubmit(onUpdateCurrentLocation)} className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Search Location</Label>
                      <LocationAutocomplete
                        value={currentLocationForm.watch("name")}
                        onChange={(location) => {
                          currentLocationForm.setValue("name", location.name);
                          currentLocationForm.setValue("latitude", location.latitude);
                          currentLocationForm.setValue("longitude", location.longitude);
                        }}
                        placeholder="Search for your current location..."
                      />
                    </div>
                    
                    <FormField
                      control={currentLocationForm.control}
                      name="visitDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Visit Date</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} type="month" className="bg-space-dark border-gray-600 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={currentLocationForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} placeholder="Optional notes..." className="bg-space-dark border-gray-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-red-500 hover:bg-red-600"
                      disabled={updateCurrentLocationMutation.isPending}
                    >
                      {updateCurrentLocationMutation.isPending ? "Updating..." : "Update Location"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            {/* Flight Data Import */}
            <div className="space-light rounded-xl p-4 border border-gray-700">
              <h3 className="font-semibold mb-4 flex items-center text-white">
                <Plane className="text-orange-500 mr-2" size={20} />
                Flight Data
              </h3>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => importFlightDataMutation.mutate()}
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={importFlightDataMutation.isPending}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {importFlightDataMutation.isPending ? "Importing..." : "Import Flight Destinations"}
                </Button>
                <p className="text-sm text-gray-400">
                  Import all flight destinations from your travel history as visited locations
                </p>
              </div>
            </div>

            {/* Visited Locations */}
            <div className="space-light rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center text-white">
                  <MapPin className="text-cyan-500 mr-2" size={20} />
                  Visited Locations
                </h3>
                <Button
                  onClick={() => setShowAddLocation(true)}
                  className="bg-cyan-500 hover:bg-cyan-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {visitedLocations.map((location) => (
                  <div key={location.id} className="bg-space-dark rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{location.name}</h4>
                      <p className="text-sm text-gray-400">
                        {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
                        {location.visitDate && ` • ${location.visitDate}`}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingLocation(location)}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLocation(location.id)}
                        className="text-gray-400 hover:text-red-400 p-1"
                        disabled={deleteLocationMutation.isPending}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {visitedLocations.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No visited locations yet.</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Location Modal */}
      <Dialog open={showAddLocation} onOpenChange={setShowAddLocation}>
        <DialogContent className="bg-space-medium border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Add New Location</DialogTitle>
          </DialogHeader>

          <Form {...addLocationForm}>
            <form onSubmit={addLocationForm.handleSubmit(onAddLocation)} className="space-y-4">
              <div>
                <Label className="text-gray-300">Search Location</Label>
                <LocationAutocomplete
                  value={addLocationForm.watch("name")}
                  onChange={(location) => {
                    addLocationForm.setValue("name", location.name);
                    addLocationForm.setValue("latitude", location.latitude);
                    addLocationForm.setValue("longitude", location.longitude);
                  }}
                  placeholder="Search for a location to add..."
                />
              </div>
              
              <FormField
                control={addLocationForm.control}
                name="visitDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Visit Date</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} type="month" className="bg-space-dark border-gray-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addLocationForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} placeholder="Add any memorable details..." className="bg-space-dark border-gray-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowAddLocation(false)}
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-cyan-500 hover:bg-cyan-600"
                  disabled={addLocationMutation.isPending}
                >
                  {addLocationMutation.isPending ? "Adding..." : "Add Location"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
