import React, { useState, useEffect, useRef } from 'react';
import { socketService } from '../services/socket';
import { Send, MessageSquare, Clock } from 'lucide-react';

const GREEN = '#008751';

interface ChatMessage {
  message: string;
  senderName: string;
  senderId: string;
  timestamp: string;
}

interface RoomChatProps {
  roomId: string;
  userName: string;
  showHeader?: boolean;
}

const RoomChat: React.FC<RoomChatProps> = ({ roomId, userName, showHeader = true }) => {
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
      background: 'rgba(10,16,24,0.95)', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      {showHeader && <div style={{
        padding: '16px 20px', 
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <MessageSquare size={16} color={GREEN} />
        <span style={{ 
          fontSize: '12px', 
          fontWeight: 800, 
          color: 'white', 
          letterSpacing: '0.1em' 
        }}>
          PanX Live Chat
        </span>
      </div>}
      
      {/* Messages */}
      <div className="no-scrollbar" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px' 
      }}>
        {messages.length === 0 ? (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            opacity: 0.2
          }}>
            <Activity size={32} color={GREEN} style={{ marginBottom: '12px' }} />
            <span style={{ 
              fontSize: '10px', 
              fontWeight: 800, 
              color: 'white', 
              letterSpacing: '0.1em' 
            }}>
              No messages yet
            </span>
          </div>
        ) : (
          messages.map((item, idx) => {
            const isMe = item.senderName === userName;
            return (
              <div key={idx} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: isMe ? 'flex-end' : 'flex-start',
                gap: '6px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px'
                }}>
                  <span style={{ 
                    fontSize: '9px', 
                    fontWeight: 800, 
                    color: isMe ? GREEN : 'rgba(255,255,255,0.3)',
                  }}>
                    {item.senderName}
                  </span>
                  <Clock size={8} color="rgba(255,255,255,0.15)" />
                  <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.15)' }}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ 
                  background: isMe ? GREEN : 'rgba(255,255,255,0.05)', 
                  border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)', 
                  padding: '10px 14px',
                  borderRadius: '14px',
                  borderTopRightRadius: isMe ? '2px' : '14px',
                  borderTopLeftRadius: isMe ? '14px' : '2px',
                  color: isMe ? 'white' : 'rgba(255,255,255,0.8)',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  boxShadow: isMe ? `0 4px 12px -4px ${GREEN}40` : 'none',
                  maxWidth: '90%',
                  wordBreak: 'break-word'
                }}>
                  {item.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ 
        padding: '16px 20px 24px', 
        background: 'transparent'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          background: 'rgba(20, 32, 26, 0.8)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.5)',
          borderRadius: '16px',
          padding: '6px'
        }}>
          <input 
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Message this session"
            style={{ 
              flex: 1,
              background: 'none', 
              border: 'none',
              outline: 'none',
              color: 'white',
              padding: '10px 14px',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            style={{ 
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              border: 'none',
              background: inputValue.trim() ? GREEN : 'rgba(255, 255, 255, 0.03)',
              color: inputValue.trim() ? 'white' : 'rgba(255, 255, 255, 0.1)',
              cursor: inputValue.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: inputValue.trim() ? `0 6px 12px -4px ${GREEN}60` : 'none'
            }}
          >
            <Send size={16} fill={inputValue.trim() ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes activity-pulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
};

const Activity = ({ size, color, style }: { size: number, color: string, style?: any }) => (
  <svg 
    width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
    style={{ ...style, animation: 'activity-pulse 2s infinite' }}
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export default RoomChat;
