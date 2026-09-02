import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { PageShell } from "@/components/AppTopbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ContactForm } from "@/components/forms/ContactForm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  ArrowLeft, MapPin, Award, CreditCard, Car, Calendar, ShieldCheck, Pen,
  Phone, Mail, MessageSquare, Clock, AlertCircle, CheckCircle, 
  TrendingUp, Activity, FileText, Wrench, User, Building, Star,
  Download, Share2, Edit, Plus, History
} from "lucide-react";

export const Route = createFileRoute("/contacts/$contactId")({
  component: ContactDetailsPage,
});

function ContactDetailsPage() {
  const { contactId } = Route.useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch contact details from API
  const { data: contact, isLoading: contactLoading, error: contactError, refetch } = useQuery({
    queryKey: ['contact', contactId],
    queryFn: () => apiClient.getContact(contactId),
  });

  // Fetch contact activity from API
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['contactActivity', contactId],
    queryFn: () => apiClient.getContactActivity(contactId),
    enabled: !!contact,
  });

  // Fetch branches for display
  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: () => apiClient.getBranches(),
  });

  const branches = branchesData?.data || [];
  const activity = activityData || {
    appointments: [],
    tickets: [],
    totalAppointments: 0,
    totalTickets: 0,
    openTickets: 0
  };

  if (contactError) {
    return (
      <PageShell title="Contact Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Contact not found</p>
          <Button variant="outline" asChild>
            <Link to="/contacts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contacts
            </Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  if (contactLoading) {
    return (
      <PageShell title="Loading...">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading contact details...</p>
        </div>
      </PageShell>
    );
  }

  if (!contact) {
    return (
      <PageShell title="Contact Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Contact not found</p>
          <Button variant="outline" asChild>
            <Link to="/contacts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contacts
            </Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const loyaltyColors = {
    Bronze: "bg-orange-700/20 text-orange-700",
    Silver: "bg-slate-400/20 text-slate-600 dark:text-slate-300",
    Gold: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-500",
    Platinum: "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getContactName = (contact: any) => {
    return `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || 'Unknown Branch';
  };

  // Get contact-specific data
  const contactAppointments = activity.appointments || [];
  const contactTickets = activity.tickets || [];
  const openTickets = contactTickets.filter((t: any) => t.stage !== "Solved");
  const closedTickets = contactTickets.filter((t: any) => t.stage === "Solved");

  // Calculate activity metrics
  const totalVisits = activity.totalAppointments || 0;
  const completedVisits = contactAppointments.filter((a: any) => a.status === "Completed").length;
  const cancelledVisits = contactAppointments.filter((a: any) => a.status === "Cancelled").length;
  const upcomingVisits = contactAppointments.filter((a: any) => a.status === "Confirmed" || a.status === "Pending").length;

  const contactName = getContactName(contact);
  const loyaltyTier = contact.loyalty_tier || "Bronze";

  return (
    <PageShell
      title={contactName}
      subtitle={contact.company || contact.type}
    >
      {/* Header with Quick Actions */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild className="hover-lift">
            <Link to="/contacts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contacts
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback className={cn(
                "font-semibold text-sm",
                contact.type === "Fleet" ? "bg-purple-500/20 text-purple-700" :
                contact.type === "Company" ? "bg-blue-500/20 text-blue-700" :
                "bg-green-500/20 text-green-700"
              )}>
                {getInitials(contact.first_name, contact.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{contactName}</p>
              <p className="text-xs text-muted-foreground">{contact.email || 'No email'}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="hover-lift button-press">
            <Phone className="mr-2 h-4 w-4" /> Call
          </Button>
          <Button variant="outline" size="sm" className="hover-lift button-press">
            <Mail className="mr-2 h-4 w-4" /> Email
          </Button>
          <Button variant="outline" size="sm" className="hover-lift button-press">
            <MessageSquare className="mr-2 h-4 w-4" /> Message
          </Button>
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="hover-lift button-press">
                <Pen className="mr-2 h-4 w-4" /> Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Contact</DialogTitle>
              </DialogHeader>
              <ContactForm initialData={contact} onSuccess={() => {
                setIsEditModalOpen(false);
                refetch();
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Activity Overview Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4 card-stagger">
        <Card className="glass-card hover-lift transition-all button-press">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold stat-counter">{totalVisits}</p>
                <p className="text-xs text-muted-foreground">Total Visits</p>
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
                <p className="text-2xl font-bold stat-counter">{completedVisits}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift transition-all button-press">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold stat-counter">{upcomingVisits}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift transition-all button-press">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold stat-counter">{openTickets.length}</p>
                <p className="text-xs text-muted-foreground">Open Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 tab-content fade-in">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Card */}
            <Card className="glass-card md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarFallback className={cn(
                      "font-semibold text-lg",
                      contact.type === "Fleet" ? "bg-purple-500/20 text-purple-700" :
                      contact.type === "Company" ? "bg-blue-500/20 text-blue-700" :
                      "bg-green-500/20 text-green-700"
                    )}>
                      {getInitials(contact.first_name, contact.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{contactName}</p>
                    <Badge variant="secondary" className="mt-1">{contact.type}</Badge>
                    {contact.company && <p className="text-sm text-muted-foreground mt-1">{contact.company}</p>}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary/70" />
                    <span className="truncate">{contact.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 text-primary/70" />
                    <span>{contact.phone}</span>
                  </div>
                  {contact.mobile && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 text-primary/70" />
                      <span>{contact.mobile}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary/70" />
                    <span className="text-xs">{contact.address || 'No address'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4 text-primary/70" />
                    <span className="text-xs">{getBranchName(contact.branch_id)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1 pt-3 border-t">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Award className="h-4 w-4" /> Loyalty Tier
                  </span>
                  <div>
                    <Badge className={loyaltyColors[loyaltyTier]} variant="secondary">
                      <Star className="h-3 w-3 mr-1" />
                      {loyaltyTier}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col space-y-1 pt-3 border-t">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Balances
                  </span>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Lifetime Value:</span>
                    <span className="font-bold text-primary">{(contact.total_spent || 0).toLocaleString()} EGP</span>
                  </div>
                </div>

                {contact.notes && (
                  <div className="pt-3 border-t">
                    <span className="text-sm text-muted-foreground block mb-1">Notes</span>
                    <p className="text-sm italic text-muted-foreground">{contact.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Manager & Quick Actions */}
            <Card className="glass-card md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" /> Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Account Manager</span>
                    </div>
                    <p className="font-semibold">{contact.account_manager || 'Not assigned'}</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Home Branch</span>
                    </div>
                    <p className="font-semibold">{getBranchName(contact.branch_id)}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Customer Since</span>
                    </div>
                    <p className="font-semibold">{contact.since ? new Date(contact.since).toLocaleDateString() : 'N/A'}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Status</span>
                    </div>
                    <p className="font-semibold">{contact.status}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 hover-lift">
                    <Plus className="mr-2 h-4 w-4" /> New Appointment
                  </Button>
                  <Button variant="outline" className="flex-1 hover-lift">
                    <FileText className="mr-2 h-4 w-4" /> Create Ticket
                  </Button>
                  <Button variant="outline" className="hover-lift">
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" /> Owned Vehicles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contact.vehicles && contact.vehicles.length > 0 ? (
                <div className="space-y-4">
                  {contact.vehicles.map((vehicleId: string) => (
                    <div key={vehicleId} className="p-4 rounded-xl bg-muted/50 border border-border/50 hover-lift">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Car className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{getVehicleName(vehicleId)}</h4>
                          <div className="text-sm text-muted-foreground font-mono mt-1">ID: {vehicleId}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No vehicles associated with this contact</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Appointment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contactAppointments.length > 0 ? (
                <div className="space-y-3">
                  {contactAppointments.map((apt: any) => (
                    <div key={apt.id} className="p-4 rounded-xl bg-muted/50 border border-border/50 hover-lift">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            apt.status === "Completed" ? "bg-green-500/10" :
                            apt.status === "Cancelled" ? "bg-red-500/10" :
                            apt.status === "Confirmed" ? "bg-blue-500/10" :
                            "bg-yellow-500/10"
                          )}>
                            <Calendar className={cn(
                              "h-4 w-4",
                              apt.status === "Completed" ? "text-green-500" :
                              apt.status === "Cancelled" ? "text-red-500" :
                              apt.status === "Confirmed" ? "text-blue-500" :
                              "text-yellow-500"
                            )} />
                          </div>
                          <div>
                            <p className="font-medium">{apt.kind || 'Service Appointment'}</p>
                            <p className="text-sm text-muted-foreground">{apt.vehicle_id ? getVehicleName(apt.vehicle_id) : 'No vehicle specified'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={apt.status === "Completed" ? "default" : "secondary"} className="mb-1">
                            {apt.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground">{apt.date || 'N/A'} at {apt.time || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No appointment history for this contact.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" /> Support Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contactTickets.length > 0 ? (
                <div className="space-y-3">
                  {contactTickets.map((ticket: any) => (
                    <div key={ticket.id} className="p-4 rounded-xl bg-muted/50 border border-border/50 hover-lift">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            ticket.stage === "Solved" ? "bg-green-500/10" :
                            ticket.priority === "Urgent" ? "bg-red-500/10" :
                            ticket.priority === "High" ? "bg-orange-500/10" :
                            "bg-blue-500/10"
                          )}>
                            <AlertCircle className={cn(
                              "h-4 w-4",
                              ticket.stage === "Solved" ? "text-green-500" :
                              ticket.priority === "Urgent" ? "text-red-500" :
                              ticket.priority === "High" ? "text-orange-500" :
                              "text-blue-500"
                            )} />
                          </div>
                          <div>
                            <p className="font-medium">{ticket.ref || `Ticket #${ticket.id}`}</p>
                            <p className="text-sm text-muted-foreground">{ticket.subject || 'No subject'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={ticket.stage === "Solved" ? "default" : "secondary"} className="mb-1">
                            {ticket.stage || 'Open'}
                          </Badge>
                          <p className="text-sm text-muted-foreground">{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No support tickets for this contact.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
