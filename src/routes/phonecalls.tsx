import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  Search,
  Filter,
  Download,
  MoreVertical,
  Star,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Users,
  Play,
  Pause,
  MessageSquare,
  Calendar,
  FileText,
  Trash2,
  Tag,
  FileSpreadsheet,
  Headphones,
  Mic,
  PhoneOff,
  ArrowRight,
  RefreshCw,
  Plus,
} from "lucide-react";
import { PageShell } from "@/components/AppTopbar";
import { AppSidebar } from "@/components/AppSidebar";
import { PhoneCallForm } from "@/components/forms/PhoneCallForm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/phonecalls")({
  head: () => ({
    meta: [
      { title: "Phone Calls — SIG" },
      {
        name: "description",
        content:
          "Phone call management system with detailed call logs, recordings, and customer follow-up tracking.",
      },
      { property: "og:title", content: "Phone Calls — SIG" },
      {
        property: "og:description",
        content: "Manage incoming and outgoing calls with detailed logging and customer relationship tracking.",
      },
    ],
  }),
  component: PhoneCallsPage,
});

function PhoneCallsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState("all");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedCalls, setSelectedCalls] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<any>(null);

  // Fetch phone calls from API
  const { data: phoneCallsResponse, isLoading: phoneCallsLoading } = useQuery({
    queryKey: ['phone-calls'],
    queryFn: () => apiClient.getPhoneCalls(),
  });

  // Fetch branches from API
  const { data: branchesResponse } = useQuery({
    queryKey: ['branches'],
    queryFn: () => apiClient.getBranches(),
  });

  // Fetch contacts from API
  const { data: contactsResponse } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => apiClient.getContacts(),
  });

  // Fetch vehicles from API
  const { data: vehiclesResponse } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => apiClient.getVehicles(),
  });

  const phoneCalls = phoneCallsResponse?.data || [];
  const branches = branchesResponse?.data || [];
  const contacts = contactsResponse?.data || [];
  const vehicles = vehiclesResponse?.data || [];

  // Mutations
  const deleteCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      return await apiClient.deletePhoneCall(callId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-calls'] });
      toast.success("Call deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete call");
    },
  });

  const updateCallMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiClient.updatePhoneCall(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-calls'] });
      toast.success("Call updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update call");
    },
  });

  const createCallMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiClient.createPhoneCall(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-calls'] });
      toast.success("Call created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create call");
    },
  });

  const list = useMemo(
    () =>
      phoneCalls
        .filter((c: any) => (branch === "all" ? true : c.branch_id === branch))
        .filter((c: any) => (status === "all" ? true : c.status === status))
        .filter((c: any) => (category === "all" ? true : c.purpose === category))
        .filter((c: any) => (priority === "all" ? true : c.priority === priority))
        .filter((c: any) =>
          (c.caller_name + c.caller_phone + c.notes + c.direction)
            .toLowerCase()
            .includes(q.toLowerCase())
        )
        .sort((a: any, b: any) => {
          if (sortBy === "recent") return new Date(b.call_date).getTime() - new Date(a.call_date).getTime();
          if (sortBy === "duration") return (b.call_duration || 0) - (a.call_duration || 0);
          if (sortBy === "priority") {
            const priorityOrder = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          return 0;
        }),
    [q, branch, status, category, priority, phoneCalls, sortBy]
  );

  // Statistics calculations
  const stats = useMemo(() => {
    const totalCalls = phoneCalls.length;
    const byStatus = {
      inbound: phoneCalls.filter((c: any) => c.direction === "inbound").length,
      outbound: phoneCalls.filter((c: any) => c.direction === "outbound").length,
      missed: phoneCalls.filter((c: any) => c.status === "missed").length,
      completed: phoneCalls.filter((c: any) => c.status === "completed").length,
      cancelled: phoneCalls.filter((c: any) => c.status === "cancelled").length,
      voicemail: phoneCalls.filter((c: any) => c.status === "voicemail").length,
    };
    const byPriority = {
      Urgent: phoneCalls.filter((c: any) => c.priority === "Urgent").length,
      High: phoneCalls.filter((c: any) => c.priority === "High").length,
      Medium: phoneCalls.filter((c: any) => c.priority === "Medium").length,
      Low: phoneCalls.filter((c: any) => c.priority === "Low").length,
    };
    const totalDuration = phoneCalls.reduce((sum: number, c: any) => sum + (c.call_duration || 0), 0);
    const avgDuration = totalCalls > 0 ? Math.round(totalDuration / phoneCalls.filter((c: any) => c.call_duration).length) : 0;
    const followUpRequired = phoneCalls.filter((c: any) => c.follow_up_required).length;
    const avgSatisfaction = phoneCalls.filter((c: any) => c.satisfaction_rating).length > 0
      ? Math.round(phoneCalls.reduce((sum: number, c: any) => sum + (c.satisfaction_rating || 0), 0) / phoneCalls.filter((c: any) => c.satisfaction_rating).length)
      : 0;

    return { totalCalls, byStatus, byPriority, totalDuration, avgDuration, followUpRequired, avgSatisfaction };
  }, [phoneCalls]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      inbound: "bg-blue-500/20 text-blue-700",
      outbound: "bg-green-500/20 text-green-700",
      missed: "bg-red-500/20 text-red-700",
      completed: "bg-emerald-500/20 text-emerald-700",
      cancelled: "bg-gray-500/20 text-gray-700",
      voicemail: "bg-purple-500/20 text-purple-700",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500/20 text-gray-600";
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      inbound: PhoneIncoming,
      outbound: PhoneOutgoing,
      missed: PhoneMissed,
      completed: CheckCircle,
      cancelled: PhoneOff,
      voicemail: Play,
    };
    return icons[status as keyof typeof icons] || Phone;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      Urgent: "bg-red-500/20 text-red-700 border-red-500/30",
      High: "bg-orange-500/20 text-orange-700 border-orange-500/30",
      Medium: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
      Low: "bg-green-500/20 text-green-700 border-green-500/30",
    };
    return colors[priority as keyof typeof colors] || "bg-gray-500/20 text-gray-600";
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      inquiry: "bg-blue-500/20 text-blue-700",
      appointment: "bg-purple-500/20 text-purple-700",
      support: "bg-cyan-500/20 text-cyan-700",
      complaint: "bg-red-500/20 text-red-700",
      follow_up: "bg-green-500/20 text-green-700",
      sales: "bg-orange-500/20 text-orange-700",
      other: "bg-gray-500/20 text-gray-600",
    };
    return colors[category as keyof typeof colors] || "bg-gray-500/20 text-gray-600";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCallSelection = (callId: string) => {
    const newSelection = new Set(selectedCalls);
    if (newSelection.has(callId)) {
      newSelection.delete(callId);
    } else {
      newSelection.add(callId);
    }
    setSelectedCalls(newSelection);
  };

  const toggleAllCalls = () => {
    if (selectedCalls.size === list.length) {
      setSelectedCalls(new Set());
    } else {
      setSelectedCalls(new Set(list.map((c) => c.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedCalls.size === 0) return;
    selectedCalls.forEach((callId) => {
      deleteCallMutation.mutate(callId);
    });
    setSelectedCalls(new Set());
    setIsBulkMode(false);
  };

  const handleBulkExport = () => {
    if (selectedCalls.size === 0) return;
    const selectedData = list.filter((c: any) => selectedCalls.has(c.id));
    toast.success(`Exporting ${selectedData.length} calls`);
    setIsBulkMode(false);
  };

  const handleBulkTag = () => {
    if (selectedCalls.size === 0) return;
    toast.info(`Add tags to ${selectedCalls.size} calls`);
  };

  const handleDeleteCall = (callId: string) => {
    if (confirm("Are you sure you want to delete this call?")) {
      deleteCallMutation.mutate(callId);
    }
  };

  const handleEditCall = (call: any) => {
    setEditingCall(call);
    setIsAddModalOpen(true);
  };

  const handleReturnCall = (call: any) => {
    const newCall = {
      ...call,
      id: undefined,
      direction: "outbound",
      call_date: new Date().toISOString(),
      call_duration: undefined,
      notes: `Return call regarding: ${call.notes}`,
    };
    createCallMutation.mutate(newCall);
  };

  const handleScheduleCallback = (call: any) => {
    const date = prompt("Enter callback date (YYYY-MM-DD):");
    if (date) {
      const time = prompt("Enter callback time (HH:MM):");
      if (time) {
        const newCall = {
          ...call,
          id: undefined,
          direction: "outbound",
          notes: `Scheduled callback for ${date} at ${time}`,
          follow_up_required: true,
          follow_up_date: `${date}T${time}:00`,
        };
        createCallMutation.mutate(newCall);
        toast.success("Callback scheduled successfully!");
      }
    }
  };

  const handleSendMessage = (call: any) => {
    const message = prompt(`Enter message for ${call.caller_name}:`);
    if (message) {
      toast.success(`Message sent to ${call.caller_name}: ${message}`);
    }
  };

  const handleCompleteCall = (callId: string) => {
    const call = phoneCalls.find((c: any) => c.id === callId);
    if (call) {
      updateCallMutation.mutate({
        id: callId,
        data: {
          status: "completed",
          call_duration: Math.floor((new Date().getTime() - new Date(call.call_date).getTime()) / 1000),
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentTitle="Phone Calls"
      />
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-64")}>
        <PageShell
          title="Phone Calls"
          subtitle="Incoming and outgoing call management with detailed logging, recordings, and customer follow-up tracking."
          showTopbar={false}
        >
          {/* Statistics Dashboard */}
          <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5 card-stagger">
            <Card className="glass-card hover-lift transition-all button-press">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold stat-counter">{stats.totalCalls}</p>
                    <p className="text-xs text-muted-foreground">Total Calls</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift transition-all button-press">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold stat-counter">{stats.byStatus.completed}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift transition-all button-press">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <PhoneMissed className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold stat-counter">{stats.byStatus.missed}</p>
                    <p className="text-xs text-muted-foreground">Missed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift transition-all button-press">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold stat-counter">{formatDuration(stats.avgDuration)}</p>
                    <p className="text-xs text-muted-foreground">Avg Duration</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift transition-all button-press">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold stat-counter">{stats.followUpRequired}</p>
                    <p className="text-xs text-muted-foreground">Follow-ups</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {phoneCallsLoading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-muted-foreground">Loading phone calls...</p>
            </div>
          )}

          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search contact, phone, subject, agent..."
                  className="max-w-sm pl-10"
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="voicemail">Voicemail</SelectItem>
                </SelectContent>
              </Select>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Purposes</SelectItem>
                  <SelectItem value="inquiry">Inquiry</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-2">
                <Checkbox
                  className="h-4 w-4"
                  checked={isBulkMode}
                  onCheckedChange={() => setIsBulkMode(!isBulkMode)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="hover-lift button-press"
                  onClick={() => setIsBulkMode(!isBulkMode)}
                >
                  Bulk Actions
                </Button>
              </div>
              <Button variant="outline" size="sm" className="hover-lift button-press">
                <Download className="mr-2 h-4 w-4" /> Export All
              </Button>
              <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                setIsAddModalOpen(open);
                if (!open) {
                  setEditingCall(null);
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="hover-lift button-press">
                    <Plus className="mr-2 h-4 w-4" /> New Call
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingCall ? "Edit Phone Call" : "New Phone Call"}</DialogTitle>
                  </DialogHeader>
                  <PhoneCallForm
                    editingCall={editingCall || undefined}
                    onSuccess={() => {
                      setIsAddModalOpen(false);
                      setEditingCall(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {isBulkMode && (
            <div className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between fade-in">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedCalls.size === list.length && list.length > 0}
                  onCheckedChange={toggleAllCalls}
                  className="button-press"
                />
                <span className="font-medium">{selectedCalls.size} calls selected</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover-lift button-press"
                  onClick={handleBulkTag}
                  disabled={selectedCalls.size === 0}
                >
                  <Tag className="mr-2 h-4 w-4" /> Add Tags
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover-lift button-press"
                  onClick={handleBulkExport}
                  disabled={selectedCalls.size === 0}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Export
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="hover-lift button-press"
                  onClick={handleBulkDelete}
                  disabled={selectedCalls.size === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsBulkMode(false);
                    setSelectedCalls(new Set());
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {list.map((call: any, index) => {
              const StatusIcon = getStatusIcon(call.direction);
              const contact = contacts.find((c: any) => c.id === call.contact_id);
              const branch = branches.find((b: any) => b.id === call.branch_id);

              return (
                <Link key={call.id} to={`/phonecalls/$callId`} params={{ callId: call.id }} className="block outline-none ring-primary focus-visible:ring-2 rounded-xl">
                  <Card
                    className="h-full glass-card hover-lift transition-all group button-press scale-in relative"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                  <CardContent className="space-y-4 p-5">
                    {/* Header with Contact and Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                            {getInitials(call.caller_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {call.caller_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{call.caller_phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(call.direction)} variant="secondary">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {call.direction}
                        </Badge>
                        <Badge className={getStatusColor(call.status)} variant="secondary">
                          {call.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Call Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryColor(call.purpose)} variant="secondary">
                            {call.purpose}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{branch?.name || 'Unknown'}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{call.notes || 'No notes'}</p>
                      </div>

                      {/* Related Information */}
                      <div className="flex flex-wrap gap-2">
                        {call.follow_up_required && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Follow-up Required
                          </Badge>
                        )}
                        {call.recording_url && (
                          <Badge variant="outline" className="text-xs">
                            <Play className="h-3 w-3 mr-1" />
                            Recording
                          </Badge>
                        )}
                      </div>

                      {/* Call Metadata */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(call.call_date).toLocaleString()}</span>
                          </div>
                          {call.call_duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDuration(call.call_duration)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex gap-2">
                        {call.follow_up_required && (
                          <Button variant="outline" size="sm" className="hover-lift button-press">
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Follow-up
                          </Button>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10" onClick={(e) => e.preventDefault()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleDeleteCall(call.id); }} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Call
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              );
            })}
          </div>

          {list.length === 0 && (
            <div className="text-center py-12">
              <Phone className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-lg font-medium text-muted-foreground">No phone calls found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </PageShell>
      </div>
    </div>
  );
}