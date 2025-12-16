import React, { useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
 } from 'react';
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
import Message from "../components/Message";
import ChatInput from "../components/ChatInput";
import HealingPackagesSidebar from "../components/HealingPackagesSidebar";
import PilotProjectsSidebar from "../components/PilotProjectsSidebar";
import { useAuth } from "../context/AuthContext";

const { Title, Paragraph } = Typography;
const { useToken } = theme;
const { TextArea } = Input;

const moduleDetails = {
  infrastructure: {
    title: "Smart Infrastructure",
    endpoint: "/infrastructure",
    background: (token) =>
      `linear-gradient(180deg, ${token.colorBgContainer} 0%, ${token.colorBgContainer} 50%, ${token.colorBgContainer} 100%)`,
    icon: "🛠️",
  },
  healing: {
    title: "Healing & Therapy",
    endpoint: "/healing-chat",
    background: (token) =>
      `linear-gradient(180deg, ${token.colorBgContainer} 0%, ${token.colorBgContainer} 50%, ${token.colorBgContainer} 100%)`,
    icon: "🌿",
  },
  vision: {
    title: "Vision Space",
    endpoint: "/vision",
    background: (token) =>
      `linear-gradient(180deg, ${token.colorBgContainer} 0%, ${token.colorBgContainer} 50%, ${token.colorBgContainer} 100%)`,
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
  const buttonStyle = useMemo(
    () => ({
      background: token.colorFillTertiary,
      border: `1px solid ${token.colorBorder}`,
      borderRadius: token.borderRadius,
      padding: `${token.paddingSM}px ${token.padding}px`,
      color: token.colorText,
      fontSize: token.fontSizeSM,
      textAlign: "left",
      cursor: "pointer",
      transition: `all ${token.motionDurationMid} ${token.motionEaseInOut}`,
      lineHeight: 1.4,
      width: "100%",
      display: "block",
    }),
    [token]
  );

  const buttonHoverEnter = useCallback(
    (e: React.FormEvent) => {
      e.currentTarget.style.background = token.colorFillSecondary;
      e.currentTarget.style.borderColor = token.colorPrimaryHover;
      e.currentTarget.style.transform = "translateX(4px)";
    },
    [token]
  );

  const buttonHoverLeave = useCallback(
    (e: React.FormEvent) => {
      e.currentTarget.style.background = token.colorFillTertiary;
      e.currentTarget.style.borderColor = token.colorBorder;
      e.currentTarget.style.transform = "translateX(0)";
    },
    [token]
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: "24px", flexShrink: 0 }}>
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
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "32px" }}>{details.icon}</span>
          <Title level={4} style={{ margin: 0, color: token.colorText }}>
            {details.title}
          </Title>
        </div>
        <Paragraph
          style={{
            color: token.colorTextSecondary,
            fontSize: "13px",
            margin: 0,
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
        <div style={{ marginBottom: "24px", flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <BulbOutlined
              style={{ color: token.colorPrimary, fontSize: "16px" }}
            />
            <Paragraph
              style={{
                margin: 0,
                color: token.colorTextSecondary,
                fontSize: "13px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Suggestions
            </Paragraph>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {fetchedSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.id || `sugg-${index}`}
                onClick={() => handleSuggestionClick(suggestion.text, false)}
                style={buttonStyle}
                onMouseEnter={buttonHoverEnter}
                onMouseLeave={buttonHoverLeave}
                aria-label={`Select suggestion: ${suggestion.text}`}
              >
                {suggestion.text}
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

  const [contactInfo, setContactInfo] = useState(
    location.state?.contactInfo || {
      name: "Valued User",
      email: "user@chat.com",
      userId: user?.id,
    }
  );
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [leftDrawerVisible, setLeftDrawerVisible] = useState<boolean>(false);
  const [rightDrawerVisible, setRightDrawerVisible] = useState<boolean>(false);
  const [packageInquiry, setPackageInquiry] = useState<string>("");
  const [inquiryModalVisible, setInquiryModalVisible] = useState<boolean>(false);
  const messagesEndRef = useRef(null);
  const [pilotProjects, setPilotProjects] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [fetchedPackages, setFetchedPackages] = useState<any[]>([]);
  const [fetchedSuggestions, setFetchedSuggestions] = useState<any[]>([]);
  const [submitAction, setSubmitAction] = useState<string>("chat");
  const [selectedModule, setSelectedModule] = useState();

  useEffect(() => {
    setSelectedModule(moduleName);
  }, [moduleName]);

  const baseURL =
    import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";

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

      // 3. Append Contextual Metadata (FIXED)
      // This ensures files aren't just labeled "GENERAL" in the DB
      formData.append("category", "INFRASTRUCTURE");

      // Optional: Add a tag to identify source
      const tags = JSON.stringify(["chat-attachment"]);
      formData.append("tags", tags);

      try {
        // console.log to debug file payload
        console.log(`[Upload] Sending ${files.length} file(s)`);

        const response = await axios.post(
          `${baseURL}/submit/upload`, // Ensure this matches your route mount point
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            // timeout: 30000, // Optional: Increase timeout for large files
          }
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
            // Nginx or Express Body Parser limit hit
            errorMessage = "Total file size exceeds the server limit (50MB).";
          } else if (error.response.status === 400) {
            // Backend validation error (e.g., 'No files uploaded')
            errorMessage = error.response.data.error || "Invalid file request.";
          } else if (error.response.status === 500) {
            // Multer or Prisma error
            errorMessage = "Server error during file processing.";
          }
        }

        antMessage.error(errorMessage);
        // Return empty array so the chat message can still try to send text
        return [];
      }
    },
    [baseURL, isAuthenticated, user, antMessage] // setUploadedDocumentIds is stable, no need to add
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

        // Step B: Send the Chat Request
        const payload = {
          messages: newMessages,
          contactInfo: contactInfo,
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
    ]
  );

  const handleSuggestionClick = useCallback(
    (suggestionText, isPilot = false) => {
      if (isPilot) {
        navigate(`/pilots/${suggestionText}`);
      } else if (moduleName === "healing") {
        const pkg = fetchedPackages.find((p) => p.cta === suggestionText);
        if (pkg) {
          setSelectedPackage(pkg);
          setPackageInquiry("");
          setSubmitAction("quote");
          setInquiryModalVisible(true);
        } else {
          handleSendMessage(suggestionText);
        }
      } else {
        handleSendMessage(suggestionText);
      }
    },
    [moduleName, navigate, handleSendMessage, fetchedPackages]
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
            : `${contactInfo.name} <${contactInfo.email}>`,
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

  const handlePackageClick = useCallback((packageItem) => {
    setSelectedPackage(packageItem);
    setPackageInquiry("");
    setSubmitAction("quote");
    setInquiryModalVisible(true);
  }, []);

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

    if (moduleName === "vision") {
      fetchPilots();
    } else {
      setPilotProjects([]); // Clear if switching away from vision
    }
  }, [moduleName, antMessage, baseURL]);
  // --- END: CONSOLIDATED DATA FETCHING ---

  useEffect(() => {
    if (user?.id && user.id !== contactInfo.userId) {
      setContactInfo((prev) => ({
        ...prev,
        userId: user.id,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user, contactInfo.userId]);

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
      text: `Welcome, ${contactInfo.name}. ${
        moduleName === "infrastructure"
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

  const backgroundStyle = useMemo(
    () => ({ background: details.background(token) }),
    [details, token]
  );
  const showRightSidebar = moduleName === "healing" || moduleName === "vision";

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
    [token]
  );

  return (
    <div
      style={{
        width: "100vw",
        height: "100%",
        display: "flex",
        ...backgroundStyle,
        position: "fixed",
        top: 0,
        left: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${token.colorPrimary}25 0%, transparent 70%)`,
            filter: "blur(60px)",
            top: "10%",
            left: "5%",
            animation: "float1 20s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${token.colorInfo}20 0%, transparent 70%)`,
            filter: "blur(50px)",
            top: "60%",
            right: "10%",
            animation: "float2 18s ease-in-out infinite",
          }}
        />
      </div>

      <div
        className="desktop-sidebar"
        style={{
          width: "15%",
          minWidth: "250px",
          maxWidth: "360px",
          borderRight: `1px solid ${token.colorBorder}`,
          display: "flex",
          flexDirection: "column",
          backdropFilter: "blur(10px)",
          background: token.colorBgContainer,
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
          pilotProjects={pilotProjects}
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
          pilotProjects={pilotProjects}
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
            padding: "16px",
            borderBottom: `1px solid ${token.colorBorder}`,
            background: token.colorBgContainer,
            backdropFilter: "blur(10px)",
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
                style={{ color: token.colorText }}
                aria-label="Open menu"
              />
              <span style={{ fontSize: "24px" }}>{details.icon}</span>
              <Title level={5} style={{ margin: 0, color: token.colorText }}>
                {details.title}
              </Title>
            </div>
            {showRightSidebar && (
              <Button
                type="primary"
                onClick={() => setRightDrawerVisible(true)}
                style={{ color: token.colorText, padding: 6 }}
                aria-label={`Open ${
                  moduleName === "healing" ? "packages" : "QSI concepts"
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

          <div
            style={{
              borderTop: `1px solid ${token.colorBorder}`,
              padding: "clamp(16px, 3vw, 20px)",
              background: token.colorBgContainer,
              backdropFilter: "blur(10px)",
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
            minWidth: "250px",
            maxWidth: "360px",
            borderLeft: `1px solid ${token.colorBorder}`,
            backdropFilter: "blur(10px)",
            background: token.colorBgContainer,
            position: "relative",
            zIndex: 1,
            flexShrink: 0,
            height: "100vh",
            overflowY: "auto",
          }}
        >
          {moduleName === "healing" ? (
            <HealingPackagesSidebar
              packages={fetchedPackages}
              onPackageClick={handlePackageClick}
              isMobile={true}
            />
          ) : (
            <PilotProjectsSidebar
              pilots={pilotProjects}
              onPilotClick={handleSuggestionClick}
              isMobile={true}
            />
          )}
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
                        prev ? `${prev}\n${suggestion}` : suggestion
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
