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
  UserPlus,
  UserCheck,
  UserX,
  Search,
  List,
  Grid3x3,
  SortAsc,
  SortDesc,
  Mail,
  Phone,
  Building2,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreVertical,
  Shield,
  Key,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usersApi, companiesApi, branchesApi, rolesApi } from '@/lib/api';
import { toCamelCase } from '@/lib/case-conversion';
import { availablePermissions } from '@/lib/data';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/settings/users')({
  component: UsersPage,
});

// ─── Permission preview panel ─────────────────────────────────────────────────
function RolePermissionsPreview({ role }: { role: any }) {
  const [expanded, setExpanded] = useState(false);
  if (!role) return null;

  const perms: string[] = role.permissions || [];
  const matched = availablePermissions.filter((p) => perms.includes(p.id));

  const byModule = matched.reduce<Record<string, typeof matched>>((acc, p) => {
    (acc[p.module] = acc[p.module] || []).push(p);
    return acc;
  }, {});

  const CAT_COLORS: Record<string, string> = {
    read:   'bg-blue-50 text-blue-700 border-blue-200',
    write:  'bg-green-50 text-green-700 border-green-200',
    delete: 'bg-red-50 text-red-700 border-red-200',
    admin:  'bg-purple-50 text-purple-700 border-purple-200',
    export: 'bg-orange-50 text-orange-700 border-orange-200',
    import: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };

  return (
    <div className="mt-2 border rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-3 py-2 bg-muted/40 hover:bg-muted/60 text-sm font-medium"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          Role Permissions
          <Badge variant="secondary" className="text-xs">
            {matched.length} / {availablePermissions.length}
          </Badge>
        </span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
          {Object.entries(byModule).map(([module, mPerms]) => (
            <div key={module}>
              <p className="text-xs font-semibold text-muted-foreground mb-1">{module}</p>
              <div className="flex flex-wrap gap-1">
                {mPerms.map((p) => (
                  <Badge
                    key={p.id}
                    variant="outline"
                    className={cn('text-xs capitalize', CAT_COLORS[p.category])}
                  >
                    {p.action}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          {matched.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              No permissions assigned to this role
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    nameAr: '',
    role: 'staff',
    roleId: '',
    branchId: '',
    companyId: '',
    phone: '',
    department: '',
    position: '',
    status: 'active',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, companiesRes, branchesRes, rolesRes] = await Promise.all([
          usersApi.getAll(),
          companiesApi.getAll(),
          branchesApi.getAll(),
          rolesApi.getAll(),
        ]);
        const arr = (r: any) =>
          Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : [];
        setUsers(arr(usersRes).map((u: any) => toCamelCase(u)));
        setCompanies(arr(companiesRes).map((c: any) => toCamelCase(c)));
        setBranches(arr(branchesRes).map((b: any) => toCamelCase(b)));
        setRoles(arr(rolesRes).map((r: any) => toCamelCase(r)));
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
        const str = `${name} ${u.email || ''} ${u.username || ''}`.toLowerCase();
        return (
          str.includes(q.toLowerCase()) &&
          (selectedCompany === 'all' || u.companyId === selectedCompany) &&
          (selectedBranch === 'all' || u.branchId === selectedBranch) &&
          (selectedRole === 'all' || u.roleId === selectedRole) &&
          (selectedStatus === 'all' ||
            u.status?.toLowerCase() === selectedStatus.toLowerCase())
        );
      })
      .sort((a, b) => {
        const na = `${a.firstName || ''} ${a.lastName || ''}`;
        const nb = `${b.firstName || ''} ${b.lastName || ''}`;
        return sortOrder === 'asc' ? na.localeCompare(nb) : nb.localeCompare(na);
      });
  }, [q, selectedCompany, selectedBranch, selectedRole, selectedStatus, users, sortOrder]);

  const stats = useMemo(() => ({
    activeUsers:    users.filter((u) => u.status?.toLowerCase() === 'active').length,
    inactiveUsers:  users.filter((u) => u.status?.toLowerCase() === 'inactive').length,
    suspendedUsers: users.filter((u) => u.status?.toLowerCase() === 'suspended').length,
  }), [users]);

  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({
      username: '', email: '', firstName: '', lastName: '', nameAr: '',
      role: 'staff', roleId: '', branchId: '', companyId: '',
      phone: '', department: '', position: '', status: 'active',
    });
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({
      username:   user.username   || '',
      email:      user.email      || '',
      firstName:  user.firstName  || '',
      lastName:   user.lastName   || '',
      nameAr:     user.nameAr     || '',
      role:       user.role       || 'staff',
      roleId:     user.roleId     || '',
      branchId:   user.branchId   || '',
      companyId:  user.companyId  || '',
      phone:      user.phone      || '',
      department: user.department || '',
      position:   user.position   || '',
      status:     user.status     || 'active',
    });
    setUserDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        const result = await usersApi.update(editingUser.id, userForm);
        toast.success('User updated successfully');
        const updated = toCamelCase(result?.data || { ...editingUser, ...userForm });
        setUsers((prev) => prev.map((u) => u.id === editingUser.id ? updated : u));
      } else {
        const result = await usersApi.create(userForm);
        toast.success('User added successfully');
        setUsers((prev) => [
          ...prev,
          toCamelCase(result?.data?.user || result?.data || result),
        ]);
      }
      setUserDialogOpen(false);
    } catch {
      toast.error('Failed to save user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await usersApi.delete(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success('User deleted successfully');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) return;
      const newStatus = user.status?.toLowerCase() === 'active' ? 'inactive' : 'active';
      await usersApi.update(userId, { status: newStatus });
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, status: newStatus } : u)
      );
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const companyName = (id: string) => companies.find((c) => c.id === id)?.name || '—';
  const branchName  = (id: string) => branches.find((b) => b.id === id)?.name || '—';
  const roleName    = (id: string) => roles.find((r) => r.id === id)?.name || '—';
  const roleForId   = (id: string) => roles.find((r) => r.id === id);
  const selectedFormRole = roles.find((r) => r.id === userForm.roleId);

  const getRoleColor = (roleId: string) => {
    const name = roleName(roleId).toLowerCase();
    if (name.includes('super') || name.includes('admin')) return 'bg-red-500/20 text-red-700';
    if (name.includes('manager'))    return 'bg-blue-500/20 text-blue-700';
    if (name.includes('supervisor')) return 'bg-green-500/20 text-green-700';
    if (name.includes('staff'))      return 'bg-purple-500/20 text-purple-700';
    return 'bg-gray-500/20 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'active')    return 'bg-green-500/20 text-green-700';
    if (s === 'inactive')  return 'bg-gray-500/20 text-gray-700';
    if (s === 'suspended') return 'bg-red-500/20 text-red-700';
    return 'bg-gray-500/20 text-gray-700';
  };

  const getInitials = (f?: string, l?: string) =>
    `${(f || '').trim()[0] || ''}${(l || '').trim()[0] || ''}`.toUpperCase() || '?';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">
            Manage system users, roles, and access permissions
          </p>
        </div>
        <Button className="hover-lift button-press" onClick={handleAddUser}>
          <UserPlus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <Card className="glass-card">
        <CardContent className="space-y-4 pt-6">

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="glass-card bg-green-500/5 border-green-500/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <h4 className="text-2xl font-bold text-green-600">{stats.activeUsers}</h4>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500/80" />
              </CardContent>
            </Card>
            <Card className="glass-card bg-gray-500/5 border-gray-500/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inactive Users</p>
                  <h4 className="text-2xl font-bold text-gray-600">{stats.inactiveUsers}</h4>
                </div>
                <XCircle className="h-8 w-8 text-gray-500/80" />
              </CardContent>
            </Card>
            <Card className="glass-card bg-red-500/5 border-red-500/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Suspended</p>
                  <h4 className="text-2xl font-bold text-red-600">{stats.suspendedUsers}</h4>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500/80" />
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search users…"
                className="pl-10"
              />
            </div>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Company" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Branch" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="hover-lift"
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="hover-lift"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Users list */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <p>Loading users…</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No users found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="glass-card hover-lift transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                          <AvatarFallback className={getRoleColor(user.roleId)}>
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}
                          </CardTitle>
                          {user.nameAr && (
                            <CardDescription className="text-xs">{user.nameAr}</CardDescription>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(user.status)} variant="secondary">
                        {user.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" /> {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" /> {user.phone}
                        </div>
                      )}
                      {user.companyId && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-4 w-4" /> {companyName(user.companyId)}
                        </div>
                      )}
                      {user.branchId && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" /> {branchName(user.branchId)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {user.roleId && (
                        <Badge
                          className={cn(getRoleColor(user.roleId), 'flex items-center gap-1')}
                          variant="secondary"
                        >
                          <Shield className="w-3 h-3" /> {roleName(user.roleId)}
                        </Badge>
                      )}
                      {user.department && (
                        <Badge variant="outline" className="text-xs">{user.department}</Badge>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 hover-lift"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleUserStatus(user.id)}
                        className="hover-lift"
                      >
                        {user.status?.toLowerCase() === 'active'
                          ? <UserX className="h-4 w-4 text-red-500" />
                          : <UserCheck className="h-4 w-4 text-green-500" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={getRoleColor(user.roleId)}>
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">
                          {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}
                        </p>
                        <Badge className={getStatusColor(user.status)} variant="secondary">
                          {user.status}
                        </Badge>
                        {user.roleId && (
                          <Badge className={cn(getRoleColor(user.roleId), 'text-xs')} variant="secondary">
                            <Shield className="w-3 h-3 mr-1" /> {roleName(user.roleId)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {user.email}
                        </span>
                        {user.companyId && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> {companyName(user.companyId)}
                          </span>
                        )}
                        {user.branchId && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {branchName(user.branchId)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover-lift"
                      onClick={() => handleEditUser(user)}
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
                        <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id)}>
                          {user.status?.toLowerCase() === 'active'
                            ? <><UserX className="mr-2 h-4 w-4" /> Deactivate</>
                            : <><UserCheck className="mr-2 h-4 w-4" /> Activate</>}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete User
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

      {/* ── User Dialog ── */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information' : 'Create a new user account'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Arabic Name</Label>
                  <Input
                    value={userForm.nameAr}
                    onChange={(e) => setUserForm({ ...userForm, nameAr: e.target.value })}
                    placeholder="جون دو"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    placeholder="johndoe"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email <span className="text-red-500">*</span></Label>
                  <Input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="john@company.com"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="+20 100 000 0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={userForm.status}
                    onValueChange={(v) => setUserForm({ ...userForm, status: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Role & assignment */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Role &amp; Assignment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label className="flex items-center gap-1">
                    <Shield className="w-4 h-4" /> Role
                  </Label>
                  <Select
                    value={userForm.roleId}
                    onValueChange={(v) => setUserForm({ ...userForm, roleId: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}{r.description ? ` — ${r.description}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <RolePermissionsPreview role={selectedFormRole} />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Select
                    value={userForm.companyId}
                    onValueChange={(v) => setUserForm({ ...userForm, companyId: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Select
                    value={userForm.branchId}
                    onValueChange={(v) => setUserForm({ ...userForm, branchId: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    placeholder="e.g., Service"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input
                    value={userForm.position}
                    onChange={(e) => setUserForm({ ...userForm, position: e.target.value })}
                    placeholder="e.g., Service Advisor"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              {editingUser ? 'Update User' : 'Add User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
