import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
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

const branchSchema = z.object({
  name: z.string().min(2, "Branch name must be at least 2 characters"),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .regex(/^[A-Z0-9_-]+$/i, "Code: letters, numbers, - and _ only"),
  city: z.string().min(2, "City must be at least 2 characters"),
  country: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  working_hours: z.string().optional(),
  branch_type: z.enum(["showroom", "service_center", "warehouse", "office"]),
  status: z.enum(["active", "inactive", "closed"]),
  is_main_branch: z.boolean(),
});

type BranchFormValues = z.infer<typeof branchSchema>;

interface ApiBranch {
  id: string;
  name: string;
  code: string;
  city?: string;
  country?: string;
  address?: string;
  phone?: string;
  email?: string;
  working_hours?: string;
  branch_type: "showroom" | "service_center" | "warehouse" | "office";
  status: "active" | "inactive" | "closed";
  is_main_branch: boolean;
}

interface BranchFormProps {
  initialData?: ApiBranch;
  onSuccess: (branch: ApiBranch) => void;
}

const BRANCH_TYPES = [
  { value: "showroom", label: "Showroom" },
  { value: "service_center", label: "Service Center" },
  { value: "warehouse", label: "Warehouse" },
  { value: "office", label: "Office" },
] as const;

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "closed", label: "Closed" },
] as const;

export function BranchForm({ initialData, onSuccess }: BranchFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      code: initialData?.code ?? "",
      city: initialData?.city ?? "",
      country: initialData?.country ?? "Egypt",
      address: initialData?.address ?? "",
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
      working_hours: initialData?.working_hours ?? "9:00 AM - 6:00 PM",
      branch_type: initialData?.branch_type ?? "showroom",
      status: initialData?.status ?? "active",
      is_main_branch: initialData?.is_main_branch ?? false,
    },
  });

  async function onSubmit(data: BranchFormValues) {
    setLoading(true);
    try {
      const payload = {
        ...data,
        code: data.code.toUpperCase(),
        email: data.email || undefined,
      };

      let result: ApiBranch;
      if (initialData) {
        result = await apiClient.updateBranch(initialData.id, payload);
        toast.success("Branch updated successfully");
      } else {
        result = await apiClient.createBranch(payload);
        toast.success("Branch created successfully");
      }

      onSuccess(result);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save branch";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nasr City Showroom"
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Code */}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch Code *</FormLabel>
              <FormControl>
                <Input
                  placeholder="NSR-001"
                  className="transition-all focus:ring-2 focus:ring-primary/20 uppercase"
                  {...field}
                  onChange={(e) =>
                    field.onChange(e.target.value.toUpperCase())
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* City & Country */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Cairo"
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Egypt"
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="12 El-Tayaran St., Nasr City"
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone & Email */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+20 2 2267 8900"
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="branch@company.com"
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Working Hours */}
        <FormField
          control={form.control}
          name="working_hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Working Hours</FormLabel>
              <FormControl>
                <Input
                  placeholder="8:00 AM - 8:00 PM"
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Branch Type & Status */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="branch_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BRANCH_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Is Main Branch */}
        <FormField
          control={form.control}
          name="is_main_branch"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 space-y-0 rounded-md border p-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div>
                <FormLabel className="cursor-pointer">Main Branch</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Mark this as the main/headquarters branch
                </p>
              </div>
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess(initialData as ApiBranch)}
            disabled={loading}
            className="transition-all hover-lift"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="transition-all hover-lift button-press"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Save Changes" : "Add Branch"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
