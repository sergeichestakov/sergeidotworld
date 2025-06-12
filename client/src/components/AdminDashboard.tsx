import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Upload } from "lucide-react";
import LocationAutocomplete from "./LocationAutocomplete";
import { insertLocationSchema, type Location, type InsertLocation, type Setting } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const { data: currentLocation } = useQuery<Location>({
    queryKey: ["/api/locations/current"],
  });

  const { data: settings = [] } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  const currentLocationForm = useForm({
    resolver: zodResolver(currentLocationSchema),
    defaultValues: {
      name: currentLocation?.name || "",
      latitude: currentLocation?.latitude || 0,
      longitude: currentLocation?.longitude || 0,
      visitDate: currentLocation?.visitDate || null,
      notes: currentLocation?.notes || "",
    },
  });

  const addLocationForm = useForm({
    resolver: zodResolver(addLocationSchema),
    defaultValues: {
      name: "",
      type: "visited" as const,
      latitude: 0,
      longitude: 0,
      visitDate: null,
      notes: "",
    },
  });

  const editLocationForm = useForm({
    resolver: zodResolver(addLocationSchema),
    defaultValues: {
      name: "",
      type: "visited" as const,
      latitude: 0,
      longitude: 0,
      visitDate: null,
      notes: "",
    },
  });

  useEffect(() => {
    if (currentLocation) {
      currentLocationForm.reset({
        name: currentLocation.name,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        visitDate: currentLocation.visitDate,
        notes: currentLocation.notes || "",
      });
    }
  }, [currentLocation, currentLocationForm]);

  useEffect(() => {
    if (editingLocation) {
      editLocationForm.reset({
        name: editingLocation.name,
        type: editingLocation.type,
        latitude: editingLocation.latitude,
        longitude: editingLocation.longitude,
        visitDate: editingLocation.visitDate,
        notes: editingLocation.notes || "",
      });
    }
  }, [editingLocation, editLocationForm]);

  const updateCurrentLocationMutation = useMutation({
    mutationFn: async (data: Omit<InsertLocation, 'type'>) => {
      return await apiRequest('/api/locations/current', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/locations/current"] });
      toast({ title: "Current location updated successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating current location", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const addLocationMutation = useMutation({
    mutationFn: async (data: InsertLocation) => {
      return await apiRequest('/api/locations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setShowAddLocation(false);
      addLocationForm.reset();
      toast({ title: "Location added successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error adding location", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertLocation> }) => {
      return await apiRequest(`/api/locations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setEditingLocation(null);
      toast({ title: "Location updated successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating location", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteLocationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/locations/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({ title: "Location deleted successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting location", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const uploadFlightsMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('csvFile', file);
      
      const response = await fetch('/api/flights/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({ 
        title: "Flight data uploaded successfully!", 
        description: `Imported ${data.imported} destinations from ${data.total} flights` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error uploading flight data", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const onUpdateCurrentLocation = (data: Omit<InsertLocation, 'type'>) => {
    updateCurrentLocationMutation.mutate(data);
  };

  const onAddLocation = (data: InsertLocation) => {
    addLocationMutation.mutate(data);
  };

  const onEditLocation = (data: InsertLocation) => {
    if (editingLocation) {
      updateLocationMutation.mutate({ id: editingLocation.id, data });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      uploadFlightsMutation.mutate(file);
    } else {
      toast({ 
        title: "Invalid file type", 
        description: "Please select a CSV file",
        variant: "destructive"
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const visitedLocations = locations.filter(loc => loc.type === 'visited');
  const wishlistLocations = locations.filter(loc => loc.type === 'wishlist');

  const content = (
    <div className="space-y-6">
      {/* Current Location */}
      <Card className="bg-space-medium border-gray-600">
        <CardHeader>
          <CardTitle className="text-white">Current Location</CardTitle>
          <CardDescription className="text-gray-400">
            Update your current position
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...currentLocationForm}>
            <form onSubmit={currentLocationForm.handleSubmit(onUpdateCurrentLocation)} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-200">Location Name</Label>
                <FormField
                  control={currentLocationForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <LocationAutocomplete
                          value={field.value}
                          onChange={(location) => {
                            field.onChange(location.name);
                            currentLocationForm.setValue('latitude', location.latitude);
                            currentLocationForm.setValue('longitude', location.longitude);
                          }}
                          placeholder="Enter current location"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium text-gray-200">Notes</Label>
                <FormField
                  control={currentLocationForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Optional notes about current location"
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={updateCurrentLocationMutation.isPending}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                {updateCurrentLocationMutation.isPending ? 'Updating...' : 'Update Current Location'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Flight Data Upload */}
      <Card className="bg-space-medium border-gray-600">
        <CardHeader>
          <CardTitle className="text-white">Flight Data Upload</CardTitle>
          <CardDescription className="text-gray-400">
            Upload a CSV file with flight data to update routes and visited destinations
          </CardDescription>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadFlightsMutation.isPending}
            className="bg-blue-500 hover:bg-blue-600 w-fit"
          >
            <Upload size={16} className="mr-2" />
            {uploadFlightsMutation.isPending ? 'Uploading...' : 'Upload CSV'}
          </Button>
        </CardHeader>
      </Card>

      {/* Travel History */}
      <Card className="bg-space-medium border-gray-600">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white">Travel History</CardTitle>
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
            {visitedLocations.length > 0 ? (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Visited Locations</h4>
                <div className="grid gap-3">
                  {visitedLocations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <h5 className="font-medium text-white">{location.name}</h5>
                        {location.visitDate && (
                          <p className="text-sm text-gray-400">Visited: {location.visitDate}</p>
                        )}
                        {location.notes && (
                          <p className="text-sm text-gray-300 mt-1">{location.notes}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingLocation(location)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-600"
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteLocationMutation.mutate(location.id)}
                          disabled={deleteLocationMutation.isPending}
                          className="border-red-600 text-red-400 hover:bg-red-900"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No visited locations yet.</p>
            )}

            {wishlistLocations.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Wishlist</h4>
                <div className="grid gap-3">
                  {wishlistLocations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <h5 className="font-medium text-white">{location.name}</h5>
                        {location.notes && (
                          <p className="text-sm text-gray-300 mt-1">{location.notes}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingLocation(location)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-600"
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteLocationMutation.mutate(location.id)}
                          disabled={deleteLocationMutation.isPending}
                          className="border-red-600 text-red-400 hover:bg-red-900"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="bg-space-medium border-gray-600">
        <CardHeader>
          <CardTitle className="text-white">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-cyan-400">{visitedLocations.length}</p>
              <p className="text-sm text-gray-400">Visited</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{settings.find(s => s.key === 'countries_visited')?.value || '0'}</p>
              <p className="text-sm text-gray-400">Countries</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!embedded) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-space-dark border-gray-600 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Admin Dashboard</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {embedded && content}

      {/* Add Location Modal */}
      {showAddLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Add New Location</h2>
              <button onClick={() => setShowAddLocation(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            
            <Form {...addLocationForm}>
              <form onSubmit={addLocationForm.handleSubmit(onAddLocation)} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-200">Location Name</Label>
                  <FormField
                    control={addLocationForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <LocationAutocomplete
                            value={field.value}
                            onChange={(location) => {
                              field.onChange(location.name);
                              addLocationForm.setValue('latitude', location.latitude);
                              addLocationForm.setValue('longitude', location.longitude);
                            }}
                            placeholder="Enter location name"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-sm font-medium text-gray-200">Type</Label>
                  <FormField
                    control={addLocationForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Select location type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="visited" className="text-white">Visited</SelectItem>
                            <SelectItem value="wishlist" className="text-white">Wishlist</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="visitDate" className="text-sm font-medium text-gray-200">Visit Date</Label>
                  <FormField
                    control={addLocationForm.control}
                    name="visitDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="date"
                            className="bg-gray-700 border-gray-600 text-white"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-200">Notes</Label>
                  <FormField
                    control={addLocationForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Optional notes about this location"
                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddLocation(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addLocationMutation.isPending}
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    {addLocationMutation.isPending ? 'Adding...' : 'Add Location'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      {editingLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Edit Location</h2>
              <button onClick={() => setEditingLocation(null)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            
            <Form {...editLocationForm}>
              <form onSubmit={editLocationForm.handleSubmit(onEditLocation)} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-200">Location Name</Label>
                  <FormField
                    control={editLocationForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <LocationAutocomplete
                            value={field.value}
                            onChange={(location) => {
                              field.onChange(location.name);
                              editLocationForm.setValue('latitude', location.latitude);
                              editLocationForm.setValue('longitude', location.longitude);
                            }}
                            placeholder="Enter location name"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-sm font-medium text-gray-200">Type</Label>
                  <FormField
                    control={editLocationForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Select location type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="visited" className="text-white">Visited</SelectItem>
                            <SelectItem value="wishlist" className="text-white">Wishlist</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="visitDate" className="text-sm font-medium text-gray-200">Visit Date</Label>
                  <FormField
                    control={editLocationForm.control}
                    name="visitDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="date"
                            className="bg-gray-700 border-gray-600 text-white"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-200">Notes</Label>
                  <FormField
                    control={editLocationForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Optional notes about this location"
                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingLocation(null)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateLocationMutation.isPending}
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    {updateLocationMutation.isPending ? 'Updating...' : 'Update Location'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </>
  );
}