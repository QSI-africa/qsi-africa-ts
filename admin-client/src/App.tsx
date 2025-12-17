// admin-client/src/App.jsx
import React, { useEffect, useState  } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute"; // Import PublicRoute
import AdminLayout from "./components/AdminLayout"; // Import AdminLayout
import DashboardPage from "./pages/DashboardPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import UserPage from "./pages/UserPage";
import HealingInquiriesPage from "./pages/HealingInquiriesPage";
import PilotProjectsPage from "./pages/PilotProjectsPage";
import VisionSubmissionsPage from "./pages/VisionSubmissionsPage";
import { ConfigProvider } from "antd";
import { BulbOutlined } from "@ant-design/icons";
import { Switch } from "antd";
import { BulbFilled } from "@ant-design/icons";
import {
  lightTheme,
  darkTheme,
} from "./theme/theme-config";
import HealingPackagesPage from "./pages/HealingPackagesPage";
import HealingSuggestionsPage from "./pages/HealingSuggestionsPage";
import ClientListPage from "./pages/ClientListPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import SuggestionManagementPage from "./pages/SuggestionManagementPage";
const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isMobile = windowWidth <= 768;

  // Check system preference or saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
    }
  }, []);

  // Update theme in localStorage and apply to document
  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light"
    );

    // Update background based on theme
    if (isDarkMode) {
      document.body.style.background =
        "linear-gradient(135deg, #0A1931 0%, #0F2442 100%)";
    } else {
      document.body.style.background =
        "linear-gradient(135deg, #F6FAFD 0%, #B3CFE5 100%)";
    }
  }, [isDarkMode]);

  const themeConfig = isDarkMode ? darkTheme : lightTheme;
  return (
    <ConfigProvider theme={themeConfig}>
      {/* Theme Toggle Button */}
      <div
        style={{
          position: "fixed",
          bottom: isMobile ? 100 : 20,
          right: 20,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          backgroundColor: isDarkMode
            ? "rgba(30, 41, 59, 0.8)"
            : "rgba(255, 255, 255, 0.8)",
          borderRadius: 20,
          backdropFilter: "blur(10px)",
          border: isDarkMode
            ? "1px solid rgba(179, 207, 229, 0.2)"
            : "1px solid rgba(74, 127, 167, 0.2)",
          boxShadow: isDarkMode
            ? "0 4px 12px rgba(0, 0, 0, 0.3)"
            : "0 4px 12px rgba(10, 25, 49, 0.1)",
        }}
      >
        <BulbOutlined
          style={{
            color: isDarkMode ? "#B3CFE5" : "#4A7FA7",
            fontSize: 16,
          }}
        />
        <Switch
          checked={isDarkMode}
          onChange={setIsDarkMode}
          size="small"
          style={{
            backgroundColor: isDarkMode ? "#4A7FA7" : "#B3CFE5",
          }}
        />
        <BulbFilled
          style={{
            color: isDarkMode ? "#B3CFE5" : "#4A7FA7",
            fontSize: 16,
          }}
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: isDarkMode ? "#B3CFE5" : "#1A3D63",
            marginLeft: 4,
          }}
        >
          {isDarkMode ? "Dark" : "Light"}
        </span>
      </div>
      <BrowserRouter>
        <Routes>
          {/* Public routes (like login) */}
          <Route element={<PublicRoute />}>
            {/* Use PublicRoute to prevent access if logged in */}
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected routes (admin panel) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/users" element={<UserPage />} />
              <Route
                path="/healing-inquiries"
                element={<HealingInquiriesPage />}
              />
              <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
              <Route
                path="/vision-submissions"
                element={<VisionSubmissionsPage />}
              />
              <Route path="/pilots" element={<PilotProjectsPage />} />
              <Route
                path="/healing-packages"
                element={<HealingPackagesPage />}
              />
              <Route
                path="/healing-suggestions"
                element={<HealingSuggestionsPage />}
              />
              <Route path="/clients" element={<ClientListPage />} />
              <Route path="/clients/:id" element={<ClientDetailPage />} />
              <Route
                path="/admin/suggestions"
                element={<SuggestionManagementPage />}
              />
            </Route>
          </Route>

          {/* Fallback route - Redirects any unknown path */}
          {/* If logged in, redirects to dashboard ('/'). If not, ProtectedRoute redirects to '/login'. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
