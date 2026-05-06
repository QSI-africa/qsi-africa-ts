import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Typography, Avatar, Space } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import { socketService } from '../services/socket';

const { Text, Title } = Typography;

interface ChatMessage {
  message: string;
  senderName: string;
  senderId: string;
  timestamp: string;
}

interface RoomChatProps {
  roomId: string;
  userName: string;
}

const RoomChat: React.FC<RoomChatProps> = ({ roomId, userName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketService.on('receive-chat-message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socketService.off('receive-chat-message');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    socketService.emit('send-chat-message', {
      roomId,
      message: inputValue,
      senderName: userName
    });

    setInputValue('');
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      background: 'var(--papyrus-off-white)', 
      borderLeft: '3px solid var(--onyx-black)',
      position: 'relative'
    }}>
      {/* Brand Accent Line */}
      <div 
        style={{ 
          height: '6px', 
          width: '100%', 
          background: 'repeating-linear-gradient(to right, #0B6138 0, #0B6138 16px, #D15B35 16px, #D15B35 32px, #E2B142 32px, #E2B142 48px, #4D7A51 48px, #4D7A51 64px, #111111 64px, #111111 80px)',
          borderBottom: '2px solid var(--onyx-black)'
        }} 
      />

      <div style={{ padding: '20px', borderBottom: '2px solid var(--onyx-black)', background: 'var(--canvas-white)' }}>
        <Title level={4} style={{ margin: 0, textTransform: 'uppercase', fontSize: '14px', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
          Session Transmission
        </Title>
        <span className="eyebrow" style={{ fontSize: '10px', margin: 0 }}>Live Intelligence Log</span>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <span className="eyebrow" style={{ opacity: 0.5 }}>Waiting for logs...</span>
          </div>
        ) : (
          messages.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-accent)', color: 'var(--onyx-black)' }}>
                  {item.senderName}
                </Text>
                <Text style={{ fontSize: '10px', opacity: 0.5 }}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </div>
              <div style={{ 
                background: 'var(--canvas-white)', 
                border: '2px solid var(--onyx-black)', 
                padding: '12px 16px',
                boxShadow: '4px 4px 0px var(--onyx-black)',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--onyx-black)'
              }}>
                {item.message}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '20px', borderTop: '3px solid var(--onyx-black)', background: 'var(--canvas-white)' }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input 
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onPressEnter={handleSend}
            placeholder="TYPE TRANSMISSION..."
            style={{ 
              background: 'var(--canvas-white)', 
              color: 'var(--onyx-black)', 
              border: '2px solid var(--onyx-black)',
              borderRadius: 0,
              height: '48px',
              fontFamily: 'var(--font-accent)',
              fontSize: '12px'
            }}
          />
          <Button 
            className="afro-button primary"
            icon={<SendOutlined />} 
            onClick={handleSend}
            style={{ 
              height: '48px',
              width: '60px',
              marginLeft: '-2px',
              zIndex: 1
            }}
          />
        </Space.Compact>
      </div>
    </div>
  );
};

export default RoomChat;
