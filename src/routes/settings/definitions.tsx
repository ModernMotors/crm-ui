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
  BookOpen,
  FileCheck,
  Copy,
  Workflow,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { definitionsApi } from '@/lib/api';
import { toSnakeCase, toCamelCase } from '@/lib/case-conversion';

export const Route = createFileRoute('/settings/definitions')({
  component: DefinitionsPage,
});

function DefinitionsPage() {
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [definitionDialogOpen, setDefinitionDialogOpen] = useState(false);
  const [editingDefinition, setEditingDefinition] = useState<any>(null);
  const [definitionForm, setDefinitionForm] = useState({
    name: '',
    nameAr: '',
    code: '',
    type: 'system' as 'system' | 'status' | 'service' | 'category',
    category: '',
    description: '',
    color: '',
    isActive: true,
  });

  const generateCode = (name: string) =>
    name.toUpperCase().replace(/\s+/g, '_').substring(0, 20) ||
    `DEF_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await definitionsApi.getAll();
        const data = response.data || [];
        setDefinitions(data.filter((d: any) => d.type === 'definition'));
        setStatuses(data.filter((d: any) => d.type === 'status'));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddDefinition = () => {
    setEditingDefinition(null);
    setDefinitionForm({
      name: '',
      nameAr: '',
      code: '',
      type: 'system',
      category: '',
      description: '',
      color: '',
      isActive: true,
    });
    setDefinitionDialogOpen(true);
  };

  const handleEditDefinition = (definition: any) => {
    setEditingDefinition(definition);
    setDefinitionForm({
      name: definition.name || definition.value || '',
      nameAr: definition.nameAr || definition.name_ar || definition.valueAr || '',
      code: definition.code || '',
      type: definition.type || 'system',
      category: definition.category || '',
      description: definition.description || '',
      color: definition.metadata?.color || definition.color || '',
      isActive: definition.isActive ?? definition.is_active ?? true,
    });
    setDefinitionDialogOpen(true);
  };

  const handleSaveDefinition = async () => {
    try {
      const definitionData = toSnakeCase({
        name: definitionForm.name,
        nameAr: definitionForm.nameAr,
        code: definitionForm.code || generateCode(definitionForm.name),
        type: definitionForm.type,
        category: definitionForm.category,
        description: definitionForm.description,
        isActive: definitionForm.isActive,
        metadata: definitionForm.color ? { color: definitionForm.color } : {},
      });

      if (editingDefinition) {
        await definitionsApi.update(editingDefinition.id, definitionData);
        toast.success('Definition updated successfully');
        setDefinitions((prev) =>
          prev.map((d) =>
            d.id === editingDefinition.id ? { ...d, ...toCamelCase(definitionData) } : d
          )
        );
      } else {
        const result = await definitionsApi.create(definitionData);
        toast.success('Definition added successfully');
        setDefinitions((prev) => [...prev, toCamelCase(result.data || result)]);
      }
      setDefinitionDialogOpen(false);
    } catch (error) {
      console.error('Error saving definition:', error);
      toast.error('Failed to save definition');
    }
  };

  const handleDeleteDefinition = async (definitionId: string) => {
    try {
      await definitionsApi.delete(definitionId);
      setDefinitions((prev) => prev.filter((d) => d.id !== definitionId));
      toast.success('Definition deleted successfully');
    } catch (error) {
      console.error('Error deleting definition:', error);
      toast.error('Failed to delete definition');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Definitions & Statuses</h1>
          <p className="text-muted-foreground">
            Manage system definitions, statuses, and terminology
          </p>
        </div>
        <Button className="hover-lift button-press" onClick={handleAddDefinition}>
          <Plus className="mr-2 h-4 w-4" /> Add Definition
        </Button>
      </div>

      <Card className="glass-card">
        <CardContent className="space-y-6 pt-6">
          {/* Definitions Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              System Definitions
            </h3>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <p>Loading definitions...</p>
              </div>
            ) : definitions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No definitions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {definitions.map((definition) => (
                  <div
                    key={definition.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {definition.color && (
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: definition.color }}
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{definition.name || definition.value}</p>
                          <p className="text-sm text-muted-foreground">
                            {definition.nameAr || definition.name_ar || definition.valueAr}
                          </p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {definition.category}
                          </Badge>
                          {definition.isActive && (
                            <Badge className="bg-green-500/20 text-green-700">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {definition.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover-lift"
                        onClick={() => handleEditDefinition(definition)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover-lift"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Statuses Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Status Definitions
            </h3>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <p>Loading statuses...</p>
              </div>
            ) : statuses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No statuses found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {statuses.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{status.status}</p>
                          <p className="text-sm text-muted-foreground">
                            {status.statusAr}
                          </p>
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: status.backgroundColor,
                              color: status.textColor,
                            }}
                          >
                            {status.entityType}
                          </Badge>
                          {status.isDefault && (
                            <Badge className="bg-blue-500/20 text-blue-700">
                              Default
                            </Badge>
                          )}
                          {status.isTerminal && (
                            <Badge className="bg-red-500/20 text-red-700">
                              Terminal
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {status.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="hover-lift">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover-lift">
                        <Workflow className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Definition Dialog */}
      <Dialog open={definitionDialogOpen} onOpenChange={setDefinitionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDefinition ? 'Edit Definition' : 'Add New Definition'}
            </DialogTitle>
            <DialogDescription>
              {editingDefinition
                ? 'Update definition details'
                : 'Create a new system definition'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="definition-name">Name (English) <span className="text-red-500">*</span></Label>
                  <Input
                    id="definition-name"
                    value={definitionForm.name}
                    onChange={(e) =>
                      setDefinitionForm({ ...definitionForm, name: e.target.value })
                    }
                    placeholder="e.g., Active"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="definition-name-ar">Name (Arabic)</Label>
                  <Input
                    id="definition-name-ar"
                    value={definitionForm.nameAr}
                    onChange={(e) =>
                      setDefinitionForm({
                        ...definitionForm,
                        nameAr: e.target.value,
                      })
                    }
                    placeholder="مثال: نشط"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="definition-code">Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="definition-code"
                    value={definitionForm.code}
                    onChange={(e) =>
                      setDefinitionForm({ ...definitionForm, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g., ACTIVE"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="definition-type">Type <span className="text-red-500">*</span></Label>
                  <Select
                    value={definitionForm.type}
                    onValueChange={(value) =>
                      setDefinitionForm({ ...definitionForm, type: value as any })
                    }
                  >
                    <SelectTrigger id="definition-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="definition-category">Category</Label>
                  <Select
                    value={definitionForm.category}
                    onValueChange={(value) =>
                      setDefinitionForm({ ...definitionForm, category: value })
                    }
                  >
                    <SelectTrigger id="definition-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="definition-color">Color</Label>
                  <Input
                    id="definition-color"
                    type="color"
                    value={definitionForm.color || '#000000'}
                    onChange={(e) =>
                      setDefinitionForm({ ...definitionForm, color: e.target.value })
                    }
                    className="h-10 w-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="definition-description">Description</Label>
                <Textarea
                  id="definition-description"
                  value={definitionForm.description}
                  onChange={(e) =>
                    setDefinitionForm({
                      ...definitionForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe this definition"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDefinitionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveDefinition}
              disabled={!definitionForm.name || !definitionForm.code}
            >
              {editingDefinition ? 'Update Definition' : 'Add Definition'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
