import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  App as AntApp,
  Spin,
  Typography,
  Button,
  Drawer,
  theme,
  Card,
  Modal,
  Input,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  BulbOutlined,
  MenuOutlined,
  ShoppingOutlined,
  SendOutlined,
} from "@ant-design/icons";
import axios from "axios";
import Message from "./Message";
import ChatInput from "./ChatInput";
import HealingPackagesSidebar from "./HealingPackagesSidebar";
import PilotProjectsSidebar from "./PilotProjectsSidebar";
import { useAuth } from "../context/AuthContext";
import FrequencyScanForm from "./FrequencyScanForm";

const { Title, Paragraph } = Typography;
const { useToken } = theme;
const { TextArea } = Input;

const moduleDetails = {
  infrastructure: {
    title: "Smart Infrastructure",
    endpoint: "/infrastructure",
    background: "var(--canvas-white)",
    icon: "🛠️",
  },
  healing: {
    title: "Healing & Therapy",
    endpoint: "/healing-chat",
    background: "var(--canvas-white)",
    icon: "🌿",
  },
  vision: {
    title: "Vision Space",
    endpoint: "/vision",
    background: "var(--canvas-white)",
    icon: "🔭",
  },
};

const SidebarContent = ({
  details,
  moduleName,
  fetchedSuggestions,
  handleSuggestionClick,
  token,
}) => {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Back button + Module header - fixed at top */}
      <div style={{ flexShrink: 0 }}>
        <Link to="/">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            style={{
              color: token.colorTextSecondary,
              marginBottom: "16px",
              padding: "4px 8px",
            }}
          >
            Back
          </Button>
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <span style={{ fontSize: "32px" }}>{details.icon}</span>
          <Title level={4} style={{ margin: 0, color: "var(--onyx-black)", fontFamily: "var(--font-heading)", fontWeight: 900, textTransform: 'uppercase' }}>
            {details.title}
          </Title>
        </div>
        <Paragraph
          style={{
            color: "var(--onyx-black)",
            fontSize: "12px",
            margin: 0,
            marginBottom: "24px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontFamily: "var(--font-accent)",
            borderBottom: `4px solid ${moduleName === 'infrastructure' ? 'var(--savanna-moss)' : 'var(--baobab-emerald)'}`,
            paddingBottom: "8px",
            display: "inline-block"
          }}
        >
          {moduleName === "infrastructure"
            ? "Building coherence..."
            : moduleName === "healing"
              ? "Guiding you..."
              : "Translate imagination..."}
        </Paragraph>
      </div>

      {fetchedSuggestions && fetchedSuggestions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          {/* Suggestions label - fixed */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              flexShrink: 0,
            }}
          >
            <BulbOutlined
              style={{ color: token.colorPrimary, fontSize: "16px" }}
            />
            <Paragraph
              style={{
                margin: 0,
                color: "var(--onyx-black)",
                fontSize: "13px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              {moduleName === 'infrastructure' ? 'Schematics' : 'Suggestions'}
            </Paragraph>
          </div>
          {/* Scrollable suggestions list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              overflowY: "auto",
              flex: 1,
              paddingRight: "4px",
            }}
          >
            {fetchedSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.id || `sugg-${index}`}
                onClick={() => handleSuggestionClick(suggestion.text, false)}
                className="suggestion-card"
                aria-label={`Select suggestion: ${suggestion.text}`}
              >
                <span>{suggestion.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ChatWindow: React.FC = () => {
  const { moduleName } = useParams();
  const location = useLocation();
  const details = moduleDetails[moduleName] || moduleDetails.healing;
  const { message: antMessage } = AntApp.useApp();
  const { token } = useToken();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // File Upload State
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [uploadedDocumentIds, setUploadedDocumentIds] = useState<any[]>([]);

  // Fix: Initialize contactInfo with proper values from user if available
  const [contactInfo, setContactInfo] = useState(() => {
    // Check if we have user data from location state
    if (location.state?.contactInfo) {
      return location.state.contactInfo;
    }

    // If user is authenticated, use their actual info
    if (isAuthenticated && user) {

      return {
        name: user.name || user.email?.split("@")[0] || "Valued User",
        email: user.email || "user@chat.com",
        phone: user.phone || "",
        userId: user.id,
      };
    }

    // Fallback to default
    return {
      name: "Valued User",
      email: "user@chat.com",
      phone: "",
      userId: user?.id || null,
    };
  });

  console.log("contact info", contactInfo)
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [leftDrawerVisible, setLeftDrawerVisible] = useState<boolean>(false);
  const [rightDrawerVisible, setRightDrawerVisible] = useState<boolean>(false);
  const [packageInquiry, setPackageInquiry] = useState<string>("");
  const [inquiryModalVisible, setInquiryModalVisible] =
    useState<boolean>(false);
  const messagesEndRef = useRef(null);
  const [pilotProjects, setPilotProjects] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [fetchedPackages, setFetchedPackages] = useState<any[]>([]);
  const [fetchedSuggestions, setFetchedSuggestions] = useState<any[]>([]);
  const [submitAction, setSubmitAction] = useState<string>("chat");
  const [selectedModule, setSelectedModule] = useState();
  const [showFrequencyScan, setShowFrequencyScan] = useState<boolean>(false);

  useEffect(() => {
    setSelectedModule(moduleName);
  }, [moduleName]);

  const baseURL =
    import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";

  // --- FIX: Update contactInfo whenever user data changes ---
  useEffect(() => {
    if (isAuthenticated && user) {
      setContactInfo((prev) => {
        // Only update if the values are different
        const newContactInfo = {
          name: user.name || user.email?.split("@")[0] || prev.name,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
          userId: user.id,
        };

        // Check if anything actually changed to avoid unnecessary re-renders
        if (
          prev.userId !== newContactInfo.userId ||
          prev.name !== newContactInfo.name ||
          prev.email !== newContactInfo.email ||
          prev.phone !== newContactInfo.phone
        ) {
          return newContactInfo;
        }
        return prev;
      });
    }
  }, [isAuthenticated, user]);

  // --- 1. DEDICATED UPLOAD FUNCTION ---
  const handleFileUpload = useCallback(
    async (files) => {
      if (!files || files.length === 0) {
        return [];
      }

      const formData = new FormData();

      // 1. Append Files
      files.forEach((file) => {
        formData.append("documents", file);
      });

      // 2. Append User ID
      if (isAuthenticated && user?.id) {
        formData.append("userId", user.id);
      }

      // 3. Append Contextual Metadata
      formData.append("category", "INFRASTRUCTURE");

      // Optional: Add a tag to identify source
      const tags = JSON.stringify(["chat-attachment"]);
      formData.append("tags", tags);

      try {
        console.log(`[Upload] Sending ${files.length} file(s)`);

        const response = await axios.post(
          `${baseURL}/submit/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        const uploadedIds = response.data.documents?.map((doc) => doc.id) || [];

        // Update the state for global context
        setUploadedDocumentIds((prev) => [...prev, ...uploadedIds]);

        antMessage.success(`Successfully uploaded ${files.length} file(s)`);

        // Return IDs so handleSendMessage can use them immediately
        return uploadedIds;
      } catch (error) {
        console.error("[Upload] Error:", error);

        let errorMessage = "File upload failed. Please try again.";

        // Handle specific status codes
        if (error.response) {
          if (error.response.status === 413) {
            errorMessage = "Total file size exceeds the server limit (50MB).";
          } else if (error.response.status === 400) {
            errorMessage = error.response.data.error || "Invalid file request.";
          } else if (error.response.status === 500) {
            errorMessage = "Server error during file processing.";
          }
        }

        antMessage.error(errorMessage);
        return [];
      }
    },
    [baseURL, isAuthenticated, user, antMessage],
  );

  // --- 2. MAIN SEND MESSAGE FUNCTION ---
  const handleSendMessage = useCallback(
    async (userInput, files = []) => {
      const filesToProcess = files.length > 0 ? files : selectedFiles;

      if (!userInput && filesToProcess.length === 0) {
        setLoading(false);
        return;
      }

      // Add User Message to Chat UI
      let userMessageText = userInput;
      if (filesToProcess.length > 0) {
        const fileNames = filesToProcess.map((f) => f.name).join(", ");
        userMessageText = userInput
          ? `${userInput} (Files: ${fileNames})`
          : `(Files: ${fileNames})`;
      }

      const userMessage = { sender: "user", text: userMessageText };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setLoading(true);
      setLeftDrawerVisible(false);
      setRightDrawerVisible(false);

      try {
        const endpoint = `${baseURL}/submit${details.endpoint}`;

        // Step A: Handle File Upload first (if files exist)
        let currentDocumentIds = uploadedDocumentIds;

        if (filesToProcess.length > 0) {
          const newDocIds = await handleFileUpload(filesToProcess);
          if (newDocIds.length === 0 && filesToProcess.length > 0) {
            throw new Error("File upload failed.");
          }
          currentDocumentIds = [...currentDocumentIds, ...newDocIds];
        }

        // Step B: Send the Chat Request with updated contactInfo
        const payload = {
          messages: newMessages,
          contactInfo: contactInfo, // This now has the correct user data
          userId: isAuthenticated && user ? user.id : null,
          documentIds:
            currentDocumentIds.length > 0 ? currentDocumentIds : null,
        };

        const response = await axios.post(endpoint, payload);

        let aiResponse = response.data;
        if (!aiResponse || aiResponse.sender !== "ai") {
          aiResponse = {
            sender: "ai",
            text: "Received an unexpected response.",
          };
        }

        setMessages((prevMessages) => [...prevMessages, aiResponse]);
        setSelectedPackage(null);

        // Reset file state
        if (filesToProcess.length > 0) {
          setSelectedFiles([]);
        }
      } catch (error) {
        console.error("API call error:", error);
        let errorText = "Sorry, I encountered an error. Please try again.";
        if (error.response?.data?.error) {
          errorText = `Error: ${error.response.data.error}`;
        }
        antMessage.error("Error communicating with the server.");
        setMessages((prev) => [...prev, { sender: "ai", text: errorText }]);
      } finally {
        setLoading(false);
      }
    },
    [
      messages,
      contactInfo,
      baseURL,
      details.endpoint,
      antMessage,
      user,
      selectedFiles,
      uploadedDocumentIds,
      isAuthenticated,
      handleFileUpload,
    ],
  );

  // --- FIX: Handle suggestion clicks to send directly to chat ---
  const handleSuggestionClick = useCallback(
    (suggestionText, isPilot = false) => {
      if (isPilot) {
        navigate(`/pilots/${suggestionText}`);
      } else {
        // For all suggestions (including healing), send directly to chat
        handleSendMessage(suggestionText);
      }
    },
    [navigate, handleSendMessage],
  );

  const handleSubmitToChat = useCallback(async () => {
    if (!packageInquiry.trim()) {
      message.warning("Please provide details.");
      return;
    }
    if (!selectedPackage) {
      message.error("No package selected.");
      return;
    }
    setLoading(true);
    setSubmitAction("chat");
    try {
      const messageText = `I'm interested in the ${selectedPackage.title} package. ${packageInquiry}`;
      await handleSendMessage(messageText);
      setInquiryModalVisible(false);
      setPackageInquiry("");
      setSelectedPackage(null);
    } catch (error) {
      message.error("Failed to send to chat.", error);
    } finally {
      setLoading(false);
      setSubmitAction(null);
    }
  }, [packageInquiry, selectedPackage, handleSendMessage]);

  const handleSubmitForQuote = useCallback(async () => {
    if (!packageInquiry.trim()) {
      message.warning("Please provide details.");
      return;
    }
    if (!selectedPackage) {
      message.error("No package selected.");
      return;
    }
    setLoading(true);
    setSubmitAction("quote");
    try {
      const endpoint = `${baseURL}/submit/healing`;
      const payload = {
        struggleDescription: packageInquiry,
        packageName: selectedPackage.title,
        contactInfo:
          contactInfo.email === "user@chat.com"
            ? "user@chat.com"
            : `${contactInfo.name} <${contactInfo.email}>${contactInfo.phone ? ` - ${contactInfo.phone}` : ''}`,
        userId: isAuthenticated && user ? user.id : null,
      };
      await axios.post(endpoint, payload);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Thank you for your interest in the ${selectedPackage.title} package! We've received your inquiry.`,
        },
      ]);
      message.success("Inquiry submitted!");
      setInquiryModalVisible(false);
      setPackageInquiry("");
      setSelectedPackage(null);
    } catch (error) {
      message.error("Error submitting inquiry.", error);
    } finally {
      setLoading(false);
      setSubmitAction(null);
    }
  }, [
    packageInquiry,
    selectedPackage,
    contactInfo,
    isAuthenticated,
    user,
    baseURL,
  ]);

  const handlePackageClick = useCallback(
    (packageItem) => {
      // Check if user has a frequency scan (Healing module only)
      if (moduleName === "healing") {
        if (!user?.frequencyScans || user.frequencyScans.length === 0) {
          // No scan found, prompt to scan
          setSelectedPackage(packageItem);
          setShowFrequencyScan(true);
          message.info(
            "Please complete a Frequency Scan to ensure alignment with this package.",
          );
          return;
        }
      }

      setSelectedPackage(packageItem);
      setPackageInquiry("");
      setSubmitAction("quote");
      setInquiryModalVisible(true);
    },
    [moduleName, user],
  );

  // --- START: CONSOLIDATED DATA FETCHING ---
  useEffect(() => {
    // 1. Helper to fetch suggestions based on module
    const fetchSuggestions = async (module) => {
      let endpoint;
      if (module === "healing") {
        endpoint = "/healing-suggestions";
      } else if (module === "infrastructure") {
        endpoint = "/infrastructure-suggestions";
      } else if (module === "vision") {
        endpoint = "/vision-suggestions";
      } else {
        setFetchedSuggestions([]);
        return;
      }

      try {
        const response = await axios.get(`${baseURL}/submit${endpoint}`);
        setFetchedSuggestions(response.data);
      } catch (error) {
        console.error(`Failed to fetch ${module} suggestions:`, error);
        antMessage.error(`Could not load ${module} suggestions.`);
        setFetchedSuggestions([]);
      }
    };

    // 2. Helper to fetch healing packages
    const fetchHealingData = async () => {
      try {
        const pkgRes = await axios.get(`${baseURL}/submit/healing-packages`);
        setFetchedPackages(pkgRes.data);
      } catch (error) {
        console.error("Failed to fetch healing packages:", error);
        antMessage.error("Could not load healing packages.");
        setFetchedPackages([]);
      }
    };

    // 3. Helper to fetch pilot projects
    const fetchPilots = async () => {
      try {
        const response = await axios.get(`${baseURL}/submit/pilots`);
        setPilotProjects(response.data);
      } catch (error) {
        console.error("Failed to fetch pilot projects:", error);
        antMessage.error("Could not load pilot projects.");
        setPilotProjects([]);
      }
    };

    // Execute fetches based on module
    fetchSuggestions(moduleName);

    if (moduleName === "healing") {
      fetchHealingData();
    } else {
      setFetchedPackages([]); // Clear if switching away from healing
    }

    // Vision no longer needs pilot projects sidebar
    setPilotProjects([]);
  }, [moduleName, antMessage, baseURL]);
  // --- END: CONSOLIDATED DATA FETCHING ---

  useEffect(() => {
    const preventZoom = (e: React.FormEvent) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };
    document.addEventListener("touchstart", preventZoom, { passive: false });
    return () => document.removeEventListener("touchstart", preventZoom);
  }, []);

  useEffect(() => {
    const initialMessage = {
      sender: "ai",
      text: `Welcome, ${contactInfo.name}. ${moduleName === "infrastructure"
        ? "What infrastructure project are you considering today?"
        : moduleName === "healing"
          ? "What are you currently experiencing?"
          : "I'm excited to help you create impact. What's your vision today?"
        }`,
    };
    setMessages([initialMessage]);
  }, [contactInfo.name, moduleName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const backgroundStyle = { backgroundColor: 'var(--canvas-white)' };
  const showRightSidebar = moduleName === "healing";

  const MobileDrawer = useCallback(
    ({ placement, visible, onClose, children, title, width = 280 }) => (
      <Drawer
        placement={placement}
        onClose={onClose}
        open={visible}
        width={width}
        styles={{
          body: {
            padding: placement === "left" ? "24px" : "0",
            background: token.colorBgContainer,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
          header: {
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorder}`,
          },
          mask: { background: token.colorBgMask },
        }}
        title={title}
        closeIcon={
          <ArrowLeftOutlined style={{ color: token.colorTextSecondary }} />
        }
      >
        {children}
      </Drawer>
    ),
    [token],
  );

  return (
    <div
      style={{
        width: "100vw",
        height: "calc(100vh - 80px)",
        display: "flex",
        ...backgroundStyle,
        position: "fixed",
        top: "80px",
        left: 0,
        overflow: "hidden",
      }}
    >
      {/* Pattern Overlay - Dynamic based on module */}
      <div 
        className={moduleName === 'infrastructure' ? "pattern-mudcloth" : "pattern-dots"} 
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.2, pointerEvents: 'none', zIndex: 0 }} 
      />

      {/* Infrastructure Blueprint Grid */}
      {moduleName === 'infrastructure' && (
        <>
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `
              linear-gradient(rgba(11, 97, 56, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(11, 97, 56, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            zIndex: 0,
            pointerEvents: 'none'
          }} />
          {/* Technical Markings */}
          <div style={{ position: 'absolute', top: '20px', right: '40px', fontSize: '10px', fontFamily: 'var(--font-accent)', opacity: 0.3, zIndex: 0 }}>
            COORD: 17.8248° S, 31.0530° E <br />
            STRUCTURAL COHERENCE: OPTIMAL <br />
            FRN: QSI-INFRA-802
          </div>
          <div style={{ position: 'absolute', bottom: '100px', left: '40px', fontSize: '10px', fontFamily: 'var(--font-accent)', opacity: 0.3, zIndex: 0, transform: 'rotate(-90deg)', transformOrigin: 'left' }}>
            PROJECT SCALE: PAN-AFRICAN ARCHITECTURE
          </div>
        </>
      )}

      <div
        className="desktop-sidebar"
        style={{
          width: "15%",
          minWidth: "300px",
          maxWidth: "400px",
          borderRight: "3px solid var(--onyx-black)",
          display: "flex",
          flexDirection: "column",
          background: "var(--papyrus-off-white)",
          padding: "24px",
          overflowY: "auto",
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        <SidebarContent
          details={details}
          moduleName={moduleName}
          fetchedSuggestions={fetchedSuggestions}
          handleSuggestionClick={handleSuggestionClick}
          token={token}
        />
      </div>

      <MobileDrawer
        placement="left"
        visible={leftDrawerVisible}
        onClose={() => setLeftDrawerVisible(false)}
        title={null}
      >
        <SidebarContent
          details={details}
          moduleName={moduleName}
          fetchedSuggestions={fetchedSuggestions}
          handleSuggestionClick={handleSuggestionClick}
          token={token}
        />
      </MobileDrawer>

      {showRightSidebar && (
        <MobileDrawer
          placement="right"
          visible={rightDrawerVisible}
          onClose={() => setRightDrawerVisible(false)}
          width={320}
          title={
            <span style={{ color: token.colorText }}>
              {moduleName === "healing" ? "Healing Packages" : "Pilot Projects"}
            </span>
          }
        >
          {moduleName === "healing" ? (
            <HealingPackagesSidebar
              packages={fetchedPackages}
              onPackageClick={handlePackageClick}
              isMobile={false}
            />
          ) : (
            <PilotProjectsSidebar
              pilots={pilotProjects}
              onPilotClick={handleSuggestionClick}
              isMobile={false}
            />
          )}
        </MobileDrawer>
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          ...backgroundStyle,
          minWidth: 0,
          zIndex: 1,
          height: "100%",
          overflow: "hidden",
        }}
      >
        <div
          className="mobile-header"
          style={{
            display: "none",
            padding: "20px",
            borderBottom: "3px solid var(--onyx-black)",
            background: "var(--canvas-white)",
            position: "sticky",
            top: 0,
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setLeftDrawerVisible(true)}
                style={{ color: "var(--onyx-black)" }}
                aria-label="Open menu"
              />
              <span style={{ fontSize: "24px" }}>{details.icon}</span>
              <Title level={5} style={{ margin: 0, color: "var(--onyx-black)", fontFamily: "var(--font-heading)", fontWeight: 900, textTransform: 'uppercase' }}>
                {details.title}
              </Title>
            </div>
            {showRightSidebar && (
              <Button
                type="primary"
                onClick={() => setRightDrawerVisible(true)}
                style={{ color: token.colorText, padding: 6 }}
                aria-label={`Open ${moduleName === "healing" ? "packages" : "QSI concepts"
                  }`}
              >
                {moduleName === "healing" ? "Packages" : "QSI Concepts"}
              </Button>
            )}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            height: "100%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "clamp(16px, 4vw, 24px)",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <div
              style={{
                maxWidth: "800px",
                margin: "0 auto",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                flex: 1,
              }}
            >
              {messages.map((msg, index) => (
                <Message
                  key={index}
                  sender={msg.sender}
                  text={msg.text}
                  isMobile={window.innerWidth < 768}
                />
              ))}
              {loading && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "24px",
                  }}
                >
                  <Spin size="large" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Colourful Brand Accent Line */}
          <div 
            style={{ 
              height: '8px', 
              width: '100%', 
              background: 'repeating-linear-gradient(to right, #0B6138 0, #0B6138 24px, #D15B35 24px, #D15B35 48px, #E2B142 48px, #E2B142 72px, #4D7A51 72px, #4D7A51 96px, #111111 96px, #111111 120px)',
              borderTop: '3px solid var(--onyx-black)',
              borderBottom: '3px solid var(--onyx-black)',
            }} 
          />

          <div
            style={{
              padding: "32px",
              background: "var(--papyrus-off-white)",
              flexShrink: 0,
            }}
          >
            <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
              <ChatInput
                onSendMessage={handleSendMessage}
                loading={loading}
                isMobile={window.innerWidth < 768}
                moduleName={selectedModule}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
              />
            </div>
          </div>
        </div>
      </div>

      {showRightSidebar && (
        <div
          className="desktop-sidebar-right"
          style={{
            width: "18%",
            minWidth: "300px",
            maxWidth: "400px",
            borderLeft: "3px solid var(--onyx-black)",
            background: "var(--papyrus-off-white)",
            position: "relative",
            zIndex: 1,
            flexShrink: 0,
            height: "100%",
            overflowY: "auto",
          }}
        >
          <div style={{ padding: "40px 24px" }}>
            {moduleName === "healing" ? (
              <HealingPackagesSidebar
                packages={fetchedPackages}
                onPackageClick={handlePackageClick}
                isMobile={false}
              />
            ) : (
              <PilotProjectsSidebar
                pilots={pilotProjects}
                onPilotClick={handleSuggestionClick}
                isMobile={false}
              />
            )}
          </div>
        </div>
      )}

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShoppingOutlined style={{ color: token.colorPrimary }} />
            <span>Package Inquiry: {selectedPackage?.title}</span>
          </div>
        }
        open={inquiryModalVisible}
        onCancel={() => {
          setInquiryModalVisible(false);
          setPackageInquiry("");
          setSelectedPackage(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setInquiryModalVisible(false);
              setPackageInquiry("");
              setSelectedPackage(null);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="chat"
            type="default"
            onClick={handleSubmitToChat}
            loading={loading && submitAction === "chat"}
            icon={<BulbOutlined />}
          >
            Send to AI Chat
          </Button>,
          <Button
            key="quote"
            type="primary"
            onClick={handleSubmitForQuote}
            loading={loading && submitAction === "quote"}
            icon={<SendOutlined />}
          >
            Submit for Quote
          </Button>,
        ]}
        width={window.innerWidth < 768 ? "90%" : "50%"}
      >
        {selectedPackage && (
          <>
            <Card
              size="small"
              style={{
                background: token.colorFillAlter,
                border: `1px solid ${token.colorPrimaryBorder}`,
                marginBottom: "16px",
              }}
            >
              <Paragraph
                style={{ margin: 0, fontSize: "14px", color: token.colorText }}
              >
                {selectedPackage.shortPreview}
              </Paragraph>
            </Card>

            <div style={{ marginBottom: "16px" }}>
              <Paragraph
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: token.colorTextSecondary,
                  lineHeight: 1.5,
                }}
              >
                Choose how you'd like to proceed:
              </Paragraph>
              <ul
                style={{
                  margin: "8px 0 0 0",
                  paddingLeft: "20px",
                  fontSize: "13px",
                  color: token.colorTextSecondary,
                }}
              >
                <li>
                  <strong>Send to AI Chat:</strong> Continue conversation with
                  AI assistant
                </li>
                <li>
                  <strong>Submit for Quote:</strong> Get direct pricing and
                  contact from our team
                </li>
              </ul>
            </div>

            <div>
              <Paragraph
                strong
                style={{ marginBottom: "8px", color: token.colorText }}
              >
                Tell us more about what you need:
              </Paragraph>
              <TextArea
                value={packageInquiry}
                onChange={(e) => setPackageInquiry(e.target.value)}
                placeholder="Describe your specific needs, concerns, or questions about this package..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadius,
                  fontSize: "14px",
                  lineHeight: 1.5,
                  resize: "vertical",
                  background: token.colorBgContainer,
                  color: token.colorText,
                }}
              />
            </div>

            <div style={{ marginTop: "16px" }}>
              <Paragraph
                type="secondary"
                style={{ fontSize: "12px", marginBottom: "8px" }}
              >
                Quick actions:
              </Paragraph>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  "I'd like to know more about the pricing",
                  "What's included in this package?",
                  "Do you offer payment plans?",
                  "Can I customize this package?",
                  "What are the available time slots?",
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    size="small"
                    type="text"
                    onClick={() =>
                      setPackageInquiry((prev) =>
                        prev ? `${prev}\n${suggestion}` : suggestion,
                      )
                    }
                    style={{
                      fontSize: "12px",
                      border: `1px solid ${token.colorBorder}`,
                      background: token.colorFillTertiary,
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </Modal>

      <style>
        {`
          * { -webkit-tap-highlight-color: transparent; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
          input, textarea { -webkit-user-select: text; -khtml-user-select: text; -moz-user-select: text; -ms-user-select: text; user-select: text; }
          @media (max-width: 1024px) { .desktop-sidebar-right { display: none !important; } }
          @media (max-width: 768px) { .desktop-sidebar { display: none !important; } .mobile-header { display: flex !important; } }
          @media (min-width: 769px) { .mobile-header { display: none !important; } }
          @keyframes float1 { 0%, 100% { transform: translate(0, 0); } 33% { transform: translate(30px, -40px); } 66% { transform: translate(-25px, 35px); } }
          @keyframes float2 { 0%, 100% { transform: translate(0, 0); } 33% { transform: translate(-35px, 30px); } 66% { transform: translate(40px, -25px); } }
          @keyframes float3 { 0%, 100% { transform: translate(0, 0); } 33% { transform: translate(40px, 30px); } 66% { transform: translate(-30px, -35px); } }
          @keyframes float4 { 0%, 100% { transform: translate(0, 0); } 33% { transform: translate(-40px, -30px); } 66% { transform: translate(35px, 40px); } }
        `}
      </style>
    </div>
  );
};

export default ChatWindow;
