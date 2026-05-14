// client/src/components/VideoCallContainer.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  MessageSquare, Link2, PhoneOff, Users
} from 'lucide-react';
import { App } from 'antd';
import { socketService } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import RoomChat from './RoomChat';

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
  const { user } = useAuth();
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

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const servers = {
    iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }],
  };

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
    socketService.off('user-connected');
    socketService.off('offer');
    socketService.off('answer');
    socketService.off('ice-candidate');
    socketService.off('user-disconnected');

    onLeave();
  };

  useEffect(() => {
    const startCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        streamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        socketService.on('user-connected', async ({ socketId }) => {
          const pc = createPeerConnection(socketId, stream);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketService.emit('offer', { targetUserId: socketId, offer });
        });

        socketService.on('offer', async ({ offer, senderUserId }) => {
          const pc = createPeerConnection(senderUserId, stream);
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketService.emit('answer', { targetUserId: senderUserId, answer });
        });

        const pendingCandidates = new Map<string, RTCIceCandidate[]>();

        socketService.on('answer', async ({ answer, senderUserId }) => {
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

        socketService.on('ice-candidate', async ({ candidate, senderUserId }) => {
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
            setRemoteParticipants(prev => prev.filter(p => p.socketId !== socketId));
          }
        });

        socketService.emit('join-room', roomId, user?.name || 'Guest-' + Math.random().toString(36).substring(7));
      } catch (err) {
        console.error('Error starting call:', err);
      }
    };

    startCall();

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      peerConnections.current.forEach(pc => pc.close());
      socketService.off('user-connected');
      socketService.off('offer');
      socketService.off('answer');
      socketService.off('ice-candidate');
      socketService.off('user-disconnected');
    };
  }, [roomId]);

  const createPeerConnection = (targetSocketId: string, stream: MediaStream) => {
    const pc = new RTCPeerConnection(servers);
    peerConnections.current.set(targetSocketId, pc);
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    pc.ontrack = (event) => {
      setRemoteParticipants(prev => {
        if (prev.find(p => p.socketId === targetSocketId)) return prev;
        return [...prev, { socketId: targetSocketId, stream: event.streams[0] }];
      });
    };
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.emit('ice-candidate', { targetUserId: targetSocketId, candidate: event.candidate });
      }
    };
    return pc;
  };

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
    <div style={{
      display: 'grid',
      gridTemplateColumns: !isMobile && showChat ? '1fr 340px' : '1fr',
      height: '100%',
      background: '#0a1018',
      overflow: 'hidden'
    }}>
      {/* ── Video Area ── */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '20px', gap: '16px', overflow: 'hidden' }}>

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
          overflow: 'hidden'
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
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

      {/* ── Chat Sidebar ── */}
      {showChat && !isMobile && (
        <div style={{
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <MessageSquare size={15} color={GREEN} />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Chat
            </span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <RoomChat roomId={roomId} userName={user?.name || 'Participant'} />
          </div>
        </div>
      )}
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
