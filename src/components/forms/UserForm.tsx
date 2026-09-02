import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { SystemUser, UserRole, availablePermissions, systemUsers, notifyData, branches, rolePermissions } from "@/lib/data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["Super Admin", "Admin", "Manager", "Supervisor", "Staff", "Viewer"]),
  branchId: z.string().optional(),
  status: z.enum(["Active", "Inactive", "Suspended"]),
  phone: z.string().optional(),
  department: z.string().optional(),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  initialData?: SystemUser;
  onSuccess: () => void;
}

export function UserForm({ initialData, onSuccess }: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: initialData?.username || "",
      email: initialData?.email || "",
      name: initialData?.name || "",
      role: initialData?.role || "Staff",
      branchId: initialData?.branchId || "",
      status: initialData?.status || "Active",
      phone: initialData?.phone || "",
      department: initialData?.department || "",
      permissions: initialData?.permissions || rolePermissions["Staff"],
    },
  });

  const selectedRole = form.watch("role");

  const handleRoleChange = (role: UserRole) => {
    form.setValue("role", role);
    form.setValue("permissions", rolePermissions[role]);
  };

  function onSubmit(data: UserFormValues) {
    if (initialData) {
      // Edit mode
      const index = systemUsers.findIndex((u) => u.id === initialData.id);
      if (index !== -1) {
        systemUsers[index] = { 
          ...systemUsers[index], 
          ...data,
          branchId: data.branchId || undefined,
          phone: data.phone || undefined,
          department: data.department || undefined,
        };
        toast.success("User updated successfully");
      }
    } else {
      // Add mode
      const newUser: SystemUser = {
        ...data,
        id: `u${Date.now()}`,
        branchId: data.branchId || undefined,
        phone: data.phone || undefined,
        department: data.department || undefined,
        createdAt: new Date().toISOString().split("T")[0],
        lastLogin: undefined,
      };
      systemUsers.push(newUser);
      toast.success("User created successfully");
    }
    
    notifyData();
    onSuccess();
  }

  const togglePermission = (permissionId: string) => {
    const currentPermissions = form.getValues("permissions");
    if (currentPermissions.includes(permissionId)) {
      form.setValue("permissions", currentPermissions.filter(p => p !== permissionId));
    } else {
      form.setValue("permissions", [...currentPermissions, permissionId]);
    }
  };

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, typeof availablePermissions>);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" className="transition-all focus:ring-2 focus:ring-primary/20" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" className="transition-all focus:ring-2 focus:ring-primary/20" {...field} />
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
                <Input type="email" placeholder="john@example.com" className="transition-all focus:ring-2 focus:ring-primary/20" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="+20 123 456 7890" className="transition-all focus:ring-2 focus:ring-primary/20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="IT, Operations, etc." className="transition-all focus:ring-2 focus:ring-primary/20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={(value) => handleRoleChange(value as UserRole)} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="branchId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
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
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Permissions</FormLabel>
          <div className="space-y-4 max-h-64 overflow-y-auto border rounded-lg p-4">
            {Object.entries(groupedPermissions).map(([module, permissions]) => (
              <div key={module} className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground">{module}</h4>
                <div className="space-y-2 pl-2">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-2 space-y-0">
                      <Checkbox
                        id={permission.id}
                        checked={form.watch("permissions").includes(permission.id)}
                        onCheckedChange={() => togglePermission(permission.id)}
                        className="button-press"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={permission.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {permission.name}
                        </label>
                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <FormMessage />
        </div>

        <div className="flex justify-end pt-4 gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onSuccess()}
            className="transition-all hover-lift"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="transition-all hover-lift button-press"
          >
            {initialData ? "Save Changes" : "Add User"}
          </Button>
        </div>
      </form>
    </Form>
  );
}