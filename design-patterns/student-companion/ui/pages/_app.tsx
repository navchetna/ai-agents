import type React from "react";
import { usePathname } from "next/navigation";
import { CssBaseline, Box } from "@mui/material";
import {
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  Book as BookIcon,
  AssignmentTurnedIn as AssignmentIcon,
  BarChart as BarChartIcon,
  Timer as TimerIcon,
  SmartToy as SmartToyIcon,
  LocalLibrary as LibraryIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { TimerSettingsProvider } from "@/contexts/TimerSettingsContext";
import { TimerProvider } from "@/contexts/TimerContext";
import { TextbookProvider, useTextbook } from "@/contexts/TextbookContext";
import { CollapsibleSidebar } from "@/components/collapsible-sidebar";

const drawerWidth = 240;

function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const { mode, toggleColorMode, scheduledTheme } = useTheme();
  const { isTextbookOpen } = useTextbook();

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, href: "/" },
    { text: "Schedule", icon: <CalendarIcon />, href: "/schedule" },
    { text: "Courses", icon: <BookIcon />, href: "/courses" },
    { text: "Assignments", icon: <AssignmentIcon />, href: "/assignments" },
    { text: "Grades", icon: <BarChartIcon />, href: "/grades" },
    { text: "Study Timer", icon: <TimerIcon />, href: "/study-timer" },
    { text: "AI Coach", icon: <SmartToyIcon />, href: "/ai-coach" },
    {
      text: "Resource Library",
      icon: <LibraryIcon />,
      href: "/resource-library",
    },
    { text: "Support", icon: <HelpIcon />, href: "/support" },
    { text: "Settings", icon: <SettingsIcon />, href: "/settings" },
    { text: "Logout", icon: <LogoutIcon />, href: "/login" },
  ];

  // This is a placeholder for actual authentication logic
  const isAuthenticated = true;

  return (
    <>
      <CssBaseline />
      {!isAuthenticated || isAuthPage ? (
        children
      ) : (
        <Box sx={{ display: "flex" }}>
          {!isTextbookOpen && <CollapsibleSidebar />}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${drawerWidth}px)` },
              minHeight: "100vh",
              bgcolor: "background.default",
              color: "text.primary",
            }}
          >
            {children}
          </Box>
        </Box>
      )}
    </>
  );
}

// export default function Home({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body>
//         <ThemeProvider>
//           <TimerSettingsProvider>
//             <TimerProvider>
//               <TextbookProvider>
//                 <Layout>
//                   {children}
//                 </Layout>
//               </TextbookProvider>
//             </TimerProvider>
//           </TimerSettingsProvider>
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }


import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <TimerSettingsProvider>
        <TimerProvider>
          <TextbookProvider>
            <Layout>
              <Component {...pageProps} />;
            </Layout>
          </TextbookProvider>
        </TimerProvider>
      </TimerSettingsProvider>
    </ThemeProvider>
  );
}
