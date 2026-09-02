import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BranchForm } from "@/components/forms/BranchForm";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  Users,
  Clock,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
  Calendar,
  TrendingUp,
  Car,
  Wrench,
  Package,
  Loader2,
  AlertCircle,
  RefreshCw,
  Star,
} from "lucide-react";
import { PageShell } from "@/components/AppTopbar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";

export const Route = createFileRoute("/branches")({
  head: () => ({
    meta: [
      { title: "Branches — SIG" },
      {
        name: "description",
        content: "Manage branch information, staff, vehicles, and performance metrics.",
      },
      { property: "og:title", content: "Branches — SIG" },
      {
        property: "og:description",
        content: "Branch management with detailed information and performance tracking.",
      },
    ],
  }),
  component: BranchesPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiBranch {
  id: string;
  name: string;
  code: string;
  city?: string;
  country?: string;
  address?: string;
  phone?: string;
  email?: string;
  working_hours?: string;
  branch_type: "showroom" | "service_center" | "warehouse" | "office";
  status: "active" | "inactive" | "closed";
  is_main_branch: boolean;
  manager?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  company?: {
    id: string;
    name: string;
    name_ar?: string;
    code: string;
  };
  created_at?: string;
}

interface BranchStats {
  branchId: string;
  employees: { total: number; active: number; inactive: number };
  vehicles: { total: number; available: number; unavailable: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-yellow-100 text-yellow-700 border-yellow-200",
  closed: "bg-red-100 text-red-700 border-red-200",
};

const TYPE_LABELS: Record<string, string> = {
  showroom: "Showroom",
  service_center: "Service Center",
  warehouse: "Warehouse",
  office: "Office",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

function BranchesPage() {
  const [q, setQ] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<ApiBranch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiBranch | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Data state
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, BranchStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (q.trim()) params.search = q.trim();
      if (cityFilter !== "all") params.city = cityFilter;

      const res = await apiClient.getBranches(params);
      const list: ApiBranch[] = res.data ?? [];
      setBranches(list);

      // Fetch stats for all branches in parallel (fire and forget per branch)
      const statsEntries = await Promise.allSettled(
        list.map((b) => apiClient.getBranchStats(b.id)),
      );
      const map: Record<string, BranchStats> = {};
      statsEntries.forEach((result, i) => {
        if (result.status === "fulfilled") {
          map[list[i].id] = result.value;
        }
      });
      setStatsMap(map);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to load branches";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [q, cityFilter]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const cities = Array.from(new Set(branches.map((b) => b.city).filter(Boolean))) as string[];

  const totalEmployees = Object.values(statsMap).reduce(
    (sum, s) => sum + s.employees.total,
    0,
  );
  const totalVehicles = Object.values(statsMap).reduce(
    (sum, s) => sum + s.vehicles.total,
    0,
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleFormSuccess = (saved: ApiBranch) => {
    setIsAddModalOpen(false);
    setEditBranch(null);
    fetchBranches();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await apiClient.deleteBranch(deleteTarget.id);
      toast.success("Branch deleted successfully");
      setBranches((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setStatsMap((prev) => {
        const copy = { ...prev };
        delete copy[deleteTarget.id];
        return copy;
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to delete branch";
      toast.error(msg);
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentTitle="Branch Management"
      />
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-64")}>
        <PageShell
          title="Branch Management"
          subtitle="Manage branch information, staff assignments, and operational details."
          showTopbar={false}
        >
          {/* ── Stats Overview ─────────────────────────────────────────────── */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 card-stagger mb-6">
            <Card className="glass-card hover-lift transition-all button-press">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold stat-counter">{branches.length}</p>
                    <p className="text-xs text-muted-foreground">Total Branches</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift transition-all button-press">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold stat-counter">{totalEmployees}</p>
                    <p className="text-xs text-muted-foreground">Total Staff</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift transition-all button-press">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Car className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold stat-counter">{totalVehicles}</p>
                    <p className="text-xs text-muted-foreground">Total Vehicles</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift transition-all button-press">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold stat-counter">{cities.length}</p>
                    <p className="text-xs text-muted-foreground">Cities Covered</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Search / Filter Bar ────────────────────────────────────────── */}
          <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search branches..."
                  className="max-w-sm pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={cityFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCityFilter("all")}
                  className="hover-lift"
                >
                  All Cities
                </Button>
                {cities.map((c) => (
                  <Button
                    key={c}
                    variant={cityFilter === c ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCityFilter(c)}
                    className="hover-lift"
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBranches}
                disabled={loading}
                className="hover-lift"
                aria-label="Refresh branches"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>

              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="hover-lift button-press">
                    <Plus className="mr-2 h-4 w-4" /> Add Branch
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Branch</DialogTitle>
                  </DialogHeader>
                  <BranchForm onSuccess={handleFormSuccess} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* ── Loading ────────────────────────────────────────────────────── */}
          {loading && (
            <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading branches…</span>
            </div>
          )}

          {/* ── Error ─────────────────────────────────────────────────────── */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={fetchBranches} variant="outline" className="hover-lift">
                <RefreshCw className="mr-2 h-4 w-4" /> Retry
              </Button>
            </div>
          )}

          {/* ── Branch Cards ───────────────────────────────────────────────── */}
          {!loading && !error && (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {branches.map((branch) => {
                  const stats = statsMap[branch.id];
                  return (
                    <Card key={branch.id} className="glass-card hover-lift transition-all button-press">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg truncate">{branch.name}</CardTitle>
                              {branch.is_main_branch && (
                                <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" aria-label="Main branch" />
                              )}
                            </div>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {[branch.city, branch.country].filter(Boolean).join(", ")}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 ml-2">
                            <Badge variant="outline" className="text-xs font-mono">{branch.code}</Badge>
                            <Badge
                              variant="outline"
                              className={cn("text-xs capitalize", STATUS_COLORS[branch.status])}
                            >
                              {branch.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Contact info */}
                        <div className="space-y-1.5 text-sm">
                          {branch.address && (
                            <div className="flex items-start gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">{branch.address}</span>
                            </div>
                          )}
                          {branch.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{branch.phone}</span>
                            </div>
                          )}
                          {branch.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              <span className="line-clamp-1">{branch.email}</span>
                            </div>
                          )}
                          {branch.manager && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>
                                {branch.manager.first_name} {branch.manager.last_name}
                              </span>
                            </div>
                          )}
                          {branch.working_hours && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{branch.working_hours}</span>
                            </div>
                          )}
                        </div>

                        {/* Type badge */}
                        <div>
                          <Badge variant="secondary" className="text-xs">
                            {TYPE_LABELS[branch.branch_type] ?? branch.branch_type}
                          </Badge>
                          {branch.company && (
                            <Badge variant="outline" className="text-xs ml-1.5">
                              {branch.company.name}
                            </Badge>
                          )}
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-blue-600">
                              <Users className="h-4 w-4" />
                              <span className="font-semibold">
                                {stats ? stats.employees.total : "—"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Staff</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-green-600">
                              <Car className="h-4 w-4" />
                              <span className="font-semibold">
                                {stats ? stats.vehicles.total : "—"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Vehicles</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-purple-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="font-semibold">
                                {stats ? stats.employees.active : "—"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Active</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 hover-lift"
                            onClick={() => setEditBranch(branch)}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                View Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Wrench className="mr-2 h-4 w-4" />
                                View Services
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Package className="mr-2 h-4 w-4" />
                                View Inventory
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => setDeleteTarget(branch)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Branch
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Empty state */}
              {branches.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No branches found</h3>
                  <p className="text-muted-foreground mb-4">
                    {q || cityFilter !== "all"
                      ? "Try adjusting your search criteria"
                      : "Get started by adding your first branch"}
                  </p>
                  {!q && cityFilter === "all" && (
                    <Button
                      onClick={() => setIsAddModalOpen(true)}
                      className="hover-lift button-press"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Branch
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </PageShell>
      </div>

      {/* ── Edit Modal ────────────────────────────────────────────────────── */}
      <Dialog open={!!editBranch} onOpenChange={(open) => !open && setEditBranch(null)}>
        <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
          </DialogHeader>
          {editBranch && (
            <BranchForm initialData={editBranch} onSuccess={handleFormSuccess} />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ───────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Branch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteTarget?.name}</span>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!!deletingId}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
