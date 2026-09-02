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
  ShieldCheck,
  Shield,
  Users,
  CheckCircle,
  XCircle,
  Search,
} from 'lucide-react';
import { rolesApi, companiesApi, usersApi } from '@/lib/api';

export const Route = createFileRoute('/settings/roles')({
  component: RolesPage,
});

function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');

  // Dialog states
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    nameAr: '',
    description: '',
    level: 50,
    isSystemRole: false,
    isDefault: false,
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rolesRes, companiesRes, usersRes] = await Promise.all([
          rolesApi.getAll(),
          companiesApi.getAll(),
          usersApi.getAll(),
        ]);
        setRoles(rolesRes.data || []);
        setCompanies(companiesRes.data || []);
        setUsers(usersRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredRoles = useMemo(() => {
    return roles.filter(
      (r) =>
        (r.name + r.nameAr + r.description)
          .toLowerCase()
          .includes(q.toLowerCase()) &&
        (selectedCompany === 'all' || r.companyId === selectedCompany)
    );
  }, [q, selectedCompany, roles]);

  const handleAddRole = () => {
    setEditingRole(null);
    setRoleForm({
      name: '',
      nameAr: '',
      description: '',
      level: 50,
      isSystemRole: false,
      isDefault: false,
    });
    setRoleDialogOpen(true);
  };

  const handleEditRole = (role: any) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      nameAr: role.nameAr,
      description: role.description,
      level: role.level,
      isSystemRole: role.isSystemRole,
      isDefault: role.isDefault,
    });
    setRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    try {
      if (editingRole) {
        await rolesApi.update(editingRole.id, roleForm);
        toast.success('Role updated successfully');
        setRoles((prev) =>
          prev.map((r) =>
            r.id === editingRole.id ? { ...r, ...roleForm } : r
          )
        );
      } else {
        const result = await rolesApi.create(roleForm);
        toast.success('Role added successfully');
        setRoles((prev) => [...prev, result.data]);
      }
      setRoleDialogOpen(false);
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error('Failed to save role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await rolesApi.delete(roleId);
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      toast.success('Role deleted successfully');
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
    }
  };

  const getRoleUsers = (roleId: string) => {
    return users.filter((u) => u.roleId === roleId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Configure user roles and their associated permissions
          </p>
        </div>
        <Button className="hover-lift button-press" onClick={handleAddRole}>
          <Plus className="mr-2 h-4 w-4" /> Add Role
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
                placeholder="Search roles..."
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
          </div>

          {/* Roles List */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <p>Loading roles...</p>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No roles found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRoles.map((role) => (
                <Card key={role.id} className="glass-card hover-lift transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-orange-500/10">
                          <ShieldCheck className="h-6 w-6 text-orange-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{role.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {role.nameAr}
                            </CardDescription>
                            {role.isSystemRole && (
                              <Badge className="bg-red-500/20 text-red-700">
                                System
                              </Badge>
                            )}
                            {role.isDefault && (
                              <Badge className="bg-blue-500/20 text-blue-700">
                                Default
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="mt-1">
                            {role.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Level {role.level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {role.permissions?.length || 0} Permissions
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        {role.canManageUsers ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-muted-foreground">Manage Users</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {role.canManageRoles ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-muted-foreground">Manage Roles</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {role.canEditSettings ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-muted-foreground">Edit Settings</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {role.canViewReports ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-muted-foreground">View Reports</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{getRoleUsers(role.id).length} users assigned</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover-lift"
                          onClick={() => handleEditRole(role)}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit Role
                        </Button>
                        <Button variant="outline" size="sm" className="hover-lift">
                          <Shield className="mr-2 h-4 w-4" /> Permissions
                        </Button>
                        {!role.isSystemRole && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover-lift"
                            onClick={() => handleDeleteRole(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Edit Role' : 'Add New Role'}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? 'Update role information'
                : 'Create a new user role with permissions'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input
                    id="role-name"
                    value={roleForm.name}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, name: e.target.value })
                    }
                    placeholder="e.g., Manager"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-name-ar">Role Name (Arabic)</Label>
                  <Input
                    id="role-name-ar"
                    value={roleForm.nameAr}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, nameAr: e.target.value })
                    }
                    placeholder="مثال: مدير"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="role-description">Description</Label>
                  <Textarea
                    id="role-description"
                    value={roleForm.description}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, description: e.target.value })
                    }
                    placeholder="Describe the role and its responsibilities"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-level">Access Level</Label>
                  <Input
                    id="role-level"
                    type="number"
                    value={roleForm.level}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, level: parseInt(e.target.value) })
                    }
                    placeholder="e.g., 50"
                    min={0}
                    max={100}
                  />
                </div>
              </div>
            </div>

            {/* Role Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Role Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="role-system"
                    checked={roleForm.isSystemRole}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, isSystemRole: e.target.checked })
                    }
                    disabled={editingRole?.isSystemRole}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="role-system" className="cursor-pointer">
                    System Role (cannot be deleted)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="role-default"
                    checked={roleForm.isDefault}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, isDefault: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="role-default" className="cursor-pointer">
                    Default Role (assigned to new users)
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole}>
              {editingRole ? 'Update Role' : 'Add Role'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
