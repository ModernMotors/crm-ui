import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Building2,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { warrantyPackagesApi, companiesApi } from '@/lib/api';
import { toCamelCase, toSnakeCase } from '@/lib/case-conversion';

export const Route = createFileRoute('/settings/warranty-packages')({
  component: WarrantyPackagesPage,
});

function WarrantyPackagesPage() {
  const [warrantyPackages, setWarrantyPackages] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('all');

  // Dialog states
  const [warrantyDialogOpen, setWarrantyDialogOpen] = useState(false);
  const [editingWarranty, setEditingWarranty] = useState<any>(null);
  const [warrantyForm, setWarrantyForm] = useState({
    companyId: '',
    vehicleType: 'Sedan',
    vehicleModel: '',
    modelYear: new Date().getFullYear(),
    warrantyName: '',
    warrantyDescription: '',
    warrantyPeriod: 36,
    warrantyPeriodText: '3 Years',
    kilometerFrom: 0,
    kilometerTo: 100000,
    warrantyCoverage: '',
    exclusions: '',
    additionalNotes: '',
    isActive: true,
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [warrantyRes, companiesRes] = await Promise.all([
          warrantyPackagesApi.getAll(),
          companiesApi.getAll(),
        ]);
        const warrantyArray = Array.isArray(warrantyRes.data) ? warrantyRes.data : Array.isArray(warrantyRes) ? warrantyRes : [];
        const companiesArray = Array.isArray(companiesRes.data) ? companiesRes.data : Array.isArray(companiesRes) ? companiesRes : [];
        setWarrantyPackages(warrantyArray.map((w: any) => toCamelCase(w)));
        setCompanies(companiesArray.map((c: any) => toCamelCase(c)));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredWarrantyPackages = useMemo(() => {
    return warrantyPackages.filter(
      (w) => selectedCompany === 'all' || w.companyId === selectedCompany
    );
  }, [selectedCompany, warrantyPackages]);

  const handleAddWarranty = () => {
    setEditingWarranty(null);
    setWarrantyForm({
      companyId: '',
      vehicleType: 'Sedan',
      vehicleModel: '',
      modelYear: new Date().getFullYear(),
      warrantyName: '',
      warrantyDescription: '',
      warrantyPeriod: 36,
      warrantyPeriodText: '3 Years',
      kilometerFrom: 0,
      kilometerTo: 100000,
      warrantyCoverage: '',
      exclusions: '',
      additionalNotes: '',
      isActive: true,
    });
    setWarrantyDialogOpen(true);
  };

  const handleEditWarranty = (warranty: any) => {
    setEditingWarranty(warranty);
    setWarrantyForm({
      companyId: warranty.companyId,
      vehicleType: warranty.vehicleType,
      vehicleModel: warranty.vehicleModel,
      modelYear: warranty.modelYear,
      warrantyName: warranty.warrantyName,
      warrantyDescription: warranty.warrantyDescription,
      warrantyPeriod: warranty.warrantyPeriod,
      warrantyPeriodText: warranty.warrantyPeriodText,
      kilometerFrom: warranty.kilometerRange?.from || 0,
      kilometerTo: warranty.kilometerRange?.to || 100000,
      warrantyCoverage: warranty.warrantyCoverage?.join(', ') || '',
      exclusions: warranty.exclusions?.join(', ') || '',
      additionalNotes: warranty.additionalNotes,
      isActive: warranty.isActive,
    });
    setWarrantyDialogOpen(true);
  };

  const handleSaveWarranty = async () => {
    try {
      const warrantyData = {
        ...warrantyForm,
        kilometerRange: {
          from: warrantyForm.kilometerFrom,
          to: warrantyForm.kilometerTo,
        },
        warrantyCoverage: warrantyForm.warrantyCoverage
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean),
        exclusions: warrantyForm.exclusions
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean),
      };
      const snakeCaseData = toSnakeCase(warrantyData);

      if (editingWarranty) {
        await warrantyPackagesApi.update(editingWarranty.id, snakeCaseData);
        toast.success('Warranty package updated successfully');
        setWarrantyPackages((prev) =>
          prev.map((w) =>
            w.id === editingWarranty.id ? { ...w, ...snakeCaseData } : w
          )
        );
      } else {
        const result = await warrantyPackagesApi.create(snakeCaseData);
        toast.success('Warranty package added successfully');
        const convertedResult = toCamelCase(result.data || result);
        setWarrantyPackages((prev) => [...prev, convertedResult]);
      }
      setWarrantyDialogOpen(false);
    } catch (error) {
      console.error('Error saving warranty package:', error);
      toast.error('Failed to save warranty package');
    }
  };

  const handleDeleteWarranty = async (warrantyId: string) => {
    try {
      await warrantyPackagesApi.delete(warrantyId);
      setWarrantyPackages((prev) => prev.filter((w) => w.id !== warrantyId));
      toast.success('Warranty package deleted successfully');
    } catch (error) {
      console.error('Error deleting warranty package:', error);
      toast.error('Failed to delete warranty package');
    }
  };

  const companyName = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    return company?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Warranty Packages</h1>
          <p className="text-muted-foreground">
            Manage vehicle warranty packages by company, vehicle type, and model
          </p>
        </div>
        <Button className="hover-lift button-press" onClick={handleAddWarranty}>
          <Plus className="mr-2 h-4 w-4" /> Add Warranty Package
        </Button>
      </div>

      <Card className="glass-card">
        <CardContent className="space-y-6 pt-6">
          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Warranty Packages Grid */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <p>Loading warranty packages...</p>
            </div>
          ) : filteredWarrantyPackages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No warranty packages found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredWarrantyPackages.map((warranty) => (
                <Card
                  key={warranty.id}
                  className="hover-lift transition-all border-l-4 border-l-primary"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {warranty.warrantyName}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {companyName(warranty.companyId)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={warranty.isActive ? 'default' : 'secondary'}>
                        {warranty.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Vehicle Type:</span>
                      <Badge variant="outline">{warranty.vehicleType}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium">{warranty.vehicleModel}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Year:</span>
                      <span className="font-medium">{warranty.modelYear}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Warranty Period:</span>
                      <span className="font-medium">
                        {warranty.warrantyPeriodText}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Kilometer Range:</span>
                      <span className="font-medium">
                        {warranty.kilometerRange?.from?.toLocaleString()} -{' '}
                        {warranty.kilometerRange?.to?.toLocaleString()} km
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600 mb-2 font-medium">
                        Coverage:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {warranty.warrantyCoverage?.slice(0, 3).map((coverage: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {coverage}
                          </Badge>
                        ))}
                        {warranty.warrantyCoverage?.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{warranty.warrantyCoverage.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 hover-lift"
                        onClick={() => handleEditWarranty(warranty)}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover-lift text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteWarranty(warranty.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warranty Package Dialog */}
      <Dialog open={warrantyDialogOpen} onOpenChange={setWarrantyDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWarranty ? 'Edit Warranty Package' : 'Add New Warranty Package'}
            </DialogTitle>
            <DialogDescription>
              {editingWarranty
                ? 'Update warranty package details'
                : 'Create a new warranty package for vehicles'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Company and Vehicle Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company & Vehicle Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warranty-company">Company</Label>
                  <Select
                    value={warrantyForm.companyId}
                    onValueChange={(value) =>
                      setWarrantyForm({ ...warrantyForm, companyId: value })
                    }
                  >
                    <SelectTrigger id="warranty-company">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warranty-vehicle-type">Vehicle Type</Label>
                  <Select
                    value={warrantyForm.vehicleType}
                    onValueChange={(value) =>
                      setWarrantyForm({ ...warrantyForm, vehicleType: value as any })
                    }
                  >
                    <SelectTrigger id="warranty-vehicle-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Hatchback">Hatchback</SelectItem>
                      <SelectItem value="Pickup">Pickup</SelectItem>
                      <SelectItem value="Van">Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warranty-model">Vehicle Model</Label>
                  <Input
                    id="warranty-model"
                    value={warrantyForm.vehicleModel}
                    onChange={(e) =>
                      setWarrantyForm({
                        ...warrantyForm,
                        vehicleModel: e.target.value,
                      })
                    }
                    placeholder="e.g., Swift GL, Vitara"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warranty-year">Model Year</Label>
                  <Input
                    id="warranty-year"
                    type="number"
                    value={warrantyForm.modelYear}
                    onChange={(e) =>
                      setWarrantyForm({
                        ...warrantyForm,
                        modelYear: parseInt(e.target.value),
                      })
                    }
                    placeholder="e.g., 2024"
                  />
                </div>
              </div>
            </div>

            {/* Warranty Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Warranty Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warranty-name">Warranty Name</Label>
                  <Input
                    id="warranty-name"
                    value={warrantyForm.warrantyName}
                    onChange={(e) =>
                      setWarrantyForm({
                        ...warrantyForm,
                        warrantyName: e.target.value,
                      })
                    }
                    placeholder="e.g., Standard Factory Warranty"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warranty-period">Warranty Period (Months)</Label>
                  <Input
                    id="warranty-period"
                    type="number"
                    value={warrantyForm.warrantyPeriod}
                    onChange={(e) =>
                      setWarrantyForm({
                        ...warrantyForm,
                        warrantyPeriod: parseInt(e.target.value),
                      })
                    }
                    placeholder="e.g., 36"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="warranty-description">Warranty Description</Label>
                  <Textarea
                    id="warranty-description"
                    value={warrantyForm.warrantyDescription}
                    onChange={(e) =>
                      setWarrantyForm({
                        ...warrantyForm,
                        warrantyDescription: e.target.value,
                      })
                    }
                    placeholder="Describe the warranty coverage"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Kilometer Range */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Kilometer Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warranty-km-from">Kilometer From</Label>
                  <Input
                    id="warranty-km-from"
                    type="number"
                    value={warrantyForm.kilometerFrom}
                    onChange={(e) =>
                      setWarrantyForm({
                        ...warrantyForm,
                        kilometerFrom: parseInt(e.target.value),
                      })
                    }
                    placeholder="e.g., 0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warranty-km-to">Kilometer To</Label>
                  <Input
                    id="warranty-km-to"
                    type="number"
                    value={warrantyForm.kilometerTo}
                    onChange={(e) =>
                      setWarrantyForm({
                        ...warrantyForm,
                        kilometerTo: parseInt(e.target.value),
                      })
                    }
                    placeholder="e.g., 100000"
                  />
                </div>
              </div>
            </div>

            {/* Coverage and Exclusions */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Coverage & Exclusions</h3>
              <div className="space-y-2">
                <Label htmlFor="warranty-coverage">
                  Warranty Coverage (comma separated)
                </Label>
                <Textarea
                  id="warranty-coverage"
                  value={warrantyForm.warrantyCoverage}
                  onChange={(e) =>
                    setWarrantyForm({
                      ...warrantyForm,
                      warrantyCoverage: e.target.value,
                    })
                  }
                  placeholder="e.g., Engine, Transmission, Electrical System, Suspension"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warranty-exclusions">
                  Exclusions (comma separated)
                </Label>
                <Textarea
                  id="warranty-exclusions"
                  value={warrantyForm.exclusions}
                  onChange={(e) =>
                    setWarrantyForm({
                      ...warrantyForm,
                      exclusions: e.target.value,
                    })
                  }
                  placeholder="e.g., Wear and tear, Normal maintenance, Accidental damage"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warranty-notes">Additional Notes</Label>
                <Textarea
                  id="warranty-notes"
                  value={warrantyForm.additionalNotes}
                  onChange={(e) =>
                    setWarrantyForm({
                      ...warrantyForm,
                      additionalNotes: e.target.value,
                    })
                  }
                  placeholder="Any additional terms or conditions"
                  rows={2}
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="warranty-active"
                checked={warrantyForm.isActive}
                onCheckedChange={(checked) =>
                  setWarrantyForm({ ...warrantyForm, isActive: checked as boolean })
                }
              />
              <Label htmlFor="warranty-active" className="cursor-pointer">
                Active warranty package
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setWarrantyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveWarranty}>
              {editingWarranty ? 'Update Warranty Package' : 'Add Warranty Package'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
