import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  LayoutGrid,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { pageAccessApi, rolesApi } from '@/lib/api';

export const Route = createFileRoute('/settings/page-access')({
  component: PageAccessPage,
});

function PageAccessPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pagesRes, rolesRes] = await Promise.all([
          pageAccessApi.getAll(),
          rolesApi.getAll(),
        ]);
        setPages(pagesRes.data || []);
        setRoles(rolesRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPages = selectedRole === 'all' 
    ? pages 
    : pages.filter((p) => p.roleId === selectedRole);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Page Access Control</h1>
          <p className="text-muted-foreground">
            Configure page-level access permissions for each role
          </p>
        </div>
      </div>

      <Card className="glass-card">
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">System Pages</h3>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <p>Loading page access...</p>
              </div>
            ) : filteredPages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No page access configurations found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPages.map((page) => (
                  <Card key={page.pageId} className="glass-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <LayoutGrid className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{page.pageName}</CardTitle>
                            <CardDescription className="text-xs">{page.pageNameAr}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">{page.accessLevel}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          {page.canView ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-muted-foreground">View</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {page.canCreate ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-muted-foreground">Create</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {page.canEdit ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-muted-foreground">Edit</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {page.canDelete ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-muted-foreground">Delete</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {page.canExport ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-muted-foreground">Export</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {page.canImport ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-muted-foreground">Import</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
