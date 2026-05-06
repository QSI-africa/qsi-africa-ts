import React, { useState, useEffect, useRef } from 'react';
import { 
  Typography, 
  Input, 
  Button, 
  Layout, 
  Space, 
  Empty, 
  Divider,
  Badge,
  Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  SendOutlined, 
  FilterOutlined,
  EllipsisOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import ConversationItem, { Conversation } from '../components/ConversationItem';
import Message from '../components/Message';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { message as antMessage } from 'antd';

const { Title, Text } = Typography;
const { Header, Sider, Content } = Layout;

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    title: 'Smart Infrastructure AI',
    lastMessage: 'The structural coherence for the Zambezi bridge project is currently at 94% optimal levels.',
    timestamp: '2m ago',
    type: 'module',
    unreadCount: 3,
    status: 'online'
  },
  {
    id: '2',
    title: 'Eng. Kwame Mensah',
    lastMessage: 'I have reviewed the site survey data. We need to adjust the foundation depth.',
    timestamp: '1h ago',
    type: 'operator',
    unreadCount: 0,
    status: 'online'
  },
  {
    id: '3',
    title: 'Project: Nairobi Logistics Hub',
    lastMessage: 'System-assisted update: 5 new vehicles have been dispatched to the hub.',
    timestamp: '3h ago',
    type: 'system-assisted',
    unreadCount: 0,
    status: 'active'
  },
  {
    id: '4',
    title: 'Healing & Wisdom AI',
    lastMessage: 'How are you feeling after the frequency alignment session yesterday?',
    timestamp: 'Yesterday',
    type: 'module',
    unreadCount: 0,
    status: 'online'
  },
  {
    id: '5',
    title: 'Lagos Smart Grid Expansion',
    lastMessage: 'Phase 2 documentation has been uploaded to the vault.',
    timestamp: '2 days ago',
    type: 'project',
    unreadCount: 0,
    status: 'offline'
  }
];

const MOCK_MESSAGES: Record<string, any[]> = {
  '1': [
    { sender: 'ai', text: 'Welcome back. I have completed the analysis for the Zambezi Bridge project.' },
    { sender: 'user', text: 'Thank you. What is the current status of the structural coherence?' },
    { sender: 'ai', text: 'The structural coherence for the Zambezi bridge project is currently at 94% optimal levels. We have identified a minor deviation in the eastern pillar tension.' }
  ],
  '2': [
    { sender: 'operator', text: 'Hello! I am Eng. Kwame. I have reviewed your request for the foundation adjustment.' },
    { sender: 'user', text: 'Great, what are the next steps?' },
    { sender: 'operator', text: 'I have reviewed the site survey data. We need to adjust the foundation depth by approximately 1.5 meters to reach the bedrock.' }
  ]
};

const InboxPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'module' | 'operator' | 'project'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showListOnMobile, setShowListOnMobile] = useState(true);
  
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
      if (response.data.length > 0 && !selectedId && !isMobile) {
        setSelectedId(response.data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      antMessage.error("Could not load discussions.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Messages for Selected Conversation
  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
    } else {
      setMessages([]);
    }
  }, [selectedId]);

  const fetchMessages = async (id: string) => {
    setMessagesLoading(true);
    try {
      const response = await api.get(`/messaging/conversations/${id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      antMessage.error("Could not load message history.");
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedId, inputValue]);

  const filteredConversations = conversations.filter(conv => {
    const matchesFilter = filter === 'all' || conv.type === filter || (filter === 'module' && conv.type === 'system-assisted');
    const matchesSearch = conv.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeConversation = conversations.find(c => c.id === selectedId);

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
      
      // Update the last message in the sidebar
      setConversations(prev => prev.map(conv => 
        conv.id === selectedId 
          ? { ...conv, lastMessage: textToSend, timestamp: 'Just now' } 
          : conv
      ));
    } catch (error) {
      console.error("Failed to send message:", error);
      antMessage.error("Message failed to send.");
      setInputValue(textToSend); // Restore input on failure
    }
  };

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    if (isMobile) {
      setShowListOnMobile(false);
    }
  };

  return (
    <div style={{ 
      height: isMobile ? 'calc(100vh - 80px - 70px)' : 'calc(100vh - 80px)', 
      marginTop: '80px',
      display: 'flex', 
      backgroundColor: 'var(--canvas-white)',
      overflow: 'hidden'
    }}>
      {/* Sidebar - Conversation List */}
      <div style={{ 
        width: isMobile ? (showListOnMobile ? '100%' : '0%') : '350px',
        borderRight: '3px solid var(--onyx-black)',
        display: isMobile && !showListOnMobile ? 'none' : 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--canvas-white)',
        transition: 'var(--snappy)',
        zIndex: 10
      }}>
        <div style={{ padding: '24px', borderBottom: '3px solid var(--onyx-black)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={3} style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inbox</Title>
            <Button type="text" icon={<EllipsisOutlined />} />
          </div>
          
          <Input 
            prefix={<SearchOutlined style={{ color: 'var(--ash-grey)' }} />}
            placeholder="SEARCH DISCUSSIONS..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ 
              borderRadius: 0, 
              border: '2px solid var(--onyx-black)',
              fontFamily: 'var(--font-accent)',
              fontSize: '12px'
            }}
          />

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', overflowX: 'auto' }} className="no-scrollbar">
            {(['all', 'module', 'operator', 'project'] as const).map(f => (
              <Button 
                key={f}
                size="small"
                onClick={() => setFilter(f)}
                style={{
                  borderRadius: 0,
                  border: '2px solid var(--onyx-black)',
                  backgroundColor: filter === f ? 'var(--onyx-black)' : 'transparent',
                  color: filter === f ? 'var(--canvas-white)' : 'var(--onyx-black)',
                  fontSize: '10px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-accent)',
                  transition: 'none'
                }}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConversations.length > 0 ? (
            filteredConversations.map(conv => (
              <ConversationItem 
                key={conv.id}
                conversation={conv}
                isActive={selectedId === conv.id}
                onClick={() => handleSelectConversation(conv.id)}
              />
            ))
          ) : (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description={<Text style={{ fontFamily: 'var(--font-accent)', fontSize: '12px' }}>NO DISCUSSIONS FOUND</Text>}
              style={{ marginTop: '40px' }}
            />
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ 
        flex: 1, 
        display: isMobile && showListOnMobile ? 'none' : 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative'
      }}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <Header style={{ 
              backgroundColor: 'var(--canvas-white)', 
              borderBottom: '3px solid var(--onyx-black)',
              padding: '0 24px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 5
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {isMobile && (
                  <Button 
                    type="text" 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => setShowListOnMobile(true)} 
                  />
                )}
                <div>
                  <Title level={4} style={{ 
                    margin: 0, 
                    textTransform: 'uppercase', 
                    fontSize: '16px',
                    lineHeight: '1.2',
                    paddingTop: '4px' // Add small padding to prevent top cutoff
                  }}>
                    {activeConversation.title}
                  </Title>
                  <Text style={{ fontSize: '10px', color: 'var(--ash-grey)', fontFamily: 'var(--font-accent)', textTransform: 'uppercase' }}>
                    {activeConversation.type} • {activeConversation.status === 'online' ? 'Connected' : 'Offline'}
                  </Text>
                </div>
              </div>
              <Space>
                <Tooltip title="Details">
                  <Button type="text" icon={<InfoCircleOutlined />} />
                </Tooltip>
                <Button type="text" icon={<EllipsisOutlined />} />
              </Space>
            </Header>

            {/* Messages Area */}
            <Content style={{ 
              flex: 1, 
              padding: '24px', 
              overflowY: 'auto',
              backgroundColor: 'var(--papyrus-off-white)',
              position: 'relative'
            }}>
              <div className="pattern-mudcloth" style={{ 
                position: 'absolute', 
                top: 0, left: 0, right: 0, bottom: 0, 
                opacity: 0.03, pointerEvents: 'none' 
              }} />
              
              <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {messages.length > 0 ? (
                  messages.map((msg, idx) => (
                    <Message 
                      key={msg.id || idx} 
                      sender={msg.senderType.toLowerCase() === 'user' ? 'user' : msg.senderType.toLowerCase()} 
                      text={msg.text} 
                    />
                  ))
                ) : (
                  !messagesLoading && (
                    <Empty 
                      description={<Text style={{ color: 'var(--ash-grey)' }}>START THE CONVERSATION</Text>} 
                      style={{ marginTop: '100px' }}
                    />
                  )
                )}
                <div ref={messagesEndRef} />
              </div>
            </Content>

            {/* Input Area */}
            <div style={{ 
              padding: '24px', 
              backgroundColor: 'var(--canvas-white)',
              borderTop: '3px solid var(--onyx-black)',
              zIndex: 5
            }}>
              <div style={{ 
                maxWidth: '900px', 
                margin: '0 auto',
                display: 'flex',
                gap: '12px'
              }}>
                <Input.TextArea 
                  placeholder="TYPE YOUR MESSAGE..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onPressEnter={e => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  style={{ 
                    borderRadius: 0,
                    border: '3px solid var(--onyx-black)',
                    padding: '12px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    boxShadow: '4px 4px 0px var(--onyx-black)'
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  style={{
                    height: 'auto',
                    aspectRatio: '1/1',
                    borderRadius: 0,
                    backgroundColor: 'var(--baobab-emerald)',
                    color: 'white',
                    border: '3px solid var(--onyx-black)',
                    boxShadow: '4px 4px 0px var(--onyx-black)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  icon={<SendOutlined style={{ fontSize: '20px' }} />}
                />
              </div>
            </div>
          </>
        ) : (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'var(--papyrus-off-white)' 
          }}>
            <Empty 
              description={<Title level={4} style={{ color: 'var(--ash-grey)', textTransform: 'uppercase' }}>Select a discussion to start messaging</Title>} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;
