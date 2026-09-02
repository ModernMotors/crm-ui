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
import { Progress } from '@/components/ui/progress';
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
  Tag,
  Activity,
  Users,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { stationsApi, companiesApi, branchesApi } from '@/lib/api';
import { toCamelCase, toSnakeCase } from '@/lib/case-conversion';

export const Route = createFileRoute('/settings/stations')({
  component: StationsPage,
});

function StationsPage() {
  const [stations, setStations] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Dialog states
  const [stationDialogOpen, setStationDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<any>(null);
  const [stationForm, setStationForm] = useState({
    name: '',
    nameAr: '',
    code: '',
    type: 'service_bay',
    status: 'active',
    capacity: 1,
    specialization: '',
    companyId: '',
    branchId: '',
  });

  const dialogBranches = useMemo(
    () =>
      stationForm.companyId
        ? branches.filter((b) => b.companyId === stationForm.companyId)
        : branches,
    [branches, stationForm.companyId]
  );

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [stationsRes, companiesRes, branchesRes] = await Promise.all([
          stationsApi.getAll(),
          companiesApi.getAll(),
          branchesApi.getAll(),
        ]);
        const stationsArray = Array.isArray(stationsRes.data) ? stationsRes.data : Array.isArray(stationsRes) ? stationsRes : [];
        const companiesArray = Array.isArray(companiesRes.data) ? companiesRes.data : Array.isArray(companiesRes) ? companiesRes : [];
        const branchesArray = Array.isArray(branchesRes.data) ? branchesRes.data : Array.isArray(branchesRes) ? branchesRes : [];
        setStations(stationsArray.map((s: any) => toCamelCase(s)));
        setCompanies(companiesArray.map((c: any) => toCamelCase(c)));
        setBranches(branchesArray.map((b: any) => toCamelCase(b)));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredStations = useMemo(() => {
    return stations
      .filter(
        (s) =>
          (s.name + s.nameAr + s.code + s.type)
            .toLowerCase()
            .includes(q.toLowerCase()) &&
          (selectedCompany === 'all' || s.companyId === selectedCompany) &&
          (selectedBranch === 'all' || s.branchId === selectedBranch)
      )
      .sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [q, selectedCompany, selectedBranch, stations, sortOrder]);

  const handleAddStation = () => {
    setEditingStation(null);
    setStationForm({
      name: '',
      nameAr: '',
      code: '',
      type: 'service_bay',
      status: 'active',
      capacity: 1,
      specialization: '',
      companyId: '',
      branchId: '',
    });
    setStationDialogOpen(true);
  };

  const handleEditStation = (station: any) => {
    setEditingStation(station);
    setStationForm({
      name: station.name,
      nameAr: station.nameAr || '',
      code: station.code,
      type: station.type,
      status: station.status,
      capacity: station.capacity,
      specialization: station.specialization || '',
      companyId: station.companyId || '',
      branchId: station.branchId || '',
    });
    setStationDialogOpen(true);
  };

  const handleSaveStation = async () => {
    try {
      const snakeCaseForm = toSnakeCase(stationForm);
      if (editingStation) {
        await stationsApi.update(editingStation.id, snakeCaseForm);
        toast.success('Station updated successfully');
        setStations((prev) =>
          prev.map((s) =>
            s.id === editingStation.id ? { ...s, ...snakeCaseForm } : s
          )
        );
      } else {
        const result = await stationsApi.create(snakeCaseForm);
        toast.success('Station added successfully');
        const convertedResult = toCamelCase(result.data || result);
        setStations((prev) => [...prev, convertedResult]);
      }
      setStationDialogOpen(false);
    } catch (error) {
      console.error('Error saving station:', error);
      toast.error('Failed to save station');
    }
  };

  const handleDeleteStation = async (stationId: string) => {
    try {
      await stationsApi.delete(stationId);
      setStations((prev) => prev.filter((s) => s.id !== stationId));
      toast.success('Station deleted successfully');
    } catch (error) {
      console.error('Error deleting station:', error);
      toast.error('Failed to delete station');
    }
  };

  const companyName = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    return company?.name || 'Unknown';
  };

  const branchName = (branchId: string) => {
    const branch = branches.find((b) => b.id === branchId);
    return branch?.name || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Active: 'bg-green-500/20 text-green-700',
      Inactive: 'bg-gray-500/20 text-gray-700',
      Maintenance: 'bg-orange-500/20 text-orange-700',
      Closed: 'bg-red-500/20 text-red-700',
      active: 'bg-green-500/20 text-green-700',
      maintenance: 'bg-orange-500/20 text-orange-700',
      inactive: 'bg-gray-500/20 text-gray-700',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stations Management</h1>
          <p className="text-muted-foreground">
            Manage service stations, bays, and technical resources
          </p>
        </div>
        <Button className="hover-lift button-press" onClick={handleAddStation}>
          <Plus className="mr-2 h-4 w-4" /> Add Station
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
                placeholder="Search stations..."
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
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
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

          {/* Stations Grid/List */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <p>Loading stations...</p>
            </div>
          ) : filteredStations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Wrench className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No stations found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredStations.map((station) => (
                <Card
                  key={station.id}
                  className="glass-card hover-lift transition-all button-press"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Wrench className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{station.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {station.nameAr}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{station.code}</Badge>
                        <Badge
                          className={getStatusColor(station.status)}
                          variant="secondary"
                        >
                          {station.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />{' '}
                        {companyName(station.companyId)}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />{' '}
                        {branchName(station.branchId)}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Tag className="h-4 w-4" />{' '}
                        {station.type.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="font-medium">{station.capacity}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Current Load</span>
                        <span className="font-medium">
                          {station.currentLoad || 0}/{station.capacity}
                        </span>
                      </div>
                      <Progress
                        value={
                          station.currentLoad
                            ? ((station.currentLoad / station.capacity) * 100)
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 hover-lift"
                        onClick={() => handleEditStation(station)}
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
              {filteredStations.map((station) => (
                <div
                  key={station.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Wrench className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{station.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {station.nameAr}
                        </p>
                        <Badge variant="outline">{station.code}</Badge>
                        <Badge
                          className={getStatusColor(station.status)}
                          variant="secondary"
                        >
                          {station.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />{' '}
                          {companyName(station.companyId)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{' '}
                          {branchName(station.branchId)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />{' '}
                          {station.type.replace(/_/g, ' ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />{' '}
                          {station.currentLoad || 0}/{station.capacity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover-lift"
                      onClick={() => handleEditStation(station)}
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
                          <Users className="mr-2 h-4 w-4" />
                          View Technicians
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Activity className="mr-2 h-4 w-4" />
                          View Schedule
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteStation(station.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Station
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

      {/* Station Dialog */}
      <Dialog open={stationDialogOpen} onOpenChange={setStationDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStation ? 'Edit Station' : 'Add New Station'}
            </DialogTitle>
            <DialogDescription>
              {editingStation
                ? 'Update station information'
                : 'Create a new service station'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Assignment */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Assignment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="station-company">Company</Label>
                  <Select
                    value={stationForm.companyId}
                    onValueChange={(value) =>
                      setStationForm({ ...stationForm, companyId: value, branchId: '' })
                    }
                  >
                    <SelectTrigger id="station-company">
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
                  <Label htmlFor="station-branch">Branch <span className="text-red-500">*</span></Label>
                  <Select
                    value={stationForm.branchId}
                    onValueChange={(value) =>
                      setStationForm({ ...stationForm, branchId: value })
                    }
                  >
                    <SelectTrigger id="station-branch">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {dialogBranches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="station-name">Station Name</Label>
                  <Input
                    id="station-name"
                    value={stationForm.name}
                    onChange={(e) =>
                      setStationForm({ ...stationForm, name: e.target.value })
                    }
                    placeholder="e.g., Service Bay 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="station-name-ar">Station Name (Arabic)</Label>
                  <Input
                    id="station-name-ar"
                    value={stationForm.nameAr}
                    onChange={(e) =>
                      setStationForm({ ...stationForm, nameAr: e.target.value })
                    }
                    placeholder="مثال: مركز خدمة 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="station-code">Station Code</Label>
                  <Input
                    id="station-code"
                    value={stationForm.code}
                    onChange={(e) =>
                      setStationForm({ ...stationForm, code: e.target.value })
                    }
                    placeholder="e.g., ST001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="station-type">Station Type</Label>
                  <Select
                    value={stationForm.type}
                    onValueChange={(value) =>
                      setStationForm({ ...stationForm, type: value })
                    }
                  >
                    <SelectTrigger id="station-type">
                      <SelectValue placeholder="Select station type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service_bay">Service Bay</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="wash">Wash</SelectItem>
                      <SelectItem value="parking">Parking</SelectItem>
                      <SelectItem value="storage">Storage</SelectItem>
                      <SelectItem value="showroom">Showroom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Capacity and Status */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Capacity & Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="station-capacity">Capacity</Label>
                  <Input
                    id="station-capacity"
                    type="number"
                    value={stationForm.capacity}
                    onChange={(e) =>
                      setStationForm({
                        ...stationForm,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    placeholder="e.g., 5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="station-status">Status</Label>
                  <Select
                    value={stationForm.status}
                    onValueChange={(value) =>
                      setStationForm({ ...stationForm, status: value })
                    }
                  >
                    <SelectTrigger id="station-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Specialization */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Specialization</h3>
              <div className="space-y-2">
                <Label htmlFor="station-specialization">Specialization</Label>
                <Input
                  id="station-specialization"
                  value={stationForm.specialization}
                  onChange={(e) =>
                    setStationForm({
                      ...stationForm,
                      specialization: e.target.value,
                    })
                  }
                  placeholder="e.g., Engine Repair, Electrical Systems"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStationDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveStation}
              disabled={!stationForm.branchId}
            >
              {editingStation ? 'Update Station' : 'Add Station'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
