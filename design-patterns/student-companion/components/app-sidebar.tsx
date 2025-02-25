import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dashboard,
  CalendarToday,
  Book,
  AssignmentTurnedIn,
  BarChart,
  Timer,
  SmartToy,
  LocalLibrary,
  Help,
  Settings,
  Logout,
} from "@mui/icons-material";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/contexts/ThemeContext";

const menuItems = [
  { text: "Dashboard", icon: Dashboard, href: "/" },
  { text: "Schedule", icon: CalendarToday, href: "/schedule" },
  { text: "Courses", icon: Book, href: "/courses" },
  { text: "Assignments", icon: AssignmentTurnedIn, href: "/assignments" },
  { text: "Grades", icon: BarChart, href: "/grades" },
  { text: "Study Timer", icon: Timer, href: "/study-timer" },
  { text: "AI Coach", icon: SmartToy, href: "/ai-coach" },
  { text: "Resource Library", icon: LocalLibrary, href: "/resource-library" },
  { text: "Support", icon: Help, href: "/support" },
  { text: "Settings", icon: Settings, href: "/settings" },
  { text: "Logout", icon: Logout, href: "/login" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { mode, isSidebarCollapsed, toggleSidebar }: any = useTheme();

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      <div className="flex h-16 items-center justify-between px-3">
        {!isSidebarCollapsed && (
          <Image
            src={
              mode === "light"
                ? "/student-companion.png"
                : "/student-companion.png"
            }
            alt="Study Buddy Logo"
            width={120}
            height={120}
            style={{ objectFit: "contain" }}
          />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="ml-auto"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {menuItems.map((item) => (
            <Link key={item.text} href={item.href} passHref>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isSidebarCollapsed ? "px-2" : "px-4",
                  pathname === item.href &&
                    "bg-secondary text-secondary-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isSidebarCollapsed ? "mr-0" : "mr-2"
                  )}
                />
                {!isSidebarCollapsed && <span>{item.text}</span>}
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
