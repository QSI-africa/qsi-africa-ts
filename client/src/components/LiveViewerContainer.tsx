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
        console.log('[Viewer] Received remote track:', event.track.kind);
        setRemoteStream(event.streams[0]);
        if (videoRef.current) videoRef.current.srcObject = event.streams[0];
      };

      pc.current.onicecandidate = (event) => {
        if (event.candidate && broadcasterId.current) {
          console.log('[Viewer] Sending ICE candidate to broadcaster');
          socketService.emit('ice-candidate', { targetUserId: broadcasterId.current, candidate: event.candidate, roomId });
        }
      };

      const candidateQueue: RTCIceCandidate[] = [];

      socketService.on('offer', async ({ offer, senderUserId }) => {
        console.log('[Viewer] Received offer from broadcaster:', senderUserId);
        if (pc.current) {
          broadcasterId.current = senderUserId;
          await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.current.createAnswer();
          await pc.current.setLocalDescription(answer);
          console.log('[Viewer] Sending answer back to broadcaster');
          socketService.emit('answer', { targetUserId: senderUserId, answer });
          
          if (candidateQueue.length > 0) {
            console.log(`[Viewer] Processing ${candidateQueue.length} buffered candidates`);
            while(candidateQueue.length > 0) {
              const cand = candidateQueue.shift();
              if (cand) await pc.current.addIceCandidate(cand);
            }
          }
        }
      });

      socketService.on('ice-candidate', async ({ candidate }) => {
        if (pc.current) {
          const iceCand = new RTCIceCandidate(candidate);
          if (pc.current.remoteDescription) {
            await pc.current.addIceCandidate(iceCand);
          } else {
            console.log('[Viewer] Buffering incoming ICE candidate (no remote description yet)');
            candidateQueue.push(iceCand);
          }
        }
      });

      socketService.on('broadcast-ended', ({ roomId: endedRoomId }) => {
        if (endedRoomId === roomId) {
          console.log('[Viewer] Broadcast has ended');
          onClose();
        }
      });

      // Notify the broadcaster that we are here and want the stream
      console.log('[Viewer] Requesting join for broadcast:', roomId);
      socketService.emit('request-join-broadcast', roomId);
    };

    initPC();

    const retryInterval = setInterval(() => {
      if (!remoteStream && pc.current) {
        console.log('[Viewer] Retrying join request...');
        socketService.emit('request-join-broadcast', roomId);
      }
    }, 3000);

    return () => {
      pc.current?.close();
      clearInterval(retryInterval);
      socketService.off('offer');
      socketService.off('ice-candidate');
      socketService.off('broadcast-ended');
    };
  }, [roomId]);

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : (showChat ? '1fr 400px' : '1fr'), 
      gridTemplateRows: isMobile && showChat ? '1fr 350px' : 'auto',
      height: '100%',
      minHeight: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 180px)',
      background: 'var(--canvas-white)',
      overflow: 'hidden'
    }}>
      {/* Video Content */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: isMobile ? '12px' : '20px 24px', borderBottom: '2px solid var(--onyx-black)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--papyrus-off-white)' }}>
          <Text style={{ color: 'var(--onyx-black)', fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 900, textTransform: 'uppercase', fontFamily: 'var(--font-accent)' }}>{title}</Text>
          <Space>
            <AfroButton 
                icon={<MessageOutlined />} 
                onClick={() => setShowChat(!showChat)} 
                primary={showChat}
                size={isMobile ? "small" : "middle"}
                style={{ height: '40px', padding: '0 16px' }}
            >
              {showChat ? 'HIDE CHAT' : 'SHOW CHAT'}
            </AfroButton>
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
