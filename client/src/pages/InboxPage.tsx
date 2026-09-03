import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Input, 
  Empty, 
  Spin,
  Modal,
  message,
  Button
} from 'antd';
import { 
  Search, 
  Send, 
  MoreVertical,
  Info,
  User,
  Bot,
  Plus,
  MessageSquare,
  Paperclip,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import api from '../api';
import { socketService } from '../services/socket';
import UnifiedHeader from '../components/layout/UnifiedHeader';

const GREEN = '#008751';

const formatCompactTimestamp = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  type: 'module' | 'operator' | 'project' | 'system-assisted' | 'GENERAL' | 'DIRECT';
  unreadCount: number;
  status: 'online' | 'offline' | 'active';
  avatarUrl?: string;
}

interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string | null;
  senderType: string;
  text: string;
  createdAt: string;
  sender?: { id: string; name: string } | null;
}

// ─── Conversation List (shared between sidebar and mobile inline view) ─────────
interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  loading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  chatSegment: 'all' | 'unread';
  onSegmentChange: (s: 'all' | 'unread') => void;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onBack?: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  loading,
  searchQuery,
  onSearchChange,
  chatSegment,
  onSegmentChange,
  onSelectConversation,
  onNewConversation,
  onBack,
}) => {
  const filtered = useMemo(() =>
    (Array.isArray(conversations) ? conversations : [])
      .filter(c => chatSegment === 'all' || c.unreadCount > 0)
      .filter(c => (c?.title || '').toLowerCase().includes((searchQuery || '').toLowerCase())),
    [conversations, chatSegment, searchQuery]
  );

  return (
    <div style={{ height: '100%', background: 'rgba(10,16,24,0.95)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '0 0 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <UnifiedHeader
          title="PanX Chats"
          backAction={onBack}
          extra={
            <button
              onClick={onNewConversation}
              aria-label="New conversation"
              style={{
                width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${GREEN}30`}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <Plus size={16} />
            </button>
          }
        />

        <div className="qsi-search-bar qsi-search-bar--compact" style={{ marginBottom: '12px', padding: '0 16px', marginTop: '16px' }}>
          <Search size={16} color="rgba(255,255,255,0.2)" />
          <input
            placeholder="Search PanX Chats..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', padding: '0 16px' }}>
          <button
            onClick={() => onSegmentChange('all')}
            style={{
              flex: 1, padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 800,
              background: chatSegment === 'all' ? GREEN : 'rgba(255,255,255,0.03)',
              color: chatSegment === 'all' ? 'black' : 'rgba(255,255,255,0.6)',
              border: 'none', cursor: 'pointer'
            }}
          >All</button>
          <button
            onClick={() => onSegmentChange('unread')}
            style={{
              flex: 1, padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 800,
              background: chatSegment === 'unread' ? GREEN : 'rgba(255,255,255,0.03)',
              color: chatSegment === 'unread' ? 'black' : 'rgba(255,255,255,0.6)',
              border: 'none', cursor: 'pointer'
            }}
          >Unread</button>
        </div>
      </header>

      <div className="no-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px' }}>
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}><Spin size="small" /></div>
        ) : filtered.length > 0 ? (
          filtered.map(conv => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              style={{
                padding: '14px', borderRadius: '16px', marginBottom: '6px', cursor: 'pointer',
                transition: 'all 0.2s',
                background: selectedId === conv.id ? `${GREEN}15` : 'transparent',
                border: `1px solid ${selectedId === conv.id ? `${GREEN}30` : 'transparent'}`,
              }}
              onMouseEnter={e => { if (selectedId !== conv.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { if (selectedId !== conv.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: selectedId === conv.id ? GREEN : 'rgba(255,255,255,0.4)'
                }}>
                  {conv.avatarUrl
                    ? <img src={conv.avatarUrl} alt={conv.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : conv.type === 'module' ? <Bot size={20} /> : <User size={20} />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', gap: '8px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.title}
                    </span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, flexShrink: 0 }}>
                      {formatCompactTimestamp(conv.timestamp)}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span style={{
                    minWidth: 20, height: 20, padding: '0 6px', borderRadius: 10, flexShrink: 0,
                    display: 'grid', placeItems: 'center', background: GREEN, color: 'white', fontSize: 10, fontWeight: 800
                  }}>
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Empty description={<span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'none' }}>No conversations</span>} />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const InboxPage: React.FC = () => {
  const auth = useAuth();
  const user = auth?.user;
  const navigate = useNavigate();
  const { setSidebarContent } = useSidebar();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatSegment, setChatSegment] = useState<'all' | 'unread'>('all');
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  
  const [isDiscoverModalOpen, setIsDiscoverModalOpen] = useState(false);
  const [discoverUsers, setDiscoverUsers] = useState<any[]>([]);
  const [discoverSearchQuery, setDiscoverSearchQuery] = useState('');
  const [discoverLoading, setDiscoverLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedIdRef = useRef<string | null>(null);

  const [searchParams] = useSearchParams();
  const targetUserParam = searchParams.get('user');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) socketService.connect(token);
    return () => { socketService.disconnect(); };
  }, [user?.id]);

  useEffect(() => {
    const handleNotification = ({ conversationId, message: incoming, senderName }: { conversationId: string; message: ConversationMessage; senderName: string }) => {
      setConversations(prev => {
        const existing = prev.find(conv => conv.id === conversationId);
        if (!existing) {
          return [{
            id: conversationId,
            title: senderName || incoming.sender?.name || 'New conversation',
            type: 'GENERAL',
            status: 'active',
            lastMessage: incoming.text,
            timestamp: incoming.createdAt,
            unreadCount: 1
          }, ...prev];
        }
        const updated = prev.map(conv => conv.id === conversationId
          ? { ...conv, lastMessage: incoming.text, timestamp: incoming.createdAt, unreadCount: conv.id === selectedId ? (conv.unreadCount ?? 0) : (conv.unreadCount ?? 0) + 1 }
          : conv
        );
        const changed = updated.find(conv => conv.id === conversationId);
        return changed ? [changed, ...updated.filter(conv => conv.id !== conversationId)] : updated;
      });
    };

    const handleConversationError = ({ message: errorMessage }: { message: string }) => {
      message.error(errorMessage || 'Unable to open this conversation.');
    };

    socketService.on('direct_message_notification', handleNotification);
    socketService.on('conversation-error', handleConversationError);
    return () => {
      socketService.off('direct_message_notification', handleNotification);
      socketService.off('conversation-error', handleConversationError);
    };
  }, [selectedId, user?.id]);

  const openConversation = (conversationId: string) => {
    setSelectedId(conversationId);
    setConversations(prev => prev.map(conv => conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv));
  };

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    if (targetUserParam && user?.id) {
      handleStartConversation(targetUserParam);
    }
  }, [targetUserParam, user?.id]);

  useEffect(() => {
    const controller = new AbortController();
    if (isDiscoverModalOpen) fetchDiscoverUsers(controller.signal);
    return () => controller.abort();
  }, [isDiscoverModalOpen]);

  const fetchDiscoverUsers = async (signal?: AbortSignal) => {
    setDiscoverLoading(true);
    try {
      const response = await api.get('/messaging/users', { signal });
      setDiscoverUsers(response.data);
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.message?.includes('canceled')) return;
      message.error(error?.response?.data?.error || error?.response?.data?.message || "Failed to fetch user list.");
    } finally {
      setDiscoverLoading(false);
    }
  };

  const handleStartConversation = async (targetUserId: string) => {
    try {
      const response = await api.post('/messaging/conversations/direct', { targetUserId });
      const newConv: Conversation = {
        ...response.data,
        lastMessage: response.data.lastMessage || 'No messages yet',
        timestamp: response.data.timestamp || response.data.updatedAt,
        unreadCount: response.data.unreadCount ?? 0,
        status: (response.data.status || 'active').toLowerCase() as Conversation['status']
      };
      setConversations(prev => {
        const exists = prev.some(c => c.id === newConv.id);
        if (exists) return prev;
        return [newConv, ...prev];
      });
      setSelectedId(newConv.id);
      setIsDiscoverModalOpen(false);
      message.success("Conversation established.");
    } catch (error: any) {
      message.error(error?.response?.data?.error || error?.response?.data?.message || "Failed to start conversation.");
    }
  };

  const filteredDiscoverUsers = useMemo(() => {
    if (!Array.isArray(discoverUsers)) return [];
    return discoverUsers.filter(u =>
      (u?.name || '').toLowerCase().includes((discoverSearchQuery || '').toLowerCase()) ||
      (u?.email || '').toLowerCase().includes((discoverSearchQuery || '').toLowerCase()) ||
      (u?.role || '').toLowerCase().includes((discoverSearchQuery || '').toLowerCase())
    );
  }, [discoverUsers, discoverSearchQuery]);

  useEffect(() => {
    const controller = new AbortController();
    if (user?.id) fetchConversations(controller.signal);
    return () => controller.abort();
  }, [user?.id]);

  const fetchConversations = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const response = await api.get('/messaging/conversations', { signal });
      setConversations(response.data);
      // Desktop: auto-open first conversation
      if (!isMobile && response.data.length > 0 && !selectedId) {
        setSelectedId(response.data[0].id);
      }
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.message?.includes('canceled')) return;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    if (selectedId) {
      fetchMessages(selectedId, controller.signal);
      socketService.emit("join-conversation", selectedId);

      const handleNewMessage = (messageObj: any) => {
        if (messageObj.conversationId === selectedId) {
          setMessages(prev => {
            if (prev.some(msg => msg.id === messageObj.id)) return prev;
            return [...prev, messageObj];
          });
          setConversations(prev => prev.map(conv =>
            conv.id === messageObj.conversationId
              ? { ...conv, lastMessage: messageObj.text, timestamp: 'Just now' }
              : conv
          ));
        }
      };

      socketService.on("new_message", handleNewMessage);
      return () => {
        socketService.emit("leave-conversation", selectedId);
        socketService.off("new_message", handleNewMessage);
        controller.abort();
      };
    }
    return () => controller.abort();
  }, [selectedId]);

  const fetchMessages = async (id: string, signal?: AbortSignal) => {
    setMessagesLoading(true);
    try {
      const response = await api.get(`/messaging/conversations/${id}/messages`, { signal });
      setMessages(response.data);
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.message?.includes('canceled')) return;
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedId || !user || isSending) return;
    const conversationId = selectedId;
    const textToSend = inputValue.trim();
    setInputValue('');
    setIsSending(true);
    try {
      const response = await api.post(`/messaging/conversations/${conversationId}/messages`, { text: textToSend });
      if (selectedIdRef.current === conversationId) {
        setMessages(prev => {
          if (prev.some(msg => msg.id === response.data.id)) return prev;
          return [...prev, response.data];
        });
      }
      setConversations(prev => prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, lastMessage: textToSend, timestamp: 'Just now' }
          : conv
      ));
    } catch (error: any) {
      setInputValue(textToSend);
      message.error(error?.response?.data?.error || 'Message could not be sent. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const activeConversation = conversations.find(c => c.id === selectedId);

  // ─── Desktop: Inject conversation list into sidebar ─────────────────────────
  useEffect(() => {
    if (isMobile) {
      setSidebarContent(null);
      return () => setSidebarContent(null);
    }

    setSidebarContent(
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        chatSegment={chatSegment}
        onSegmentChange={setChatSegment}
        onSelectConversation={openConversation}
        onNewConversation={() => setIsDiscoverModalOpen(true)}
      />
    );
    return () => setSidebarContent(null);
  }, [conversations, selectedId, searchQuery, chatSegment, loading, setSidebarContent, isMobile]);

  // ─── Chat View (shared between mobile and desktop) ──────────────────────────
  const renderChatView = () => (
    <>
      <UnifiedHeader
        title={activeConversation?.title ?? ''}
        subTitle={
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeConversation?.status === 'online' ? GREEN : 'rgba(255,255,255,0.2)' }} />
            <span style={{ fontSize: '10px', fontWeight: 800, color: activeConversation?.status === 'online' ? GREEN : 'rgba(255,255,255,0.2)', textTransform: 'none', letterSpacing: '0.05em' }}>
              {activeConversation ? (activeConversation.status.charAt(0).toUpperCase() + activeConversation.status.slice(1)) : ''}
            </span>
          </div>
        }
        backAction={isMobile ? () => setSelectedId(null) : undefined}
        extra={
          <div style={{ display: 'flex', gap: '16px', color: 'rgba(255,255,255,0.4)', alignItems: 'center' }}>
            <Info size={20} style={{ cursor: 'pointer' }} />
            <MoreVertical size={20} style={{ cursor: 'pointer' }} />
          </div>
        }
      />

      {/* Messages Area */}
      <div className="no-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messagesLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}><Spin /></div>
        ) : messages && Array.isArray(messages) && messages.length > 0 ? (
          messages.map((msg) => {
            const isOwnMessage = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                  maxWidth: '72%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  padding: '12px 16px', borderRadius: '20px',
                  background: isOwnMessage ? GREEN : 'rgba(255,255,255,0.05)',
                  color: isOwnMessage ? 'white' : 'rgba(255,255,255,0.9)',
                  border: isOwnMessage ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  fontSize: '14px', lineHeight: 1.6,
                  boxShadow: isOwnMessage ? `0 8px 20px -8px ${GREEN}60` : 'none',
                  borderBottomRightRadius: isOwnMessage ? '4px' : '20px',
                  borderBottomLeftRadius: isOwnMessage ? '20px' : '4px',
                }}>
                  {msg.text}
                </div>
                <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.2)', marginTop: '6px', textTransform: 'none' }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description={<span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: 800, textTransform: 'none' }}>Synchronisation initiated</span>} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <footer style={{ padding: '16px 16px 24px', background: 'transparent', position: 'relative', zIndex: 10 }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '10px',
          background: 'rgba(20, 32, 26, 0.8)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
          borderRadius: '24px',
          padding: '6px'
        }}>
          <input type="file" id="inbox-file-upload" style={{ display: 'none' }} multiple onChange={e => console.log(e.target.files)} />
          <label htmlFor="inbox-file-upload" style={{
            width: '40px', height: '40px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)',
            color: 'rgba(255, 255, 255, 0.2)', cursor: 'pointer', transition: 'all 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.color = GREEN}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.2)'}
          >
            <Paperclip size={18} />
          </label>

          <div style={{ flex: 1 }}>
            <Input.TextArea
              placeholder="Type secure message..."
              autoSize={{ minRows: 1, maxRows: 6 }}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              style={{
                background: 'none', border: 'none', outline: 'none', color: 'white',
                padding: '10px 4px', fontSize: '14px', fontWeight: 500, resize: 'none', boxShadow: 'none'
              }}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isSending}
            style={{
              width: '40px', height: '40px', borderRadius: '14px', border: 'none', flexShrink: 0,
              background: inputValue.trim() ? GREEN : 'rgba(255, 255, 255, 0.03)',
              color: inputValue.trim() ? 'white' : 'rgba(255, 255, 255, 0.1)',
              cursor: inputValue.trim() && !isSending ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: inputValue.trim() ? `0 10px 20px -5px ${GREEN}60` : 'none',
            }}
          >
            {isSending ? <Spin size="small" /> : <Send size={17} fill={inputValue.trim() ? 'currentColor' : 'none'} />}
          </button>
        </div>
      </footer>
    </>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', background: 'transparent', position: 'relative', overflow: 'hidden' }}>

      {/* ── MOBILE VIEW ── */}
      {isMobile ? (
        selectedId && activeConversation ? (
          // Mobile: Chat view
          renderChatView()
        ) : (
          // Mobile: Full-screen conversation list
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <ConversationList
              conversations={conversations}
              selectedId={selectedId}
              loading={loading}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              chatSegment={chatSegment}
              onSegmentChange={setChatSegment}
              onSelectConversation={openConversation}
              onNewConversation={() => setIsDiscoverModalOpen(true)}
              onBack={() => navigate(-1)}
            />
          </div>
        )
      ) : (
        /* ── DESKTOP VIEW ── */
        activeConversation ? (
          renderChatView()
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
            <div style={{ color: GREEN, opacity: 0.1, marginBottom: '32px' }}>
              <MessageSquare size={120} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'white', marginBottom: '12px', textTransform: 'none', letterSpacing: '-0.02em' }}>Secure Channels</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', maxWidth: '360px', textAlign: 'center', lineHeight: 1.6 }}>
              Select a communication channel from the sidebar to begin operational synchronization and secure briefings.
            </p>
          </div>
        )
      )}

      {/* Discover People Modal */}
      <Modal
        title={<div style={{ color: 'white', fontSize: '18px', fontWeight: 900, textTransform: 'none', letterSpacing: '0.05em' }}>Discover People</div>}
        open={isDiscoverModalOpen}
        onCancel={() => setIsDiscoverModalOpen(false)}
        footer={null}
        width={600}
        styles={{
          body: { background: 'rgba(10, 16, 24, 0.98)', padding: '24px 0 0' },
          content: {
            background: 'rgba(10, 16, 24, 0.98)', border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)', borderRadius: '24px', color: 'white', overflow: 'hidden',
          },
          header: { background: 'rgba(10, 16, 24, 0.98)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', padding: '20px 24px', margin: 0 },
          mask: { backdropFilter: 'blur(8px)', background: 'rgba(5, 8, 12, 0.85)' }
        }}
      >
        <div style={{ padding: '0 24px 20px' }}>
          <div className="qsi-search-bar qsi-search-bar--compact" style={{ marginBottom: '20px' }}>
            <Search size={16} color="rgba(255,255,255,0.3)" />
            <input
              placeholder="Search by name, email, or role..."
              value={discoverSearchQuery}
              onChange={e => setDiscoverSearchQuery(e.target.value)}
            />
          </div>

          <div className="no-scrollbar" style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {discoverLoading ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}><Spin size="default" /></div>
            ) : filteredDiscoverUsers.length > 0 ? (
              filteredDiscoverUsers.map(u => {
                const initials = u.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                const gradientIndex = u.id.charCodeAt(0) % 5;
                const gradients = [
                  'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                  'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                  'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
                  'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)'
                ];
                return (
                  <div
                    key={u.id}
                    style={{
                      padding: '14px 16px', borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                        background: gradients[gradientIndex], display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, color: 'white', fontSize: '14px', letterSpacing: '0.05em'
                      }}>
                        {initials}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>{u.name}</span>
                          <span style={{
                            fontSize: '9px', fontWeight: 900, background: 'rgba(255,255,255,0.05)',
                            padding: '2px 6px', borderRadius: '6px', color: 'rgba(255,255,255,0.5)',
                            textTransform: 'none', letterSpacing: '0.05em', flexShrink: 0
                          }}>{u.role.charAt(0).toUpperCase() + u.role.slice(1)}</span>
                        </div>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</span>
                      </div>
                    </div>
                    <Button
                      type="primary"
                      onClick={() => handleStartConversation(u.id)}
                      style={{ background: GREEN, borderColor: GREEN, borderRadius: '10px', fontWeight: 700, fontSize: '12px', height: '32px', flexShrink: 0, marginLeft: '12px' }}
                    >
                      Message
                    </Button>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <Empty description={<span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: 800, textTransform: 'none' }}>No matching users</span>} />
              </div>
            )}
          </div>
        </div>
      </Modal>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default InboxPage;
