import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

export const Route = createFileRoute('/settings/general-settings')({
  component: GeneralSettingsPage,
});

function GeneralSettingsPage() {
  const [systemSettings, setSystemSettings] = useState({
    companyName: 'Car Branch Manager',
    timezone: 'Africa/Cairo',
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
    currency: 'EGP',
  });

  const handleSaveSettings = () => {
    try {
      // Save settings to API
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">General Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
        <Button className="hover-lift button-press" onClick={handleSaveSettings}>
          <Save className="mr-2 h-4 w-4" /> Save Settings
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
          <CardDescription>
            Manage global system settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={systemSettings.companyName}
                onChange={(e) => {
                  setSystemSettings((prev) => ({ ...prev, companyName: e.target.value }));
                }}
                placeholder="e.g., Car Branch Manager"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={systemSettings.timezone}
                  onValueChange={(value) => {
                    setSystemSettings((prev) => ({ ...prev, timezone: value }));
                  }}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Cairo">Africa/Cairo</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={systemSettings.language}
                  onValueChange={(value) => {
                    setSystemSettings((prev) => ({ ...prev, language: value }));
                  }}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select
                  value={systemSettings.dateFormat}
                  onValueChange={(value) => {
                    setSystemSettings((prev) => ({ ...prev, dateFormat: value }));
                  }}
                >
                  <SelectTrigger id="date-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={systemSettings.currency}
                  onValueChange={(value) => {
                    setSystemSettings((prev) => ({ ...prev, currency: value }));
                  }}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EGP">EGP - Egyptian Pound</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
