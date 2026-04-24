// client/src/components/VideoCallContainer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, Typography, Card, Tooltip, Divider, Badge, App } from 'antd';
import { 
  AudioOutlined, AudioMutedOutlined, 
  VideoCameraOutlined, VideoCameraAddOutlined,
  PhoneOutlined, DesktopOutlined, MessageOutlined,
  UserOutlined, ShareAltOutlined
} from '@ant-design/icons';
import { socketService } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import RoomChat from './RoomChat';

const { Text } = Typography;

interface VideoCallProps {
  roomId: string;
  onLeave: () => void;
}

interface RemoteParticipant {
  socketId: string;
  stream: MediaStream;
}

const VideoCallContainer: React.FC<VideoCallProps> = ({ roomId, onLeave }) => {
  const { message } = App.useApp();
  const { user } = useAuth();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);
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

  useEffect(() => {
    const startCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        streamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        socketService.on('user-connected', async ({ socketId }) => {
           console.log('New participant connected:', socketId);
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
      if (track) {
        track.enabled = isVideoOff;
        setIsVideoOff(!isVideoOff);
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
    } catch (err) {
      console.error('Screen share error:', err);
    }
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
    const shareUrl = `${window.location.origin}/tv?call=${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    message.success('Join link copied to clipboard!');
  };

  return (
    <div className="tv-glass-panel" style={{ 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : (showChat ? '1fr 350px' : '1fr'), 
      gridTemplateRows: isMobile && showChat ? '1fr 300px' : 'auto',
      height: isMobile ? 'auto' : 'calc(100vh - 200px)',
      minHeight: isMobile ? '100vh' : 'auto',
      overflow: 'hidden'
    }}>
      {/* Video Grid */}
      <div style={{ padding: isMobile ? '12px' : '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="video-grid" style={{ flex: 1, overflowY: 'auto' }}>
          {/* Local Participant */}
          <div className="video-participant">
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: isScreenSharing ? 'none' : 'scaleX(-1)' }} />
            <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: 4 }}>
              <Text style={{ color: '#fff', fontSize: '12px' }}>You {isMuted && <Badge status="error" />}</Text>
            </div>
          </div>

          {/* Remote Participants */}
          {remoteParticipants.map(participant => (
            <RemoteVideo key={participant.socketId} stream={participant.stream} socketId={participant.socketId} />
          ))}

          {remoteParticipants.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)' }}>Waiting for others to join...</Text>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: isMobile ? 12 : 20 }}>
          <div className="control-bar" style={{ padding: '8px', gap: isMobile ? '8px' : '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Tooltip title={isMuted ? "Unmute" : "Mute"}>
              <Button shape="circle" size={isMobile ? "middle" : "large"} icon={isMuted ? <AudioMutedOutlined /> : <AudioOutlined />} onClick={toggleMute} danger={isMuted} />
            </Tooltip>
            <Tooltip title={isVideoOff ? "Camera On" : "Camera Off"}>
              <Button shape="circle" size={isMobile ? "middle" : "large"} icon={isVideoOff ? <VideoCameraAddOutlined /> : <VideoCameraOutlined />} onClick={toggleVideo} danger={isVideoOff} />
            </Tooltip>
            {!isMobile && (
              <Tooltip title={isScreenSharing ? "Stop Sharing" : "Share Screen"}>
                <Button shape="circle" size="large" icon={<DesktopOutlined />} onClick={toggleScreenShare} type={isScreenSharing ? "primary" : "default"} />
              </Tooltip>
            )}
            <Divider type="vertical" style={{ height: isMobile ? 24 : 40, borderColor: 'rgba(255,255,255,0.2)' }} />
            <Tooltip title="Toggle Chat">
              <Button shape="circle" size={isMobile ? "middle" : "large"} icon={<MessageOutlined />} onClick={() => setShowChat(!showChat)} type={showChat ? "primary" : "default"} />
            </Tooltip>
            <Tooltip title="Copy Share Link">
              <Button shape="circle" size={isMobile ? "middle" : "large"} icon={<ShareAltOutlined />} onClick={copyShareLink} />
            </Tooltip>
            <Tooltip title="Leave Call">
              <Button shape="circle" size={isMobile ? "middle" : "large"} icon={<PhoneOutlined rotate={225} />} onClick={onLeave} danger type="primary" />
            </Tooltip>
          </div>
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
          <RoomChat roomId={roomId} userName={user?.name || "Participant"} />
        </div>
      )}
    </div>
  );
};

const RemoteVideo = ({ stream, socketId }: { stream: MediaStream, socketId: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="video-participant">
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: 4 }}>
        <Text style={{ color: '#fff', fontSize: '12px' }}>{socketId.substring(0, 5)}...</Text>
      </div>
    </div>
  );
};

export default VideoCallContainer;
