import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/AppTopbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Building,
  Car,
  DollarSign,
  Tag,
  TrendingUp,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Award,
  MessageSquare,
} from "lucide-react";
import { LeadForm, SOURCE_LABELS, STATUS_LABELS } from "@/components/forms/LeadForm";
import apiClient from "@/lib/api-client";

export const Route = createFileRoute("/sales/create")({
  head: () => ({
    meta: [
      { title: "Create Lead — SIG" },
      { name: "description", content: "Create a new sales lead." },
    ],
  }),
  component: CreateLeadPage,
});

// ─── Quick tips ───────────────────────────────────────────────────────────────
const TIPS = [
  { icon: <Zap className="h-4 w-4 text-amber-500" />, text: "Link to an existing contact to pull their info automatically." },
  { icon: <Target className="h-4 w-4 text-violet-500" />, text: "Set a realistic win probability to keep your pipeline accurate." },
  { icon: <Calendar className="h-4 w-4 text-blue-500" />, text: "Always set a next follow-up date to keep the deal moving." },
  { icon: <Award className="h-4 w-4 text-green-500" />, text: "Mark the lead source so you can track your best channels." },
];

function CreateLeadPage() {
  const [selectedContactId, setSelectedContactId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");

  // ── Data for sidebar cards ────────────────────────────────────────────────
  const { data: contactsData } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => apiClient.getContacts(),
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["lead-stats"],
    queryFn: () => apiClient.getLeadStats(),
  });

  const { data: branchesData } = useQuery({
    queryKey: ["branches"],
    queryFn: () => apiClient.getBranches(),
  });

  const contacts = contactsData?.data || [];
  const branches = branchesData?.data || [];
  const stats = statsData || {};

  const selectedContact = selectedContactId
    ? contacts.find((c: any) => c.id === selectedContactId)
    : null;

  const selectedBranch = selectedBranchId
    ? branches.find((b: any) => b.id === selectedBranchId)
    : null;

  const getContactName = (c: any) =>
    `${c.first_name || ""} ${c.last_name || ""}`.trim();

  return (
    <PageShell
      title="Create New Lead"
      subtitle="Add a new lead to the sales pipeline and start tracking the opportunity."
    >
      {/* ── Back + badge row ── */}
      <div className="mb-3 flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link to="/sales">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leads
          </Link>
        </Button>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-white gap-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            {statsLoading ? "…" : stats.total ?? 0} total leads
          </Badge>
          <Badge variant="outline" className="bg-white gap-1">
            <Clock className="h-3 w-3 text-amber-500" />
            {statsLoading ? "…" : stats.overdue_follow_ups ?? 0} overdue
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ── Main form ── */}
        <div className="lg:col-span-2">
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-4">
              <div className="mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Lead Details</h2>
                  <p className="text-xs text-muted-foreground">Fill in the information to create the lead</p>
                </div>
              </div>

              <LeadForm
                onSuccess={() => window.history.back()}
                onContactSelect={setSelectedContactId}
                onBranchSelect={setSelectedBranchId}
              />
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Pipeline stats mini */}
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Pipeline Overview
              </h3>
              {statsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                  {[
                    { label: "Total Leads",   value: stats.total ?? 0,                                                color: "text-foreground"  },
                    { label: "Won",           value: stats.byStatus?.won ?? 0,                                        color: "text-green-600"   },
                    { label: "In Pipeline",   value: (stats.total ?? 0) - (stats.byStatus?.won ?? 0) - (stats.byStatus?.lost ?? 0), color: "text-blue-600" },
                    { label: "Pipeline Value",value: `EGP ${Number(stats.pipeline_value || 0).toLocaleString()}`,     color: "text-amber-600"   },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className={`font-semibold ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected contact card */}
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" /> Contact Profile
              </h3>

              {selectedContact ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getContactName(selectedContact))}&background=random&color=fff&size=80`}
                        alt={getContactName(selectedContact)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{getContactName(selectedContact)}</p>
                      <p className="text-xs text-muted-foreground">{selectedContact.type}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 border-t pt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {selectedContact.phone}
                    </div>
                    {selectedContact.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" /> <span className="truncate">{selectedContact.email}</span>
                      </div>
                    )}
                    {selectedContact.company && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Building className="h-3 w-3" /> {selectedContact.company}
                      </div>
                    )}
                    {selectedContact.loyalty_tier && (
                      <div className="flex items-center gap-2 text-xs">
                        <Award className="h-3 w-3 text-amber-500" />
                        <Badge variant="outline" className="text-[10px] py-0">
                          {selectedContact.loyalty_tier}
                        </Badge>
                      </div>
                    )}
                    {selectedContact.total_spent > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        Total spent: EGP {Number(selectedContact.total_spent).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Select a contact in the Customer tab to see their profile.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Selected branch card */}
          {selectedBranch && (
            <Card className="border-gray-200 bg-white">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                  <Building className="h-4 w-4" /> Branch Info
                </h3>
                <div className="space-y-1.5">
                  <p className="font-medium text-sm">{selectedBranch.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedBranch.code}</p>
                  {selectedBranch.address && (
                    <p className="text-xs text-muted-foreground">{selectedBranch.address}</p>
                  )}
                  {selectedBranch.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {selectedBranch.phone}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card className="border-dashed border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm text-primary mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Tips
              </h3>
              <ul className="space-y-2">
                {TIPS.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="shrink-0 mt-0.5">{tip.icon}</span>
                    <span>{tip.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
