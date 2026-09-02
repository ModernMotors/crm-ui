import { createFileRoute, Outlet, Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Building2,
  MapPin,
  Wrench,
  UserCog,
  Shield,
  Mail,
  BookOpen,
  ShieldCheck,
  Users,
  LayoutGrid,
  Settings2,
} from 'lucide-react'
import { AppSidebar } from '@/components/AppSidebar'
import { useState } from 'react'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

const SETTINGS_CATEGORIES = [
  { id: 'companies', label: 'Companies', labelAr: 'الشركات', icon: Building2, path: '/settings/companies' },
  { id: 'branches', label: 'Branches', labelAr: 'الفروع', icon: MapPin, path: '/settings/branches' },
  { id: 'stations', label: 'Stations', labelAr: 'المحطات', icon: Wrench, path: '/settings/stations' },
  { id: 'engineers', label: 'Engineers', labelAr: 'المهندسين', icon: UserCog, path: '/settings/engineers' },
  { id: 'warranty', label: 'Warranty Packages', labelAr: 'باكدجات الضمان', icon: Shield, path: '/settings/warranty-packages' },
  { id: 'mailgroups', label: 'Mail Groups', labelAr: 'جروبات الميل', icon: Mail, path: '/settings/mail-groups' },
  { id: 'definitions', label: 'Definitions', labelAr: 'التعريفات', icon: BookOpen, path: '/settings/definitions' },
  { id: 'roles', label: 'Roles & Permissions', labelAr: 'الأدوار والصلاحيات', icon: ShieldCheck, path: '/settings/roles' },
  { id: 'users', label: 'Users', labelAr: 'المستخدمين', icon: Users, path: '/settings/users' },
  { id: 'pages', label: 'Page Access', labelAr: 'الوصول للصفحات', icon: LayoutGrid, path: '/settings/page-access' },
  { id: 'general', label: 'General Settings', labelAr: 'الإعدادات العامة', icon: Settings2, path: '/settings/general-settings' },
]

function SettingsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeCategory, setActiveCategory] = useState('companies')

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} currentTitle="System Settings" />
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-64")}>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">System Settings Center</h1>
            <p className="text-muted-foreground">
              Professional management system for companies, branches, stations, users, roles, and permissions.
            </p>
          </div>
          <div className="flex gap-6 w-full">
            {/* Left Sidebar Menu */}
            <div className="w-72 shrink-0">
              <Card className="glass-card sticky top-4 border-none bg-background/50 backdrop-blur-sm shadow-sm">
                <div className="flex flex-col gap-1 p-3">
                  <div className="mb-4 px-2">
                    <h3 className="font-semibold text-lg tracking-tight">Management</h3>
                    <p className="text-xs text-muted-foreground">Select a category</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {SETTINGS_CATEGORIES.map((cat) => {
                      const Icon = cat.icon
                      const isActive = activeCategory === cat.id
                      return (
                        <Link
                          key={cat.id}
                          to={cat.path}
                          onClick={() => setActiveCategory(cat.id)}
                          className={cn(
                            "flex items-center justify-start gap-3 px-3 py-2.5 rounded-md transition-all text-sm font-medium w-full",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <div className="flex flex-col items-start">
                            <span>{cat.label}</span>
                            <span className="text-xs opacity-70">{cat.labelAr}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Content Area - Outlet for sub-pages */}
            <div className="flex-1 min-w-0 pb-20">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
