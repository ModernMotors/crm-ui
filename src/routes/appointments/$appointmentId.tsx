import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/AppTopbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Wrench,
  FileText,
  User,
  Navigation,
  Activity,
  Pen,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  Car as CarIcon,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/appointments/$appointmentId")({
  component: AppointmentDetailsPage,
});

const statusVariant: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  in_progress: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  no_show: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

const statusLabel: Record<string, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

const typeLabel: Record<string, string> = {
  test_drive: "Test Drive",
  service: "Service",
  consultation: "Consultation",
  delivery: "Delivery",
  pickup: "Pickup",
  other: "Other",
};

function AppointmentDetailsPage() {
  const { appointmentId } = Route.useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: appointment,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => apiClient.getAppointment(appointmentId),
  });

  if (isLoading) {
    return (
      <PageShell title="Loading…" subtitle="Fetching appointment details">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }

  if (error || !appointment) {
    return (
      <PageShell title="Not Found" subtitle="Appointment not found">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">
            The appointment you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild variant="outline">
            <Link to="/appointments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Appointments
            </Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-GB");
    } catch {
      return dateStr;
    }
  };

  const getCustomerName = () => {
    if (appointment.contact) {
      return `${appointment.contact.first_name} ${appointment.contact.last_name}`;
    }
    return appointment.customer_name || "Unknown Customer";
  };

  return (
    <PageShell
      title={`Appointment: ${typeLabel[appointment.type] || appointment.type}`}
      subtitle={`${formatDate(appointment.appointment_date)} at ${appointment.appointment_time}`}
    >
      {/* Top Bar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <Button variant="outline" size="sm" asChild className="hover-lift">
          <Link to="/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Appointments
          </Link>
        </Button>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="hover-lift">
              <Pen className="mr-2 h-4 w-4" /> Edit Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
            </DialogHeader>
            <AppointmentForm
              onSuccess={() => {
                setIsEditModalOpen(false);
                queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
                refetch();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <Badge
          className={`px-3 py-1 text-sm border ${statusVariant[appointment.status] || "bg-gray-100 text-gray-700"}`}
          variant="secondary"
        >
          {statusLabel[appointment.status] || appointment.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Service Details Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="h-5 w-5 text-primary" /> Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-4 w-4" /> Customer
                  </span>
                  {appointment.contact ? (
                    <Link
                      to="/contacts/$contactId"
                      params={{ contactId: appointment.contact.id }}
                      className="font-medium text-primary hover:underline"
                    >
                      {getCustomerName()}
                    </Link>
                  ) : (
                    <span className="font-medium">{getCustomerName()}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-4 w-4" /> Advisor
                  </span>
                  <span className="font-medium">{appointment.advisor || "—"}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> Branch
                  </span>
                  <span className="font-medium">
                    {appointment.branch?.name || "Unknown Branch"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Duration
                  </span>
                  <span className="font-medium">
                    {appointment.duration ? `${appointment.duration} mins` : "Not specified"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Date & Time
                  </span>
                  <span className="font-medium">
                    {formatDate(appointment.appointment_date)} — {appointment.appointment_time}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Wrench className="h-4 w-4" /> Service Type
                  </span>
                  <Badge variant="secondary">
                    {typeLabel[appointment.type] || appointment.type}
                  </Badge>
                </div>
              </div>

              {appointment.notes && (
                <div className="pt-4 border-t border-border/50">
                  <span className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                    <FileText className="h-4 w-4" /> Notes
                  </span>
                  <p className="text-sm bg-muted/30 p-3 rounded-lg italic border border-border/30">
                    "{appointment.notes}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Contact Card */}
          {(appointment.contact || appointment.customer_phone || appointment.customer_email) && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" /> Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Full Name</span>
                    <p className="font-medium">{getCustomerName()}</p>
                  </div>
                  {(appointment.contact?.phone || appointment.customer_phone) && (
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> Phone
                      </span>
                      <p className="font-medium">
                        {appointment.contact?.phone || appointment.customer_phone}
                      </p>
                    </div>
                  )}
                  {(appointment.contact?.email || appointment.customer_email) && (
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Email
                      </span>
                      <p className="font-medium truncate">
                        {appointment.contact?.email || appointment.customer_email}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" /> Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
                  </div>
                  <div className="pb-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-sm">System</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(appointment.created_at || appointment.appointment_date)}
                      </span>
                    </div>
                    <p className="text-sm mt-1">Appointment created.</p>
                  </div>
                </div>
                {appointment.status !== "scheduled" && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
                    </div>
                    <div className="pb-2">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm">System</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(appointment.updated_at || appointment.appointment_date)}
                        </span>
                      </div>
                      <p className="text-sm mt-1">
                        Status updated to: {statusLabel[appointment.status] || appointment.status}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vehicle Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Navigation className="h-5 w-5 text-primary" /> Vehicle Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointment.vehicle ? (
                <>
                  <div>
                    <span className="text-sm text-muted-foreground">Model</span>
                    <div className="font-semibold text-lg">
                      {appointment.vehicle.make} {appointment.vehicle.model}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Year: {appointment.vehicle.year}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">License Plate</span>
                    <div className="font-mono bg-muted/50 p-2 rounded text-center mt-1 border border-border/50 text-lg">
                      {appointment.vehicle.license_plate || "—"}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <Badge variant="secondary" className="capitalize">
                      {appointment.vehicle.status || "unknown"}
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <CarIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No vehicle assigned</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Branch Card */}
          {appointment.branch && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" /> Branch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="font-semibold">{appointment.branch.name}</div>
                <div className="text-sm text-muted-foreground">
                  Code: {appointment.branch.code}
                </div>
                {appointment.branch.address && (
                  <div className="text-sm text-muted-foreground">
                    {appointment.branch.address}
                  </div>
                )}
                {appointment.branch.phone && (
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="h-3 w-3" />
                    {appointment.branch.phone}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Appointment ID Card */}
          <Card className="glass-card bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <span className="text-xs text-muted-foreground block mb-1">
                Appointment ID
              </span>
              <span className="text-xs font-mono text-primary break-all">
                {appointment.id}
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
