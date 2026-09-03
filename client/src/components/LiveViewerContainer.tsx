/* global RTCConfiguration */
// client/src/components/LiveViewerContainer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, X, Lock, Maximize, Minimize } from 'lucide-react';
import { socketService } from '../services/socket';
import RoomChat from './RoomChat';
import { useAuth } from '../context/AuthContext';
import { Drawer } from 'antd';
import { getIceConfiguration, toRtcConfiguration } from '../services/webrtc';

const GREEN = '#008751';

interface LiveViewerProps {
  roomId: string;
  title: string;
  onClose: () => void;
}

const LiveViewerContainer: React.FC<LiveViewerProps> = ({ roomId, title, onClose }) => {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const user = auth?.user;
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [relayConfigured, setRelayConfigured] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'reconnecting' | 'failed'>('connecting');

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen().catch(console.error);
    } else {
      await document.exitFullscreen().catch(console.error);
    }
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (remoteStream && videoRef.current) {
      remoteStreamRef.current = remoteStream;
      videoRef.current.srcObject = remoteStream;
      videoRef.current.play().catch(e => console.warn("Video play failed", e));
    }
  }, [remoteStream]);

  const isMobile = windowWidth <= 768;
  const serversRef = useRef<RTCConfiguration>({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10,
  });
  const broadcasterId = useRef<string | null>(null);
  const hasReceivedOffer = useRef(false);
  const hasFailed = useRef(false);

  // ─── Clean close: stop peer, remove listeners ──────────────────────────────
  const stopRemotePlayback = () => {
    remoteStreamRef.current?.getTracks().forEach(track => track.stop());
    remoteStreamRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  };

  const handleClose = () => {
    stopRemotePlayback();
    pc.current?.close();
    pc.current = null;
    // socket listeners will be cleaned up by useEffect return function
    onClose();
  };

  useEffect(() => {
    const handlers: any = {};
    const initPC = async () => {
      hasFailed.current = false;
      const iceConfiguration = await getIceConfiguration();
      serversRef.current = toRtcConfiguration(iceConfiguration);
      setRelayConfigured(iceConfiguration.relayConfigured);
      pc.current = new RTCPeerConnection(serversRef.current);

      pc.current.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
        setRemoteStream(event.streams[0]);
        setConnecting(false);
        setConnectionStatus('connected');
        if (videoRef.current) videoRef.current.srcObject = event.streams[0];
      };

      pc.current.onicecandidate = (event) => {
        if (event.candidate && broadcasterId.current) {
          socketService.emit('ice-candidate', { targetUserId: broadcasterId.current, candidate: event.candidate, roomId });
        }
      };

      pc.current.oniceconnectionstatechange = () => {
        const iceState = pc.current?.iceConnectionState;
        if (iceState === 'connected' || iceState === 'completed') {
          setConnectionStatus('connected');
        } else if (iceState === 'disconnected') {
          setConnectionStatus('reconnecting');
        } else if (iceState === 'failed') {
          hasFailed.current = true;
          setConnectionStatus('failed');
          setError('The video connection could not cross the current networks. Please retry after confirming TURN relay configuration.');
          setConnecting(false);
        }
      };

      const candidateQueue: RTCIceCandidate[] = [];

      handlers.onOffer = async ({ offer, senderUserId }: any) => {
        if (pc.current) {
          hasReceivedOffer.current = true;
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
      };
      socketService.on('offer', handlers.onOffer);

      handlers.onIceCandidate = async ({ candidate }: any) => {
        if (pc.current) {
          const iceCand = new RTCIceCandidate(candidate);
          if (pc.current.remoteDescription) {
            await pc.current.addIceCandidate(iceCand);
          } else {
            candidateQueue.push(iceCand);
          }
        }
      };
      socketService.on('ice-candidate', handlers.onIceCandidate);

      handlers.onBroadcastEnded = ({ roomId: endedRoomId }: any) => {
        if (endedRoomId === roomId) handleClose();
      };
      socketService.on('broadcast-ended', handlers.onBroadcastEnded);

      handlers.onJoinError = ({ roomId: errRoomId, message: errMsg }: any) => {
        if (errRoomId === roomId) {
          setError(errMsg);
          hasFailed.current = true;
          setConnectionStatus('failed');
          setConnecting(false);
        }
      };
      socketService.on('join-error', handlers.onJoinError);

      await socketService.waitForConnection();
      socketService.emit('request-join-broadcast', roomId);
    };

    initPC().catch((connectionError) => {
      console.error('Failed to initialize broadcast viewer', connectionError);
      hasFailed.current = true;
      setConnectionStatus('failed');
      setConnecting(false);
      setError(connectionError?.message || 'Could not initialize the video connection.');
    });

    const retryInterval = setInterval(() => {
      if (!remoteStream && pc.current && !hasFailed.current && !hasReceivedOffer.current) {
        socketService.emit('request-join-broadcast', roomId);
      }
    }, 3000);

    return () => {
      stopRemotePlayback();
      pc.current?.close();
      clearInterval(retryInterval);
      socketService.emit('leave-broadcast', roomId);
      if (handlers.onOffer) socketService.off('offer', handlers.onOffer);
      if (handlers.onIceCandidate) socketService.off('ice-candidate', handlers.onIceCandidate);
      if (handlers.onBroadcastEnded) socketService.off('broadcast-ended', handlers.onBroadcastEnded);
      if (handlers.onJoinError) socketService.off('join-error', handlers.onJoinError);
    };
  }, [roomId]);

  return (
    <div ref={containerRef} style={{
      display: 'grid',
      gridTemplateColumns: !isMobile && showChat && !error ? '1fr 340px' : '1fr',
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
            <span className={`panx-connection-badge ${connectionStatus}`}>{connectionStatus}</span>
            <span className={`panx-relay-badge ${relayConfigured ? 'ready' : 'missing'}`}>
              {relayConfigured ? 'Relay Ready' : 'Direct Network'}
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
            <button
              onClick={toggleFullscreen}
              style={{
                width: '40px', height: '40px', borderRadius: '12px', border: 'none',
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
                color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
            {!error && (
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
            )}
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

        {/* Video / Connecting / Error State */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
          {error ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '40px', maxWidth: '400px', textAlign: 'center' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '20px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444'
              }}>
                <Lock size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>Locked Transmission</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                  {error}
                </p>
              </div>
              <button 
                onClick={handleClose}
                className="qsi-btn qsi-btn-outline" 
                style={{ padding: '10px 20px', borderRadius: '12px', cursor: 'pointer' }}
              >
                Return to Frequencies
              </button>
            </div>
          ) : remoteStream ? (
            <video
              ref={videoRef} autoPlay playsInline
              style={{ width: '100%', height: '100%', objectFit: isMobile ? 'cover' : 'contain', display: 'block' }}
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

      {/* ── Chat Sidebar (Desktop) ── */}
      {showChat && !isMobile && !error && (
        <div style={{
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={15} color={GREEN} />
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'white' }}>
                PanX Live Chat
              </span>
            </div>
            <button onClick={() => setShowChat(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
              ✕
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <RoomChat roomId={roomId} userName={user?.name || 'Viewer'} showHeader={false} />
          </div>
        </div>
      )}

      {/* ── Chat Drawer (Mobile) ── */}
      <Drawer
        title={<span style={{ color: 'white', fontWeight: 800, fontSize: '12px' }}>PanX Live Chat</span>}
        placement="bottom"
        onClose={() => setShowChat(false)}
        open={showChat && isMobile && !error}
        height="80vh"
        styles={{ 
          header: { background: '#0a1018', borderBottom: '1px solid rgba(255,255,255,0.06)' }, 
          body: { padding: 0, background: '#0a1018', overflow: 'hidden' }, 
          mask: { background: 'rgba(0,0,0,0.8)' } 
        }}
        closeIcon={<span style={{ color: 'rgba(255,255,255,0.5)' }}>✕</span>}
      >
        <RoomChat roomId={roomId} userName={user?.name || 'Viewer'} showHeader={false} />
      </Drawer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
};

export default LiveViewerContainer;
