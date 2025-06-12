import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Shield, Settings, MapPin, Home, Navigation, Plane, Upload, Plus, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import AdminDashboard from "@/components/AdminDashboard";
import type { Location, Setting } from "@shared/schema";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
    enabled: isAuthenticated,
  });

  const { data: settings = [] } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
    enabled: isAuthenticated,
  });

  const authenticateAdmin = async () => {
    setIsLoading(true);
    setAuthError("");
    
    try {
      const response = await apiRequest("POST", "/api/admin/auth", { password });
      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
      } else {
        setAuthError("Invalid password");
      }
    } catch (error) {
      setAuthError("Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest("PUT", `/api/settings/${key}`, { 
        value, 
        password 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authenticateAdmin();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-space-dark text-white flex items-center justify-center">
        <Card className="w-full max-w-md bg-space-light border-gray-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-white" size={32} />
            </div>
            <CardTitle className="text-2xl text-white">Admin Access</CardTitle>
            <CardDescription className="text-gray-400">
              Enter the admin password to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  required
                />
              </div>
              
              {authError && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <Lock className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    {authError}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Access Dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const countriesVisitedSetting = settings.find(s => s.key === 'countries_visited');

  return (
    <div className="min-h-screen bg-space-dark text-white">
      {/* Header */}
      <header className="border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-amber-500 rounded-full flex items-center justify-center">
              <Settings className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-400">Manage locations and settings</p>
            </div>
          </div>
          
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="bg-space-light hover:bg-gray-700 transition-colors border-gray-600 text-white"
          >
            Back to Globe
          </Button>
        </div>
      </header>

      <div className="p-6">
        {/* Settings Section */}
        <Card className="mb-6 bg-space-light border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Settings className="mr-2" size={20} />
              Global Settings
            </CardTitle>
            <CardDescription className="text-gray-400">
              Configure display settings for the globe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label htmlFor="countries-visited" className="text-white min-w-32">
                  Countries Visited:
                </Label>
                <Input
                  id="countries-visited"
                  type="number"
                  min="0"
                  defaultValue={countriesVisitedSetting?.value || "37"}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 w-32"
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value !== countriesVisitedSetting?.value) {
                      updateSettingMutation.mutate({ 
                        key: 'countries_visited', 
                        value 
                      });
                    }
                  }}
                />
                <span className="text-gray-400 text-sm">
                  Manual override for countries count display
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Management */}
        <AdminDashboard 
          isOpen={true} 
          onClose={() => window.location.href = '/'} 
        />
      </div>
    </div>
  );
}