import React, { useState, useEffect, useRef } from 'react';
import { 
  Input, 
  Empty, 
  Spin,
  Tooltip
} from 'antd';
import { 
  Search, 
  Send, 
  Filter,
  MoreVertical,
  ArrowLeft,
  Info,
  User,
  Bot,
  Layers,
  Activity,
  Plus,
  Inbox,
  MessageSquare,
  Circle,
  Paperclip,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import api from '../api';

const GREEN = '#10B981';

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  type: 'module' | 'operator' | 'project' | 'system-assisted';
  unreadCount: number;
  status: 'online' | 'offline' | 'active';
}

const InboxPage: React.FC = () => {
  const { user } = useAuth();
  const { setSidebarContent } = useSidebar();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Conversations
  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/messaging/conversations?userId=${user.id}`);
      setConversations(response.data);
      if (response.data.length > 0 && !selectedId) {
        setSelectedId(response.data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Messages for Selected Conversation
  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
    }
  }, [selectedId]);

  const fetchMessages = async (id: string) => {
    setMessagesLoading(true);
    try {
      const response = await api.get(`/messaging/conversations/${id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedId || !user) return;
    
    const textToSend = inputValue;
    setInputValue('');

    try {
      const response = await api.post(`/messaging/conversations/${selectedId}/messages`, {
        senderId: user.id,
        senderType: 'USER',
        text: textToSend
      });
      
      setMessages(prev => [...prev, response.data]);
      setConversations(prev => prev.map(conv => 
        conv.id === selectedId 
          ? { ...conv, lastMessage: textToSend, timestamp: 'Just now' } 
          : conv
      ));
    } catch (error) {
      console.error("Failed to send message:", error);
      setInputValue(textToSend);
    }
  };

  const activeConversation = conversations.find(c => c.id === selectedId);

  // 3. Sidebar Integration
  useEffect(() => {
    setSidebarContent(
      <div style={{ height: '100%', background: 'rgba(10,16,24,0.95)', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', margin: 0 }}>INBOXES</h2>
            <button style={{
              width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)',
              border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Plus size={16} />
            </button>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '0 12px'
          }}>
            <Search size={16} color="rgba(255,255,255,0.2)" />
            <input 
              style={{
                background: 'none', border: 'none', outline: 'none', color: 'white',
                padding: '10px 12px', flex: 1, fontSize: '13px'
              }}
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {loading ? (
             <div style={{ padding: '40px 0', textAlign: 'center' }}><Spin size="small" /></div>
          ) : conversations.length > 0 ? (
            conversations.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).map(conv => (
              <div 
                key={conv.id} 
                onClick={() => setSelectedId(conv.id)}
                style={{ 
                  padding: '16px', borderRadius: '16px', marginBottom: '8px', cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: selectedId === conv.id ? `${GREEN}15` : 'transparent',
                  border: `1px solid ${selectedId === conv.id ? `${GREEN}30` : 'transparent'}`,
                }}
                onMouseEnter={e => {
                  if (selectedId !== conv.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
                onMouseLeave={e => {
                  if (selectedId !== conv.id) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ 
                    width: '44px', height: '44px', borderRadius: '14px', 
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedId === conv.id ? GREEN : 'rgba(255,255,255,0.4)'
                  }}>
                    {conv.type === 'module' ? <Bot size={20} /> : conv.type === 'operator' ? <User size={20} /> : <Layers size={20} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.title}</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>{conv.timestamp}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <Empty description={<span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: 800, textTransform: 'uppercase' }}>No Discussions</span>} />
            </div>
          )}
        </div>
      </div>
    );
    return () => setSidebarContent(null);
  }, [conversations, selectedId, searchQuery, loading, setSidebarContent]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      {activeConversation ? (
        <>
          {/* Chat Header */}
          <header style={{ 
            padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', 
            background: 'rgba(16, 26, 21, 0.85)', backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0, zIndex: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '12px', 
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN
              }}>
                {activeConversation.type === 'module' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'white', margin: 0 }}>{activeConversation.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeConversation.status === 'online' ? GREEN : 'rgba(255,255,255,0.2)' }} />
                  <span style={{ fontSize: '10px', fontWeight: 800, color: activeConversation.status === 'online' ? GREEN : 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {activeConversation.status}
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
          <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {messagesLoading ? (
              <div style={{ padding: '60px 0', textAlign: 'center' }}><Spin /></div>
            ) : messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    alignSelf: msg.senderType === 'USER' ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.senderType === 'USER' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{ 
                    padding: '14px 18px', borderRadius: '20px', 
                    background: msg.senderType === 'USER' ? GREEN : 'rgba(255,255,255,0.05)',
                    color: msg.senderType === 'USER' ? 'white' : 'rgba(255,255,255,0.9)',
                    border: msg.senderType === 'USER' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    fontSize: '14px', lineHeight: 1.6,
                    boxShadow: msg.senderType === 'USER' ? `0 8px 20px -8px ${GREEN}60` : 'none',
                    borderBottomRightRadius: msg.senderType === 'USER' ? '4px' : '20px',
                    borderBottomLeftRadius: msg.senderType === 'USER' ? '20px' : '4px',
                  }}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.2)', marginTop: '6px', textTransform: 'uppercase' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty description={<span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: 800, textTransform: 'uppercase' }}>Synchronisation initiated</span>} />
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
              maxWidth: '800px', 
              margin: '0 auto', 
              display: 'flex', 
              alignItems: 'flex-end', 
              gap: '12px',
              background: 'rgba(20, 32, 26, 0.8)', 
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
              borderRadius: '24px', 
              padding: '8px'
            }}>
              <input 
                type="file" 
                id="inbox-file-upload" 
                style={{ display: 'none' }} 
                multiple 
                onChange={(e) => {
                  console.log(e.target.files);
                }}
              />
              <label htmlFor="inbox-file-upload" style={{ 
                width: '44px',
                height: '44px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                color: 'rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = GREEN}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.2)'}
              >
                <Paperclip size={20} />
              </label>
              
              <div style={{ flex: 1 }}>
                <Input.TextArea 
                  placeholder="Type secure message..."
                  autoSize={{ minRows: 1, maxRows: 6 }}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    outline: 'none', 
                    color: 'white',
                    padding: '12px 4px', 
                    fontSize: '14px', 
                    fontWeight: 500,
                    resize: 'none', 
                    boxShadow: 'none'
                  }}
                />
              </div>

              <button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '16px', 
                  border: 'none',
                  background: inputValue.trim() ? GREEN : 'rgba(255, 255, 255, 0.03)',
                  color: inputValue.trim() ? 'white' : 'rgba(255, 255, 255, 0.1)',
                  cursor: inputValue.trim() ? 'pointer' : 'default',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: inputValue.trim() ? `0 10px 20px -5px ${GREEN}60` : 'none',
                  transform: inputValue.trim() ? 'scale(1)' : 'scale(0.95)'
                }}
              >
                <Send size={18} fill={inputValue.trim() ? 'currentColor' : 'none'} />
              </button>
            </div>
          </footer>
        </>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
           <div style={{ color: GREEN, opacity: 0.1, marginBottom: '32px' }}>
             <MessageSquare size={120} />
           </div>
           <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'white', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Secure Channels</h2>
           <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', maxWidth: '360px', textAlign: 'center', lineHeight: 1.6 }}>
             Select a communication channel from the sidebar to begin operational synchronization and secure briefings.
           </p>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default InboxPage;
