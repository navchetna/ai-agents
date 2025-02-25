import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTimerSettings } from "@/contexts/TimerSettingsContext";
import Link from "next/link";

export default function SettingsPage() {
  const [name, setName] = useState("John Doe");
  const [grade, setGrade] = useState("5");
  const [fontSize, setFontSize] = useState(16);
  const [ttsVoice, setTtsVoice] = useState("default");
  const [ttsSpeed, setTtsSpeed] = useState(1);
  const [language, setLanguage] = useState("english");
  const [wordTranslation, setWordTranslation] = useState(false);
  const [pomodoroEnabled, setPomodoroEnabled] = useState(true);
  const [autoSaveNotes, setAutoSaveNotes] = useState(true);
  const { mode, toggleColorMode } = useTheme();
  const { timerSettings, updateTimerSettings } = useTimerSettings();

  const [studyDuration, setStudyDuration] = useState(
    timerSettings.studyDuration / 60
  );
  const [breakDuration, setBreakDuration] = useState(
    timerSettings.breakDuration / 60
  );

  useEffect(() => {
    setStudyDuration(timerSettings.studyDuration / 60);
    setBreakDuration(timerSettings.breakDuration / 60);
  }, [timerSettings]);

  const handleSaveSettings = () => {
    updateTimerSettings({
      studyDuration: studyDuration * 60,
      breakDuration: breakDuration * 60,
    });
    console.log("Saving settings:", {
      name,
      grade,
      mode,
      fontSize,
      ttsVoice,
      ttsSpeed,
      language,
      wordTranslation,
      pomodoroEnabled,
      studyDuration,
      breakDuration,
      autoSaveNotes,
    });
  };

  const handleResetProgress = () => {
    console.log("Resetting progress");
  };

  const handleExportData = () => {
    console.log("Exporting user data");
  };

  const handleDeleteData = () => {
    console.log("Deleting user data");
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="study">Study</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  {/* <AvatarImage src="/placeholder.svg" alt={name} /> */}
                  <AvatarFallback>
                    {name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Button>Change Avatar</Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger id="grade">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 6, 7, 8, 9, 10].map((g) => (
                      <SelectItem key={g} value={g.toString()}>
                        {g}th Grade
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>Customize your app experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <Switch
                  id="dark-mode"
                  checked={mode === "dark"}
                  onCheckedChange={toggleColorMode}
                  aria-label="toggle dark mode"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="scheduled-theme">Scheduled Theme</Label>
                <Button variant="outline" asChild>
                  <Link href="/settings/scheduled-theme">
                    <Clock className="mr-2 h-4 w-4" />
                    Configure
                  </Link>
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size: {fontSize}px</Label>
                <Slider
                  id="font-size"
                  min={12}
                  max={24}
                  step={1}
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tts-voice">Text-to-Speech Voice</Label>
                <Select value={ttsVoice} onValueChange={setTtsVoice}>
                  <SelectTrigger id="tts-voice">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tts-speed">
                  Text-to-Speech Speed: {ttsSpeed}x
                </Label>
                <Slider
                  id="tts-speed"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[ttsSpeed]}
                  onValueChange={(value) => setTtsSpeed(value[0])}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="urdu">Urdu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="word-translation"
                  checked={wordTranslation}
                  onCheckedChange={setWordTranslation}
                />
                <Label htmlFor="word-translation">
                  Enable word-level translation
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="study">
          <Card>
            <CardHeader>
              <CardTitle>Study Preferences</CardTitle>
              <CardDescription>Customize your study experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="pomodoro"
                  checked={pomodoroEnabled}
                  onCheckedChange={setPomodoroEnabled}
                />
                <Label htmlFor="pomodoro">Enable Pomodoro Timer</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="study-duration">
                  Study Duration: {studyDuration} minutes
                </Label>
                <Select
                  value={studyDuration.toString()}
                  onValueChange={(value) => setStudyDuration(Number(value))}
                  disabled={!pomodoroEnabled}
                >
                  <SelectTrigger id="study-duration">
                    <SelectValue placeholder="Select study duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 minutes (Test)</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="25">25 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="break-duration">
                  Break Duration: {breakDuration} minutes
                </Label>
                <Select
                  value={breakDuration.toString()}
                  onValueChange={(value) => setBreakDuration(Number(value))}
                  disabled={!pomodoroEnabled}
                >
                  <SelectTrigger id="break-duration">
                    <SelectValue placeholder="Select break duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 minutes (Test)</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-save"
                  checked={autoSaveNotes}
                  onCheckedChange={setAutoSaveNotes}
                />
                <Label htmlFor="auto-save">Auto-save notes</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
              <CardDescription>
                Manage your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" onClick={handleResetProgress}>
                Reset Progress
              </Button>
              <Button variant="outline" onClick={handleExportData}>
                Export Data
              </Button>
              <Button variant="destructive" onClick={handleDeleteData}>
                Delete All Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Button onClick={handleSaveSettings}>Save Settings</Button>
    </div>
  );
}
