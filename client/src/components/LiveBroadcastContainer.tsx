// client/src/components/LiveBroadcastContainer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, Typography, Card, Tooltip, Input, Badge, Divider, App } from 'antd';
import { 
  AudioOutlined, AudioMutedOutlined, 
  VideoCameraOutlined, VideoCameraAddOutlined,
  StopOutlined, EyeOutlined, DesktopOutlined,
  MessageOutlined, ShareAltOutlined
} from '@ant-design/icons';
import { socketService } from '../services/socket';
import RoomChat from './RoomChat';

const { Title, Text } = Typography;

interface LiveBroadcastProps {
  onStop: () => void;
}

const LiveBroadcastContainer: React.FC<LiveBroadcastProps> = ({ onStop }) => {
  const { message } = App.useApp();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [title, setTitle] = useState("My Live Broadcast");
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

  useEffect(() => {
    const startBroadcasting = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        // Register broadcast on server
        socketService.emit('start-broadcast', roomId.current, { title });

        // Listen for new viewers
      socketService.on('viewer-joined', async ({ viewerId, viewerName }) => {
          console.log(`[Broadcaster] Viewer joined: ${viewerName} (${viewerId})`);
          setViewerCount(prev => prev + 1);
          
          const pc = new RTCPeerConnection(servers);
          peerConnections.current.set(viewerId, pc);

          stream.getTracks().forEach(track => {
            console.log(`[Broadcaster] Adding track: ${track.kind} to viewer: ${viewerId}`);
            pc.addTrack(track, stream);
          });

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              console.log(`[Broadcaster] Sending ICE candidate to: ${viewerId}`);
              socketService.emit('ice-candidate', { targetUserId: viewerId, candidate: event.candidate });
            }
          };

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          console.log(`[Broadcaster] Sending offer to viewer: ${viewerId}`);
          socketService.emit('offer', { targetUserId: viewerId, offer });
        });

        const pendingCandidates = new Map<string, RTCIceCandidate[]>();

        socketService.on('answer', async ({ senderUserId, answer }) => {
          console.log(`[Broadcaster] Received answer from: ${senderUserId}`);
          const pc = peerConnections.current.get(senderUserId);
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            const queue = pendingCandidates.get(senderUserId) || [];
            console.log(`[Broadcaster] Processing ${queue.length} buffered candidates for: ${senderUserId}`);
            while (queue.length > 0) {
              const cand = queue.shift();
              if (cand) await pc.addIceCandidate(cand);
            }
            pendingCandidates.delete(senderUserId);
          }
        });

        socketService.on('ice-candidate', async ({ senderUserId, candidate }) => {
          console.log(`[Broadcaster] Received ICE candidate from: ${senderUserId}`);
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
            console.log(`[Broadcaster] Viewer disconnected: ${socketId}`);
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
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOff;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        // Replace video track for all peer connections
        peerConnections.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        if (videoRef.current) videoRef.current.srcObject = screenStream;
        
        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.error('Screen sharing error:', err);
    }
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
    const shareUrl = `${window.location.origin}/tv?view=${roomId.current}`;
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
      <div style={{ padding: isMobile ? '12px' : '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          marginBottom: 20,
          gap: 12
        }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Stream Title" 
              variant="borderless"
              style={{ color: '#fff', fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 'bold', padding: 0 }}
            />
            <Badge status="processing" text={<Text style={{ color: '#10b981' }}>LIVE</Text>} />
          </Space>
          <Space size="large" style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'space-between' }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)' }}><EyeOutlined /> {viewerCount}</Text>
            <Button type="primary" danger icon={<StopOutlined />} onClick={onStop} size={isMobile ? "small" : "middle"}>Stop</Button>
          </Space>
        </div>

        <div style={{ position: 'relative', flex: 1, borderRadius: '12px', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          
          {/* Controls Overlay */}
          <div style={{ position: 'absolute', bottom: isMobile ? 10 : 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', justifyContent: 'center', width: '90%' }}>
            <div className="control-bar" style={{ padding: '8px', gap: isMobile ? '8px' : '12px' }}>
                <Tooltip title={isMuted ? "Unmute" : "Mute"}>
                <Button shape="circle" size={isMobile ? "middle" : "large"} icon={isMuted ? <AudioMutedOutlined /> : <AudioOutlined />} onClick={toggleMute} danger={isMuted} />
                </Tooltip>
                <Tooltip title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}>
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
            </div>
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
          <RoomChat roomId={roomId.current} userName="Broadcaster" />
        </div>
      )}
    </div>
  );
};

export default LiveBroadcastContainer;
