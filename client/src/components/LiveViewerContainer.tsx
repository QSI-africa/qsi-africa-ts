// client/src/components/LiveViewerContainer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Typography, Card, Spin, Button, Space } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { socketService } from '../services/socket';
import RoomChat from './RoomChat';
import { useAuth } from '../context/AuthContext';

const { Text } = Typography;

interface LiveViewerProps {
  roomId: string;
  title: string;
  onClose: () => void;
}

const LiveViewerContainer: React.FC<LiveViewerProps> = ({ roomId, title, onClose }) => {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [showChat, setShowChat] = useState(true);
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  const servers = {
    iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }],
  };

  const broadcasterId = useRef<string | null>(null);

  useEffect(() => {
    const initPC = async () => {
      pc.current = new RTCPeerConnection(servers);

      pc.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (videoRef.current) videoRef.current.srcObject = event.streams[0];
      };

      pc.current.onicecandidate = (event) => {
        if (event.candidate && broadcasterId.current) {
          socketService.emit('ice-candidate', { targetUserId: broadcasterId.current, candidate: event.candidate, roomId });
        }
      };

      socketService.on('offer', async ({ offer, senderUserId }) => {
        if (pc.current) {
          broadcasterId.current = senderUserId;
          await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.current.createAnswer();
          await pc.current.setLocalDescription(answer);
          socketService.emit('answer', { targetUserId: senderUserId, answer });
        }
      });

      socketService.on('ice-candidate', async ({ candidate }) => {
        if (pc.current) await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      });

      // Notify the broadcaster that we are here and want the stream
      socketService.emit('request-join-broadcast', roomId);
    };

    initPC();

    return () => {
      pc.current?.close();
      socketService.off('offer');
      socketService.off('ice-candidate');
    };
  }, [roomId]);

  return (
    <div className="tv-glass-panel" style={{ 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : (showChat ? '1fr 350px' : '1fr'), 
      gridTemplateRows: isMobile && showChat ? '1fr 300px' : 'auto',
      height: isMobile ? 'auto' : 'calc(100vh - 200px)',
      minHeight: isMobile ? '80vh' : 'auto',
      overflow: 'hidden'
    }}>
      {/* Video Content */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: isMobile ? '12px' : '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 'bold' }}>{title}</Text>
          <Space>
            <Button 
                icon={<MessageOutlined />} 
                onClick={() => setShowChat(!showChat)} 
                type={showChat ? "primary" : "default"}
                ghost={!showChat}
                size={isMobile ? "small" : "middle"}
            />
          </Space>
        </div>

        <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000' }}>
          {remoteStream ? (
            <video ref={videoRef} autoPlay playsInline style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }} />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <Spin size="large" />
              <div style={{ marginTop: 20 }}>
                <Text style={{ color: 'rgba(255,255,255,0.45)' }}>Connecting to broadcast...</Text>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div style={{ 
          height: isMobile ? '300px' : 'auto',
          borderLeft: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
          borderTop: isMobile ? '1px solid rgba(255,255,255,0.1)' : 'none',
          overflow: 'hidden'
        }}>
          <RoomChat roomId={roomId} userName={user?.name || "Viewer"} />
        </div>
      )}
    </div>
  );
};

export default LiveViewerContainer;
