import { useState, useEffect } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { insertLocationSchema, type Location, type InsertLocation } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import LocationAutocomplete from "./LocationAutocomplete";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

const currentLocationSchema = insertLocationSchema.omit({ type: true });
const addLocationSchema = insertLocationSchema;

export default function AdminDashboard({ isOpen, onClose, embedded = false }: AdminDashboardProps) {
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const { data: currentLocation } = useQuery<Location>({
    queryKey: ["/api/locations/current"],
  });

  const currentLocationForm = useForm<z.infer<typeof currentLocationSchema>>({
    resolver: zodResolver(currentLocationSchema),
    defaultValues: {
      name: "",
      latitude: 0,
      longitude: 0,
      visitDate: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const addLocationForm = useForm<z.infer<typeof addLocationSchema>>({
    resolver: zodResolver(addLocationSchema),
    defaultValues: {
      name: "",
      latitude: 0,
      longitude: 0,
      type: "visited",
      visitDate: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const editLocationForm = useForm<z.infer<typeof addLocationSchema>>({
    resolver: zodResolver(addLocationSchema),
    defaultValues: {
      name: "",
      latitude: 0,
      longitude: 0,
      type: "visited",
      visitDate: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const updateCurrentLocationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof currentLocationSchema>) => {
      const response = await apiRequest("PUT", "/api/locations/current", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Current location updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/locations/current"] });
    },
    onError: () => {
      toast({ title: "Failed to update current location", variant: "destructive" });
    },
  });

  const addLocationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addLocationSchema>) => {
      const response = await apiRequest("POST", "/api/locations", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Location added successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      addLocationForm.reset();
      setShowAddLocation(false);
    },
    onError: () => {
      toast({ title: "Failed to add location", variant: "destructive" });
    },
  });

  const editLocationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addLocationSchema>) => {
      if (!editingLocation) throw new Error("No location selected for editing");
      const response = await apiRequest("PUT", `/api/locations/${editingLocation.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Location updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      editLocationForm.reset();
      setEditingLocation(null);
    },
    onError: () => {
      toast({ title: "Failed to update location", variant: "destructive" });
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertLocation> }) => {
      const response = await apiRequest("PUT", `/api/locations/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Location updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setEditingLocation(null);
    },
    onError: () => {
      toast({ title: "Failed to update location", variant: "destructive" });
    },
  });

  const deleteLocationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/locations/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "Location deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
    },
    onError: () => {
      toast({ title: "Failed to delete location", variant: "destructive" });
    },
  });

  const onUpdateCurrentLocation = (data: z.infer<typeof currentLocationSchema>) => {
    updateCurrentLocationMutation.mutate(data);
  };

  const onAddLocation = (data: z.infer<typeof addLocationSchema>) => {
    addLocationMutation.mutate(data);
  };

  const onEditLocation = (data: z.infer<typeof addLocationSchema>) => {
    editLocationMutation.mutate(data);
  };

  const onDeleteLocation = (id: number) => {
    if (confirm("Are you sure you want to delete this location?")) {
      deleteLocationMutation.mutate(id);
    }
  };

  // Update form when current location changes
  useEffect(() => {
    if (currentLocation) {
      currentLocationForm.reset({
        name: currentLocation.name,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        visitDate: currentLocation.visitDate || new Date().toISOString().split('T')[0],
        notes: currentLocation.notes || "",
      });
    }
  }, [currentLocation]);

  // Populate edit form when a location is selected for editing
  useEffect(() => {
    if (editingLocation) {
      editLocationForm.reset({
        name: editingLocation.name,
        latitude: editingLocation.latitude,
        longitude: editingLocation.longitude,
        type: editingLocation.type,
        visitDate: editingLocation.visitDate || new Date().toISOString().split('T')[0],
        notes: editingLocation.notes || "",
      });
    }
  }, [editingLocation]);

  const content = (
    <div className="space-y-6">
      {/* Update Current Location */}
      <Card className="bg-space-light border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MapPin className="text-red-500 mr-2" size={20} />
            Update Current Location
          </CardTitle>
          <CardDescription className="text-gray-400">
            Set your current location on the globe
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                        <Input {...field} type="date" className="bg-gray-800 border-gray-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={currentLocationForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} placeholder="Add any notes about your current location..." className="bg-gray-800 border-gray-600 text-white placeholder-gray-400" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="bg-red-500 hover:bg-red-600"
                disabled={updateCurrentLocationMutation.isPending}
              >
                {updateCurrentLocationMutation.isPending ? "Updating..." : "Update Current Location"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Visited Locations */}
      <Card className="bg-space-light border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white flex items-center">
                <Plane className="text-cyan-500 mr-2" size={20} />
                Visited Locations
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your travel history
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAddLocation(true)}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              <Plus size={16} className="mr-2" />
              Add Location
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locations.filter(loc => loc.type === 'visited').map(location => (
              <div key={location.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex-1">
                  <h4 className="font-medium text-white">{location.name}</h4>
                  <p className="text-sm text-gray-400">
                    {location.visitDate} • {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </p>
                  {location.notes && (
                    <p className="text-sm text-gray-300 mt-1">{location.notes}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingLocation(location)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteLocation(location.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <>
      {!embedded && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-space-medium border-gray-600">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Location Management</DialogTitle>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      )}
      
      {embedded && content}

      {/* Add Location Dialog - Always render regardless of embedded mode */}
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
                  placeholder="Search for a location..."
                />
              </div>
              
              <FormField
                control={addLocationForm.control}
                name="visitDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Visit Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className="bg-gray-800 border-gray-600 text-white" />
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
                      <Textarea {...field} value={field.value || ""} placeholder="Add any memorable details..." className="bg-gray-800 border-gray-600 text-white placeholder-gray-400" />
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

      {/* Edit Location Dialog */}
      <Dialog open={!!editingLocation} onOpenChange={() => setEditingLocation(null)}>
        <DialogContent className="bg-space-medium border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Edit Location</DialogTitle>
          </DialogHeader>
          
          {editingLocation && (
            <Form {...editLocationForm}>
              <form onSubmit={editLocationForm.handleSubmit(onEditLocation)} className="space-y-4">
                <div>
                  <Label className="text-gray-300">Search Location</Label>
                  <LocationAutocomplete
                    value={editLocationForm.watch("name")}
                    onChange={(location) => {
                      editLocationForm.setValue("name", location.name);
                      editLocationForm.setValue("latitude", location.latitude);
                      editLocationForm.setValue("longitude", location.longitude);
                    }}
                    placeholder="Search for a location..."
                  />
                </div>
                
                <FormField
                  control={editLocationForm.control}
                  name="visitDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Visit Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className="bg-gray-800 border-gray-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editLocationForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} placeholder="Add any memorable details..." className="bg-gray-800 border-gray-600 text-white placeholder-gray-400" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setEditingLocation(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-blue-500 hover:bg-blue-600"
                    disabled={editLocationMutation.isPending}
                  >
                    {editLocationMutation.isPending ? "Updating..." : "Update Location"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}