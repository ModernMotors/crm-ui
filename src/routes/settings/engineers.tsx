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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Clock,
  UserCog,
  Check,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { employeesApi, branchesApi, companiesApi } from '@/lib/api';
import { toCamelCase, toSnakeCase } from '@/lib/case-conversion';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/settings/engineers')({
  component: EngineersPage,
});

function EngineersPage() {
  const [engineers, setEngineers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [branchSearchQuery, setBranchSearchQuery] = useState('');

  // Dialog states
  const [engineerDialogOpen, setEngineerDialogOpen] = useState(false);
  const [editingEngineer, setEditingEngineer] = useState<any>(null);
  const [engineerForm, setEngineerForm] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    role: 'Engineer',
    branchId: '',
    available: true,
    workingHours: 8,
    hourlyRate: 0,
    specialization: '',
    slotDuration: 15,
    schedule: {
      monday: { start: '08:00', end: '17:00' },
      tuesday: { start: '08:00', end: '17:00' },
      wednesday: { start: '08:00', end: '17:00' },
      thursday: { start: '08:00', end: '17:00' },
      friday: null,
      saturday: { start: '09:00', end: '15:00' },
      sunday: null,
    },
  });

  const generateEmployeeId = () =>
    `EMP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [engineersRes, branchesRes, companiesRes] = await Promise.all([
          employeesApi.getAll(),
          branchesApi.getAll(),
          companiesApi.getAll(),
        ]);
        const engineersArray = Array.isArray(engineersRes.data) ? engineersRes.data : Array.isArray(engineersRes) ? engineersRes : [];
        const branchesArray = Array.isArray(branchesRes.data) ? branchesRes.data : Array.isArray(branchesRes) ? branchesRes : [];
        const companiesArray = Array.isArray(companiesRes.data) ? companiesRes.data : Array.isArray(companiesRes) ? companiesRes : [];
        setEngineers(engineersArray.map((e: any) => toCamelCase(e)));
        setBranches(branchesArray.map((b: any) => toCamelCase(b)));
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

  const filteredEngineers = useMemo(() => {
    return engineers.filter((e) => {
      const matchesCompany =
        selectedCompany === 'all' || e.companyId === selectedCompany;
      const matchesBranch =
        selectedBranch === 'all' || e.branchId === selectedBranch;
      return matchesCompany && matchesBranch;
    });
  }, [selectedCompany, selectedBranch, engineers]);

  const handleAddEngineer = () => {
    setEditingEngineer(null);
    setBranchSearchQuery('');
    setEngineerForm({
      firstName: '',
      lastName: '',
      employeeId: generateEmployeeId(),
      role: 'Engineer',
      branchId: selectedBranch === 'all' ? '' : selectedBranch,
      available: true,
      workingHours: 8,
      hourlyRate: 0,
      specialization: '',
      slotDuration: 15,
      schedule: {
        monday: { start: '08:00', end: '17:00' },
        tuesday: { start: '08:00', end: '17:00' },
        wednesday: { start: '08:00', end: '17:00' },
        thursday: { start: '08:00', end: '17:00' },
        friday: null,
        saturday: { start: '09:00', end: '15:00' },
        sunday: null,
      },
    });
    setEngineerDialogOpen(true);
  };

  const handleEditEngineer = (engineer: any) => {
    setEditingEngineer(engineer);
    setBranchSearchQuery('');
    setEngineerForm({
      firstName: engineer.firstName || engineer.first_name || '',
      lastName: engineer.lastName || engineer.last_name || '',
      employeeId: engineer.employeeId || engineer.employee_id || generateEmployeeId(),
      role: engineer.role || engineer.position || engineer.job_title || 'Engineer',
      branchId: engineer.branchId || engineer.branch_id || '',
      available: engineer.available ?? (engineer.status === 'active') ?? true,
      workingHours: engineer.workingHours || engineer.working_hours || 8,
      hourlyRate: engineer.hourlyRate || engineer.hourly_rate || 0,
      specialization: engineer.specialization || '',
      slotDuration: engineer.slotDuration || engineer.slot_duration || 15,
      schedule: engineer.schedule || {
        monday: { start: '08:00', end: '17:00' },
        tuesday: { start: '08:00', end: '17:00' },
        wednesday: { start: '08:00', end: '17:00' },
        thursday: { start: '08:00', end: '17:00' },
        friday: null,
        saturday: { start: '09:00', end: '15:00' },
        sunday: null,
      },
    });
    setEngineerDialogOpen(true);
  };

  const handleSaveEngineer = async () => {
    try {
      // Add status field based on available
      const formWithStatus = {
        ...engineerForm,
        status: engineerForm.available ? 'active' : 'inactive',
      };
      
      const snakeCaseForm = toSnakeCase(formWithStatus);

      if (editingEngineer) {
        const response = await employeesApi.update(editingEngineer.id, snakeCaseForm);
        toast.success('Engineer updated successfully');
        const updatedEngineer = toCamelCase(response.data || response);
        setEngineers((prev) =>
          prev.map((e) => e.id === editingEngineer.id ? updatedEngineer : e)
        );
      } else {
        const result = await employeesApi.create(snakeCaseForm);
        toast.success('Engineer added successfully');
        const convertedResult = toCamelCase(result.data || result);
        setEngineers((prev) => [...prev, convertedResult]);
      }
      setEngineerDialogOpen(false);
    } catch {
      toast.error('Failed to save engineer');
    }
  };

  const handleDeleteEngineer = async (engineerId: string) => {
    try {
      await employeesApi.delete(engineerId);
      setEngineers((prev) => prev.filter((e) => e.id !== engineerId));
      toast.success('Engineer deleted successfully');
    } catch {
      toast.error('Failed to delete engineer');
    }
  };

  const branchName = (branchId: string) => {
    const branch = branches.find((b) => b.id === branchId);
    return branch?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Engineers Management</h1>
          <p className="text-muted-foreground">
            Manage engineers and their working schedules
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="hover-lift button-press" onClick={handleAddEngineer}>
            <Plus className="mr-2 h-4 w-4" /> Add Engineer
          </Button>
        </div>
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
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches
                  .filter(
                    (b) =>
                      selectedCompany === 'all' || b.companyId === selectedCompany
                  )
                  .map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Engineers Grid */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <p>Loading engineers...</p>
            </div>
          ) : filteredEngineers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserCog className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No engineers found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEngineers.map((engineer) => (
                <Card key={engineer.id} className="hover-lift transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {(
                              (engineer.firstName || engineer.first_name || '?')[0] +
                              (engineer.lastName || engineer.last_name || '')[0]
                            ).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">
                            {[engineer.firstName || engineer.first_name, engineer.lastName || engineer.last_name].filter(Boolean).join(' ') || engineer.name || 'Unknown'}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {engineer.role}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Clock className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditEngineer(engineer)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteEngineer(engineer.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Branch:</span>
                      <Badge variant="outline">{branchName(engineer.branchId)}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Specialization:</span>
                      <span className="font-medium">
                        {engineer.specialization || 'General'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Working Hours:</span>
                      <span className="font-medium">
                        {engineer.workingHours || engineer.working_hours || 8}h/day
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Slot Duration:</span>
                      <span className="font-medium">
                        {engineer.slotDuration || engineer.slot_duration || 15} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={engineer.available || engineer.status === 'active' ? 'default' : 'secondary'}>
                        {engineer.available || engineer.status === 'active' ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    {engineer.schedule && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-600 mb-2 font-medium">
                          Weekly Schedule:
                        </p>
                        <div className="grid grid-cols-7 gap-1 text-xs">
                          {[
                            'saturday',
                            'sunday',
                            'monday',
                            'tuesday',
                            'wednesday',
                            'thursday',
                            'friday',
                          ].map((day) => {
                            const daySchedule =
                              engineer.schedule?.[day as keyof typeof engineer.schedule];
                            return (
                              <div key={day} className="text-center">
                                <div
                                  className={cn(
                                    'w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1',
                                    daySchedule
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-400'
                                  )}
                                >
                                  {daySchedule ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <X className="h-3 w-3" />
                                  )}
                                </div>
                                <p className="capitalize truncate">
                                  {day.slice(0, 3)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Engineer Dialog */}
      <Dialog open={engineerDialogOpen} onOpenChange={setEngineerDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEngineer ? 'Edit Engineer' : 'Add New Engineer'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="engineer-firstname">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="engineer-firstname"
                    value={engineerForm.firstName}
                    onChange={(e) =>
                      setEngineerForm({ ...engineerForm, firstName: e.target.value })
                    }
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engineer-lastname">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="engineer-lastname"
                    value={engineerForm.lastName}
                    onChange={(e) =>
                      setEngineerForm({ ...engineerForm, lastName: e.target.value })
                    }
                    placeholder="Last name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engineer-empid">Employee ID</Label>
                  <Input
                    id="engineer-empid"
                    value={engineerForm.employeeId}
                    onChange={(e) =>
                      setEngineerForm({ ...engineerForm, employeeId: e.target.value })
                    }
                    placeholder="e.g., EMP-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engineer-role">Role</Label>
                  <Select
                    value={engineerForm.role}
                    onValueChange={(value) =>
                      setEngineerForm({ ...engineerForm, role: value })
                    }
                  >
                    <SelectTrigger id="engineer-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineer">Engineer</SelectItem>
                      <SelectItem value="Service Advisor">
                        Service Advisor
                      </SelectItem>
                      <SelectItem value="Technician">Technician</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engineer-branch">Branch</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Search branches..."
                      value={branchSearchQuery}
                      onChange={(e) => setBranchSearchQuery(e.target.value)}
                      className="mb-2"
                    />
                    <Select
                      value={engineerForm.branchId}
                      onValueChange={(value) =>
                        setEngineerForm({ ...engineerForm, branchId: value })
                      }
                    >
                      <SelectTrigger id="engineer-branch">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches
                          .filter((branch) =>
                            branch.name.toLowerCase().includes(branchSearchQuery.toLowerCase()) ||
                            branch.code?.toLowerCase().includes(branchSearchQuery.toLowerCase())
                          )
                          .map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engineer-specialization">Specialization</Label>
                  <Input
                    id="engineer-specialization"
                    value={engineerForm.specialization}
                    onChange={(e) =>
                      setEngineerForm({
                        ...engineerForm,
                        specialization: e.target.value,
                      })
                    }
                    placeholder="e.g., Engine Specialist"
                  />
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Working Hours</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="engineer-hours">Working Hours per Day</Label>
                  <Input
                    id="engineer-hours"
                    type="number"
                    value={engineerForm.workingHours}
                    onChange={(e) =>
                      setEngineerForm({
                        ...engineerForm,
                        workingHours: parseInt(e.target.value),
                      })
                    }
                    placeholder="e.g., 8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engineer-slot">Slot Duration (minutes)</Label>
                  <Input
                    id="engineer-slot"
                    type="number"
                    value={engineerForm.slotDuration}
                    onChange={(e) =>
                      setEngineerForm({
                        ...engineerForm,
                        slotDuration: parseInt(e.target.value),
                      })
                    }
                    placeholder="e.g., 15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engineer-rate">Hourly Rate</Label>
                  <Input
                    id="engineer-rate"
                    type="number"
                    value={engineerForm.hourlyRate}
                    onChange={(e) =>
                      setEngineerForm({
                        ...engineerForm,
                        hourlyRate: parseFloat(e.target.value),
                      })
                    }
                    placeholder="e.g., 50"
                  />
                </div>
                <div className="space-y-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="engineer-available"
                    checked={engineerForm.available}
                    onChange={(e) =>
                      setEngineerForm({
                        ...engineerForm,
                        available: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <Label htmlFor="engineer-available" className="cursor-pointer">
                    Available for Appointments
                  </Label>
                </div>
              </div>
            </div>

            {/* Weekly Schedule */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Weekly Schedule</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  'monday',
                  'tuesday',
                  'wednesday',
                  'thursday',
                  'friday',
                  'saturday',
                  'sunday',
                ].map((day) => (
                  <div key={day} className="space-y-2">
                    <Label className="capitalize">{day}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="time"
                        value={engineerForm.schedule[day as keyof typeof engineer.schedule]?.start || ''}
                        onChange={(e) =>
                          setEngineerForm({
                            ...engineerForm,
                            schedule: {
                              ...engineerForm.schedule,
                              [day]: {
                                ...engineerForm.schedule[day as keyof typeof engineer.schedule],
                                start: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <Input
                        type="time"
                        value={engineerForm.schedule[day as keyof typeof engineer.schedule]?.end || ''}
                        onChange={(e) =>
                          setEngineerForm({
                            ...engineerForm,
                            schedule: {
                              ...engineerForm.schedule,
                              [day]: {
                                ...engineerForm.schedule[day as keyof typeof engineer.schedule],
                                end: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEngineerDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEngineer}
              disabled={!engineerForm.firstName || !engineerForm.lastName || !engineerForm.branchId}
            >
              {editingEngineer ? 'Update Engineer' : 'Add Engineer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
