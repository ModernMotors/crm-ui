import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/AppTopbar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus,
  Search,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Edit,
  Trash2,
  Loader2,
  FileText,
  LayoutGrid,
  List,
  RefreshCw,
  BookMarked,
  Layers,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/knowledge/")({
  component: KnowledgePage,
});

// ─── Color and icon presets ───────────────────────────────────────────────────
const COLOR_PRESETS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4", "#64748b", "#78716c",
];

const ICON_PRESETS = [
  "BookOpen", "Folder", "FileText", "Layers", "BookMarked",
  "Star", "Tag", "Settings", "Users", "Globe", "Shield", "Zap",
];

// ─── Tree node component ──────────────────────────────────────────────────────
function TreeNode({
  node,
  level = 0,
  onEdit,
  onDelete,
  onAddChild,
}: {
  node: any;
  level?: number;
  onEdit: (node: any) => void;
  onDelete: (id: string, name: string) => void;
  onAddChild: (parentId: string) => void;
}) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div
        className={cn(
          "group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-all hover:bg-muted/60",
          level === 0 && "font-semibold"
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {/* Expand toggle */}
        <button
          className="w-4 h-4 flex items-center justify-center flex-shrink-0 text-muted-foreground"
          onClick={() => setExpanded(!expanded)}
        >
          {hasChildren ? (
            expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <span className="w-3.5" />
          )}
        </button>

        {/* Folder icon */}
        <span style={{ color: node.color || "#6366f1" }}>
          {expanded && hasChildren ? (
            <FolderOpen className="w-4 h-4" />
          ) : (
            <Folder className="w-4 h-4" />
          )}
        </span>

        {/* Name — links to detail page */}
        <Link
          to="/knowledge/$categoryId"
          params={{ categoryId: node.id }}
          className="flex-1 text-sm text-foreground hover:text-primary truncate"
          onClick={(e) => e.stopPropagation()}
        >
          {node.name}
        </Link>

        {/* Item count badge */}
        {node.item_count > 0 && (
          <Badge variant="secondary" className="text-xs h-5 px-1.5 ml-1">
            {node.item_count}
          </Badge>
        )}

        {/* Actions — visible on hover */}
        <div className="hidden group-hover:flex items-center gap-1 ml-1">
          <button
            onClick={(e) => { e.stopPropagation(); onAddChild(node.id); }}
            className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary"
            title="Add child"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(node); }}
            className="p-1 rounded hover:bg-blue-100 text-muted-foreground hover:text-blue-600"
            title="Edit"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(node.id, node.name); }}
            className="p-1 rounded hover:bg-red-100 text-muted-foreground hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {node.children.map((child: any) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Category form dialog ─────────────────────────────────────────────────────
function CategoryDialog({
  open,
  onClose,
  initialData,
  parentId,
  allCategories,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initialData?: any;
  parentId?: string;
  allCategories: any[];
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: initialData?.name || "",
    name_ar: initialData?.name_ar || "",
    description: initialData?.description || "",
    icon: initialData?.icon || "BookOpen",
    color: initialData?.color || "#6366f1",
    parent_id: initialData?.parent_id || parentId || "",
    order_index: initialData?.order_index ?? 0,
  });

  // Reset when dialog opens
  useState(() => {
    setForm({
      name: initialData?.name || "",
      name_ar: initialData?.name_ar || "",
      description: initialData?.description || "",
      icon: initialData?.icon || "BookOpen",
      color: initialData?.color || "#6366f1",
      parent_id: initialData?.parent_id || parentId || "",
      order_index: initialData?.order_index ?? 0,
    });
  });

  const isEditing = !!initialData;

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEditing
        ? apiClient.updateKnowledgeCategory(initialData.id, data)
        : apiClient.createKnowledgeCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-tree"] });
      toast.success(isEditing ? "Category updated!" : "Category created!");
      onSaved();
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Error saving category"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    mutation.mutate({
      ...form,
      parent_id: form.parent_id || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Category" : parentId ? "Add Sub-category" : "New Root Category"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Category name"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label>Arabic Name</Label>
              <Input
                value={form.name_ar}
                onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                placeholder="الاسم بالعربية"
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of this category…"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Parent Category</Label>
              <Select
                value={form.parent_id || "none"}
                onValueChange={(v) => setForm({ ...form, parent_id: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No parent (root)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— No parent (root) —</SelectItem>
                  {allCategories
                    .filter((c) => c.id !== initialData?.id)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Order Index</Label>
              <Input
                type="number"
                value={form.order_index}
                onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-transform hover:scale-110",
                    form.color === c ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setForm({ ...form, color: c })}
                />
              ))}
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-7 h-7 rounded cursor-pointer border border-input"
                title="Custom color"
              />
            </div>
          </div>

          {/* Preview */}
          <div
            className="flex items-center gap-3 p-3 rounded-lg border"
            style={{ borderColor: form.color + "40", backgroundColor: form.color + "10" }}
          >
            <span style={{ color: form.color }}>
              <Folder className="w-5 h-5" />
            </span>
            <span className="font-medium text-sm" style={{ color: form.color }}>
              {form.name || "Category name preview"}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
function KnowledgePage() {
  const queryClient = useQueryClient();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newParentId, setNewParentId] = useState<string | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // Fetch full tree
  const { data: treeData, isLoading, refetch } = useQuery({
    queryKey: ["knowledge-tree", search],
    queryFn: () => apiClient.getKnowledgeTree(search ? { search } : {}),
    select: (d) => d.data || [],
  });

  // Flat list of all categories (for parent selector)
  const flatCategories = useMemo(() => {
    const flatten = (nodes: any[]): any[] =>
      nodes.flatMap((n) => [n, ...flatten(n.children || [])]);
    return flatten(treeData || []);
  }, [treeData]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteKnowledgeCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-tree"] });
      toast.success("Category deleted");
      setDeleteConfirm(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Delete failed"),
  });

  const totalItems = useMemo(() =>
    flatCategories.reduce((sum, c) => sum + (c.item_count || 0), 0),
    [flatCategories]
  );

  const handleEdit = (node: any) => {
    setEditingCategory(node);
    setNewParentId(undefined);
    setDialogOpen(true);
  };

  const handleAddChild = (parentId: string) => {
    setEditingCategory(null);
    setNewParentId(parentId);
    setDialogOpen(true);
  };

  const handleAddRoot = () => {
    setEditingCategory(null);
    setNewParentId(undefined);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentTitle="Knowledge Base"
      />
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-64")}>
        <PageShell
          title="Knowledge Base"
          subtitle="Organize and manage your team's knowledge — categories, articles, guides, FAQs and more."
          showTopbar={false}
        >
          {/* Stats row */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Categories", value: flatCategories.length, icon: Folder },
              { label: "Root Categories", value: (treeData || []).length, icon: Layers },
              { label: "Total Articles", value: totalItems, icon: FileText },
              { label: "Depth Levels", value: flatCategories.length > 0 ? "∞" : "0", icon: BookMarked },
            ].map((s) => (
              <Card key={s.label} className="glass-card hover-lift">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <s.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
                    <p className="text-2xl font-bold">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search categories…"
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => refetch()} className="hover-lift">
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-md border overflow-hidden">
                <button
                  className={cn("px-3 py-1.5 text-sm", viewMode === "tree" ? "bg-primary text-white" : "hover:bg-muted")}
                  onClick={() => setViewMode("tree")}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  className={cn("px-3 py-1.5 text-sm", viewMode === "grid" ? "bg-primary text-white" : "hover:bg-muted")}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
              <Button onClick={handleAddRoot} className="hover-lift">
                <Plus className="mr-2 h-4 w-4" /> New Category
              </Button>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && (!treeData || treeData.length === 0) && (
            <Card className="glass-card">
              <CardContent className="py-20 text-center">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Start by creating your first knowledge category
                </p>
                <Button onClick={handleAddRoot}>
                  <Plus className="mr-2 h-4 w-4" /> Create First Category
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Tree View */}
          {!isLoading && treeData && treeData.length > 0 && viewMode === "tree" && (
            <Card className="glass-card">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Folder className="w-4 h-4" /> Category Tree
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-0.5">
                {treeData.map((node: any) => (
                  <TreeNode
                    key={node.id}
                    node={node}
                    level={0}
                    onEdit={handleEdit}
                    onDelete={(id, name) => setDeleteConfirm({ id, name })}
                    onAddChild={handleAddChild}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Grid View */}
          {!isLoading && treeData && treeData.length > 0 && viewMode === "grid" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {flatCategories.map((cat) => (
                <Card
                  key={cat.id}
                  className="glass-card hover-lift group cursor-pointer"
                  style={{ borderTop: `3px solid ${cat.color || "#6366f1"}` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: (cat.color || "#6366f1") + "20" }}
                      >
                        <Folder className="w-5 h-5" style={{ color: cat.color || "#6366f1" }} />
                      </div>
                      <div className="hidden group-hover:flex gap-1">
                        <button
                          onClick={() => handleAddChild(cat.id)}
                          className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-1 rounded hover:bg-blue-100 text-muted-foreground hover:text-blue-600"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: cat.id, name: cat.name })}
                          className="p-1 rounded hover:bg-red-100 text-muted-foreground hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <Link to="/knowledge/$categoryId" params={{ categoryId: cat.id }}>
                      <h3 className="font-semibold text-sm mb-1 hover:text-primary transition-colors line-clamp-1">
                        {cat.name}
                      </h3>
                    </Link>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{cat.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{cat.item_count || 0} items</span>
                      {cat.children?.length > 0 && (
                        <span>{cat.children.length} sub-categories</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </PageShell>
      </div>

      {/* Category Dialog */}
      {dialogOpen && (
        <CategoryDialog
          open={dialogOpen}
          onClose={() => { setDialogOpen(false); setEditingCategory(null); setNewParentId(undefined); }}
          initialData={editingCategory}
          parentId={newParentId}
          allCategories={flatCategories}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ["knowledge-tree"] })}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <Dialog open onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Delete <span className="font-semibold text-foreground">"{deleteConfirm.name}"</span>?
              Sub-categories will be moved up. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteConfirm.id)}
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
