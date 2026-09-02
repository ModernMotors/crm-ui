import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { Loader2 } from "lucide-react";

const ticketSchema = z.object({
  title: z.string().min(5, "Subject must be at least 5 characters"),
  branch_id: z.string().min(1, "Please select a branch"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  category: z.enum(["technical", "billing", "general", "feature_request", "bug_report", "other"]),
  requester_name: z.string().min(1, "Requester name is required"),
  requester_email: z.string().email("Invalid email").optional().or(z.literal("")),
  requester_phone: z.string().optional(),
  description: z.string().min(10, "Please provide more details"),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  initialData?: any;
  onSuccess: () => void;
}

export function TicketForm({ initialData, onSuccess }: TicketFormProps) {
  const queryClient = useQueryClient();

  // ── Real branches from API ─────────────────────────────────────────────
  const { data: branchesData, isLoading: branchesLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: () => apiClient.getBranches(),
  });
  const branches = branchesData?.data || [];

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title:           initialData?.title           || "",
      branch_id:       initialData?.branch_id       || "",
      priority:        initialData?.priority        || "medium",
      category:        initialData?.category        || "general",
      requester_name:  initialData?.requester_name  || "",
      requester_email: initialData?.requester_email || "",
      requester_phone: initialData?.requester_phone || "",
      description:     initialData?.description     || "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: TicketFormValues) {
    try {
      if (initialData?.id) {
        await apiClient.updateTicket(initialData.id, data);
        toast.success("Ticket updated successfully");
      } else {
        await apiClient.createTicket(data);
        toast.success("Ticket created successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["helpdesk"] });
      onSuccess();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to save ticket"
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Subject */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Brief description of the issue" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Requester Name */}
        <FormField
          control={form.control}
          name="requester_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requester Name</FormLabel>
              <FormControl>
                <Input placeholder="Customer name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Branch — real API */}
          <FormField
            control={form.control}
            name="branch_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={branchesLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          branchesLoading ? "Loading branches…" : "Select branch"
                        }
                      />
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

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="feature_request">Feature Request</SelectItem>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Priority */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="requester_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email */}
        <FormField
          control={form.control}
          name="requester_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide more context about this ticket..."
                  className="resize-none h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.id ? "Save Changes" : "Create Ticket"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
