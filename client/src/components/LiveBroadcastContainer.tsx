// client/src/components/LiveBroadcastContainer.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  MessageSquare, Link2, Radio, Eye, StopCircle
} from 'lucide-react';
import { App } from 'antd';
import { socketService } from '../services/socket';
import RoomChat from './RoomChat';

const GREEN = '#10B981';

interface LiveBroadcastProps {
  onStop: () => void;
}

const ControlBtn: React.FC<{
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, active, danger, title, children }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: '48px', height: '48px', borderRadius: '14px', border: 'none',
      background: danger ? 'rgba(239,68,68,0.15)' : active ? `${GREEN}20` : 'rgba(255,255,255,0.07)',
      color: danger ? '#EF4444' : active ? GREEN : 'rgba(255,255,255,0.7)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.2s',
    }}
  >
    {children}
  </button>
);

const LiveBroadcastContainer: React.FC<LiveBroadcastProps> = ({ onStop }) => {
  const { message } = App.useApp();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [title, setTitle] = useState('My Live Broadcast');
  const [isEditing, setIsEditing] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const roomId = useRef(`live-${Math.random().toString(36).substring(7)}`);
  const isMobile = windowWidth <= 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const servers = {
    iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }],
  };

  // ─── Clean stop: kill all tracks, close all peers ─────────────────────────
  const handleStopBroadcast = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setLocalStream(null);

    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();

    socketService.emit('stop-broadcast', roomId.current);
    socketService.off('viewer-joined');
    socketService.off('answer');
    socketService.off('ice-candidate');
    socketService.off('user-disconnected');

    onStop();
  };

  useEffect(() => {
    const startBroadcasting = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        socketService.emit('start-broadcast', roomId.current, { title });

        socketService.on('viewer-joined', async ({ viewerId }) => {
          setViewerCount(prev => prev + 1);
          const pc = new RTCPeerConnection(servers);
          peerConnections.current.set(viewerId, pc);
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socketService.emit('ice-candidate', { targetUserId: viewerId, candidate: event.candidate });
            }
          };
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketService.emit('offer', { targetUserId: viewerId, offer });
        });

        const pendingCandidates = new Map<string, RTCIceCandidate[]>();

        socketService.on('answer', async ({ senderUserId, answer }) => {
          const pc = peerConnections.current.get(senderUserId);
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            const queue = pendingCandidates.get(senderUserId) || [];
            while (queue.length > 0) {
              const cand = queue.shift();
              if (cand) await pc.addIceCandidate(cand);
            }
            pendingCandidates.delete(senderUserId);
          }
        });

        socketService.on('ice-candidate', async ({ senderUserId, candidate }) => {
          const pc = peerConnections.current.get(senderUserId);
          const iceCand = new RTCIceCandidate(candidate);
          if (pc?.remoteDescription) {
            await pc.addIceCandidate(iceCand);
          } else {
            const queue = pendingCandidates.get(senderUserId) || [];
            queue.push(iceCand);
            pendingCandidates.set(senderUserId, queue);
          }
        });

        socketService.on('user-disconnected', ({ socketId }) => {
          if (peerConnections.current.has(socketId)) {
            peerConnections.current.get(socketId)?.close();
            peerConnections.current.delete(socketId);
            setViewerCount(prev => Math.max(0, prev - 1));
          }
        });

      } catch (err) {
        console.error('Broadcast error:', err);
      }
    };

    startBroadcasting();

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      peerConnections.current.forEach(pc => pc.close());
      socketService.emit('stop-broadcast', roomId.current);
      socketService.off('viewer-joined');
      socketService.off('answer');
      socketService.off('ice-candidate');
    };
  }, []);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const track = localStream.getVideoTracks()[0];
      if (track) { track.enabled = isVideoOff; setIsVideoOff(!isVideoOff); }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        peerConnections.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });
        if (videoRef.current) videoRef.current.srcObject = screenStream;
        screenTrack.onended = () => stopScreenShare();
        setIsScreenSharing(true);
      } else {
        stopScreenShare();
      }
    } catch (err) { console.error('Screen sharing error:', err); }
  };

  const stopScreenShare = () => {
    if (localStream && videoRef.current) {
      const videoTrack = localStream.getVideoTracks()[0];
      peerConnections.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(videoTrack);
      });
      videoRef.current.srcObject = localStream;
      setIsScreenSharing(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/tv?view=${roomId.current}`);
    message.success('Share link copied!');
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: !isMobile && showChat ? '1fr 340px' : '1fr',
      height: '100%',
      background: '#0a1018',
      overflow: 'hidden',
      maxHeight: '100%'
    }}>
      {/* ── Broadcast Area ── */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '12px 16px', gap: '10px', overflow: 'hidden', height: '100%' }}>

        {/* Broadcast Info Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            {/* Live badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
              borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)'
            }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 6px #EF4444', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live</span>
            </div>

            {/* Editable Title */}
            {isEditing ? (
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={() => setIsEditing(false)}
                onKeyDown={e => e.key === 'Enter' && setIsEditing(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: `1px solid ${GREEN}40`,
                  borderRadius: '10px', padding: '6px 14px', color: 'white',
                  fontSize: '14px', fontWeight: 700, outline: 'none', flex: 1
                }}
              />
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: 'none', border: 'none', cursor: 'text',
                  fontSize: '14px', fontWeight: 700, color: 'white'
                }}
              >
                {title}
              </button>
            )}
          </div>

          {/* Viewer Count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
            <Eye size={14} color="rgba(255,255,255,0.5)" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{viewerCount}</span>
          </div>
        </div>

        {/* Video Preview */}
        <div style={{
          flex: 1, minHeight: 0, position: 'relative', borderRadius: '16px', overflow: 'hidden',
          background: '#0d1520', border: `1px solid ${GREEN}20`
        }}>
          <video ref={videoRef} autoPlay playsInline muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

          {/* Corner Indicator */}
          <div style={{
            position: 'absolute', top: '16px', left: '16px',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <Radio size={12} color={GREEN} />
            <span style={{ fontSize: '10px', fontWeight: 800, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Broadcasting</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexShrink: 0 }}>
          <ControlBtn onClick={toggleMute} danger={isMuted} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </ControlBtn>
          <ControlBtn onClick={toggleVideo} danger={isVideoOff} title={isVideoOff ? 'Camera On' : 'Camera Off'}>
            {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
          </ControlBtn>
          {!isMobile && (
            <ControlBtn onClick={toggleScreenShare} active={isScreenSharing} title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}>
              {isScreenSharing ? <MonitorOff size={18} /> : <Monitor size={18} />}
            </ControlBtn>
          )}

          <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

          <ControlBtn onClick={() => setShowChat(!showChat)} active={showChat} title="Toggle Chat">
            <MessageSquare size={18} />
          </ControlBtn>
          <ControlBtn onClick={copyShareLink} title="Copy Share Link">
            <Link2 size={18} />
          </ControlBtn>

          <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

          {/* Stop Broadcast */}
          <button
            onClick={handleStopBroadcast}
            style={{
              height: '48px', padding: '0 22px', borderRadius: '14px',
              background: 'rgba(239,68,68,0.15)', color: '#EF4444', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '12px', fontWeight: 800, letterSpacing: '0.05em',
              border: '1px solid rgba(239,68,68,0.25)', transition: 'all 0.2s'
            }}
          >
            <StopCircle size={16} /> End Broadcast
          </button>
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
            <span style={{
              marginLeft: 'auto', padding: '2px 8px', borderRadius: '6px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              fontSize: '9px', fontWeight: 900, color: '#EF4444'
            }}>Live</span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <RoomChat roomId={roomId.current} userName="Broadcaster" />
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
};

export default LiveBroadcastContainer;
