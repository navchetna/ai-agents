import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { DoodleBackground } from "@/components/doodle-background";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import { Box } from "@mui/material";
import Switch from "@mui/material/Switch";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

// Placeholder data for cities
const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
];

export default function SignupPage() {
  const { mode, toggleColorMode } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [school, setSchool] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically call your registration API
    console.log("Signup attempt with:", {
      name,
      email,
      password,
      city,
      school,
    });
    // For demo purposes, we'll just redirect to the login page
    router.push("/login");
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-950">
      <DoodleBackground />
      <Card
        className={`w-[400px] z-10 ${
          mode === "light" ? "bg-[#E6F4FE]" : "bg-gray-800/80"
        } backdrop-blur-sm shadow-lg`}
      >
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            {/* <Image
              src={mode === "light" ? "/placeholder.svg" : "/placeholder.svg"}
              alt="Study Buddy Logo"
              width={120}
              height={120}
              style={{ objectFit: "contain" }}
            /> */}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Sign up for Study Buddy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300"
              >
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className={`${
                  mode === "light" ? "bg-white/70" : "bg-gray-700/50"
                } border-gray-200 dark:border-gray-600`}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
                className={`${
                  mode === "light" ? "bg-white/70" : "bg-gray-700/50"
                } border-gray-200 dark:border-gray-600`}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`${
                  mode === "light" ? "bg-white/70" : "bg-gray-700/50"
                } border-gray-200 dark:border-gray-600`}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="city"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300"
              >
                City
              </label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger
                  className={`${
                    mode === "light" ? "bg-white/70" : "bg-gray-700/50"
                  } border-gray-200 dark:border-gray-600`}
                >
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="school"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300"
              >
                School
              </label>
              <Input
                id="school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Enter your school name"
                required
                className={`${
                  mode === "light" ? "bg-white/70" : "bg-gray-700/50"
                } border-gray-200 dark:border-gray-600`}
              />
            </div>
            <Button
              type="submit"
              className={`w-full ${
                mode === "light"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              Sign up
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className={`${
                mode === "light" ? "text-blue-600" : "text-blue-400"
              } hover:underline`}
            >
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: 16,
          display: "flex",
          alignItems: "center",
          zIndex: 20,
        }}
      >
        <Brightness7Icon
          sx={{ color: mode === "light" ? "#1A1B1E" : "#FFFFFF", mr: 1 }}
        />
        <Switch
          checked={mode === "dark"}
          onChange={toggleColorMode}
          color="default"
          inputProps={{ "aria-label": "toggle dark mode" }}
        />
        <Brightness4Icon
          sx={{ color: mode === "light" ? "#1A1B1E" : "#FFFFFF", ml: 1 }}
        />
      </Box>
    </div>
  );
}
