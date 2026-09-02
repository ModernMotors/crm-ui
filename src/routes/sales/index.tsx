import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppSidebar } from "@/components/AppSidebar";
import { PageShell } from "@/components/AppTopbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  Loader2,
  RefreshCw,
  AlertCircle,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  Clock,
  Phone,
  CheckCircle,
  XCircle,
  Flame,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  List,
  Filter,
  DollarSign,
  Calendar,
  User,
  Building,
  Car,
  ArrowUpRight,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import {
  SOURCE_LABELS,
  STATUS_LABELS,
  STAGE_LABELS,
  PRIORITY_LABELS,
} from "@/components/forms/LeadForm";

export const Route = createFileRoute("/sales/")({
  head: () => ({
    meta: [
      { title: "Sales & Leads — SIG" },
      {
        name: "description",
        content: "Manage your sales pipeline and track leads across all branches.",
      },
    ],
  }),
  component: SalesPage,
});

// ─── Types ─────────────────────────────────────────────────────────────────────
type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
type LeadPriority = "low" | "medium" | "high" | "urgent";

interface Lead {
  id: string;
  lead_number?: string;
  title: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  source: string;
  status: LeadStatus;
  stage: string;
  priority: LeadPriority;
  interest_level?: string;
  expected_value?: number;
  probability?: number;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  budget_min?: number;
  budget_max?: number;
  financing_required?: boolean;
  trade_in?: boolean;
  expected_close_date?: string;
  next_follow_up?: string;
  last_contact_date?: string;
  notes?: string;
  created_at?: string;
  branch?: { id: string; name: string; code: string };
  contact?: { id: string; first_name: string; last_name: string; phone?: string };
  vehicle?: { id: string; make: string; model: string; year: number };
  assignedUser?: { id: string; first_name: string; last_name: string };
}

// ─── Style maps ────────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<LeadStatus, string> = {
  new:         "bg-sky-100 text-sky-700 border-sky-200",
  contacted:   "bg-blue-100 text-blue-700 border-blue-200",
  qualified:   "bg-violet-100 text-violet-700 border-violet-200",
  proposal:    "bg-amber-100 text-amber-700 border-amber-200",
  negotiation: "bg-orange-100 text-orange-700 border-orange-200",
  won:         "bg-green-100 text-green-700 border-green-200",
  lost:        "bg-red-100 text-red-700 border-red-200",
};

const PRIORITY_STYLE: Record<LeadPriority, string> = {
  low:    "bg-gray-100 text-gray-600 border-gray-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  high:   "bg-orange-100 text-orange-700 border-orange-200",
  urgent: "bg-red-100 text-red-700 border-red-200",
};

const PRIORITY_ICON: Record<LeadPriority, React.ReactNode> = {
  low:    <ChevronDown className="h-3 w-3" />,
  medium: <span className="h-3 w-3 block rounded-full bg-blue-500" />,
  high:   <ChevronUp className="h-3 w-3" />,
  urgent: <Flame className="h-3 w-3" />,
};

// ─── Kanban card ───────────────────────────────────────────────────────────────
function KanbanCard({ lead, onOpen }: { lead: Lead; onOpen: (id: string) => void }) {
  const isOverdue =
    lead.next_follow_up && new Date(lead.next_follow_up) < new Date() &&
    lead.status !== "won" && lead.status !== "lost";

  return (
    <div
      onClick={() => onOpen(lead.id)}
      className={cn(
        "group bg-background border rounded-xl p-3 cursor-pointer shadow-sm",
        "hover:shadow-md hover:border-primary/40 transition-all duration-200 space-y-2",
        isOverdue && "border-l-4 border-l-red-500"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
          {lead.title}
        </p>
        <Badge className={cn("text-[10px] shrink-0 border", PRIORITY_STYLE[lead.priority])}>
          <span className="flex items-center gap-0.5">
            {PRIORITY_ICON[lead.priority]}
            {PRIORITY_LABELS[lead.priority]}
          </span>
        </Badge>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <User className="h-3 w-3 shrink-0" />
        <span className="truncate">{lead.customer_name}</span>
      </div>

      {/* Vehicle interest */}
      {(lead.vehicle_make || lead.vehicle_model) && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Car className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {[lead.vehicle_year, lead.vehicle_make, lead.vehicle_model]
              .filter(Boolean)
              .join(" ")}
          </span>
        </div>
      )}

      {/* Value + probability */}
      {(lead.expected_value || 0) > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">
              EGP {Number(lead.expected_value).toLocaleString()}
            </span>
            <span className="font-medium">{lead.probability ?? 0}%</span>
          </div>
          <Progress value={lead.probability ?? 0} className="h-1" />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
        <span>{SOURCE_LABELS[lead.source] || lead.source}</span>
        {lead.next_follow_up && (
          <span className={cn("flex items-center gap-0.5", isOverdue && "text-red-500 font-medium")}>
            <Clock className="h-2.5 w-2.5" />
            {new Date(lead.next_follow_up).toLocaleDateString("en-GB")}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
function SalesPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [view, setView] = useState<"table" | "kanban">("kanban");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: leadsData, isLoading, error, refetch } = useQuery({
    queryKey: ["leads", { status: statusFilter, priority: priorityFilter, source: sourceFilter, q }],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (priorityFilter !== "all") params.priority = priorityFilter;
      if (sourceFilter !== "all") params.source = sourceFilter;
      if (q.trim()) params.search = q.trim();
      return apiClient.getLeads(params);
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ["lead-stats"],
    queryFn: () => apiClient.getLeadStats(),
  });

  const leads: Lead[] = leadsData?.data || [];
  const stats = statsData || {};

  // ── Delete mutation ────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-stats"] });
      toast.success("Lead deleted");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete lead"),
  });

  // ── Quick status mutation ──────────────────────────────────────────────────
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.updateLeadStatus(id, status),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-stats"] });
      toast.success(`Lead marked as ${STATUS_LABELS[vars.status as LeadStatus] || vars.status}`);
    },
    onError: () => toast.error("Failed to update status"),
  });

  // ── Derived stats ──────────────────────────────────────────────────────────
  const derivedStats = useMemo(() => {
    const pipelineValue = leads
      .filter((l) => !["won", "lost"].includes(l.status))
      .reduce((s, l) => s + (Number(l.expected_value) || 0), 0);

    const wonValue = leads
      .filter((l) => l.status === "won")
      .reduce((s, l) => s + (Number(l.expected_value) || 0), 0);

    const overdueFollowUps = leads.filter(
      (l) =>
        l.next_follow_up &&
        new Date(l.next_follow_up) < new Date() &&
        !["won", "lost"].includes(l.status)
    ).length;

    return {
      total: leads.length,
      won: leads.filter((l) => l.status === "won").length,
      lost: leads.filter((l) => l.status === "lost").length,
      active: leads.filter((l) => !["won", "lost"].includes(l.status)).length,
      pipelineValue,
      wonValue,
      overdueFollowUps,
      conversionRate:
        leads.length > 0
          ? Math.round(
              (leads.filter((l) => l.status === "won").length / leads.length) * 100
            )
          : 0,
    };
  }, [leads]);

  // ── Kanban columns ─────────────────────────────────────────────────────────
  const kanbanColumns: { key: LeadStatus; label: string; color: string; icon: React.ReactNode }[] = [
    { key: "new",         label: "New",         color: "border-t-sky-400",    icon: <Target className="h-4 w-4 text-sky-500" /> },
    { key: "contacted",   label: "Contacted",   color: "border-t-blue-400",   icon: <Phone className="h-4 w-4 text-blue-500" /> },
    { key: "qualified",   label: "Qualified",   color: "border-t-violet-400", icon: <CheckCircle className="h-4 w-4 text-violet-500" /> },
    { key: "proposal",    label: "Proposal",    color: "border-t-amber-400",  icon: <TrendingUp className="h-4 w-4 text-amber-500" /> },
    { key: "negotiation", label: "Negotiation", color: "border-t-orange-400", icon: <ArrowUpRight className="h-4 w-4 text-orange-500" /> },
    { key: "won",         label: "Won",         color: "border-t-green-400",  icon: <Trophy className="h-4 w-4 text-green-500" /> },
    { key: "lost",        label: "Lost",        color: "border-t-red-400",    icon: <XCircle className="h-4 w-4 text-red-500" /> },
  ];

  const leadsByStatus = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    kanbanColumns.forEach(({ key }) => { map[key] = []; });
    leads.forEach((l) => {
      if (map[l.status]) map[l.status].push(l);
    });
    return map;
  }, [leads]);

  const formatCurrency = (v: number) =>
    v >= 1_000_000
      ? `${(v / 1_000_000).toFixed(1)}M`
      : v >= 1_000
      ? `${(v / 1_000).toFixed(0)}K`
      : String(v);

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-GB") : "—";

  const navigateToLead = (id: string) => {
    window.location.href = `/sales/${id}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentTitle="Sales & Leads"
      />

      <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-64")}>
        <PageShell
          title="Sales & Leads"
          subtitle="Manage your pipeline, track leads, and close more deals across all branches."
          showTopbar={false}
        >
          {/* ── Stats row ── */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {[
              { label: "Total Leads",     value: derivedStats.total,           icon: <Target className="h-4 w-4" />,       color: "text-foreground"  },
              { label: "Active",          value: derivedStats.active,          icon: <TrendingUp className="h-4 w-4" />,   color: "text-blue-600"    },
              { label: "Won",             value: derivedStats.won,             icon: <Trophy className="h-4 w-4" />,       color: "text-green-600"   },
              { label: "Lost",            value: derivedStats.lost,            icon: <XCircle className="h-4 w-4" />,      color: "text-red-600"     },
              { label: "Win Rate",        value: `${derivedStats.conversionRate}%`, icon: <CheckCircle className="h-4 w-4" />, color: "text-violet-600" },
              { label: "Pipeline",        value: `EGP ${formatCurrency(derivedStats.pipelineValue)}`, icon: <DollarSign className="h-4 w-4" />, color: "text-amber-600" },
              { label: "Won Value",       value: `EGP ${formatCurrency(derivedStats.wonValue)}`,      icon: <TrendingUp className="h-4 w-4" />, color: "text-green-600" },
              { label: "Overdue Follow", value: derivedStats.overdueFollowUps, icon: <Clock className="h-4 w-4" />,        color: derivedStats.overdueFollowUps > 0 ? "text-red-600" : "text-foreground" },
            ].map((s) => (
              <Card key={s.label} className="glass-card hover-lift transition-all">
                <CardContent className="p-3">
                  <div className={cn("mb-1", s.color)}>{s.icon}</div>
                  <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                  <p className={cn("text-xl font-bold mt-0.5", s.color)}>{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Toolbar ── */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name, phone, title…"
                  className="pl-9 w-[230px]"
                />
              </div>

              {/* Status */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[145px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Priority */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {Object.entries(PRIORITY_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Source */}
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[145px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {Object.entries(SOURCE_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setView("kanban")}
                  className={cn(
                    "px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors",
                    view === "kanban" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> Kanban
                </button>
                <button
                  onClick={() => setView("table")}
                  className={cn(
                    "px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors",
                    view === "table" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                >
                  <List className="h-3.5 w-3.5" /> Table
                </button>
              </div>

              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading} className="hover-lift">
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>

              <Button asChild className="hover-lift button-press">
                <Link to="/sales/create">
                  <Plus className="mr-2 h-4 w-4" /> New Lead
                </Link>
              </Button>
            </div>
          </div>

          {/* ── Loading ── */}
          {isLoading && (
            <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading leads…</span>
            </div>
          )}

          {/* ── Error ── */}
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="text-muted-foreground">
                {(error as any)?.response?.data?.message || "Failed to load leads"}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" /> Retry
              </Button>
            </div>
          )}

          {/* ── KANBAN VIEW ── */}
          {!isLoading && !error && view === "kanban" && (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-3 min-w-max">
                {kanbanColumns.map((col) => {
                  const colLeads = leadsByStatus[col.key] || [];
                  const colValue = colLeads.reduce(
                    (s, l) => s + (Number(l.expected_value) || 0), 0
                  );
                  return (
                    <div
                      key={col.key}
                      className={cn(
                        "w-64 shrink-0 rounded-xl border border-border/60 bg-muted/30",
                        "border-t-4", col.color
                      )}
                    >
                      {/* Column header */}
                      <div className="p-3 border-b border-border/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {col.icon}
                            <span className="font-semibold text-sm">{col.label}</span>
                            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                              {colLeads.length}
                            </span>
                          </div>
                        </div>
                        {colValue > 0 && (
                          <p className="text-[11px] text-muted-foreground mt-1">
                            EGP {colValue.toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* Cards */}
                      <div className="p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-380px)] overflow-y-auto">
                        {colLeads.length === 0 ? (
                          <p className="text-center text-xs text-muted-foreground py-8 opacity-60">
                            No leads
                          </p>
                        ) : (
                          colLeads.map((lead) => (
                            <KanbanCard key={lead.id} lead={lead} onOpen={navigateToLead} />
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TABLE VIEW ── */}
          {!isLoading && !error && view === "table" && (
            <Card className="glass-card shadow-lg border-border/40">
              <CardContent className="p-0 overflow-hidden rounded-xl">
                {leads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                    <TrendingUp className="h-10 w-10 opacity-30" />
                    <p>No leads found. Create your first lead.</p>
                    <Button asChild>
                      <Link to="/sales/create"><Plus className="mr-2 h-4 w-4" /> New Lead</Link>
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Vehicle Interest</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Win %</TableHead>
                        <TableHead>Follow-up</TableHead>
                        <TableHead>Assigned</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => {
                        const isOverdue =
                          lead.next_follow_up &&
                          new Date(lead.next_follow_up) < new Date() &&
                          !["won", "lost"].includes(lead.status);

                        return (
                          <TableRow
                            key={lead.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors group"
                            onClick={() => navigateToLead(lead.id)}
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                                  {lead.title}
                                </p>
                                {lead.lead_number && (
                                  <p className="text-[11px] text-muted-foreground">{lead.lead_number}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium">{lead.customer_name}</p>
                                <p className="text-xs text-muted-foreground">{lead.customer_phone}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {[lead.vehicle_year, lead.vehicle_make, lead.vehicle_model]
                                  .filter(Boolean)
                                  .join(" ") || "—"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("text-xs border", STATUS_STYLE[lead.status])}>
                                {STATUS_LABELS[lead.status]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("text-xs border flex items-center gap-0.5 w-fit", PRIORITY_STYLE[lead.priority])}>
                                {PRIORITY_ICON[lead.priority]}
                                {PRIORITY_LABELS[lead.priority]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium">
                                {lead.expected_value
                                  ? `EGP ${Number(lead.expected_value).toLocaleString()}`
                                  : "—"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {lead.probability != null ? (
                                <div className="flex items-center gap-2 min-w-[80px]">
                                  <Progress value={lead.probability} className="h-1.5 flex-1" />
                                  <span className="text-xs text-muted-foreground w-8 text-right">
                                    {lead.probability}%
                                  </span>
                                </div>
                              ) : "—"}
                            </TableCell>
                            <TableCell>
                              <span className={cn("text-sm", isOverdue && "text-red-500 font-medium flex items-center gap-1")}>
                                {isOverdue && <Clock className="h-3 w-3" />}
                                {formatDate(lead.next_follow_up)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {lead.assignedUser
                                  ? `${lead.assignedUser.first_name} ${lead.assignedUser.last_name}`
                                  : "—"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{lead.branch?.name || "—"}</span>
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigateToLead(lead.id)}>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/sales/${lead.id}`}>Edit Lead</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      statusMutation.mutate({ id: lead.id, status: "won" })
                                    }
                                    className="text-green-600"
                                  >
                                    <Trophy className="mr-2 h-3.5 w-3.5" /> Mark as Won
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      statusMutation.mutate({ id: lead.id, status: "lost" })
                                    }
                                    className="text-red-500"
                                  >
                                    <XCircle className="mr-2 h-3.5 w-3.5" /> Mark as Lost
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setDeleteTarget(lead)}
                                    className="text-destructive"
                                  >
                                    Delete Lead
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </PageShell>
      </div>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
