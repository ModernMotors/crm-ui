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
  Building,
  Building2,
  MapPin,
  Mail,
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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { companiesApi } from '@/lib/api';
import { toCamelCase, toSnakeCase } from '@/lib/case-conversion';

export const Route = createFileRoute('/settings/companies')({
  component: CompaniesPage,
});

function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Dialog states
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    nameAr: '',
    code: '',
    commercialName: '',
    taxId: '',
    commercialRegistration: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    establishedDate: '',
    businessType: '',
    industry: '',
  });

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const response = await companiesApi.getAll();
        const companiesArray = Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
        const convertedCompanies = companiesArray.map((c: any) => toCamelCase(c));
        setCompanies(convertedCompanies);
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast.error('Failed to load companies');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    return companies
      .filter(
        (c) =>
          (c.name + c.nameAr + c.commercialName + c.email + c.phone)
            .toLowerCase()
            .includes(q.toLowerCase())
      )
      .sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [q, companies, sortOrder]);

  const handleAddCompany = () => {
    setEditingCompany(null);
    setCompanyForm({
      name: '',
      nameAr: '',
      code: '',
      commercialName: '',
      taxId: '',
      commercialRegistration: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
      website: '',
      establishedDate: '',
      businessType: '',
      industry: '',
    });
    setCompanyDialogOpen(true);
  };

  const handleEditCompany = (company: any) => {
    setEditingCompany(company);
    setCompanyForm({
      name: company.name,
      nameAr: company.nameAr,
      code: company.code,
      commercialName: company.commercialName,
      taxId: company.taxId,
      commercialRegistration: company.commercialRegistration,
      address: company.address,
      city: company.city,
      country: company.country,
      phone: company.phone,
      email: company.email,
      website: company.website,
      establishedDate: company.establishedDate,
      businessType: company.businessType,
      industry: company.industry,
    });
    setCompanyDialogOpen(true);
  };

  const handleSaveCompany = async () => {
    try {
      const snakeCaseForm = toSnakeCase(companyForm);
      if (editingCompany) {
        await companiesApi.update(editingCompany.id, snakeCaseForm);
        toast.success('Company updated successfully');
        setCompanies((prev) =>
          prev.map((c) =>
            c.id === editingCompany.id ? { ...c, ...snakeCaseForm } : c
          )
        );
      } else {
        const result = await companiesApi.create(snakeCaseForm);
        toast.success('Company added successfully');
        const convertedResult = toCamelCase(result.data || result);
        setCompanies((prev) => [...prev, convertedResult]);
      }
      setCompanyDialogOpen(false);
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error('Failed to save company');
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    try {
      await companiesApi.delete(companyId);
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
      toast.success('Company deleted successfully');
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  };

  const getCompanyBranches = (companyId: string) => {
    return companies.filter((c) => c.id === companyId).length;
  };

  const getCompanyUsers = (companyId: string) => {
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
          <h1 className="text-3xl font-bold">Companies Management</h1>
          <p className="text-muted-foreground">
            Manage company profiles, settings, and business information
          </p>
        </div>
        <Button className="hover-lift button-press" onClick={handleAddCompany}>
          <Plus className="mr-2 h-4 w-4" /> Add Company
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
                placeholder="Search companies..."
                className="pl-10"
              />
            </div>
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

          {/* Companies Grid/List */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <p>Loading companies...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No companies found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCompanies.map((company) => (
                <Card
                  key={company.id}
                  className="glass-card hover-lift transition-all button-press"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Building className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{company.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {company.nameAr}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={company.isActive ? 'default' : 'secondary'}
                      >
                        {company.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" /> {company.commercialName}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" /> {company.city}, {company.country}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" /> {company.email}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" /> {company.phone}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant="outline" className="text-xs">
                        {getCompanyBranches(company.id)} Branches
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getCompanyUsers(company.id)} Users
                      </Badge>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 hover-lift"
                        onClick={() => handleEditCompany(company)}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="hover-lift">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{company.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {company.nameAr}
                        </p>
                        <Badge
                          variant={company.isActive ? 'default' : 'secondary'}
                        >
                          {company.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> {company.commercialName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {company.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {getCompanyUsers(company.id)} Users
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {getCompanyBranches(company.id)} Branches
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover-lift"
                      onClick={() => handleEditCompany(company)}
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
                          <Building2 className="mr-2 h-4 w-4" />
                          View Branches
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="mr-2 h-4 w-4" />
                          View Users
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteCompany(company.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Company
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

      {/* Company Dialog */}
      <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCompany ? 'Edit Company' : 'Add New Company'}
            </DialogTitle>
            <DialogDescription>
              {editingCompany
                ? 'Update company information'
                : 'Create a new company profile'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companyForm.name}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, name: e.target.value })
                    }
                    placeholder="e.g., Car Branch Manager"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-name-ar">Company Name (Arabic)</Label>
                  <Input
                    id="company-name-ar"
                    value={companyForm.nameAr}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, nameAr: e.target.value })
                    }
                    placeholder="مثال: مدير فروع السيارات"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-code">Company Code</Label>
                  <Input
                    id="company-code"
                    value={companyForm.code}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, code: e.target.value })
                    }
                    placeholder="e.g., CBM001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-commercial">Commercial Name</Label>
                  <Input
                    id="company-commercial"
                    value={companyForm.commercialName}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        commercialName: e.target.value,
                      })
                    }
                    placeholder="e.g., CBM Corp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-tax-id">Tax ID</Label>
                  <Input
                    id="company-tax-id"
                    value={companyForm.taxId}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, taxId: e.target.value })
                    }
                    placeholder="e.g., 123456789"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={companyForm.email}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, email: e.target.value })
                    }
                    placeholder="e.g., info@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input
                    id="company-phone"
                    value={companyForm.phone}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, phone: e.target.value })
                    }
                    placeholder="e.g., +201234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-website">Website</Label>
                  <Input
                    id="company-website"
                    value={companyForm.website}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, website: e.target.value })
                    }
                    placeholder="e.g., https://company.com"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Address Information</h3>
              <div className="space-y-2">
                <Label htmlFor="company-address">Address</Label>
                <Input
                  id="company-address"
                  value={companyForm.address}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, address: e.target.value })
                  }
                  placeholder="e.g., 123 Main Street"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-city">City</Label>
                  <Input
                    id="company-city"
                    value={companyForm.city}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, city: e.target.value })
                    }
                    placeholder="e.g., Cairo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-country">Country</Label>
                  <Input
                    id="company-country"
                    value={companyForm.country}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, country: e.target.value })
                    }
                    placeholder="e.g., Egypt"
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Business Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-business-type">Business Type</Label>
                  <Select
                    value={companyForm.businessType}
                    onValueChange={(value) =>
                      setCompanyForm({ ...companyForm, businessType: value })
                    }
                  >
                    <SelectTrigger id="company-business-type">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manufacturer">Manufacturer</SelectItem>
                      <SelectItem value="distributor">Distributor</SelectItem>
                      <SelectItem value="dealer">Dealer</SelectItem>
                      <SelectItem value="service_center">Service Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-industry">Industry</Label>
                  <Input
                    id="company-industry"
                    value={companyForm.industry}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, industry: e.target.value })
                    }
                    placeholder="e.g., Automotive"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-established">Established Date</Label>
                  <Input
                    id="company-established"
                    type="date"
                    value={companyForm.establishedDate}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        establishedDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-registration">
                    Commercial Registration
                  </Label>
                  <Input
                    id="company-registration"
                    value={companyForm.commercialRegistration}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        commercialRegistration: e.target.value,
                      })
                    }
                    placeholder="e.g., CR-123456"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCompanyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCompany}>
              {editingCompany ? 'Update Company' : 'Add Company'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
