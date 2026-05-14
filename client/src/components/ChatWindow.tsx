import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  App as AntApp,
  Spin,
  Input,
  Button,
  Modal,
  Form
} from "antd";
import {
  Send,
  Plus,
  ArrowLeft,
  Info,
  MoreVertical,
  Paperclip,
  Mic,
  Lightbulb,
  Package,
  Zap,
  Globe,
  MoreHorizontal,
  Bot,
  Brain,
  Sparkles,
  ChevronLeft,
  LayoutGrid
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";

const GREEN = '#10B981';

const moduleDetails = {
  infrastructure: {
    title: "Infrastructure AI",
    status: "online",
    icon: <LayoutGrid size={24} />,
    endpoint: "/infrastructure",
    slogan: "Building coherence..."
  },
  healing: {
    title: "Healing Assistant",
    status: "ready",
    icon: <Sparkles size={24} />,
    endpoint: "/healing-chat",
    slogan: "Guiding you..."
  },
  vision: {
    title: "Vision Translator",
    status: "active",
    icon: <Brain size={24} />,
    endpoint: "/vision",
    slogan: "Translate imagination..."
  },
};

const ChatWindow: React.FC = () => {
  const { moduleName } = useParams();
  const details = moduleDetails[moduleName as keyof typeof moduleDetails] || moduleDetails.healing;
  const { message: antMessage } = AntApp.useApp();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { setSidebarContent } = useSidebar();

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userInput, setUserInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [uploadedDocumentIds, setUploadedDocumentIds] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Backend state
  const [fetchedSuggestions, setFetchedSuggestions] = useState<any[]>([]);
  const [fetchedPackages, setFetchedPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);

  const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";

  const [contactInfo] = useState(() => ({
    name: user?.name || "Valued User",
    email: user?.email || "user@chat.com",
    phone: user?.phone || "",
    userId: user?.id || null,
  }));

  // --- 1. DEDICATED UPLOAD FUNCTION ---
  const handleFileUpload = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) return [];
    const formData = new FormData();
    files.forEach(file => formData.append("documents", file));
    if (isAuthenticated && user?.id) formData.append("userId", user.id);
    formData.append("category", "INFRASTRUCTURE");
    formData.append("tags", JSON.stringify(["chat-attachment"]));

    try {
      const response = await axios.post(`${baseURL}/submit/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedIds = response.data.documents?.map((doc: any) => doc.id) || [];
      setUploadedDocumentIds(prev => [...prev, ...uploadedIds]);
      antMessage.success(`Successfully uploaded ${files.length} file(s)`);
      return uploadedIds;
    } catch (error) {
      console.error("[Upload] Error:", error);
      antMessage.error("File upload failed.");
      return [];
    }
  }, [baseURL, isAuthenticated, user, antMessage]);

  // --- 2. MAIN SEND MESSAGE FUNCTION ---
  const handleSendMessage = useCallback(async (textOverride?: string, filesOverride?: File[]) => {
    const text = textOverride !== undefined ? textOverride : userInput;
    const files = filesOverride !== undefined ? filesOverride : selectedFiles;

    if (!text.trim() && files.length === 0) return;

    let userMessageText = text;
    if (files.length > 0) {
      const fileNames = files.map(f => f.name).join(", ");
      userMessageText = text ? `${text} (Files: ${fileNames})` : `(Files: ${fileNames})`;
    }

    const userMessage = { 
      sender: "user", 
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);
    setUserInput("");
    setSelectedFiles([]);
    
    try {
      let currentDocumentIds = uploadedDocumentIds;
      if (files.length > 0) {
        const newDocIds = await handleFileUpload(files);
        currentDocumentIds = [...currentDocumentIds, ...newDocIds];
      }

      const endpoint = `${baseURL}/submit${details.endpoint}`;
      const payload = {
        messages: newMessages,
        contactInfo,
        userId: user?.id || null,
        documentIds: currentDocumentIds.length > 0 ? currentDocumentIds : null,
      };

      const response = await axios.post(endpoint, payload);
      
      const aiResponse = {
        sender: "ai",
        text: response.data.text || "Operational data received.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      antMessage.error("Synchronization failure.");
      setMessages(prev => [...prev, { 
        sender: "ai", 
        text: "Error: Coherence interrupted. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  }, [messages, userInput, selectedFiles, uploadedDocumentIds, handleFileUpload, baseURL, details.endpoint, contactInfo, user, antMessage]);

  // --- 3. FETCH DATA ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await axios.get(`${baseURL}/submit/${moduleName}-suggestions`);
        setFetchedSuggestions(res.data);
      } catch (e) { console.error(e); }
    };
    
    if (moduleName === 'healing') {
      axios.get(`${baseURL}/submit/healing-packages`).then(res => setFetchedPackages(res.data)).catch(console.error);
    }
    
    fetchSuggestions();
  }, [moduleName, baseURL]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const initialMessage = {
      sender: "ai",
      text: `Welcome, ${user?.name || 'Sovereign'}. ${moduleName === "infrastructure" ? "What infrastructure project are you considering today?" : moduleName === "healing" ? "What are you currently experiencing?" : "I'm excited to help you create impact. What's your vision today?"}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([initialMessage]);
  }, [user, moduleName]);

  // --- 4. SIDEBAR CONTENT ---
  useEffect(() => {
    setSidebarContent(
      <div style={{ height: '100%', background: 'rgba(10,16,24,0.95)', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
           <button 
             onClick={() => navigate(-1)} 
             style={{
               display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none',
               color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
               letterSpacing: '0.1em', cursor: 'pointer', marginBottom: '24px'
             }}
           >
              <ChevronLeft size={14} /> Back to Hub
           </button>
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <div style={{ 
                width: '44px', height: '44px', borderRadius: '14px', background: `${GREEN}15`, 
                border: `1px solid ${GREEN}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN
              }}>
                {details.icon}
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'white', margin: 0, textTransform: 'uppercase' }}>{details.title}</h2>
                <p style={{ fontSize: '10px', color: GREEN, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{details.slogan}</p>
              </div>
           </div>
        </header>

        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {fetchedSuggestions.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px' }}>
                Quick Modules
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {fetchedSuggestions.map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSendMessage(s.text)}
                    style={{
                      padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)',
                      fontSize: '13px', fontWeight: 600, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = `${GREEN}40`}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {moduleName === 'healing' && fetchedPackages.length > 0 && (
            <div>
              <h4 style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px' }}>
                Trajectories
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {fetchedPackages.map((p, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setSelectedPackage(p);
                      setIsModalVisible(true);
                    }}
                    style={{
                      padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.2s', width: '100%', display: 'block'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = `${GREEN}40`;
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    }}
                  >
                    <h5 style={{ fontSize: '14px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>{p.title}</h5>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>{p.description}</p>
                  </button>
                ))}
                <button 
                  onClick={() => navigate('/healing')}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '12px', background: 'transparent',
                    border: `1px solid ${GREEN}40`, color: GREEN, fontSize: '11px', fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', marginTop: '12px'
                  }}
                >
                  View Full Healing Hub
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
    return () => setSidebarContent(null);
  }, [fetchedSuggestions, fetchedPackages, details, moduleName, setSidebarContent, handleSendMessage, navigate]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      {/* Header */}
      <header style={{ 
        padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', 
        background: 'rgba(10,16,24,0.85)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '12px', 
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN
          }}>
            {details.icon}
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'white', margin: 0 }}>{details.title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: GREEN, animation: 'pulse-sync 1.5s infinite' }} />
              <span style={{ fontSize: '10px', fontWeight: 800, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Synchronized
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', color: 'rgba(255,255,255,0.3)' }}>
          <Info size={20} style={{ cursor: 'pointer' }} />
          <MoreVertical size={20} style={{ cursor: 'pointer' }} />
        </div>
      </header>

      {/* Messages Area */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            style={{ 
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{ 
              padding: '16px 20px', borderRadius: '24px', 
              background: msg.sender === 'user' ? GREEN : 'rgba(255,255,255,0.05)',
              color: msg.sender === 'user' ? 'white' : 'rgba(255,255,255,0.9)',
              border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              fontSize: '15px', lineHeight: 1.6,
              boxShadow: msg.sender === 'user' ? `0 8px 24px -8px ${GREEN}60` : 'none',
              borderBottomRightRadius: msg.sender === 'user' ? '4px' : '24px',
              borderBottomLeftRadius: msg.sender === 'user' ? '24px' : '4px',
            }}>
              {msg.text}
            </div>
            <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.2)', marginTop: '8px', textTransform: 'uppercase' }}>
              {msg.timestamp}
            </span>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ 
               width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', 
               display: 'flex', alignItems: 'center', justifyContent: 'center' 
             }}>
               <Spin size="small" />
             </div>
             <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontStyle: 'italic' }}>Synchronizing operational coherence...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <footer style={{ 
        padding: '24px 32px 40px', 
        background: 'transparent',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ 
          maxWidth: '900px', 
          margin: '0 auto', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '12px',
          background: 'rgba(20, 32, 26, 0.8)', 
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
          borderRadius: '24px', 
          padding: '8px'
        }}>
          {selectedFiles.length > 0 && (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px', 
              padding: '8px 12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              {selectedFiles.map((f, i) => (
                <div key={i} style={{ 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  border: `1px solid ${GREEN}30`,
                  padding: '6px 12px', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '11px', color: GREEN, fontWeight: 800 }}>{f.name}</span>
                  <button 
                    onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}
                    style={{ background: 'none', border: 'none', color: 'rgba(16, 185, 129, 0.5)', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <input 
              type="file" 
              id="file-upload" 
              style={{ display: 'none' }} 
              multiple 
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setSelectedFiles(prev => [...prev, ...files]);
              }}
            />
            <label htmlFor="file-upload" style={{ 
              width: '44px',
              height: '44px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: 'rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = GREEN}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)'}
            >
              <Paperclip size={20} />
            </label>
            
            <div style={{ flex: 1, position: 'relative' }}>
              <Input.TextArea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Message ${details.title}...`}
                autoSize={{ minRows: 1, maxRows: 6 }}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  outline: 'none', 
                  color: 'white',
                  padding: '12px 4px', 
                  fontSize: '15px', 
                  fontWeight: 500,
                  resize: 'none', 
                  boxShadow: 'none'
                }}
              />
            </div>
            
            <button 
              onClick={() => handleSendMessage()}
              disabled={!userInput.trim() && selectedFiles.length === 0}
              style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '16px', 
                border: 'none',
                background: userInput.trim() || selectedFiles.length > 0 ? GREEN : 'rgba(255, 255, 255, 0.03)',
                color: userInput.trim() || selectedFiles.length > 0 ? 'white' : 'rgba(255, 255, 255, 0.1)',
                cursor: userInput.trim() || selectedFiles.length > 0 ? 'pointer' : 'default',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: userInput.trim() || selectedFiles.length > 0 ? `0 10px 20px -5px ${GREEN}60` : 'none',
                transform: userInput.trim() || selectedFiles.length > 0 ? 'scale(1)' : 'scale(0.95)'
              }}
            >
              <Send size={18} fill={userInput.trim() ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </footer>

      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={520}
        centered
        styles={{ 
          content: { 
            background: 'rgba(16, 26, 21, 0.9)', 
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '28px', 
            padding: 0,
            overflow: 'hidden'
          } 
        }}
      >
        <div style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '18px', background: `${GREEN}15`, 
              border: `1px solid ${GREEN}30`, display: 'flex', alignItems: 'center', 
              justifyContent: 'center', color: GREEN, margin: '0 auto 20px',
              boxShadow: `0 10px 20px -5px ${GREEN}40`
            }}>
              <Sparkles size={28} />
            </div>
            <p style={{ fontSize: '10px', fontWeight: 900, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '6px' }}>Trajectory Briefing</p>
            <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>{selectedPackage?.title}</h3>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid rgba(255,255,255,0.06)', 
            borderRadius: '20px', 
            padding: '20px', 
            marginBottom: '32px' 
          }}>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
              {selectedPackage?.description || selectedPackage?.shortPreview}
            </p>
            {selectedPackage?.fee && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Trajectory Fee</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: GREEN }}>${selectedPackage.fee}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={() => {
                handleSendMessage(`I would like more information about the ${selectedPackage.title} trajectory.`);
                setIsModalVisible(false);
              }}
              style={{
                width: '100%', padding: '16px', borderRadius: '14px', border: `1px solid ${GREEN}40`, 
                background: 'transparent', color: GREEN, fontSize: '12px', fontWeight: 900, 
                textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${GREEN}10`}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Bot size={18} /> Ask AI Assistant
            </button>
            <button 
              onClick={async () => {
                setInquiryLoading(true);
                try {
                  await axios.post(`${baseURL}/inquiry`, {
                    ...contactInfo,
                    packageId: selectedPackage.id,
                    message: `Immediate trajectory quote requested for: ${selectedPackage.title}`
                  });
                  antMessage.success("Operational request transmitted to administrators.");
                  setIsModalVisible(false);
                } catch (err) {
                  antMessage.error("Failed to transmit request.");
                } finally {
                  setInquiryLoading(false);
                }
              }}
              disabled={inquiryLoading}
              style={{
                width: '100%', padding: '16px', borderRadius: '14px', border: 'none', 
                background: GREEN, color: 'white', fontSize: '12px', fontWeight: 900, 
                textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: `0 12px 24px -6px ${GREEN}60`
              }}
            >
              {inquiryLoading ? 'TRANSMITTING...' : 'REQUEST IMMEDIATE QUOTE'} <Send size={18} />
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes pulse-sync { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } }
      `}</style>
    </div>
  );
};

export default ChatWindow;
