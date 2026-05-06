import React, { useState, useEffect  } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout, ConfigProvider, Switch, App as AntApp } from "antd"; // Import AntApp
import { BulbOutlined, BulbFilled } from "@ant-design/icons";

// Page Imports
import LandingPage from "./pages/LandingPage";
import ServicesPage from "./pages/Services";
import ChatWindow from "./components/ChatWindow";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OnboardingPage from "./pages/OnboardingPage";
import Privacy from "./pages/Privacy";
import ConceptDetailPage from "./pages/ConceptDetailPage";
import SmartCityDemoDetail from "./pages/SmartCityDemoDetail";
import QsiConceptsPage from "./pages/QsiConceptsPage";
import SmartCityDemosPage from "./pages/SmartCityDemosPage";
import QsiTvPage from "./pages/QsiTvPage";
import LogicAssistant from "./components/LogicAssistant";
import MobilityPage from "./pages/MobilityPage";
import SovereignMindsPage from "./pages/SovereignMindsPage";
import EngineerDashboard from "./pages/EngineerDashboard";
import HealingPage from "./pages/HealingPage";
import MyRequestsPage from "./pages/MyRequestsPage";
import GlobalNavbar from "./components/GlobalNavbar";

// Theme & Auth Imports
import { lightTheme, darkTheme } from './components/theme/theme-config';
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import OnboardingRoute from "./components/OnboardingRoute";
import PublicRoute from "./components/PublicRoute";
import "./App.css";
import TermsAndConditions from "./pages/TermsAndConditions";
import InvoicesPage from "./pages/InvoicesPage";

const { Content } = Layout;

const App: React.FC = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isMobile = windowWidth <= 768;

  // Enforce Afro-Bauhaus White Canvas globally
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.body.style.background = "var(--canvas-white)";
  }, []);

  return (
    <ConfigProvider theme={lightTheme}>
      <AntApp>
        <BrowserRouter>
          <AuthProvider>
            <Layout
              style={{
                background: "var(--canvas-white)",
                minHeight: "100vh"
              }}
            >

              <GlobalNavbar />
              <LogicAssistant />

              <Content
                style={{
                  minHeight: "calc(100vh - 70px)",
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
                    <Route path="/invoices" element={<InvoicesPage />} />
                    <Route path="/engineer/dashboard" element={<EngineerDashboard />} />
                    <Route path="/dashboard" element={<MyRequestsPage />} />
                  </Route>

                  {/* === Fully Public Routes (Visible to all) === */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/chat/:moduleName" element={<ChatWindow />} />
                  <Route path="/healing" element={<HealingPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/contact-us" element={<ContactUs />} />
                  <Route path="/concepts" element={<QsiConceptsPage />} />
                  <Route
                    path="/concepts/:id"
                    element={<ConceptDetailPage />}
                  />
                  <Route path="/demos" element={<SmartCityDemosPage />} />
                  <Route
                    path="/demos/:id"
                    element={<SmartCityDemoDetail />}
                  />
                  <Route path="/mobility" element={<MobilityPage />} />
                  <Route path="/network" element={<SovereignMindsPage />} />
                  <Route path="/tv" element={<QsiTvPage />} />
                  
                  {/* Frequency Route REMOVED - Internal to Healing */}

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
