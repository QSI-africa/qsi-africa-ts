import React, { useState, useEffect  } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout, ConfigProvider, App as AntApp } from "antd";
import { 
  BulbOutlined 
} from "@ant-design/icons";

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
import ProfileDetailPage from "./pages/ProfileDetailPage";
import EngineerDashboard from "./pages/EngineerDashboard";
import HealingPage from "./pages/HealingPage";
import LabPage from "./pages/LabPage";
import MyRequestsPage from "./pages/MyRequestsPage";
import GlobalNavbar from "./components/GlobalNavbar";
import BottomNavigationBar from "./components/BottomNavigationBar";
import TermsAndConditions from "./pages/TermsAndConditions";
import InvoicesPage from "./pages/InvoicesPage";
import InboxPage from "./pages/InboxPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";

// Theme & Auth Imports
import { lightTheme } from './components/theme/theme-config';
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import OnboardingRoute from "./components/OnboardingRoute";
import PublicRoute from "./components/PublicRoute";
import "./App.css";

const { Content } = Layout;

// Placeholder components for new routes
const PlaceholderPage: React.FC<{ name: string }> = ({ name }) => (
  <div style={{ padding: '100px 20px', textAlign: 'center', backgroundColor: 'var(--canvas-white)', minHeight: '80vh' }}>
    <h1 style={{ fontSize: '3rem', textTransform: 'uppercase' }}>{name} <span style={{ color: 'var(--baobab-emerald)' }}>Section</span></h1>
    <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '24px auto' }}>
      This section is currently being developed as part of the PANX evolution.
    </p>
  </div>
);

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
                  paddingBottom: isMobile ? '70px' : 0
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

                  {/* === Admin Routes === */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
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
                  <Route path="/profiles/:id" element={<ProfileDetailPage />} />
                  <Route path="/tv" element={<QsiTvPage />} />
                  
                  {/* === New PANX Routes === */}
                  <Route path="/office" element={<PlaceholderPage name="Office" />} />
                  <Route path="/lab" element={<LabPage />} />
                  <Route path="/inbox" element={<InboxPage />} />
                  <Route path="/music" element={<PlaceholderPage name="Music" />} />

                  {/* Add these public routes */}
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/privacy" element={<Privacy />} />

                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Content>

              {isMobile && <BottomNavigationBar />}
            </Layout>
          </AuthProvider>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
