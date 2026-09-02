import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
  ArrowLeft,
  Play,
  Pause,
  MessageSquare,
  Calendar,
  FileText,
  Trash2,
  Tag,
  RefreshCw,
  Edit,
  ArrowRight,
  User,
  MapPin,
  Building,
  Headphones,
  Mic,
  PhoneOff,
  ChevronRight,
} from "lucide-react";
import { PageShell } from "@/components/AppTopbar";
import { AppSidebar } from "@/components/AppSidebar";
import { phoneCalls, branches, branchName, contacts, contactName, vehicles, vehicleName, tickets, appointments, notifyData } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PhoneCallForm } from "@/components/forms/PhoneCallForm";

export const Route = createFileRoute("/phonecalls/$callId")({
  head: () => ({
    meta: [
      { title: "Phone Call Details — SIG" },
      {
        name: "description",
        content: "Detailed view of phone call with recordings, notes, and related information.",
      },
    ],
  }),
  component: PhoneCallDetailsPage,
});

function PhoneCallDetailsPage() {
  const { callId } = Route.useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  const call = phoneCalls.find((c) => c.id === callId);

  if (!call) {
    return (
      <div className="min-h-screen bg-background">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentTitle="Phone Call Details"
        />
        <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-64")}>
          <PageShell title="Call Not Found" showTopbar={false}>
            <div className="text-center py-12">
              <Phone className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-lg font-medium text-muted-foreground">Phone call not found</p>
              <Link to="/phonecalls">
                <Button className="mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Calls
                </Button>
              </Link>
            </div>
          </PageShell>
        </div>
      </div>
    );
  }

  const contact = contacts.find((c) => c.id === call.contactId);
  const vehicle = call.relatedVehicleId ? vehicles.find((v) => v.id === call.relatedVehicleId) : null;
  const ticket = call.relatedTicketId ? tickets.find((t) => t.id === call.relatedTicketId) : null;
  const appointment = call.relatedAppointmentId ? appointments.find((a) => a.id === call.relatedAppointmentId) : null;

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
      Incoming: "bg-blue-500/20 text-blue-700",
      Outgoing: "bg-green-500/20 text-green-700",
      Missed: "bg-red-500/20 text-red-700",
      Completed: "bg-emerald-500/20 text-emerald-700",
      "In Progress": "bg-yellow-500/20 text-yellow-700",
      "On Hold": "bg-orange-500/20 text-orange-700",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500/20 text-gray-600";
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      Incoming: PhoneIncoming,
      Outgoing: PhoneOutgoing,
      Missed: PhoneMissed,
      Completed: CheckCircle,
      "In Progress": Phone,
      "On Hold": Pause,
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
      "Service Inquiry": "bg-blue-500/20 text-blue-700",
      "Sales Inquiry": "bg-purple-500/20 text-purple-700",
      Support: "bg-cyan-500/20 text-cyan-700",
      Complaint: "bg-red-500/20 text-red-700",
      "Follow-up": "bg-green-500/20 text-green-700",
      Emergency: "bg-red-600/20 text-red-800",
      General: "bg-gray-500/20 text-gray-600",
    };
    return colors[category as keyof typeof colors] || "bg-gray-500/20 text-gray-600";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this call record?")) {
      const index = phoneCalls.findIndex((c) => c.id === callId);
      if (index !== -1) {
        phoneCalls.splice(index, 1);
        notifyData();
      }
      navigate({ to: "/phonecalls" });
    }
  };

  const handleReturnCall = () => {
    const newCall = {
      ...call,
      id: `pc${Date.now()}`,
      status: "Outgoing" as const,
      startTime: new Date().toISOString(),
      endTime: undefined,
      duration: undefined,
      subject: `Return Call: ${call.subject}`,
      description: `Return call regarding: ${call.description}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    phoneCalls.unshift(newCall);
    notifyData();
    navigate({ to: "/phonecalls" });
  };

  const handleScheduleCallback = () => {
    const date = prompt("Enter callback date (YYYY-MM-DD):");
    if (date) {
      const time = prompt("Enter callback time (HH:MM):");
      if (time) {
        const newCall = {
          ...call,
          id: `pc${Date.now()}`,
          status: "Outgoing" as const,
          subject: `Scheduled Callback: ${call.subject}`,
          description: `Scheduled callback for ${date} at ${time}`,
          followUpRequired: true,
          followUpDate: `${date}T${time}:00`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        phoneCalls.unshift(newCall);
        notifyData();
        alert("Callback scheduled successfully!");
      }
    }
  };

  const handleSendMessage = () => {
    const message = prompt("Enter your message:");
    if (message) {
      alert(`Message sent to ${call.contactName}: ${message}`);
    }
  };

  const handlePlaybackToggle = () => {
    setIsPlaying(!isPlaying);
    // Simulate playback progress
    if (!isPlaying) {
      const interval = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    }
  };

  const handleCompleteCall = () => {
    const index = phoneCalls.findIndex((c) => c.id === callId);
    if (index !== -1) {
      phoneCalls[index] = {
        ...call,
        status: "Completed",
        endTime: new Date().toISOString(),
        duration: Math.floor((new Date().getTime() - new Date(call.startTime).getTime()) / 1000),
        updatedAt: new Date().toISOString(),
      };
      notifyData();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentTitle="Phone Call Details"
      />
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-64")}>
        <PageShell
          title="Phone Call Details"
          subtitle="View detailed information about this phone call"
          showTopbar={false}
        >
          {/* Header Actions */}
          <div className="mb-6 flex items-center justify-between">
            <Link to="/phonecalls">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Calls
              </Button>
            </Link>
            <div className="flex gap-2">
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Phone Call</DialogTitle>
                  </DialogHeader>
                  <PhoneCallForm
                    editingCall={call}
                    onSuccess={() => setIsEditModalOpen(false)}
                  />
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={handleReturnCall}>
                <Phone className="mr-2 h-4 w-4" /> Return Call
              </Button>
              <Button variant="outline" size="sm" onClick={handleScheduleCallback}>
                <Calendar className="mr-2 h-4 w-4" /> Schedule Callback
              </Button>
              <Button variant="outline" size="sm" onClick={handleSendMessage}>
                <MessageSquare className="mr-2 h-4 w-4" /> Send Message
              </Button>
              {call.status !== "Completed" && (
                <Button size="sm" onClick={handleCompleteCall}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Complete Call
                </Button>
              )}
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Call Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Call Information Card */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Call Information</span>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(call.priority)} variant="outline">
                        {call.priority}
                      </Badge>
                      <Badge className={getStatusColor(call.status)} variant="secondary">
                        {call.status}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                        {getInitials(call.contactName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{call.contactName}</h3>
                      <p className="text-muted-foreground">{call.contactPhone}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getCategoryColor(call.category)} variant="secondary">
                          {call.category}
                        </Badge>
                        {call.followUpRequired && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Follow-up Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">{call.subject}</h4>
                    <p className="text-muted-foreground">{call.description}</p>
                  </div>

                  {/* Recording Player */}
                  {call.recordingUrl && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handlePlaybackToggle}
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <div className="flex-1">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${playbackProgress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{formatDuration(Math.floor((playbackProgress / 100) * (call.duration || 0)))}</span>
                            <span>{formatDuration(call.duration || 0)}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Call Metadata */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Agent</p>
                      <p className="font-medium flex items-center gap-2">
                        <Headphones className="h-4 w-4" />
                        {call.agentName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Branch</p>
                      <p className="font-medium flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {branchName(call.branchId)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Start Time</p>
                      <p className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {new Date(call.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {call.duration ? formatDuration(call.duration) : "In progress"}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {call.notes && (
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Notes</p>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg">{call.notes}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {call.tags.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {call.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Related Information */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Related Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {vehicle && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{vehicleName(vehicle.modelId)}</p>
                          <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
                        </div>
                      </div>
                      <Link to={`/vehicles/${vehicle.id}`}>
                        <Button variant="outline" size="sm">
                          View <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}

                  {ticket && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{ticket.subject}</p>
                          <p className="text-sm text-muted-foreground">{ticket.ref} - {ticket.stage}</p>
                        </div>
                      </div>
                      <Link to={`/helpdesk/${ticket.id}`}>
                        <Button variant="outline" size="sm">
                          View <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}

                  {appointment && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{appointment.kind}</p>
                          <p className="text-sm text-muted-foreground">{appointment.date} at {appointment.time}</p>
                        </div>
                      </div>
                      <Link to={`/appointments/${appointment.id}`}>
                        <Button variant="outline" size="sm">
                          View <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}

                  {!vehicle && !ticket && !appointment && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No related information available
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleReturnCall}
                  >
                    <Phone className="mr-2 h-4 w-4" /> Return Call
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleScheduleCallback}
                  >
                    <Calendar className="mr-2 h-4 w-4" /> Schedule Callback
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleSendMessage}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                  {call.status !== "Completed" && (
                    <Button
                      className="w-full justify-start"
                      onClick={handleCompleteCall}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Complete Call
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Follow-up Information */}
              {call.followUpRequired && (
                <Card className="glass-card border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      Follow-up Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {call.followUpDate && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Scheduled Date</p>
                        <p className="font-medium">{new Date(call.followUpDate).toLocaleString()}</p>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => {
                        const newCall = {
                          ...call,
                          id: `pc${Date.now()}`,
                          status: "Outgoing" as const,
                          subject: `Follow-up: ${call.subject}`,
                          description: `Follow-up call for ${call.subject}`,
                          startTime: new Date().toISOString(),
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        };
                        phoneCalls.unshift(newCall);
                        notifyData();
                        navigate({ to: "/phonecalls" });
                      }}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Start Follow-up Call
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Satisfaction Rating */}
              {call.satisfactionRating && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Customer Satisfaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-6 w-6",
                            star <= call.satisfactionRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                      <span className="ml-2 font-semibold">{call.satisfactionRating}/5</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Information */}
              {contact && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Contact Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{contact.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{branchName(contact.branchId)}</span>
                    </div>
                    <Link to={`/contacts/${contact.id}`}>
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        View Full Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </PageShell>
      </div>
    </div>
  );
}