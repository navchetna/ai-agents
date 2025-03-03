import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Switch,
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { DoodleBackground } from "@/components/doodle-background";
import { useTheme } from "@/contexts/ThemeContext";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { mode, toggleColorMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically call your authentication API
    console.log("Login attempt with:", email, password);
    // For demo purposes, we'll just redirect to the dashboard
    router.push("/");
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background:
          mode === "light"
            ? "linear-gradient(to bottom right, #E3F2FD, #C5CAE9)"
            : "linear-gradient(to bottom right, #1E3A8A, #312E81)", // Updated dark mode gradient
      }}
    >
      <DoodleBackground />
      <Card
        sx={{
          width: 350,
          zIndex: 10,
          backgroundColor:
            mode === "light" ? "#E6F4FE" : "rgba(31, 41, 55, 0.8)", // Updated dark mode background
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
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
          </Box>
          <Typography
            variant="h5"
            component="h1"
            align="center"
            gutterBottom
            sx={{ color: mode === "light" ? "#1A1B1E" : "#FFFFFF" }}
          >
            Login to Study Buddy
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{
                backgroundColor:
                  mode === "light"
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(255, 255, 255, 0.05)",
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: mode === "light" ? "#2196F3" : "#90CAF9",
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              margin="normal"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{
                backgroundColor:
                  mode === "light"
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(255, 255, 255, 0.05)",
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: mode === "light" ? "#2196F3" : "#90CAF9",
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                backgroundColor: mode === "light" ? "#2196F3" : "#90CAF9",
                "&:hover": {
                  backgroundColor: mode === "light" ? "#1976D2" : "#64B5F6",
                },
              }}
            >
              Login
            </Button>
          </form>
          <Typography
            variant="body2"
            align="center"
            sx={{
              mt: 2,
              color: mode === "light" ? "#1A1B1E" : "#FFFFFF",
            }}
          >
            Don't have an account?{" "}
            <Link
              href="/signup"
              style={{
                color: mode === "light" ? "#2196F3" : "#90CAF9",
                textDecoration: "none",
              }}
            >
              Sign up
            </Link>
          </Typography>
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
    </Box>
  );
}
