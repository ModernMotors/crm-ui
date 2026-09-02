import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VehicleForm } from "@/components/forms/VehicleForm";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Car,
  ArrowLeft,
  Edit,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  Shield,
  TrendingUp,
  Wrench,
  AlertCircle,
  User,
  MapPin,
  DollarSign,
  Building2,
  FileText,
  History,
  Activity,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MoreVertical,
  Download,
  Printer,
  Share2,
  Star,
  Zap,
  Truck,
} from "lucide-react";

export const Route = createFileRoute("/vehicles/$vehicleId")({
  component: VehicleDetailsPage,
});

function VehicleDetailsPage() {
  const { vehicleId } = Route.useParams();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch vehicle details from API
  const { data: vehicle, isLoading, error, refetch } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => apiClient.getVehicle(vehicleId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-12 text-center">
            <Car className="h-16 w-16 mx-auto mb-4 text-gray-300 animate-pulse" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading vehicle details...</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-12 text-center">
            <Car className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Vehicle not found</h3>
            <p className="text-gray-500 mb-4">
              The vehicle you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/vehicles">
              <Button className="button-press">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Vehicles
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700 border-green-200";
      case "in_service":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "maintenance":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "reserved":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "sold":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "out_of_service":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getFuelIcon = (fuelType: string) => {
    switch (fuelType) {
      case "Petrol":
        return <Fuel className="h-4 w-4" />;
      case "Diesel":
        return <Truck className="h-4 w-4" />;
      case "Hybrid":
        return <Zap className="h-4 w-4" />;
      case "Electric":
        return <Zap className="h-4 w-4" />;
      default:
        return <Fuel className="h-4 w-4" />;
    }
  };

  const isWarrantyActive = vehicle.insurance_expiry ? new Date(vehicle.insurance_expiry) > new Date() : false;
  const isRegistrationValid = vehicle.registration_expiry ? new Date(vehicle.registration_expiry) > new Date() : false;
  const isInsuranceValid = vehicle.insurance_expiry ? new Date(vehicle.insurance_expiry) > new Date() : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-8 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link to="/vehicles">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Vehicles
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-white text-primary hover:bg-white/90">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Vehicle</DialogTitle>
                  </DialogHeader>
                  <VehicleForm
                    initialData={vehicle}
                    onSuccess={() => {
                      setIsEditDialogOpen(false);
                      refetch();
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Car className="h-8 w-8" />
                {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-white/90 text-lg">
                {vehicle.license_plate} • {vehicle.vin || 'N/A'}
              </p>
            </div>
            <Badge className={cn("text-lg px-4 py-2", getStatusColor(vehicle.status))}>
              {vehicle.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4 card-stagger">
          <Card className="bg-white/95 backdrop-blur-sm hover-lift transition-all button-press shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Gauge className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Mileage</p>
                  <p className="text-lg font-bold text-gray-900">{vehicle.mileage?.toLocaleString() || 0} km</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm hover-lift transition-all button-press shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Insurance</p>
                  <p className="text-lg font-bold text-gray-900">
                    {isInsuranceValid ? "Active" : "Expired"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm hover-lift transition-all button-press shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Registration</p>
                  <p className="text-lg font-bold text-gray-900">
                    {isRegistrationValid ? "Valid" : "Expired"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm hover-lift transition-all button-press shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estimated Value</p>
                  <p className="text-lg font-bold text-gray-900">
                    EGP {vehicle.estimated_value?.toLocaleString() || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Vehicle Info */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="bg-white/95 backdrop-blur-sm shadow-lg">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="specifications" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Specifications
                </TabsTrigger>
                <TabsTrigger value="service" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Service History
                </TabsTrigger>
                <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Documents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Vehicle Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Make</p>
                        <p className="font-semibold text-gray-900">{vehicle.make}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Model</p>
                        <p className="font-semibold text-gray-900">{vehicle.model}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Category</p>
                        <p className="font-semibold text-gray-900">{vehicle.category || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Year</p>
                        <p className="font-semibold text-gray-900">{vehicle.year}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Color</p>
                        <p className="font-semibold text-gray-900">{vehicle.color || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">VIN</p>
                        <p className="font-mono text-sm text-gray-900">{vehicle.vin || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">License Plate</p>
                        <p className="font-semibold text-gray-900">{vehicle.license_plate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Branch</p>
                        <p className="font-semibold text-gray-900">{vehicle.branch?.name || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Purchase & Warranty</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Purchase Date</p>
                        <p className="font-semibold text-gray-900">
                          {vehicle.purchase_date ? new Date(vehicle.purchase_date).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Purchase Price</p>
                        <p className="font-semibold text-gray-900">
                          {vehicle.purchase_price ? `EGP ${vehicle.purchase_price.toLocaleString()}` : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Registration Expiry</p>
                        <p className="font-semibold text-gray-900">
                          {vehicle.registration_expiry ? new Date(vehicle.registration_expiry).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Insurance Expiry</p>
                        <p className="font-semibold text-gray-900">
                          {vehicle.insurance_expiry ? new Date(vehicle.insurance_expiry).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Last Service</p>
                        <p className="font-semibold text-gray-900">
                          {vehicle.last_service_date ? new Date(vehicle.last_service_date).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Next Service</p>
                        <p className="font-semibold text-gray-900">
                          {vehicle.next_service_date ? new Date(vehicle.next_service_date).toLocaleDateString() : "—"}
                        </p>
                      </div>
                    </div>
                    {vehicle.description && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Description</p>
                        <p className="text-gray-900">{vehicle.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specifications" className="space-y-4">
                <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Technical Specifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {getFuelIcon(vehicle.fuel_type)}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Fuel Type</p>
                          <p className="font-semibold text-gray-900">{vehicle.fuel_type || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Settings className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Transmission</p>
                          <p className="font-semibold text-gray-900">{vehicle.transmission || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="p-2 rounded-lg bg-green-100">
                          <Gauge className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Current Mileage</p>
                          <p className="font-semibold text-gray-900">{vehicle.mileage?.toLocaleString() || 0} km</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Insurance Status</p>
                          <p className="font-semibold text-gray-900">
                            {isInsuranceValid ? "Active" : "Expired"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {vehicle.features && vehicle.features.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 mb-3">Accessories & Features</p>
                        <div className="flex flex-wrap gap-2">
                          {vehicle.features.map((feature: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-white">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="service" className="space-y-4">
                <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Service History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <Wrench className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No service history recorded</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Vehicle Documents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Registration Certificate</p>
                          <p className="text-xs text-gray-500">Valid until {vehicle.registration_expiry ? new Date(vehicle.registration_expiry).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Insurance Policy</p>
                          <p className="text-xs text-gray-500">
                            Valid until {vehicle.insurance_expiry ? new Date(vehicle.insurance_expiry).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Owner & Actions */}
          <div className="space-y-6">
            {/* Owner Card */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Owner Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {owner ? (
                  <>
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                      <div className="p-3 rounded-full bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{owner.name}</p>
                        <p className="text-sm text-gray-500">{owner.type}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{owner.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{owner.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{owner.company || "—"}</span>
                      </div>
                    </div>
                    <Link to={`/contacts/${owner.id}`}>
                      <Button variant="outline" size="sm" className="w-full hover-lift">
                        View Owner Profile
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">No owner assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Branch Card */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Branch Location</CardTitle>
              </CardHeader>
              <CardContent>
                {branch ? (
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{branch.name}</p>
                      <p className="text-sm text-gray-500">{branch.city}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No branch assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start hover-lift">
                  <Wrench className="mr-2 h-4 w-4" />
                  Schedule Service
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start hover-lift">
                  <Shield className="mr-2 h-4 w-4" />
                  Check Warranty
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start hover-lift">
                  <FileText className="mr-2 h-4 w-4" />
                  Request Inspection
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start hover-lift">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Details
                </Button>
              </CardContent>
            </Card>

            {/* Service Due Alert */}
            {vehicle.nextServiceDue && (
              <Card className="bg-orange-50 backdrop-blur-sm border-orange-200 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-900">Service Due</p>
                      <p className="text-sm text-orange-700">
                        Next service scheduled for {new Date(vehicle.nextServiceDue).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
