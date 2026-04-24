import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, List, Typography, Avatar, Space } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import { socketService } from '../services/socket';

const { Text } = Typography;

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
      background: 'rgba(30, 41, 59, 0.5)', 
      backdropFilter: 'blur(10px)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '16px'
    }}>
      <Text strong style={{ color: '#fff', marginBottom: 16, display: 'block' }}>Live Chat</Text>
      
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
        <List
          dataSource={messages}
          renderItem={(item) => (
            <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
              <List.Item.Meta
                avatar={<Avatar size="small" icon={<UserOutlined />} />}
                title={
                  <Space>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: 'bold' }}>{item.senderName}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px' }}>
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </Space>
                }
                description={<Text style={{ color: '#fff' }}>{item.message}</Text>}
              />
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>

      <Space.Compact style={{ width: '100%' }}>
        <Input 
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onPressEnter={handleSend}
          placeholder="Message..."
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}
        />
        <Button 
          type="primary" 
          icon={<SendOutlined />} 
          onClick={handleSend}
          style={{ border: 'none' }}
        />
      </Space.Compact>
    </div>
  );
};

export default RoomChat;
