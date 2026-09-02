import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { tickets, contactName, branchName, vehicleName, type TicketStage, type TicketPriority, subscribeData, contacts, employees } from "@/lib/data";
import { PageShell } from "@/components/AppTopbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Tag, User, MapPin, AlertCircle, Clock, Pen, Send, Plus, Paperclip, ArrowRight } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TicketForm } from "@/components/forms/TicketForm";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/helpdesk/$ticketId")({
  loader: ({ params: { ticketId } }) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) throw notFound();
    return { ticket };
  },
  component: TicketDetailsPage,
});

const stageVariant: Record<TicketStage, string> = {
  New: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "In Progress": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Waiting Parts": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Solved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

const priorityVariant: Record<TicketPriority, string> = {
  Low: "text-slate-500",
  Medium: "text-blue-500",
  High: "text-orange-500",
  Urgent: "text-red-500 font-bold",
};

function TicketDetailsPage() {
  const { ticketId } = Route.useParams();
  const { ticket: loadedTicket, details } = Route.useLoaderData();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const currentTickets = useSyncExternalStore(subscribeData, () => tickets, () => tickets);
  const ticket = currentTickets.find((t) => t.id === ticketId) || loadedTicket;

  return (
    <PageShell
      title={`Ticket ${ticket.ref}`}
      subtitle={ticket.subject}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild className="hover-lift">
            <Link to="/helpdesk">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Helpdesk
            </Link>
          </Button>
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="hover-lift">
                <Pen className="mr-2 h-4 w-4" /> Edit Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Ticket</DialogTitle>
              </DialogHeader>
              <TicketForm initialData={ticket} onSuccess={() => setIsEditModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className={`border ${priorityVariant[ticket.priority]} bg-background/50`}>
            {ticket.priority} Priority
          </Badge>
          <Badge className={`border ${stageVariant[ticket.stage]}`} variant="secondary">
            {ticket.stage}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details and Messages */}
        <div className="md:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Description</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {details.description}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-primary" /> Messages & Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {details.messages.map((msg, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary/80 ring-4 ring-primary/10 mt-1" />
                      {i !== details.messages.length - 1 && <div className="w-px h-full bg-border mt-2" />}
                    </div>
                    <div className="pb-4 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{msg.by}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {msg.at}
                        </span>
                      </div>
                      <div className="bg-muted/40 p-3 rounded-lg border border-border/50 text-sm">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="h-5 w-5 text-primary" /> Ticket Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground">Category</span>
                <div className="font-medium">{details.category}</div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Channel</span>
                <div className="font-medium">{details.channel}</div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Assignee</span>
                <div className="font-medium">{ticket.assignee}</div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Opened Date</span>
                <div className="font-medium">{ticket.opened}</div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">SLA</span>
                <div className="font-medium">{ticket.slaHours} Hours</div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" /> Customer & Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground">Customer</span>
                <Link to="/contacts/$contactId" params={{ contactId: ticket.contactId }} className="block font-medium text-primary hover:underline">
                  {contactName(ticket.contactId)}
                </Link>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Branch
                </span>
                <div className="font-medium">{branchName(ticket.branchId)}</div>
              </div>
              <div className="space-y-1 border-t border-border/50 pt-3 mt-1">
                <span className="text-muted-foreground">Vehicle</span>
                <div className="font-medium">{vehicleName(ticket.vehicleId)}</div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">License Plate</span>
                <Badge variant="outline" className="font-mono">{details.plate}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
