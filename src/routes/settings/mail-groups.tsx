import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Mail,
  Send,
  Copy,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { mailGroupsApi, companiesApi } from '@/lib/api';
import { toSnakeCase, toCamelCase } from '@/lib/case-conversion';

export const Route = createFileRoute('/settings/mail-groups')({
  component: MailGroupsPage,
});

function MailGroupsPage() {
  const [mailGroups, setMailGroups] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('all');

  // Dialog states
  const [mailGroupDialogOpen, setMailGroupDialogOpen] = useState(false);
  const [editingMailGroup, setEditingMailGroup] = useState<any>(null);
  const [mailGroupForm, setMailGroupForm] = useState({
    groupName: '',
    groupDescription: '',
    companyId: '',
    toEmails: '',
    ccEmails: '',
    bccEmails: '',
    category: 'general',
    isActive: true,
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [mailGroupsRes, companiesRes] = await Promise.all([
          mailGroupsApi.getAll(),
          companiesApi.getAll(),
        ]);
        const mailGroupsArray = Array.isArray(mailGroupsRes.data) ? mailGroupsRes.data : Array.isArray(mailGroupsRes) ? mailGroupsRes : [];
        const companiesArray = Array.isArray(companiesRes.data) ? companiesRes.data : Array.isArray(companiesRes) ? companiesRes : [];
        setMailGroups(mailGroupsArray.map((g: any) => toCamelCase(g)));
        setCompanies(companiesArray.map((c: any) => toCamelCase(c)));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMailGroups = useMemo(() => {
    return mailGroups.filter(
      (g) => selectedCompany === 'all' || g.companyId === selectedCompany
    );
  }, [selectedCompany, mailGroups]);

  const handleAddMailGroup = () => {
    setEditingMailGroup(null);
    setMailGroupForm({
      groupName: '',
      groupDescription: '',
      companyId: '',
      toEmails: '',
      ccEmails: '',
      bccEmails: '',
      category: 'general',
      isActive: true,
    });
    setMailGroupDialogOpen(true);
  };

  const handleEditMailGroup = (mailGroup: any) => {
    setEditingMailGroup(mailGroup);
    setMailGroupForm({
      groupName: mailGroup.groupName,
      groupDescription: mailGroup.groupDescription,
      companyId: mailGroup.companyId,
      toEmails: mailGroup.toEmails?.join(', ') || '',
      ccEmails: mailGroup.ccEmails?.join(', ') || '',
      bccEmails: mailGroup.bccEmails?.join(', ') || '',
      category: mailGroup.category,
      isActive: mailGroup.isActive,
    });
    setMailGroupDialogOpen(true);
  };

  const handleSaveMailGroup = async () => {
    try {
      const mailGroupData = toSnakeCase({
        ...mailGroupForm,
        toEmails: mailGroupForm.toEmails
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean),
        ccEmails: mailGroupForm.ccEmails
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean),
        bccEmails: mailGroupForm.bccEmails
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean),
      });

      if (editingMailGroup) {
        await mailGroupsApi.update(editingMailGroup.id, mailGroupData);
        toast.success('Mail group updated successfully');
        setMailGroups((prev) =>
          prev.map((g) =>
            g.id === editingMailGroup.id ? { ...g, ...mailGroupData } : g
          )
        );
      } else {
        const result = await mailGroupsApi.create(mailGroupData);
        toast.success('Mail group added successfully');
        setMailGroups((prev) => [...prev, toCamelCase(result.data || result)]);
      }
      setMailGroupDialogOpen(false);
    } catch (error) {
      console.error('Error saving mail group:', error);
      toast.error('Failed to save mail group');
    }
  };

  const handleDeleteMailGroup = async (mailGroupId: string) => {
    try {
      await mailGroupsApi.delete(mailGroupId);
      setMailGroups((prev) => prev.filter((g) => g.id !== mailGroupId));
      toast.success('Mail group deleted successfully');
    } catch (error) {
      console.error('Error deleting mail group:', error);
      toast.error('Failed to delete mail group');
    }
  };

  const companyName = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    return company?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mail Groups</h1>
          <p className="text-muted-foreground">
            Manage email groups and mailing lists for TO and CC recipients
          </p>
        </div>
        <Button className="hover-lift button-press" onClick={handleAddMailGroup}>
          <Plus className="mr-2 h-4 w-4" /> Add Mail Group
        </Button>
      </div>

      <Card className="glass-card">
        <CardContent className="space-y-6 pt-6">
          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mail Groups Grid */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <p>Loading mail groups...</p>
            </div>
          ) : filteredMailGroups.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No mail groups found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMailGroups.map((mailGroup) => (
                <Card
                  key={mailGroup.id}
                  className="hover-lift transition-all border-l-4 border-l-blue-500"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Mail className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {mailGroup.groupName}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {companyName(mailGroup.companyId)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={mailGroup.isActive ? 'default' : 'secondary'}>
                        {mailGroup.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <Badge variant="outline" className="capitalize">
                        {mailGroup.category}
                      </Badge>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600 mb-2 font-medium flex items-center gap-1">
                        <Send className="h-3 w-3" /> TO Recipients (
                        {mailGroup.toEmails?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {mailGroup.toEmails?.slice(0, 2).map((email: string, idx: number) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs truncate max-w-[100px]"
                          >
                            {email}
                          </Badge>
                        ))}
                        {(mailGroup.toEmails?.length || 0) > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(mailGroup.toEmails?.length || 0) - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600 mb-2 font-medium flex items-center gap-1">
                        <Copy className="h-3 w-3" /> CC Recipients (
                        {mailGroup.ccEmails?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {mailGroup.ccEmails?.slice(0, 2).map((email: string, idx: number) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs truncate max-w-[100px]"
                          >
                            {email}
                          </Badge>
                        ))}
                        {(mailGroup.ccEmails?.length || 0) > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(mailGroup.ccEmails?.length || 0) - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600 truncate">
                        {mailGroup.groupDescription}
                      </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 hover-lift"
                        onClick={() => handleEditMailGroup(mailGroup)}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover-lift text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteMailGroup(mailGroup.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mail Group Dialog */}
      <Dialog open={mailGroupDialogOpen} onOpenChange={setMailGroupDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMailGroup ? 'Edit Mail Group' : 'Add New Mail Group'}
            </DialogTitle>
            <DialogDescription>
              {editingMailGroup
                ? 'Update mail group details'
                : 'Create a new email group with TO and CC recipients'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Group Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mailgroup-name">Group Name</Label>
                  <Input
                    id="mailgroup-name"
                    value={mailGroupForm.groupName}
                    onChange={(e) =>
                      setMailGroupForm({
                        ...mailGroupForm,
                        groupName: e.target.value,
                      })
                    }
                    placeholder="e.g., Service Notifications"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mailgroup-company">Company</Label>
                  <Select
                    value={mailGroupForm.companyId}
                    onValueChange={(value) =>
                      setMailGroupForm({ ...mailGroupForm, companyId: value })
                    }
                  >
                    <SelectTrigger id="mailgroup-company">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailgroup-description">Description</Label>
                <Textarea
                  id="mailgroup-description"
                  value={mailGroupForm.groupDescription}
                  onChange={(e) =>
                    setMailGroupForm({
                      ...mailGroupForm,
                      groupDescription: e.target.value,
                    })
                  }
                  placeholder="Describe the purpose of this mail group"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailgroup-category">Category</Label>
                <Select
                  value={mailGroupForm.category}
                  onValueChange={(value) =>
                    setMailGroupForm({ ...mailGroupForm, category: value as any })
                  }
                >
                  <SelectTrigger id="mailgroup-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notifications">Notifications</SelectItem>
                    <SelectItem value="reports">Reports</SelectItem>
                    <SelectItem value="alerts">Alerts</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email Recipients */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Send className="h-5 w-5" />
                Email Recipients
              </h3>
              <div className="space-y-2">
                <Label htmlFor="mailgroup-to">TO Recipients (comma separated)</Label>
                <Textarea
                  id="mailgroup-to"
                  value={mailGroupForm.toEmails}
                  onChange={(e) =>
                    setMailGroupForm({ ...mailGroupForm, toEmails: e.target.value })
                  }
                  placeholder="e.g., email1@company.com, email2@company.com"
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Primary recipients who will receive the email directly
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailgroup-cc">CC Recipients (comma separated)</Label>
                <Textarea
                  id="mailgroup-cc"
                  value={mailGroupForm.ccEmails}
                  onChange={(e) =>
                    setMailGroupForm({ ...mailGroupForm, ccEmails: e.target.value })
                  }
                  placeholder="e.g., manager@company.com, supervisor@company.com"
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Carbon copy recipients who will receive a copy of the email
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailgroup-bcc">BCC Recipients (comma separated)</Label>
                <Textarea
                  id="mailgroup-bcc"
                  value={mailGroupForm.bccEmails}
                  onChange={(e) =>
                    setMailGroupForm({ ...mailGroupForm, bccEmails: e.target.value })
                  }
                  placeholder="e.g., admin@company.com"
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Blind carbon copy recipients (hidden from other recipients)
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mailgroup-active"
                checked={mailGroupForm.isActive}
                onCheckedChange={(checked) =>
                  setMailGroupForm({
                    ...mailGroupForm,
                    isActive: checked as boolean,
                  })
                }
              />
              <Label htmlFor="mailgroup-active" className="cursor-pointer">
                Active mail group
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMailGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveMailGroup}
              disabled={!mailGroupForm.groupName || !mailGroupForm.companyId}
            >
              {editingMailGroup ? 'Update Mail Group' : 'Add Mail Group'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
