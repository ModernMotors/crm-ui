import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

interface PhoneCallFormProps {
  onSuccess?: () => void;
  editingCall?: any;
}

export function PhoneCallForm({ onSuccess, editingCall }: PhoneCallFormProps) {
  const queryClient = useQueryClient();

  // Fetch real data from API
  const { data: contactsResponse } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => apiClient.getContacts(),
  });

  const { data: branchesResponse } = useQuery({
    queryKey: ['branches'],
    queryFn: () => apiClient.getBranches(),
  });

  const { data: employeesResponse } = useQuery({
    queryKey: ['employees'],
    queryFn: () => apiClient.getEmployees(),
  });

  const { data: vehiclesResponse } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => apiClient.getVehicles(),
  });

  const contacts = contactsResponse?.data || [];
  const branches = branchesResponse?.data || [];
  const employees = employeesResponse?.data || [];
  const vehicles = vehiclesResponse?.data || [];

  const [formData, setFormData] = useState({
    contact_id: editingCall?.contact_id || "",
    caller_name: editingCall?.caller_name || "",
    caller_phone: editingCall?.caller_phone || "",
    branch_id: editingCall?.branch_id || "",
    agent_id: editingCall?.agent_id || "",
    agent_name: editingCall?.agent_name || "",
    direction: editingCall?.direction || "inbound",
    status: editingCall?.status || "completed",
    priority: editingCall?.priority || "Medium",
    purpose: editingCall?.purpose || "inquiry",
    subject: editingCall?.subject || "",
    description: editingCall?.description || "",
    call_duration: editingCall?.call_duration || 0,
    notes: editingCall?.notes || "",
    follow_up_required: editingCall?.follow_up_required || false,
    follow_up_date: editingCall?.follow_up_date || "",
    related_ticket_id: editingCall?.related_ticket_id || "",
    related_appointment_id: editingCall?.related_appointment_id || "",
    related_vehicle_id: editingCall?.related_vehicle_id || "",
    satisfaction_rating: editingCall?.satisfaction_rating || 0,
    tags: editingCall?.tags || [],
  });

  const [selectedTags, setSelectedTags] = useState<string[]>(editingCall?.tags || []);
  const availableTags = ["VIP", "Urgent", "Service", "Sales", "Support", "Follow-up", "Escalation", "Warranty"];

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiClient.createPhoneCall(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-calls'] });
      toast.success("Call created successfully");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create call");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiClient.updatePhoneCall(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-calls'] });
      toast.success("Call updated successfully");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update call");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const callData = {
      contact_id: formData.contact_id || null,
      caller_name: formData.caller_name,
      caller_phone: formData.caller_phone,
      branch_id: formData.branch_id,
      direction: formData.direction,
      status: formData.status,
      purpose: formData.purpose,
      call_duration: formData.call_duration,
      notes: formData.notes,
      follow_up_required: formData.follow_up_required,
      follow_up_date: formData.follow_up_required ? formData.follow_up_date : null,
    };

    if (editingCall) {
      updateMutation.mutate({ id: editingCall.id, data: callData });
    } else {
      createMutation.mutate(callData);
    }
  };

  const handleContactChange = (contactId: string) => {
    const contact = contacts.find((c: any) => c.id === contactId);
    if (contact) {
      setFormData({
        ...formData,
        contact_id: contactId,
        caller_name: contact.first_name + ' ' + contact.last_name,
        caller_phone: contact.phone,
        branch_id: contact.branch_id,
      });
    }
  };

  const handleAgentChange = (agentId: string) => {
    const agent = employees.find((e: any) => e.id === agentId);
    if (agent) {
      setFormData({
        ...formData,
        agent_id: agentId,
        agent_name: agent.first_name + ' ' + agent.last_name,
        branch_id: agent.branch_id,
      });
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact">Contact *</Label>
          <Select value={formData.contact_id} onValueChange={handleContactChange} required>
            <SelectTrigger id="contact">
              <SelectValue placeholder="Select contact" />
            </SelectTrigger>
            <SelectContent>
              {contacts.map((contact: any) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name} - {contact.phone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.caller_phone}
            onChange={(e) => setFormData({ ...formData, caller_phone: e.target.value })}
            placeholder="+20 xxx xxx xxxx"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="agent">Agent *</Label>
          <Select value={formData.agent_id} onValueChange={handleAgentChange} required>
            <SelectTrigger id="agent">
              <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee: any) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name} - {employee.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch">Branch *</Label>
          <Select
            value={formData.branch_id}
            onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
            required
          >
            <SelectTrigger id="branch">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch: any) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="direction">Direction *</Label>
          <Select
            value={formData.direction}
            onValueChange={(value) => setFormData({ ...formData, direction: value })}
            required
          >
            <SelectTrigger id="direction">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inbound">Inbound</SelectItem>
              <SelectItem value="outbound">Outbound</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
            required
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="missed">Missed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="voicemail">Voicemail</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">Purpose *</Label>
          <Select
            value={formData.purpose}
            onValueChange={(value) => setFormData({ ...formData, purpose: value })}
            required
          >
            <SelectTrigger id="purpose">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inquiry">Inquiry</SelectItem>
              <SelectItem value="appointment">Appointment</SelectItem>
              <SelectItem value="complaint">Complaint</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="follow_up">Follow-up</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.call_duration}
            onChange={(e) => setFormData({ ...formData, call_duration: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="followUpDate">Follow-up Date</Label>
          <Input
            id="followUpDate"
            type="date"
            value={formData.follow_up_date}
            onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes about the call"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="followUpRequired"
          checked={formData.follow_up_required}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, follow_up_required: checked as boolean })
          }
        />
        <Label htmlFor="followUpRequired">Follow-up Required</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit">
          {editingCall ? "Update Call" : "Create Call"}
        </Button>
      </div>
    </form>
  );
}