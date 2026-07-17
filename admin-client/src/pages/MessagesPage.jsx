import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Input, List, Typography, Spin, Empty, Tag, notification, Modal, Select, Button } from 'antd';
import { SearchOutlined, SendOutlined, UserOutlined, MessageOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');

  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [selectedNewUser, setSelectedNewUser] = useState(null);
  const [creatingChat, setCreatingChat] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    // Poll for new conversations every 10s
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchConversations = async () => {
    if (!user?.id) return;
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

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
      const interval = setInterval(() => fetchMessages(selectedId, true), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedId]);

  const fetchMessages = async (id, isPolling = false) => {
    if (!isPolling) setMessagesLoading(true);
    try {
      const response = await api.get(`/messaging/conversations/${id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      if (!isPolling) setMessagesLoading(false);
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
      
      setMessages(prev => {
        if (prev.some(msg => msg.id === response.data.id)) return prev;
        return [...prev, response.data];
      });
      fetchConversations();
    } catch (error) {
      console.error("Failed to send message:", error);
      notification.error({ message: 'Failed to send message' });
      setInputValue(textToSend);
    }
  };

  const handleOpenNewChat = async () => {
    setNewChatModalOpen(true);
    if (usersList.length === 0) {
      try {
        const response = await api.get('/messaging/users');
        setUsersList(response.data);
      } catch (error) {
        notification.error({ message: 'Failed to fetch users' });
      }
    }
  };

  const handleCreateChat = async () => {
    if (!selectedNewUser) return;
    setCreatingChat(true);
    try {
      const response = await api.post('/messaging/conversations/direct', { targetUserId: selectedNewUser });
      setConversations(prev => {
        if (!prev.some(c => c.id === response.data.id)) {
          return [response.data, ...prev];
        }
        return prev;
      });
      setSelectedId(response.data.id);
      setNewChatModalOpen(false);
      setSelectedNewUser(null);
    } catch (error) {
      notification.error({ message: 'Failed to start conversation' });
    } finally {
      setCreatingChat(false);
    }
  };

  const activeConversation = conversations.find(c => c.id === selectedId);
  const filteredConversations = conversations.filter(c => (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div style={{ width: '320px', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={4} style={{ color: 'white', margin: 0 }}>Inbox</Title>
            <Button 
              type="text" 
              icon={<PlusOutlined />} 
              onClick={handleOpenNewChat}
              style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.1)' }}
            />
          </div>
          <Input 
            prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.3)' }} />} 
            placeholder="Search conversations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px' }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {loading ? (
             <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin /></div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map(conv => (
              <div 
                key={conv.id} 
                onClick={() => setSelectedId(conv.id)}
                style={{ 
                  padding: '16px', borderRadius: '12px', marginBottom: '8px', cursor: 'pointer',
                  background: selectedId === conv.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  border: `1px solid ${selectedId === conv.id ? 'rgba(16, 185, 129, 0.3)' : 'transparent'}`,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }} ellipsis>{conv.title}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>{conv.timestamp || 'Just now'}</Text>
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }} ellipsis>{conv.lastMessage}</Text>
              </div>
            ))
          ) : (
            <Empty description={<span style={{ color: 'rgba(255,255,255,0.3)' }}>No Messages</span>} />
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent' }}>
        {activeConversation ? (
          <>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                <UserOutlined style={{ fontSize: '20px' }} />
              </div>
              <div>
                <Title level={5} style={{ color: 'white', margin: 0 }}>{activeConversation.title}</Title>
                <Tag color={activeConversation.status === 'online' ? 'success' : 'default'} style={{ marginTop: '4px', border: 'none' }}>
                  {activeConversation.status}
                </Tag>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {messagesLoading ? (
                 <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin /></div>
              ) : messages.length > 0 ? (
                messages.map((msg, idx) => {
                  const isMine = msg.senderId === user.id;
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                        maxWidth: '70%'
                      }}
                    >
                      {!isMine && (
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', paddingLeft: '4px' }}>
                          {msg.sender?.name || 'User'}
                        </div>
                      )}
                      <div style={{ 
                        padding: '14px 18px', borderRadius: '20px', 
                        background: isMine ? '#10B981' : 'rgba(255,255,255,0.05)',
                        color: isMine ? 'white' : 'rgba(255,255,255,0.9)',
                        borderBottomRightRadius: isMine ? '4px' : '20px',
                        borderBottomLeftRadius: isMine ? '20px' : '4px',
                      }}>
                        {msg.text}
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', textAlign: isMine ? 'right' : 'left' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <Empty description={<span style={{ color: 'rgba(255,255,255,0.3)' }}>No messages yet</span>} />
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '24px 32px' }}>
              <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-secondary)', padding: '8px', borderRadius: '24px', border: '1px solid var(--border-subtle)' }}>
                <Input.TextArea 
                  placeholder="Type a message..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  style={{ background: 'transparent', border: 'none', boxShadow: 'none', color: 'white', paddingTop: '8px' }}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  style={{ 
                    width: '44px', height: '44px', borderRadius: '16px', border: 'none',
                    background: inputValue.trim() ? '#10B981' : 'rgba(255,255,255,0.05)',
                    color: inputValue.trim() ? 'white' : 'rgba(255,255,255,0.3)',
                    cursor: inputValue.trim() ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <SendOutlined />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <MessageOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />
            <Title level={4} style={{ color: 'white', margin: '0 0 8px 0' }}>Inbox Messages</Title>
            <Text style={{ color: 'rgba(255,255,255,0.4)' }}>Select a conversation to view messages</Text>
          </div>
        )}
      </div>

      <Modal
        title="Start New Conversation"
        open={newChatModalOpen}
        onCancel={() => setNewChatModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setNewChatModalOpen(false)}>Cancel</Button>,
          <Button key="start" type="primary" onClick={handleCreateChat} loading={creatingChat} disabled={!selectedNewUser}>
            Start Chat
          </Button>
        ]}
      >
        <div style={{ padding: '20px 0' }}>
          <Typography.Text style={{ display: 'block', marginBottom: '8px' }}>Select User:</Typography.Text>
          <Select
            showSearch
            placeholder="Search by name or email"
            style={{ width: '100%' }}
            value={selectedNewUser}
            onChange={setSelectedNewUser}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={usersList.map(u => ({
              value: u.id,
              label: `${u.name} (${u.email}) - ${u.role}`
            }))}
          />
        </div>
      </Modal>
    </div>
  );
};

export default MessagesPage;
