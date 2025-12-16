import React, { useState, useEffect  } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout, ConfigProvider, Switch, App as AntApp } from "antd"; // Import AntApp
import { BulbOutlined, BulbFilled } from "@ant-design/icons";

// Page Imports
import LandingPage from "./pages/LandingPage";
import ChatWindow from "./components/ChatWindow";
import PilotDetailPage from "./pages/PilotDetailPage";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import PilotListPage from "./pages/PilotListPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OnboardingPage from "./pages/OnboardingPage";
import Privacy from "./pages/Privacy";

// Theme & Auth Imports
import { lightTheme, darkTheme } from './components/theme/theme-config';
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import OnboardingRoute from "./components/OnboardingRoute";
import PublicRoute from "./components/PublicRoute";
import "./App.css";
import FrameWorkPage from "./pages/FrameworkPage";
import FrequencyScan from "./pages/FrequencyScan";
import TermsAndConditions from "./pages/TermsAndConditions";
import InvoicesPage from "./pages/InvoicesPage";

const { Content } = Layout;

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
      <AntApp>
        {/* 6. Add AntApp wrapper for message/notification context */}
        <BrowserRouter>
          <AuthProvider>
            {/* 7. Wrap Layout in AuthProvider */}
            <Layout
              style={{
                background: "transparent",
                transition: "all 0.3s ease",
              }}
            >
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

              <Content
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  padding: 0,
                  margin: 0,
                  background: "transparent",
                }}
              >
                <Routes>
                  {/* === Public-Only Routes === */}
                  <Route element={<PublicRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                  </Route>

                  {/* === Onboarding Route === */}
                  <Route element={<OnboardingRoute />}>
                    <Route path="/onboarding" element={<OnboardingPage />} />
                  </Route>

                  {/* === Protected Main App Routes === */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/chat/:moduleName" element={<ChatWindow />} />
                    <Route path="/invoices" element={<InvoicesPage />} />
                  </Route>

                  {/* === Fully Public Routes (Visible to all) === */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/contact-us" element={<ContactUs />} />
                  <Route path="/pilots" element={<PilotListPage />} />
                  <Route
                    path="/pilots/:pilotKey"
                    element={<PilotDetailPage />}
                  />
                  <Route path="/frameworks" element={<FrameWorkPage />} />
                  <Route path="/frequency" element={<FrequencyScan />} />

                  {/* Add these public routes */}
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/privacy" element={<Privacy />} />

                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                {/* --- End Restructured Routes --- */}
              </Content>
            </Layout>
          </AuthProvider>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
