import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/AppTopbar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  FileText,
  Link as LinkIcon,
  BookOpen,
  HelpCircle,
  Video,
  File,
  StickyNote,
  ChevronRight,
  Eye,
  Folder,
  FolderOpen,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/knowledge/$categoryId")({
  component: KnowledgeCategoryPage,
});

// ─── Type icons ───────────────────────────────────────────────────────────────
const TYPE_ICONS: Record<string, any> = {
  article: FileText,
  faq: HelpCircle,
  guide: BookOpen,
  note: StickyNote,
  link: LinkIcon,
  file: File,
  video: Video,
};

const TYPE_COLORS: Record<string, string> = {
  article: "bg-blue-50 text-blue-700 border-blue-200",
  faq: "bg-purple-50 text-purple-700 border-purple-200",
  guide: "bg-green-50 text-green-700 border-green-200",
  note: "bg-yellow-50 text-yellow-700 border-yellow-200",
  link: "bg-cyan-50 text-cyan-700 border-cyan-200",
  file: "bg-orange-50 text-orange-700 border-orange-200",
  video: "bg-red-50 text-red-700 border-red-200",
};

// ─── Item Form Dialog ─────────────────────────────────────────────────────────
function ItemDialog({
  open,
  onClose,
  categoryId,
  initialData,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  categoryId: string;
  initialData?: any;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    item_type: initialData?.item_type || "article",
    tags: initialData?.tags?.join(", ") || "",
    meta_url: initialData?.meta?.url || "",
    meta_source: initialData?.meta?.source || "",
    meta_author: initialData?.meta?.author || "",
    is_published: initialData?.is_published ?? true,
    order_index: initialData?.order_index ?? 0,
  });

  const isEditing = !!initialData;

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEditing
        ? apiClient.updateKnowledgeItem(initialData.id, data)
        : apiClient.createKnowledgeItem(data),
    onSuccess: () => {
      toast.success(isEditing ? "Item updated!" : "Item created!");
      onSaved();
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Error saving item"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    const tags = form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const meta: any = {};
    if (form.meta_url) meta.url = form.meta_url;
    if (form.meta_source) meta.source = form.meta_source;
    if (form.meta_author) meta.author = form.meta_author;

    mutation.mutate({
      category_id: categoryId,
      title: form.title,
      content: form.content,
      item_type: form.item_type,
      tags,
      meta,
      is_published: form.is_published,
      order_index: form.order_index,
    });
  };

  const ItemIcon = TYPE_ICONS[form.item_type] || FileText;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ItemIcon className="w-5 h-5 text-primary" />
            {isEditing ? "Edit Item" : "Add New Item"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {Object.entries(TYPE_ICONS).map(([type, Icon]) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm({ ...form, item_type: type })}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all",
                  form.item_type === type
                    ? "border-primary bg-primary/5 text-primary font-semibold"
                    : "border-transparent hover:border-muted-foreground/30 text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="capitalize">{type}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <Label>Title <span className="text-red-500">*</span></Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Item title…"
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <Label>Content</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write the full content, instructions, details…"
              rows={8}
              className="font-mono text-sm resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Tags</Label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-xs text-muted-foreground">Comma-separated</p>
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

          {/* Meta fields */}
          <div className="space-y-3 p-3 rounded-lg border border-dashed">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Optional Metadata
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">URL / Link</Label>
                <Input
                  value={form.meta_url}
                  onChange={(e) => setForm({ ...form, meta_url: e.target.value })}
                  placeholder="https://…"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Author</Label>
                <Input
                  value={form.meta_author}
                  onChange={(e) => setForm({ ...form, meta_author: e.target.value })}
                  placeholder="Author name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Source</Label>
                <Input
                  value={form.meta_source}
                  onChange={(e) => setForm({ ...form, meta_source: e.target.value })}
                  placeholder="Reference source"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <Label htmlFor="published" className="cursor-pointer">Published (visible to all)</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
function KnowledgeCategoryPage() {
  const { categoryId } = Route.useParams();
  const queryClient = useQueryClient();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [itemDialog, setItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  // Fetch category details
  const { data: category, isLoading: loadingCategory } = useQuery({
    queryKey: ["knowledge-category", categoryId],
    queryFn: () => apiClient.getKnowledgeCategory(categoryId),
  });

  // Fetch items
  const { data: itemsData, isLoading: loadingItems, refetch } = useQuery({
    queryKey: ["knowledge-items", categoryId, search, filterType],
    queryFn: () =>
      apiClient.getKnowledgeItems(categoryId, {
        ...(search ? { search } : {}),
        ...(filterType !== "all" ? { item_type: filterType } : {}),
      }),
    select: (d) => d.data || [],
  });

  const items: any[] = itemsData || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteKnowledgeItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-items", categoryId] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-tree"] });
      toast.success("Item deleted");
      setDeleteConfirm(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Delete failed"),
  });

  const isLoading = loadingCategory || loadingItems;

  // Breadcrumb from parent
  const buildBreadcrumb = () => {
    if (!category) return [];
    const crumbs = [];
    if (category.parent) {
      crumbs.push({ id: category.parent.id, name: category.parent.name });
    }
    crumbs.push({ id: category.id, name: category.name });
    return crumbs;
  };

  const breadcrumbs = buildBreadcrumb();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentTitle={category?.name || "Knowledge"}
      />
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-64")}>
        <PageShell
          title={category?.name || "…"}
          subtitle={category?.description || "Knowledge category"}
          showTopbar={false}
        >
          {/* Back + Breadcrumbs */}
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Button variant="ghost" size="sm" asChild className="h-7 px-2">
              <Link to="/knowledge">
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Knowledge Base
              </Link>
            </Button>
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.id} className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5" />
                {i < breadcrumbs.length - 1 ? (
                  <Link
                    to="/knowledge/$categoryId"
                    params={{ categoryId: crumb.id }}
                    className="hover:text-foreground"
                  >
                    {crumb.name}
                  </Link>
                ) : (
                  <span
                    className="font-medium"
                    style={{ color: category?.color || undefined }}
                  >
                    {crumb.name}
                  </span>
                )}
              </span>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-4">
              {/* Left sidebar: sub-categories */}
              <div className="lg:col-span-1 space-y-3">
                {/* Category info card */}
                <Card
                  className="glass-card"
                  style={{ borderTop: `3px solid ${category?.color || "#6366f1"}` }}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: (category?.color || "#6366f1") + "20" }}
                      >
                        <Folder className="w-5 h-5" style={{ color: category?.color || "#6366f1" }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{category?.name}</h3>
                        {category?.name_ar && (
                          <p className="text-xs text-muted-foreground" dir="rtl">{category.name_ar}</p>
                        )}
                      </div>
                    </div>
                    {category?.description && (
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                      <span>{items.length} items</span>
                      <Badge variant="secondary" className="text-xs">
                        Level {category?.parent ? "2+" : "1"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Sub-categories */}
                {category?.children && category.children.length > 0 && (
                  <Card className="glass-card">
                    <CardHeader className="py-3 px-4 border-b">
                      <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <FolderOpen className="w-3.5 h-3.5" /> Sub-categories
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 space-y-0.5">
                      {category.children.map((child: any) => (
                        <Link
                          key={child.id}
                          to="/knowledge/$categoryId"
                          params={{ categoryId: child.id }}
                          className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted/60 transition-colors text-sm group"
                        >
                          <Folder className="w-4 h-4 flex-shrink-0" style={{ color: child.color || category?.color || "#6366f1" }} />
                          <span className="flex-1 truncate">{child.name}</span>
                          {child.children?.length > 0 && (
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          )}
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Main content: items */}
              <div className="lg:col-span-3 space-y-4">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search items…"
                        className="pl-9 w-56"
                      />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.keys(TYPE_ICONS).map((t) => (
                          <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => { setEditingItem(null); setItemDialog(true); }}
                    className="hover-lift"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                  </Button>
                </div>

                {/* Items grid */}
                {items.length === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Folder className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{category?.name || 'Branch'}</h3>
                            {category?.description && (
                              <p className="text-sm text-muted-foreground whitespace-pre-line" dir="rtl">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {items.map((item: any) => {
                      const ItemIcon = TYPE_ICONS[item.item_type] || FileText;
                      return (
                        <Card
                          key={item.id}
                          className="glass-card hover-lift group transition-all cursor-pointer"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Type icon */}
                              <div className={cn(
                                "w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5",
                                TYPE_COLORS[item.item_type] || "bg-gray-50 text-gray-600 border-gray-200"
                              )}>
                                <ItemIcon className="w-4 h-4" />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-semibold text-sm leading-tight">{item.title}</h4>
                                  <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
                                    <button
                                      onClick={() => { setEditingItem(item); setItemDialog(true); }}
                                      className="p-1.5 rounded hover:bg-blue-100 text-muted-foreground hover:text-blue-600"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm({ id: item.id, title: item.title })}
                                      className="p-1.5 rounded hover:bg-red-100 text-muted-foreground hover:text-red-600"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {item.content && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {item.content}
                                  </p>
                                )}

                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <Badge
                                    variant="outline"
                                    className={cn("text-xs capitalize", TYPE_COLORS[item.item_type] || "")}
                                  >
                                    {item.item_type}
                                  </Badge>

                                  {item.tags?.map((tag: string) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}

                                  {!item.is_published && (
                                    <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300">
                                      Draft
                                    </Badge>
                                  )}

                                  {item.view_count > 0 && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                                      <Eye className="w-3 h-3" /> {item.view_count}
                                    </span>
                                  )}
                                </div>

                                {item.meta?.url && (
                                  <a
                                    href={item.meta.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <LinkIcon className="w-3 h-3" />
                                    {item.meta.url}
                                  </a>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </PageShell>
      </div>

      {/* Item dialog */}
      {itemDialog && (
        <ItemDialog
          open={itemDialog}
          onClose={() => { setItemDialog(false); setEditingItem(null); }}
          categoryId={categoryId}
          initialData={editingItem}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["knowledge-items", categoryId] });
            queryClient.invalidateQueries({ queryKey: ["knowledge-tree"] });
          }}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <Dialog open onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Item</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Delete <span className="font-semibold text-foreground">"{deleteConfirm.title}"</span>?
              This cannot be undone.
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
