import React, { useState, useEffect  } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout, ConfigProvider, App as AntApp } from "antd";
import { 
  BulbOutlined 
} from "@ant-design/icons";
import { Activity } from "lucide-react";

// Page Imports
import LandingPage from "./pages/LandingPage";
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
import ProfileDetailPage from "./pages/ProfileDetailPage";
import InsightDetailPage from "./pages/InsightDetailPage";
import ProfilePage from "./pages/ProfilePage";
import EngineerDashboard from "./pages/EngineerDashboard";
import HealingPage from "./pages/HealingPage";
import LabPage from "./pages/LabPage";
import MyRequestsPage from "./pages/MyRequestsPage";
import GlobalNavbar from "./components/GlobalNavbar";
import BottomNavigationBar from "./components/BottomNavigationBar";
import TermsAndConditions from "./pages/TermsAndConditions";
import InvoicesPage from "./pages/InvoicesPage";
import InboxPage from "./pages/InboxPage";
import EcosystemPage from "./pages/EcosystemPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";

// Theme & Auth Imports
import { lightTheme } from './components/theme/theme-config';
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import OnboardingRoute from "./components/OnboardingRoute";
import PublicRoute from "./components/PublicRoute";
import AppLayout from "./components/layout/AppLayout";
import { SidebarProvider } from "./context/SidebarContext";
import "./App.css";

const { Content } = Layout;

// Placeholder components for new routes
const PlaceholderPage: React.FC<{ name: string }> = ({ name }) => (
  <div style={{ 
    height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', 
    justifyContent: 'center', padding: '40px', textAlign: 'center', background: 'transparent' 
  }}>
    <div style={{ 
      width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(16,185,129,0.1)', 
      border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', 
      justifyContent: 'center', color: '#10B981', marginBottom: '32px' 
    }}>
      <Activity size={40} />
    </div>
    <p style={{ fontSize: '10px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>
      Module Under Architecture
    </p>
    <h1 style={{ fontSize: '48px', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', margin: '0 0 16px' }}>
      {name}
    </h1>
    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', maxWidth: '400px', lineHeight: 1.6 }}>
      This operational node is currently being integrated into the QSI ecosystem expansion framework.
    </p>
  </div>
);

const App: React.FC = () => {
  // Global design system initialization
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.body.style.background = "var(--bg-primary)";
    document.body.style.color = "var(--text-primary)";
  }, []);

  return (
    <ConfigProvider theme={lightTheme}>
      <AntApp>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <SidebarProvider>
              <AppLayout>
              <Content
                style={{
                  height: "100%",
                  width: "100%",
                  padding: 0,
                  margin: 0,
                  background: "transparent",
                  overflowY: 'auto'
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
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<ProfilePage />} />
                  </Route>

                  {/* === Admin Routes === */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Route>

                  {/* === Fully Public Routes (Visible to all) === */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/chat/:moduleName" element={<ChatWindow />} />
                  <Route path="/healing" element={<HealingPage />} />
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
                  <Route path="/profiles/:id" element={<ProfileDetailPage />} />
                  <Route path="/insights/:id" element={<InsightDetailPage />} />
                  <Route path="/tv" element={<QsiTvPage />} />
                  
                  {/* === New PANX Routes === */}
                   <Route path="/lab" element={<LabPage />} />
                   <Route path="/ecosystem" element={<EcosystemPage />} />
                   <Route path="/inbox" element={<InboxPage />} />
                   <Route path="/status" element={<PlaceholderPage name="System Status" />} />
                   <Route path="/music" element={<PlaceholderPage name="PanX Music" />} />
                   <Route path="/enterprise" element={<PlaceholderPage name="PanX Enterprise" />} />
                   <Route path="/others" element={<PlaceholderPage name="Other Ecosystem Nodes" />} />

                  {/* Add these public routes */}
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/privacy" element={<Privacy />} />

                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Content>
              <LogicAssistant />
            </AppLayout>
          </SidebarProvider>
        </AuthProvider>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
