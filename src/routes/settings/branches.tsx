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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Building2,
  MapPin,
  Phone,
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  List,
  Grid3x3,
  SortAsc,
  SortDesc,
  ChevronRight,
  MoreVertical,
  Wrench,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { branchesApi, companiesApi } from '@/lib/api';
import { toCamelCase, toSnakeCase } from '@/lib/case-conversion';

export const Route = createFileRoute('/settings/branches')({
  component: BranchesPage,
});

function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Dialog states
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [branchForm, setBranchForm] = useState({
    name: '',
    nameAr: '',
    code: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    manager: '',
    managerPhone: '',
    managerEmail: '',
    workingHours: '',
    branchType: 'showroom',
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [branchesRes, companiesRes] = await Promise.all([
          branchesApi.getAll(),
          companiesApi.getAll(),
        ]);
        
        // Handle branches response
        let branchesArray = [];
        if (branchesRes?.success && Array.isArray(branchesRes.data)) {
          branchesArray = branchesRes.data;
        } else if (Array.isArray(branchesRes)) {
          branchesArray = branchesRes;
        } else if (Array.isArray(branchesRes?.data)) {
          branchesArray = branchesRes.data;
        }
        
        // Handle companies response
        let companiesArray = [];
        if (companiesRes?.success && Array.isArray(companiesRes.data)) {
          companiesArray = companiesRes.data;
        } else if (Array.isArray(companiesRes)) {
          companiesArray = companiesRes;
        } else if (Array.isArray(companiesRes?.data)) {
          companiesArray = companiesRes.data;
        }
        
        // Convert and map branch data to match frontend expectations
        const mappedBranches = branchesArray.map((b: any) => {
          const camelCase = toCamelCase(b);
          const managerName = camelCase.manager ? 
            `${camelCase.manager.firstName || ''} ${camelCase.manager.lastName || ''}`.trim() : '';
          
          return {
            ...camelCase,
            // Map backend fields to frontend expectations
            nameAr: camelCase.nameAr || camelCase.name || '',
            companyId: camelCase.company?.id || camelCase.companyId || null,
            isMainBranch: camelCase.isMainBranch || false,
            isActive: camelCase.status === 'active',
            branchType: camelCase.branchType || 'showroom',
            manager: managerName || camelCase.managerName || '',
            managerPhone: camelCase.manager?.phone || camelCase.phone || '',
            managerEmail: camelCase.manager?.email || camelCase.email || '',
            workingHours: camelCase.workingHours || camelCase.openingHours || '',
          };
        });
        
        const mappedCompanies = companiesArray.map((c: any) => toCamelCase(c));
        
        setBranches(mappedBranches);
        setCompanies(mappedCompanies);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBranches = useMemo(() => {
    return branches
      .filter(
        (b) => {
          const searchString = (
            (b.name || '') + 
            (b.nameAr || '') + 
            (b.code || '') + 
            (b.city || '') + 
            (b.manager || '')
          ).toLowerCase();
          return searchString.includes(q.toLowerCase()) &&
                 (selectedCompany === 'all' || b.companyId === selectedCompany);
        }
      )
      .sort((a, b) => {
        const comparison = (a.name || '').localeCompare(b.name || '');
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [q, selectedCompany, branches, sortOrder]);

  const handleAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      name: '',
      nameAr: '',
      code: '',
      city: '',
      address: '',
      phone: '',
      email: '',
      manager: '',
      managerPhone: '',
      managerEmail: '',
      workingHours: '',
      branchType: 'showroom',
    });
    setBranchDialogOpen(true);
  };

  const handleEditBranch = (branch: any) => {
    setEditingBranch(branch);
    setBranchForm({
      name: branch.name,
      nameAr: branch.nameAr,
      code: branch.code,
      city: branch.city,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      manager: branch.manager,
      managerPhone: branch.managerPhone,
      managerEmail: branch.managerEmail,
      workingHours: branch.workingHours,
      branchType: branch.branchType,
    });
    setBranchDialogOpen(true);
  };

  const handleSaveBranch = async () => {
    try {
      const snakeCaseForm = toSnakeCase(branchForm);
      if (editingBranch) {
        await branchesApi.update(editingBranch.id, snakeCaseForm);
        toast.success('Branch updated successfully');
        setBranches((prev) =>
          prev.map((b) =>
            b.id === editingBranch.id ? { ...b, ...toCamelCase(snakeCaseForm) } : b
          )
        );
      } else {
        const result = await branchesApi.create(snakeCaseForm);
        toast.success('Branch added successfully');
        const convertedResult = toCamelCase(result.data || result);
        // Apply the same mapping as in fetchData
        const managerName = convertedResult.manager ? 
          `${convertedResult.manager.firstName || ''} ${convertedResult.manager.lastName || ''}`.trim() : '';
        
        const mappedResult = {
          ...convertedResult,
          nameAr: convertedResult.nameAr || convertedResult.name || '',
          companyId: convertedResult.company?.id || convertedResult.companyId || null,
          isMainBranch: convertedResult.isMainBranch || false,
          isActive: convertedResult.status === 'active',
          branchType: convertedResult.branchType || 'showroom',
          manager: managerName || convertedResult.managerName || '',
          managerPhone: convertedResult.manager?.phone || convertedResult.phone || '',
          managerEmail: convertedResult.manager?.email || convertedResult.email || '',
          workingHours: convertedResult.workingHours || convertedResult.openingHours || '',
        };
        setBranches((prev) => [...prev, mappedResult]);
      }
      setBranchDialogOpen(false);
    } catch (error) {
      console.error('Error saving branch:', error);
      toast.error('Failed to save branch');
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    try {
      await branchesApi.delete(branchId);
      setBranches((prev) => prev.filter((b) => b.id !== branchId));
      toast.success('Branch deleted successfully');
    } catch (error) {
      console.error('Error deleting branch:', error);
      toast.error('Failed to delete branch');
    }
  };

  const companyName = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    return company?.name || 'No Company';
  };

  const getBranchStations = (branchId: string) => {
    // This would need to be implemented based on your station data
    return 0;
  };

  const getBranchUsers = (branchId: string) => {
    // This would need to be implemented based on your user data
    return 0;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Active: 'bg-green-500/20 text-green-700',
      Inactive: 'bg-gray-500/20 text-gray-700',
      Suspended: 'bg-red-500/20 text-red-700',
      active: 'bg-green-500/20 text-green-700',
      inactive: 'bg-gray-500/20 text-gray-700',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Branches Management</h1>
          <p className="text-muted-foreground">
            Manage branch locations and operational settings
          </p>
        </div>
        <Button className="hover-lift button-press" onClick={handleAddBranch}>
          <Plus className="mr-2 h-4 w-4" /> Add Branch
        </Button>
      </div>

      <Card className="glass-card">
        <CardContent className="space-y-4 pt-6">
          {/* Search and Filter */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search branches..."
                className="pl-10"
              />
            </div>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-48">
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="hover-lift"
              >
                {viewMode === 'grid' ? (
                  <List className="h-4 w-4" />
                ) : (
                  <Grid3x3 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="hover-lift"
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Branches Grid/List */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <p>Loading branches...</p>
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No branches found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBranches.map((branch) => (
                <Card
                  key={branch.id}
                  className="glass-card hover-lift transition-all button-press"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <MapPin className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{branch.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {branch.nameAr}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{branch.code}</Badge>
                        {branch.isMainBranch && (
                          <Badge className="bg-yellow-500/20 text-yellow-700">
                            Main
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      {branch.companyId && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-4 w-4" />{' '}
                          {companyName(branch.companyId)}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" /> {branch.city || 'No city'}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" /> {branch.phone || 'No phone'}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" /> {branch.manager || 'No manager'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant="outline" className="text-xs">
                        {getBranchStations(branch.id)} Stations
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getBranchUsers(branch.id)} Users
                      </Badge>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 hover-lift"
                        onClick={() => handleEditBranch(branch)}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover-lift text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteBranch(branch.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <MapPin className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{branch.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {branch.nameAr}
                        </p>
                        <Badge variant="outline">{branch.code}</Badge>
                        {branch.isMainBranch && (
                          <Badge className="bg-yellow-500/20 text-yellow-700">
                            Main
                          </Badge>
                        )}
                        <Badge
                          className={getStatusColor(
                            branch.isActive ? 'Active' : 'Inactive'
                          )}
                          variant="secondary"
                        >
                          {branch.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {branch.companyId && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />{' '}
                            {companyName(branch.companyId)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {branch.city || 'No city'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {branch.manager || 'No manager'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Wrench className="h-3 w-3" />{' '}
                          {getBranchStations(branch.id)} Stations
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover-lift"
                      onClick={() => handleEditBranch(branch)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Wrench className="mr-2 h-4 w-4" />
                          View Stations
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="mr-2 h-4 w-4" />
                          View Users
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteBranch(branch.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Branch
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Branch Dialog */}
      <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? 'Edit Branch' : 'Add New Branch'}
            </DialogTitle>
            <DialogDescription>
              {editingBranch
                ? 'Update branch information'
                : 'Create a new branch location'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch-name">Branch Name</Label>
                  <Input
                    id="branch-name"
                    value={branchForm.name}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, name: e.target.value })
                    }
                    placeholder="e.g., Downtown Branch"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-name-ar">Branch Name (Arabic)</Label>
                  <Input
                    id="branch-name-ar"
                    value={branchForm.nameAr}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, nameAr: e.target.value })
                    }
                    placeholder="مثال: فرع وسط المدينة"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-code">Branch Code</Label>
                  <Input
                    id="branch-code"
                    value={branchForm.code}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, code: e.target.value })
                    }
                    placeholder="e.g., BR001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-type">Branch Type</Label>
                  <Select
                    value={branchForm.branchType}
                    onValueChange={(value) =>
                      setBranchForm({ ...branchForm, branchType: value })
                    }
                  >
                    <SelectTrigger id="branch-type">
                      <SelectValue placeholder="Select branch type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="showroom">Showroom</SelectItem>
                      <SelectItem value="service_center">Service Center</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-company">Company</Label>
                  <Select
                    value={branchForm.companyId || ''}
                    onValueChange={(value) =>
                      setBranchForm({ ...branchForm, companyId: value })
                    }
                  >
                    <SelectTrigger id="branch-company">
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
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch-phone">Phone</Label>
                  <Input
                    id="branch-phone"
                    value={branchForm.phone}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, phone: e.target.value })
                    }
                    placeholder="e.g., +201234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-email">Email</Label>
                  <Input
                    id="branch-email"
                    type="email"
                    value={branchForm.email}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, email: e.target.value })
                    }
                    placeholder="e.g., branch@company.com"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Address Information</h3>
              <div className="space-y-2">
                <Label htmlFor="branch-address">Address</Label>
                <Input
                  id="branch-address"
                  value={branchForm.address}
                  onChange={(e) =>
                    setBranchForm({ ...branchForm, address: e.target.value })
                  }
                  placeholder="e.g., 123 Main Street"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch-city">City</Label>
                  <Input
                    id="branch-city"
                    value={branchForm.city}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, city: e.target.value })
                    }
                    placeholder="e.g., Cairo"
                  />
                </div>
              </div>
            </div>

            {/* Manager Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Manager Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch-manager">Manager Name</Label>
                  <Input
                    id="branch-manager"
                    value={branchForm.manager}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, manager: e.target.value })
                    }
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-manager-phone">Manager Phone</Label>
                  <Input
                    id="branch-manager-phone"
                    value={branchForm.managerPhone}
                    onChange={(e) =>
                      setBranchForm({
                        ...branchForm,
                        managerPhone: e.target.value,
                      })
                    }
                    placeholder="e.g., +201234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-manager-email">Manager Email</Label>
                  <Input
                    id="branch-manager-email"
                    type="email"
                    value={branchForm.managerEmail}
                    onChange={(e) =>
                      setBranchForm({
                        ...branchForm,
                        managerEmail: e.target.value,
                      })
                    }
                    placeholder="e.g., manager@company.com"
                  />
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Working Hours</h3>
              <div className="space-y-2">
                <Label htmlFor="branch-hours">Working Hours</Label>
                <Input
                  id="branch-hours"
                  value={branchForm.workingHours}
                  onChange={(e) =>
                    setBranchForm({
                      ...branchForm,
                      workingHours: e.target.value,
                    })
                  }
                  placeholder="e.g., 9:00 AM - 5:00 PM"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBranchDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBranch}>
              {editingBranch ? 'Update Branch' : 'Add Branch'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
