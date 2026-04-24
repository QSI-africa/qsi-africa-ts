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

  const servers = {
    iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }],
  };

  useEffect(() => {
    const initPC = async () => {
      pc.current = new RTCPeerConnection(servers);

      pc.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (videoRef.current) videoRef.current.srcObject = event.streams[0];
      };

      pc.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketService.emit('ice-candidate', { targetUserId: 'broadcaster', candidate: event.candidate, roomId });
        }
      };

      socketService.on('offer', async ({ offer, senderUserId }) => {
        if (pc.current) {
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
      gridTemplateColumns: showChat ? '1fr 350px' : '1fr', 
      height: 'calc(100vh - 200px)',
      overflow: 'hidden'
    }}>
      {/* Video Content */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>{title}</Text>
          <Space>
            <Button 
                icon={<MessageOutlined />} 
                onClick={() => setShowChat(!showChat)} 
                type={showChat ? "primary" : "default"}
                ghost={!showChat}
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
        <RoomChat roomId={roomId} userName={user?.name || "Viewer"} />
      )}
    </div>
  );
};

export default LiveViewerContainer;
