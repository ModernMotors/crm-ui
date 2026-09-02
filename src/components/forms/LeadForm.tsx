import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  User,
  Phone,
  Mail,
  Car,
  DollarSign,
  Target,
  Calendar,
  Tag,
  Loader2,
  Building,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import apiClient from "@/lib/api-client";

// ─── Schema ───────────────────────────────────────────────────────────────────
const leadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  customer_name: z.string().min(1, "Customer name is required"),
  customer_phone: z.string().min(1, "Phone is required"),
  customer_email: z.string().email("Invalid email").optional().or(z.literal("")),
  branch_id: z.string().min(1, "Branch is required"),
  contact_id: z.string().optional(),
  vehicle_id: z.string().optional(),
  assigned_to: z.string().optional(),
  source: z.enum([
    "website","phone_call","walk_in","referral",
    "social_media","email","advertisement","exhibition","other",
  ]),
  status: z.enum(["new","contacted","qualified","proposal","negotiation","won","lost"]),
  priority: z.enum(["low","medium","high","urgent"]),
  stage: z.enum([
    "initial_contact","needs_analysis","test_drive_scheduled",
    "proposal_sent","negotiation","closed_won","closed_lost",
  ]),
  interest_level: z.enum(["very_low","low","medium","high","very_high"]).optional(),
  expected_value: z.coerce.number().min(0).optional(),
  probability: z.coerce.number().min(0).max(100).optional(),
  vehicle_make: z.string().optional(),
  vehicle_model: z.string().optional(),
  vehicle_year: z.coerce.number().optional().or(z.literal("")),
  budget_min: z.coerce.number().min(0).optional(),
  budget_max: z.coerce.number().min(0).optional(),
  financing_required: z.boolean().default(false),
  trade_in: z.boolean().default(false),
  trade_in_vehicle: z.string().optional(),
  expected_close_date: z.string().optional(),
  next_follow_up: z.string().optional(),
  notes: z.string().optional(),
  lost_reason: z.enum([
    "price_too_high","chose_competitor","not_interested",
    "no_budget","timing","other",
  ]).optional(),
  lost_notes: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

// ─── Label maps ───────────────────────────────────────────────────────────────
export const SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  phone_call: "Phone Call",
  walk_in: "Walk-in",
  referral: "Referral",
  social_media: "Social Media",
  email: "Email",
  advertisement: "Advertisement",
  exhibition: "Exhibition",
  other: "Other",
};

export const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export const STAGE_LABELS: Record<string, string> = {
  initial_contact: "Initial Contact",
  needs_analysis: "Needs Analysis",
  test_drive_scheduled: "Test Drive Scheduled",
  proposal_sent: "Proposal Sent",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface LeadFormProps {
  initialData?: any;
  onSuccess: () => void;
  onContactSelect?: (contactId: string) => void;
  onBranchSelect?: (branchId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function LeadForm({
  initialData,
  onSuccess,
  onContactSelect,
  onBranchSelect,
}: LeadFormProps) {
  const queryClient = useQueryClient();
  const [selectedBranchId, setSelectedBranchId] = useState(
    initialData?.branch_id || ""
  );

  // ── Remote data ─────────────────────────────────────────────────────────────
  const { data: branchesRes } = useQuery({
    queryKey: ["branches"],
    queryFn: () => apiClient.getBranches(),
  });

  const { data: contactsRes } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => apiClient.getContacts(),
  });

  const { data: usersRes } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiClient.getUsers(),
  });

  const { data: vehiclesRes } = useQuery({
    queryKey: ["vehicles", selectedBranchId],
    queryFn: () =>
      apiClient.getVehicles(
        selectedBranchId ? { branch_id: selectedBranchId } : undefined
      ),
    enabled: true,
  });

  const branches = branchesRes?.data || [];
  const contacts = contactsRes?.data || [];
  const users = usersRes?.data || [];
  const vehicles = vehiclesRes?.data || [];

  // ── Form ────────────────────────────────────────────────────────────────────
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      title: initialData?.title || "",
      customer_name: initialData?.customer_name || "",
      customer_phone: initialData?.customer_phone || "",
      customer_email: initialData?.customer_email || "",
      branch_id: initialData?.branch_id || "",
      contact_id: initialData?.contact_id || "",
      vehicle_id: initialData?.vehicle_id || "",
      assigned_to: initialData?.assigned_to || "",
      source: initialData?.source || "walk_in",
      status: initialData?.status || "new",
      priority: initialData?.priority || "medium",
      stage: initialData?.stage || "initial_contact",
      interest_level: initialData?.interest_level || "medium",
      expected_value: initialData?.expected_value || 0,
      probability: initialData?.probability || 0,
      vehicle_make: initialData?.vehicle_make || "",
      vehicle_model: initialData?.vehicle_model || "",
      vehicle_year: initialData?.vehicle_year || "",
      budget_min: initialData?.budget_min || 0,
      budget_max: initialData?.budget_max || 0,
      financing_required: initialData?.financing_required || false,
      trade_in: initialData?.trade_in || false,
      trade_in_vehicle: initialData?.trade_in_vehicle || "",
      expected_close_date: initialData?.expected_close_date
        ? new Date(initialData.expected_close_date).toISOString().split("T")[0]
        : "",
      next_follow_up: initialData?.next_follow_up
        ? new Date(initialData.next_follow_up).toISOString().split("T")[0]
        : "",
      notes: initialData?.notes || "",
      lost_reason: initialData?.lost_reason || undefined,
      lost_notes: initialData?.lost_notes || "",
    },
  });

  // Watch fields for side-effects
  const watchedBranchId = form.watch("branch_id");
  const watchedContactId = form.watch("contact_id");
  const watchedStatus = form.watch("status");
  const watchedTradeIn = form.watch("trade_in");

  useEffect(() => {
    if (watchedBranchId) {
      setSelectedBranchId(watchedBranchId);
      onBranchSelect?.(watchedBranchId);
    }
  }, [watchedBranchId, onBranchSelect]);

  useEffect(() => {
    if (watchedContactId) {
      const contact = contacts.find((c: any) => c.id === watchedContactId);
      if (contact) {
        form.setValue(
          "customer_name",
          `${contact.first_name || ""} ${contact.last_name || ""}`.trim()
        );
        form.setValue("customer_phone", contact.phone || "");
        form.setValue("customer_email", contact.email || "");
        onContactSelect?.(watchedContactId);
      }
    }
  }, [watchedContactId, contacts, form, onContactSelect]);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead created successfully");
      onSuccess();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to create lead"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead updated successfully");
      onSuccess();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to update lead"),
  });

  // ── Submit ──────────────────────────────────────────────────────────────────
  function onSubmit(data: LeadFormValues) {
    const payload: any = {
      ...data,
      vehicle_year: data.vehicle_year ? Number(data.vehicle_year) : null,
      expected_value: data.expected_value || 0,
      probability: data.probability || 0,
      budget_min: data.budget_min || null,
      budget_max: data.budget_max || null,
      contact_id: data.contact_id || null,
      vehicle_id: data.vehicle_id || null,
      assigned_to: data.assigned_to || null,
      customer_email: data.customer_email || null,
    };

    if (initialData?.id) {
      updateMutation.mutate({ id: initialData.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="basic" className="flex items-center gap-1.5 text-xs">
              <User className="h-3.5 w-3.5" /> Customer
            </TabsTrigger>
            <TabsTrigger value="vehicle" className="flex items-center gap-1.5 text-xs">
              <Car className="h-3.5 w-3.5" /> Vehicle Interest
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="flex items-center gap-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5" /> Pipeline
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-1.5 text-xs">
              <MessageSquare className="h-3.5 w-3.5" /> Notes
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: Customer ── */}
          <TabsContent value="basic" className="space-y-4 mt-0">
            {/* Lead Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Ahmed Al-Sayed — Toyota Camry interest" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Branch */}
              <FormField
                control={form.control}
                name="branch_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches.map((b: any) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Link to existing contact */}
              <FormField
                control={form.control}
                name="contact_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Linked Contact</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contact (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">— None —</SelectItem>
                        {contacts.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.first_name} {c.last_name} — {c.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="Full name" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customer_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="+20 1xx xxx xxxx" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customer_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-9" placeholder="customer@email.com" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Source */}
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Source *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(SOURCE_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Assigned To */}
              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select salesperson" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">— Unassigned —</SelectItem>
                        {users.map((u: any) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.first_name} {u.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* ── TAB 2: Vehicle Interest ── */}
          <TabsContent value="vehicle" className="space-y-4 mt-0">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="vehicle_make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input placeholder="Toyota" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicle_model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Camry" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicle_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Link to specific vehicle in inventory */}
            <FormField
              control={form.control}
              name="vehicle_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specific Vehicle from Inventory</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">— None —</SelectItem>
                      {vehicles.map((v: any) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.year} {v.make} {v.model} — {v.license_plate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budget_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Min (EGP)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" type="number" placeholder="0" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Max (EGP)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" type="number" placeholder="0" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="financing_required"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Financing required
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trade_in"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Has trade-in vehicle
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {watchedTradeIn && (
              <FormField
                control={form.control}
                name="trade_in_vehicle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trade-in Vehicle Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2019 Hyundai Elantra, 85,000 km" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </TabsContent>

          {/* ── TAB 3: Pipeline ── */}
          <TabsContent value="pipeline" className="space-y-4 mt-0">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(STAGE_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PRIORITY_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interest_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "medium"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="very_low">Very Low</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="very_high">Very High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expected_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Value (EGP)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Target className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" type="number" placeholder="0" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="probability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Win Probability (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} placeholder="0–100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expected_close_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Close Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" type="date" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="next_follow_up"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Follow-up Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" type="date" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Lost reason — show only when status = lost */}
            {watchedStatus === "lost" && (
              <div className="space-y-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                <p className="text-sm font-medium text-destructive">Lost Reason</p>
                <FormField
                  control={form.control}
                  name="lost_reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="price_too_high">Price Too High</SelectItem>
                          <SelectItem value="chose_competitor">Chose Competitor</SelectItem>
                          <SelectItem value="not_interested">Not Interested</SelectItem>
                          <SelectItem value="no_budget">No Budget</SelectItem>
                          <SelectItem value="timing">Timing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lost_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea rows={2} placeholder="Details about why it was lost…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </TabsContent>

          {/* ── TAB 4: Notes ── */}
          <TabsContent value="notes" className="space-y-4 mt-0">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={8}
                      placeholder="Customer preferences, special requirements, conversation history…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border/50 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.id ? "Update Lead" : "Create Lead"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
