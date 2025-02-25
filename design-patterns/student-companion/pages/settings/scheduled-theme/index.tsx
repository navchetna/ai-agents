import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import Link from "next/link";

export default function ScheduledThemePage() {
  const { scheduledTheme, updateScheduledTheme } = useTheme();
  const [enabled, setEnabled] = useState(scheduledTheme.enabled);
  const [mode, setMode] = useState(scheduledTheme.mode);
  const [lightModeTime, setLightModeTime] = useState(
    scheduledTheme.lightModeTime
  );
  const [darkModeTime, setDarkModeTime] = useState(scheduledTheme.darkModeTime);

  const handleSave = () => {
    updateScheduledTheme({
      enabled,
      mode,
      lightModeTime,
      darkModeTime,
    });
    // In a real app, you might want to show a success message or redirect
    console.log("Scheduled theme settings saved");
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center space-x-2">
        <Link href="/settings">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Scheduled Theme</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Theme Scheduling</CardTitle>
          <CardDescription>
            Configure when to switch between light and dark modes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="scheduled-theme-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
            <Label htmlFor="scheduled-theme-enabled">
              Enable Scheduled Theme
            </Label>
          </div>
          <RadioGroup
            value={mode}
            onValueChange={setMode}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sunset" id="sunset" />
              <Label htmlFor="sunset">Sunset to Sunrise</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom Schedule</Label>
            </div>
          </RadioGroup>
          {mode === "custom" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="light-mode-time">Light Mode Start Time</Label>
                <Input
                  id="light-mode-time"
                  type="time"
                  value={lightModeTime}
                  onChange={(e) => setLightModeTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dark-mode-time">Dark Mode Start Time</Label>
                <Input
                  id="dark-mode-time"
                  type="time"
                  value={darkModeTime}
                  onChange={(e) => setDarkModeTime(e.target.value)}
                />
              </div>
            </div>
          )}
          <Button onClick={handleSave}>Save Scheduled Theme Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
