// client/src/components/VideoCallContainer.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  MessageSquare, Link2, PhoneOff, Users, Maximize, Minimize, AlertCircle
} from 'lucide-react';
import { App, Drawer } from 'antd';
import { socketService } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import RoomChat from './RoomChat';
import api from '../api';

const GREEN = '#10B981';

interface VideoCallProps {
  roomId: string;
  onLeave: () => void;
}

interface RemoteParticipant {
  socketId: string;
  stream: MediaStream;
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
      width: '52px', height: '52px', borderRadius: '16px', border: 'none',
      background: danger
        ? 'rgba(239,68,68,0.15)'
        : active
          ? `${GREEN}20`
          : 'rgba(255,255,255,0.07)',
      color: danger ? '#EF4444' : active ? GREEN : 'rgba(255,255,255,0.7)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.2s',
      boxShadow: danger ? '0 0 0 1px rgba(239,68,68,0.2)' : active ? `0 0 0 1px ${GREEN}30` : 'none'
    }}
  >
    {children}
  </button>
);

const VideoCallContainer: React.FC<VideoCallProps> = ({ roomId, onLeave }) => {
  const { message } = App.useApp();
  const auth = useAuth();
  const user = auth?.user;
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const isMobile = windowWidth <= 768;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const [servers, setServers] = useState<RTCConfiguration>({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ],
  });
  const serversRef = useRef(servers);

  useEffect(() => {
    api.get('/ice-config').then(res => {
      if (res.data && res.data.iceServers) {
        setServers(res.data);
        serversRef.current = res.data;
      }
    }).catch(err => console.error("Failed to load ICE servers", err));
  }, []);

  // ─── Clean teardown: stop all tracks + close all peers ────────────────────
  const handleLeaveCall = () => {
    // Stop all local media tracks
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setLocalStream(null);

    // Close all peer connections
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();

    // Leave socket room
    socketService.emit('leave-room', roomId);
    // socket listeners will be cleaned up by useEffect return function

    onLeave();
  };

  useEffect(() => {
    const handlers: any = {};
    const startCall = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera/microphone access is not supported by your browser or requires a secure origin (HTTPS or localhost).');
        }

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (mediaErr) {
          console.warn('Initial getUserMedia failed, attempting device-specific fallbacks...', mediaErr);
          try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasVideo = devices.some(d => d.kind === 'videoinput');
            const hasAudio = devices.some(d => d.kind === 'audioinput');

            if (hasVideo || hasAudio) {
              stream = await navigator.mediaDevices.getUserMedia({
                video: hasVideo,
                audio: hasAudio
              });
            } else {
              throw mediaErr;
            }
          } catch (fallbackErr) {
            throw mediaErr;
          }
        }

        setLocalStream(stream);
        streamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // Sync local states based on acquired tracks
        const hasVideoTrack = stream.getVideoTracks().length > 0;
        const hasAudioTrack = stream.getAudioTracks().length > 0;
        setIsVideoOff(!hasVideoTrack || !stream.getVideoTracks()[0].enabled);
        setIsMuted(!hasAudioTrack || !stream.getAudioTracks()[0].enabled);

        const pendingCandidates = new Map<string, RTCIceCandidate[]>();

        handlers.onUserConnected = async ({ socketId }: any) => {
          const pc = createPeerConnection(socketId, stream);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketService.emit('offer', { targetUserId: socketId, offer });
        };
        socketService.on('user-connected', handlers.onUserConnected);

        handlers.onOffer = async ({ offer, senderUserId }: any) => {
          const pc = createPeerConnection(senderUserId, stream);
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketService.emit('answer', { targetUserId: senderUserId, answer });

          // Drain queued ICE candidates received before the offer was set
          const queue = pendingCandidates.get(senderUserId) || [];
          while (queue.length > 0) {
            const cand = queue.shift();
            if (cand) await pc.addIceCandidate(cand);
          }
          pendingCandidates.delete(senderUserId);
        };
        socketService.on('offer', handlers.onOffer);

        handlers.onAnswer = async ({ answer, senderUserId }: any) => {
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
        };
        socketService.on('answer', handlers.onAnswer);

        handlers.onIceCandidate = async ({ candidate, senderUserId }: any) => {
          const pc = peerConnections.current.get(senderUserId);
          const iceCand = new RTCIceCandidate(candidate);
          if (pc?.remoteDescription) {
            await pc.addIceCandidate(iceCand);
          } else {
            const queue = pendingCandidates.get(senderUserId) || [];
            queue.push(iceCand);
            pendingCandidates.set(senderUserId, queue);
          }
        };
        socketService.on('ice-candidate', handlers.onIceCandidate);

        handlers.onUserDisconnected = ({ socketId }: any) => {
          if (peerConnections.current.has(socketId)) {
            peerConnections.current.get(socketId)?.close();
            peerConnections.current.delete(socketId);
            setRemoteParticipants(prev => prev.filter(p => p.socketId !== socketId));
          }
        };
        socketService.on('user-disconnected', handlers.onUserDisconnected);

        socketService.emit('join-room', roomId, user?.name || 'Guest-' + Math.random().toString(36).substring(7));
      } catch (err: any) {
        console.error('Error starting call:', err);
        message.error(err.message || 'Could not access media devices for the call.');
      }
    };

    startCall();

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      peerConnections.current.forEach(pc => pc.close());
      if (handlers.onUserConnected) socketService.off('user-connected', handlers.onUserConnected);
      if (handlers.onOffer) socketService.off('offer', handlers.onOffer);
      if (handlers.onAnswer) socketService.off('answer', handlers.onAnswer);
      if (handlers.onIceCandidate) socketService.off('ice-candidate', handlers.onIceCandidate);
      if (handlers.onUserDisconnected) socketService.off('user-disconnected', handlers.onUserDisconnected);
    };
  }, [roomId]);

  const createPeerConnection = (targetSocketId: string, stream: MediaStream) => {
    const pc = new RTCPeerConnection(serversRef.current);
    peerConnections.current.set(targetSocketId, pc);
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    pc.ontrack = (event) => {
      setRemoteParticipants(prev => {
        if (prev.find(p => p.socketId === targetSocketId)) return prev;
        return [...prev, { socketId: targetSocketId, stream: event.streams[0], iceState: pc.iceConnectionState }];
      });
    };
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.emit('ice-candidate', { targetUserId: targetSocketId, candidate: event.candidate });
      }
    };
    pc.oniceconnectionstatechange = () => {
      setRemoteParticipants(prev => 
        prev.map(p => p.socketId === targetSocketId ? { ...p, iceState: pc.iceConnectionState } : p)
      );
      if (pc.iceConnectionState === 'failed') {
        console.warn(`ICE connection failed for ${targetSocketId}, attempting restart`);
        pc.restartIce();
      }
    };
    return pc;
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
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
        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
        screenTrack.onended = () => stopScreenShare();
        setIsScreenSharing(true);
      } else {
        stopScreenShare();
      }
    } catch (err) { console.error('Screen share error:', err); }
  };

  const stopScreenShare = () => {
    if (localStream && localVideoRef.current) {
      const videoTrack = localStream.getVideoTracks()[0];
      peerConnections.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(videoTrack);
      });
      localVideoRef.current.srcObject = localStream;
      setIsScreenSharing(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/tv?call=${roomId}`);
    message.success('Join link copied!');
  };

  const allParticipants = remoteParticipants.length + 1;

  return (
    <div ref={containerRef} style={{
      display: 'grid',
      gridTemplateColumns: !isMobile && showChat ? '1fr 340px' : '1fr',
      height: '100%',
      background: '#0a1018',
      overflow: 'hidden'
    }}>
      {/* ── Video Area ── */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: isMobile ? '12px' : '20px', gap: '16px', overflow: 'hidden' }}>

        {/* Session Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} color={GREEN} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
              {allParticipants} participant{allParticipants !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
            {roomId}
          </span>
        </div>

        {/* Video Grid */}
        <div style={{
          flex: 1,
          display: 'grid',
          gap: '12px',
          gridTemplateColumns: remoteParticipants.length === 0 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
          overflowY: 'auto'
        }}>
          {/* Local Video */}
          <div style={{
            position: 'relative', borderRadius: '20px', overflow: 'hidden',
            background: '#0d1520', border: `1px solid ${GREEN}20`,
            minHeight: '200px'
          }}>
            <video
              ref={localVideoRef} autoPlay playsInline muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: isScreenSharing ? 'none' : 'scaleX(-1)' }}
            />
            <div style={{
              position: 'absolute', bottom: '12px', left: '12px',
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
              padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              {isMuted && <MicOff size={10} color="#EF4444" />}
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>You</span>
            </div>
          </div>

          {/* Remote Participants */}
          {remoteParticipants.map(p => (
            <RemoteVideo key={p.socketId} stream={p.stream} socketId={p.socketId} />
          ))}

          {remoteParticipants.length === 0 && (
            <div style={{
              gridColumn: '1 / -1', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '12px',
              background: 'rgba(255,255,255,0.01)', borderRadius: '16px',
              border: '1px dashed rgba(255,255,255,0.06)', padding: '40px'
            }}>
              <Users size={32} color="rgba(255,255,255,0.1)" />
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>
                Waiting for others to join...
              </p>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', flexShrink: 0, paddingBottom: isMobile ? '16px' : '0' }}>
          <ControlBtn onClick={toggleMute} danger={isMuted} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </ControlBtn>
          <ControlBtn onClick={toggleVideo} danger={isVideoOff} title={isVideoOff ? 'Camera On' : 'Camera Off'}>
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </ControlBtn>
          {!isMobile && (
            <ControlBtn onClick={toggleScreenShare} active={isScreenSharing} title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}>
              {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
            </ControlBtn>
          )}

          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

          <ControlBtn onClick={() => setShowChat(!showChat)} active={showChat} title="Toggle Chat">
            <MessageSquare size={20} />
          </ControlBtn>
          <ControlBtn onClick={toggleFullscreen} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </ControlBtn>
          <ControlBtn onClick={copyShareLink} title="Copy Invite Link">
            <Link2 size={20} />
          </ControlBtn>

          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

          {/* End Call */}
          <button
            onClick={handleLeaveCall}
            title="End Call"
            style={{
              height: '52px', padding: '0 24px', borderRadius: '16px', border: 'none',
              background: '#EF4444', color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '12px', fontWeight: 800, letterSpacing: '0.05em',
              boxShadow: '0 8px 20px -5px rgba(239,68,68,0.5)',
              transition: 'all 0.2s'
            }}
          >
            <PhoneOff size={18} /> End Call
          </button>
        </div>
      </div>

      {/* ── Chat Sidebar (Desktop) ── */}
      {showChat && !isMobile && (
        <div style={{
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={15} color={GREEN} />
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Chat
              </span>
            </div>
            <button onClick={() => setShowChat(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
              ✕
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <RoomChat roomId={roomId} userName={user?.name || 'Participant'} />
          </div>
        </div>
      )}

      {/* ── Chat Drawer (Mobile) ── */}
      <Drawer
        title={<span style={{ color: 'white', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '12px' }}>Chat</span>}
        placement="bottom"
        onClose={() => setShowChat(false)}
        open={showChat && isMobile}
        height="80vh"
        styles={{ 
          header: { background: '#0a1018', borderBottom: '1px solid rgba(255,255,255,0.06)' }, 
          body: { padding: 0, background: '#0a1018', overflow: 'hidden' }, 
          mask: { background: 'rgba(0,0,0,0.8)' } 
        }}
        closeIcon={<span style={{ color: 'rgba(255,255,255,0.5)' }}>✕</span>}
      >
        <RoomChat roomId={roomId} userName={user?.name || 'Participant'} />
      </Drawer>
    </div>
  );
};

const RemoteVideo = ({ stream, socketId }: { stream: MediaStream; socketId: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div style={{
      position: 'relative', borderRadius: '20px', overflow: 'hidden',
      background: '#0d1520', border: '1px solid rgba(255,255,255,0.06)',
      minHeight: '200px'
    }}>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{
        position: 'absolute', bottom: '12px', left: '12px',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        padding: '4px 10px', borderRadius: '8px'
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>{socketId.substring(0, 5)}...</span>
      </div>
    </div>
  );
};

export default VideoCallContainer;
