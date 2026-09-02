import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  Key,
  Users,
  Lock,
  Search,
  Edit,
  MoreVertical,
  Info,
  Copy,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { PageShell } from "@/components/AppTopbar";
import { AppSidebar } from "@/components/AppSidebar";
import { availablePermissions } from "@/lib/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/roles")({
  head: () => ({
    meta: [
      { title: "Roles & Permissions — SIG" },
      {
        name: "description",
        content: "Manage user roles, permissions, and access control policies.",
      },
    ],
  }),
  component: RolesPage,
});

// ─── helpers ─────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-red-500/20 text-red-700 border-red-500/30",
  admin:       "bg-orange-500/20 text-orange-700 border-orange-500/30",
  manager:     "bg-blue-500/20 text-blue-700 border-blue-500/30",
  supervisor:  "bg-green-500/20 text-green-700 border-green-500/30",
  staff:       "bg-purple-500/20 text-purple-700 border-purple-500/30",
  viewer:      "bg-gray-500/20 text-gray-700 border-gray-500/30",
};

const CAT_COLORS: Record<string, string> = {
  read:   "bg-blue-50 text-blue-700 border-blue-200",
  write:  "bg-green-50 text-green-700 border-green-200",
  delete: "bg-red-50 text-red-700 border-red-200",
  admin:  "bg-purple-50 text-purple-700 border-purple-200",
  export: "bg-orange-50 text-orange-700 border-orange-200",
  import: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

const roleColor = (name: string) =>
  ROLE_COLORS[name?.toLowerCase().replace(" ", "_")] ??
  "bg-gray-500/20 text-gray-700 border-gray-500/30";

const roleIcon = (name: string) => {
  const n = name?.toLowerCase();
  if (n?.includes("super") || n?.includes("admin")) return <Shield className="h-5 w-5" />;
  if (n?.includes("manager")) return <Users className="h-5 w-5" />;
  if (n?.includes("supervisor")) return <Lock className="h-5 w-5" />;
  return <Users className="h-5 w-5" />;
};

// Group the fixed permission catalog by module
const groupedPermissions = availablePermissions.reduce<Record<string, typeof availablePermissions>>(
  (acc, p) => { (acc[p.module] ??= []).push(p); return acc; },
  {}
);

// ─── default permissions per role level ──────────────────────────────────────
const DEFAULT_PERMISSIONS: Record<number, string[]> = {
  100: availablePermissions.map((p) => p.id), // super admin
  90:  availablePermissions.filter((p) => p.category !== "delete" && p.category !== "admin").map((p) => p.id),
  70:  availablePermissions.filter((p) => ["read", "write"].includes(p.category) && ["Contacts","Appointments","Vehicles","Helpdesk"].includes(p.module)).map((p) => p.id),
  50:  availablePermissions.filter((p) => p.category === "read").map((p) => p.id),
  30:  availablePermissions.filter((p) => p.category === "read" && ["Contacts","Appointments"].includes(p.module)).map((p) => p.id),
  0:   [],
};
const closestDefaults = (level: number) =>
  DEFAULT_PERMISSIONS[Object.keys(DEFAULT_PERMISSIONS).map(Number).sort((a, b) => b - a).find((l) => level >= l) ?? 0];

// ─── role dialog ──────────────────────────────────────────────────────────────
function RoleDialog({
  open,
  onClose,
  initialData,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initialData?: any;
  onSaved: () => void;
}) {
  const isEditing = !!initialData;
  const [form, setForm] = useState({
    name: initialData?.name || "",
    name_ar: initialData?.name_ar || "",
    description: initialData?.description || "",
    level: initialData?.level ?? 30,
    is_active: initialData?.is_active ?? true,
    permissions: (initialData?.permissions as string[]) || [],
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEditing
        ? apiClient.updateRole(initialData.id, data)
        : apiClient.createRole(data),
    onSuccess: () => {
      toast.success(isEditing ? "Role updated!" : "Role created!");
      onSaved();
      onClose();
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to save role"),
  });

  const togglePerm = (id: string) =>
    set("permissions", form.permissions.includes(id)
      ? form.permissions.filter((p) => p !== id)
      : [...form.permissions, id]);

  const toggleModule = (module: string, perms: typeof availablePermissions) => {
    const ids = perms.map((p) => p.id);
    const allOn = ids.every((id) => form.permissions.includes(id));
    set("permissions", allOn
      ? form.permissions.filter((id) => !ids.includes(id))
      : [...new Set([...form.permissions, ...ids])]);
  };

  const applyDefaults = () => set("permissions", closestDefaults(form.level));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Role" : "Create New Role"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Role Name <span className="text-red-500">*</span></Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g., Branch Manager" />
            </div>
            <div className="space-y-1">
              <Label>Arabic Name</Label>
              <Input value={form.name_ar} onChange={(e) => set("name_ar", e.target.value)} placeholder="مثال: مدير الفرع" dir="rtl" />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} placeholder="Describe this role's responsibilities…" />
            </div>
            <div className="space-y-1">
              <Label>Level (0–100)</Label>
              <Input type="number" min={0} max={100} value={form.level} onChange={(e) => set("level", Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">Higher = more privileged. Super Admin = 100.</p>
            </div>
            <div className="flex items-center gap-2 mt-5">
              <Checkbox
                id="active-chk"
                checked={form.is_active}
                onCheckedChange={(v) => set("is_active", !!v)}
              />
              <Label htmlFor="active-chk" className="cursor-pointer">Active</Label>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Permissions
                <Badge variant="secondary" className="ml-2">{form.permissions.length} / {availablePermissions.length}</Badge>
              </h3>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={applyDefaults}>
                  <RefreshCw className="w-3 h-3 mr-1" /> Apply Defaults
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => set("permissions", availablePermissions.map((p) => p.id))}>
                  Select All
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => set("permissions", [])}>
                  Clear All
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(groupedPermissions).map(([module, perms]) => {
                const ids = perms.map((p) => p.id);
                const grantedCount = ids.filter((id) => form.permissions.includes(id)).length;
                const allOn = grantedCount === ids.length;
                const someOn = grantedCount > 0 && !allOn;
                return (
                  <Card key={module} className={cn("border-2", allOn ? "border-green-400 bg-green-50/40" : someOn ? "border-yellow-400 bg-yellow-50/30" : "border-border")}>
                    <CardHeader className="py-2 px-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{module}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{grantedCount}/{perms.length}</Badge>
                          <Checkbox
                            checked={allOn}
                            onCheckedChange={() => toggleModule(module, perms)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-1 px-3 space-y-1">
                      {perms.map((p) => (
                        <div key={p.id} className={cn("flex items-center justify-between px-2 py-1 rounded text-sm", form.permissions.includes(p.id) ? "bg-green-100" : "hover:bg-muted/50")}>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`perm-${p.id}`}
                              checked={form.permissions.includes(p.id)}
                              onCheckedChange={() => togglePerm(p.id)}
                            />
                            <label htmlFor={`perm-${p.id}`} className="cursor-pointer">{p.name}</label>
                          </div>
                          <Badge variant="outline" className={cn("text-xs capitalize", CAT_COLORS[p.category])}>{p.action}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={() => {
                if (!form.name.trim()) return toast.error("Role name is required");
                mutation.mutate(form);
              }}
              disabled={mutation.isPending}
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Role"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
function RolesPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("roles");
  const [editingRole, setEditingRole] = useState<any>(null);
  const [roleDialog, setRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // API: fetch roles
  const { data: rolesData, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => apiClient.getRoles(),
    select: (d) => d.data || [],
  });
  const roles: any[] = rolesData || [];

  // API: fetch users to count per role
  const { data: usersData } = useQuery({
    queryKey: ["users-summary"],
    queryFn: () => apiClient.getUsers(),
    select: (d) => d.data || [],
  });
  const users: any[] = usersData || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role deleted");
      setDeleteConfirm(null);
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Cannot delete this role"),
  });

  // save permissions for a role
  const savePermsMutation = useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
      apiClient.updateRole(id, { permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Permissions saved!");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to save permissions"),
  });

  const filteredRoles = useMemo(
    () => roles.filter((r) => r.name?.toLowerCase().includes(q.toLowerCase())),
    [q, roles]
  );

  const [editPerms, setEditPerms] = useState<string[]>([]);

  const openMatrix = (role: any) => {
    setSelectedRole(role);
    setEditPerms(role.permissions || []);
    setActiveTab("permissions");
  };

  const totalPermCount = (role: any) => (role.permissions || []).length;

  const toggleP = (id: string) =>
    setEditPerms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const toggleModuleP = (module: string, perms: typeof availablePermissions) => {
    const ids = perms.map((p) => p.id);
    const allOn = ids.every((id) => editPerms.includes(id));
    setEditPerms((prev) =>
      allOn ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentTitle="Roles & Permissions"
      />
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-64")}>
        <PageShell
          title="Roles & Permissions"
          subtitle="Configure role-based access control and permission management."
          showTopbar={false}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
              <TabsTrigger value="roles" className="gap-2">
                <Shield className="h-4 w-4" /> Roles Overview
              </TabsTrigger>
              <TabsTrigger value="permissions" className="gap-2">
                <Key className="h-4 w-4" /> Permission Matrix
              </TabsTrigger>
            </TabsList>

            {/* ── ROLES TAB ── */}
            <TabsContent value="roles" className="space-y-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="relative max-w-sm flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search roles…" className="pl-10" />
                </div>
                <Button onClick={() => { setEditingRole(null); setRoleDialog(true); }} className="hover-lift">
                  <Plus className="mr-2 h-4 w-4" /> New Role
                </Button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredRoles.map((role) => {
                    const userCount = users.filter((u: any) => u.role_id === role.id).length;
                    const permCount = totalPermCount(role);
                    return (
                      <Card key={role.id} className="glass-card hover-lift transition-all">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-lg", roleColor(role.name).split(" ")[0])}>
                                {roleIcon(role.name)}
                              </div>
                              <div>
                                <CardTitle className="text-lg">{role.name}</CardTitle>
                                {role.name_ar && <CardDescription className="text-xs" dir="rtl">{role.name_ar}</CardDescription>}
                                <CardDescription className="text-xs">{userCount} user{userCount !== 1 ? "s" : ""}</CardDescription>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge className={roleColor(role.name)} variant="outline">
                                {permCount} perms
                              </Badge>
                              {role.is_system && (
                                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                                  System
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {role.description && (
                            <p className="text-sm text-muted-foreground">{role.description}</p>
                          )}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Permission coverage</span>
                              <span className="font-medium">{permCount} / {availablePermissions.length}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${(permCount / availablePermissions.length) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>Level: {role.level ?? 0}</span>
                            <span className="ml-auto">
                              <Badge variant={role.is_active ? "default" : "secondary"} className="text-xs">
                                {role.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </span>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <Button variant="outline" size="sm" className="flex-1 hover-lift" onClick={() => openMatrix(role)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Permissions
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setEditingRole(role); setRoleDialog(true); }}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit Role
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setEditPerms(closestDefaults(role.level ?? 0));
                                  setSelectedRole(role);
                                  toast.info("Defaults loaded. Switch to Permissions tab to review and save.");
                                  setActiveTab("permissions");
                                }}>
                                  <RefreshCw className="mr-2 h-4 w-4" /> Reset to Defaults
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {!role.is_system && (
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => setDeleteConfirm({ id: role.id, name: role.name })}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {filteredRoles.length === 0 && !isLoading && (
                    <div className="col-span-3 text-center py-16 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No roles found</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ── PERMISSIONS MATRIX TAB ── */}
            <TabsContent value="permissions" className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Permission Matrix</CardTitle>
                  <CardDescription>
                    Select a role then toggle individual permissions. Changes are not saved until you click "Save".
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Role selector */}
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <Button
                        key={role.id}
                        size="sm"
                        variant={selectedRole?.id === role.id ? "default" : "outline"}
                        onClick={() => {
                          setSelectedRole(role);
                          setEditPerms(role.permissions || []);
                        }}
                        className={cn("gap-1", selectedRole?.id === role.id && "ring-2 ring-primary")}
                      >
                        {roleIcon(role.name)} {role.name}
                      </Button>
                    ))}
                  </div>

                  {selectedRole ? (
                    <div className="space-y-4">
                      {/* Role info banner */}
                      <div className={cn("flex items-center gap-4 p-4 rounded-lg border", roleColor(selectedRole.name).replace("border-", "border-").replace("bg-", "bg-").replace("/20", "/10"))}>
                        <div className={cn("p-3 rounded-lg", roleColor(selectedRole.name).split(" ")[0])}>
                          {roleIcon(selectedRole.name)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{selectedRole.name}</h3>
                          {selectedRole.description && (
                            <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{editPerms.length}</p>
                          <p className="text-xs text-muted-foreground">permissions selected</p>
                        </div>
                      </div>

                      {/* Bulk controls */}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditPerms(availablePermissions.map((p) => p.id))}>
                          Select All
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditPerms([])}>
                          Clear All
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditPerms(closestDefaults(selectedRole.level ?? 0))}>
                          <RefreshCw className="w-3 h-3 mr-1" /> Defaults
                        </Button>
                      </div>

                      {/* Permission groups */}
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(groupedPermissions).map(([module, perms]) => {
                          const ids = perms.map((p) => p.id);
                          const grantedCount = ids.filter((id) => editPerms.includes(id)).length;
                          const allOn = grantedCount === ids.length;
                          const someOn = grantedCount > 0 && !allOn;
                          return (
                            <Card key={module} className={cn("border-2 transition-all", allOn ? "border-green-400 bg-green-50/40" : someOn ? "border-yellow-400 bg-yellow-50/30" : "border-border")}>
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-sm">{module}</CardTitle>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">{grantedCount}/{perms.length}</Badge>
                                    <Checkbox checked={allOn} onCheckedChange={() => toggleModuleP(module, perms)} />
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-1">
                                {perms.map((p) => (
                                  <div
                                    key={p.id}
                                    className={cn(
                                      "flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors",
                                      editPerms.includes(p.id) ? "bg-green-100 border border-green-200" : "hover:bg-muted/50 border border-transparent"
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Checkbox
                                        id={`m-${p.id}`}
                                        checked={editPerms.includes(p.id)}
                                        onCheckedChange={() => toggleP(p.id)}
                                      />
                                      <label htmlFor={`m-${p.id}`} className="cursor-pointer text-xs">{p.name}</label>
                                    </div>
                                    <Badge variant="outline" className={cn("text-xs capitalize", CAT_COLORS[p.category])}>
                                      {p.action}
                                    </Badge>
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>

                      {/* Save bar */}
                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setEditPerms(selectedRole.permissions || [])}>
                          <RefreshCw className="mr-2 h-4 w-4" /> Discard Changes
                        </Button>
                        <Button
                          disabled={savePermsMutation.isPending}
                          onClick={() => savePermsMutation.mutate({ id: selectedRole.id, permissions: editPerms })}
                        >
                          {savePermsMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          Save Permissions
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <h3 className="font-semibold mb-1">Select a Role</h3>
                      <p className="text-sm">Choose a role above to view and edit its permissions</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats row */}
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { label: "Total Permissions", value: availablePermissions.length, icon: Key, color: "text-primary" },
                  { label: "Defined Roles", value: roles.length, icon: Shield, color: "text-blue-500" },
                  { label: "Active Roles", value: roles.filter((r) => r.is_active).length, icon: CheckCircle2, color: "text-green-500" },
                  { label: "Total Users", value: users.length, icon: Users, color: "text-purple-500" },
                ].map((s) => (
                  <Card key={s.label} className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <s.icon className={cn("h-5 w-5", s.color)} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{s.value}</p>
                          <p className="text-xs text-muted-foreground">{s.label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </PageShell>
      </div>

      {/* Role create/edit dialog */}
      {roleDialog && (
        <RoleDialog
          open={roleDialog}
          onClose={() => { setRoleDialog(false); setEditingRole(null); }}
          initialData={editingRole}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ["roles"] })}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <Dialog open onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Delete Role</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">
              Delete <span className="font-semibold text-foreground">"{deleteConfirm.name}"</span>?
              Users assigned this role will lose their permissions. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteConfirm.id)}
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
