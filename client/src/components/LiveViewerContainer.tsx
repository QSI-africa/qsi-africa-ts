// client/src/components/LiveViewerContainer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, X, Signal } from 'lucide-react';
import { socketService } from '../services/socket';
import RoomChat from './RoomChat';
import { useAuth } from '../context/AuthContext';

const GREEN = '#10B981';

interface LiveViewerProps {
  roomId: string;
  title: string;
  onClose: () => void;
}

const LiveViewerContainer: React.FC<LiveViewerProps> = ({ roomId, title, onClose }) => {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [connecting, setConnecting] = useState(true);
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

  // ─── Clean close: stop peer, remove listeners ──────────────────────────────
  const handleClose = () => {
    pc.current?.close();
    pc.current = null;
    socketService.off('offer');
    socketService.off('ice-candidate');
    socketService.off('broadcast-ended');
    onClose();
  };

  useEffect(() => {
    const initPC = async () => {
      pc.current = new RTCPeerConnection(servers);

      pc.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        setConnecting(false);
        if (videoRef.current) videoRef.current.srcObject = event.streams[0];
      };

      pc.current.onicecandidate = (event) => {
        if (event.candidate && broadcasterId.current) {
          socketService.emit('ice-candidate', { targetUserId: broadcasterId.current, candidate: event.candidate, roomId });
        }
      };

      const candidateQueue: RTCIceCandidate[] = [];

      socketService.on('offer', async ({ offer, senderUserId }) => {
        if (pc.current) {
          broadcasterId.current = senderUserId;
          await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.current.createAnswer();
          await pc.current.setLocalDescription(answer);
          socketService.emit('answer', { targetUserId: senderUserId, answer });
          while (candidateQueue.length > 0) {
            const cand = candidateQueue.shift();
            if (cand) await pc.current.addIceCandidate(cand);
          }
        }
      });

      socketService.on('ice-candidate', async ({ candidate }) => {
        if (pc.current) {
          const iceCand = new RTCIceCandidate(candidate);
          if (pc.current.remoteDescription) {
            await pc.current.addIceCandidate(iceCand);
          } else {
            candidateQueue.push(iceCand);
          }
        }
      });

      socketService.on('broadcast-ended', ({ roomId: endedRoomId }) => {
        if (endedRoomId === roomId) handleClose();
      });

      socketService.emit('request-join-broadcast', roomId);
    };

    initPC();

    const retryInterval = setInterval(() => {
      if (!remoteStream && pc.current) {
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
      gridTemplateColumns: !isMobile && showChat ? '1fr 340px' : '1fr',
      height: '100%',
      background: '#0a1018',
      overflow: 'hidden'
    }}>
      {/* ── Video Area ── */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

        {/* Viewer HUD */}
        <div style={{
          position: 'absolute', top: '16px', left: '16px', right: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 10, pointerEvents: 'none'
        }}>
          {/* Title & Live badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)',
            padding: '8px 14px', borderRadius: '12px', pointerEvents: 'auto'
          }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 6px #EF4444', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live</span>
            <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.2)' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{title}</span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
            <button
              onClick={() => setShowChat(!showChat)}
              style={{
                width: '40px', height: '40px', borderRadius: '12px', border: 'none',
                background: showChat ? `${GREEN}20` : 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(12px)',
                color: showChat ? GREEN : 'rgba(255,255,255,0.7)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <MessageSquare size={16} />
            </button>
            <button
              onClick={handleClose}
              style={{
                width: '40px', height: '40px', borderRadius: '12px', border: 'none',
                background: 'rgba(239,68,68,0.15)', backdropFilter: 'blur(12px)',
                color: '#EF4444', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Video / Connecting State */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
          {remoteStream ? (
            <video
              ref={videoRef} autoPlay playsInline
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                border: `2px solid ${GREEN}25`, borderTop: `2px solid ${GREEN}`,
                animation: 'spin 1s linear infinite'
              }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                  Connecting to broadcast...
                </p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
                  Establishing a secure feed
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Chat Sidebar ── */}
      {showChat && !isMobile && (
        <div style={{
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <MessageSquare size={15} color={GREEN} />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Live Chat
            </span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <RoomChat roomId={roomId} userName={user?.name || 'Viewer'} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
};

export default LiveViewerContainer;
