/* global RTCConfiguration */
// client/src/components/LiveBroadcastContainer.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  MessageSquare, Eye, Lock, Globe, Link2, Maximize, Minimize, PhoneOff, MoreVertical
} from 'lucide-react';
import { App, Drawer, Dropdown } from 'antd';
import { socketService } from '../services/socket';
import RoomChat from './RoomChat';
import { getIceConfiguration, toRtcConfiguration } from '../services/webrtc';
import { useAuth } from '../context/AuthContext';

const GREEN = '#008751';

interface LiveBroadcastProps {
  onStop: () => void;
  title: string;
  isPrivate: boolean;
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

const LiveBroadcastContainer: React.FC<LiveBroadcastProps> = ({ onStop, title, isPrivate }) => {
  const { message, modal } = App.useApp();
  const auth = useAuth();
  const user = auth?.user;
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [relayConfigured, setRelayConfigured] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<'preparing' | 'live' | 'reconnecting' | 'failed'>('preparing');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const roomId = useRef(`live-${window.crypto.randomUUID()}`);
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

  useEffect(() => {
    if (localStream && videoRef.current) {
      videoRef.current.srcObject = localStream;
      videoRef.current.play().catch(e => console.warn("Video play failed", e));
    }
  }, [localStream]);

  const serversRef = useRef<RTCConfiguration>({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10,
  });

  // ─── Clean stop: kill all tracks, close all peers ─────────────────────────
  const detachLocalPreview = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  };

  const handleStopBroadcast = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setLocalStream(null);
    detachLocalPreview();

    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();

    socketService.emit('stop-broadcast', roomId.current);
    // socket listeners will be cleaned up by useEffect return function

    onStop();
  };

  const requestStopBroadcast = () => {
    modal.confirm({
      title: 'End live broadcast?',
      content: 'The stream will close immediately for every viewer.',
      okText: 'End Broadcast',
      cancelText: 'Keep Broadcasting',
      okButtonProps: { danger: true },
      onOk: handleStopBroadcast,
    });
  };

  useEffect(() => {
    const handlers: any = {};
    const startBroadcasting = async () => {
      try {
        const iceConfiguration = await getIceConfiguration();
        serversRef.current = toRtcConfiguration(iceConfiguration);
        setRelayConfigured(iceConfiguration.relayConfigured);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera/microphone access is not supported by your browser or requires a secure origin (HTTPS or localhost).');
        }

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true });
        } catch (mediaErr) {
          console.warn('Initial getUserMedia failed, attempting device-specific fallbacks...', mediaErr);
          try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasVideo = devices.some(d => d.kind === 'videoinput');
            const hasAudio = devices.some(d => d.kind === 'audioinput');

            if (hasVideo || hasAudio) {
              stream = await navigator.mediaDevices.getUserMedia({
                video: hasVideo ? { facingMode: 'user' } : false,
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
        if (videoRef.current) videoRef.current.srcObject = stream;

        // Sync local states based on acquired tracks
        const hasVideoTrack = stream.getVideoTracks().length > 0;
        const hasAudioTrack = stream.getAudioTracks().length > 0;
        setIsVideoOff(!hasVideoTrack || !stream.getVideoTracks()[0].enabled);
        setIsMuted(!hasAudioTrack || !stream.getAudioTracks()[0].enabled);

        await socketService.waitForConnection();

        // Setup error handler first
        handlers.onBroadcastError = ({ message: errMsg }: any) => {
          message.error(errMsg || 'Failed to start broadcast');
          handleStopBroadcast();
        };
        socketService.on('broadcast-error', handlers.onBroadcastError);

        socketService.emit('start-broadcast', roomId.current, { title, isPrivate });
        setBroadcastStatus('live');

        handlers.onViewerJoined = async ({ viewerId }: any) => {
          if (peerConnections.current.has(viewerId)) {
            peerConnections.current.get(viewerId)?.close();
          } else {
            setViewerCount(prev => prev + 1);
          }
          const pc = new RTCPeerConnection(serversRef.current);
          peerConnections.current.set(viewerId, pc);
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socketService.emit('ice-candidate', { targetUserId: viewerId, candidate: event.candidate });
            }
          };
          pc.oniceconnectionstatechange = async () => {
            if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
              setBroadcastStatus('live');
            } else if (pc.iceConnectionState === 'disconnected') {
              setBroadcastStatus('reconnecting');
            }
            if (pc.iceConnectionState === 'failed') {
              setBroadcastStatus('reconnecting');
              try {
                const restartOffer = await pc.createOffer({ iceRestart: true });
                await pc.setLocalDescription(restartOffer);
                socketService.emit('offer', { targetUserId: viewerId, offer: restartOffer });
              } catch (error) {
                console.error(`ICE restart failed for viewer ${viewerId}`, error);
                setBroadcastStatus('failed');
              }
            }
          };
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketService.emit('offer', { targetUserId: viewerId, offer });
        };
        socketService.on('viewer-joined', handlers.onViewerJoined);

        const pendingCandidates = new Map<string, RTCIceCandidate[]>();

        handlers.onAnswer = async ({ senderUserId, answer }: any) => {
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

        handlers.onIceCandidate = async ({ senderUserId, candidate }: any) => {
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
            setViewerCount(prev => Math.max(0, prev - 1));
          }
        };
        socketService.on('user-disconnected', handlers.onUserDisconnected);

      } catch (err: any) {
        console.error('Broadcast error:', err);
        setBroadcastStatus('failed');
        message.error(err.message || 'Could not access media devices for broadcasting.');
        onStop();
      }
    };

    startBroadcasting();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      peerConnections.current.forEach(pc => pc.close());
      detachLocalPreview();
      socketService.emit('stop-broadcast', roomId.current);

      if (handlers.onViewerJoined) socketService.off('viewer-joined', handlers.onViewerJoined);
      if (handlers.onAnswer) socketService.off('answer', handlers.onAnswer);
      if (handlers.onIceCandidate) socketService.off('ice-candidate', handlers.onIceCandidate);
      if (handlers.onUserDisconnected) socketService.off('user-disconnected', handlers.onUserDisconnected);
      if (handlers.onBroadcastError) socketService.off('broadcast-error', handlers.onBroadcastError);
    };
  }, [title, isPrivate]);

  // Toggle audio track
  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video track
  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Share screen implementation
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        if (streamRef.current && screenTrack) {
          const localVideoTrack = streamRef.current.getVideoTracks()[0];
          if (localVideoTrack) {
            streamRef.current.removeTrack(localVideoTrack);
            localVideoTrack.stop();
          }
          streamRef.current.addTrack(screenTrack);
          if (videoRef.current) videoRef.current.srcObject = streamRef.current;

          // Replace track in all peer connections
          peerConnections.current.forEach(pc => {
            const sender = pc.getSenders().find(s => s.track?.kind === 'video');
            if (sender) sender.replaceTrack(screenTrack);
          });

          screenTrack.onended = () => {
            stopScreenShare();
          };
          setIsScreenSharing(true);
        }
      } else {
        await stopScreenShare();
      }
    } catch (err: any) {
      console.error('Screen sharing error:', err);
    }
  };

  const stopScreenShare = async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const cameraTrack = cameraStream.getVideoTracks()[0];

      if (streamRef.current && cameraTrack) {
        const screenTrack = streamRef.current.getVideoTracks()[0];
        if (screenTrack) {
          streamRef.current.removeTrack(screenTrack);
          screenTrack.stop();
        }
        streamRef.current.addTrack(cameraTrack);
        if (videoRef.current) videoRef.current.srcObject = streamRef.current;

        // Replace track in all peer connections
        peerConnections.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(cameraTrack);
        });
        setIsScreenSharing(false);
      }
    } catch (err: any) {
      console.error('Failed to restore camera track:', err);
    }
  };

  const copyViewerLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/tv?view=${roomId.current}`);
    message.success('Viewer link copied to clipboard!');
  };

  const [layoutMode, setLayoutMode] = useState<'host' | 'split' | '4grid'>('host');

  return (
    <div ref={containerRef} style={{
      display: 'grid',
      gridTemplateColumns: !isMobile && showChat ? '1fr 340px' : '1fr',
      height: '100%',
      background: '#070c14',
      overflow: 'hidden'
    }}>
      {/* --- Main Broadcasting Screen Area --- */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {/* Broadcaster HUD */}
        <div style={{
          position: 'absolute', top: '16px', left: '16px', right: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 10, pointerEvents: 'none'
        }}>
          {/* Metadata Badges & Relocated Exit Button */}
          <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto', alignItems: 'center' }}>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)',
              padding: '6px 12px', borderRadius: '10px'
            }}>
              {isPrivate ? <Lock size={12} color="#F59E0B" /> : <Globe size={12} color={GREEN} />}
              <span style={{ fontSize: '10px', fontWeight: 800, color: isPrivate ? '#F59E0B' : '#FFF', textTransform: 'uppercase' }}>
                {isPrivate ? 'SUBSCRIBERS ONLY' : 'PUBLIC'}
              </span>
            </div>
            
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)',
              padding: '6px 12px', borderRadius: '10px'
            }}>
              <Eye size={12} color="rgba(255,255,255,0.6)" />
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'white' }}>
                {viewerCount}
              </span>
            </div>
            <span className={`panx-connection-badge ${broadcastStatus}`}>{broadcastStatus}</span>
            <span className={`panx-relay-badge ${relayConfigured ? 'ready' : 'missing'}`}>
              {relayConfigured ? 'Relay Ready' : 'Direct Network'}
            </span>
          </div>

          {/* Broadcast Title HUD */}
          <div style={{
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)',
            padding: '6px 12px', borderRadius: '10px', color: 'white',
            fontSize: '11px', fontWeight: 700, pointerEvents: 'auto'
          }}>
            {title}
          </div>
        </div>

        {/* Local Stream Canvas */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
          {localStream ? (
            <div style={{
              width: '100%', height: '100%', position: 'relative',
              display: 'grid',
              gridTemplateColumns: layoutMode === 'split' ? '1fr 1fr' : layoutMode === '4grid' ? '1fr 1fr' : '1fr',
              gridTemplateRows: layoutMode === '4grid' ? '1fr 1fr' : '1fr',
              gap: '4px', padding: '4px'
            }}>
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <video
                  ref={videoRef} autoPlay muted playsInline
                  style={{
                    width: '100%', height: '100%', objectFit: isMobile ? 'cover' : 'contain', display: 'block',
                    transform: 'scaleX(-1)'
                  }}
                />
                <span style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800 }}>
                  Host: {user?.name || 'Broadcaster'}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                border: `2px solid ${GREEN}25`, borderTop: `2px solid ${GREEN}`,
                animation: 'spin 1s linear infinite'
              }} />
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Initializing Feed...
              </span>
            </div>
          )}

          {/* Video Off Overlay */}
          {isVideoOff && (
            <div style={{
              position: 'absolute', inset: 0, background: '#070c14',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px'
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)'
              }}>
                <VideoOff size={24} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>Camera is paused</span>
            </div>
          )}
        </div>

        {/* Media Controller dock */}
        <div style={{
          padding: isMobile ? '16px' : '20px 24px',
          background: 'linear-gradient(to top, rgba(7,12,20,1) 0%, rgba(7,12,20,0.8) 80%, rgba(7,12,20,0) 100%)',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: isMobile ? '8px' : '12px', zIndex: 10, flexShrink: 0
        }}>
          <ControlBtn onClick={toggleMute} active={!isMuted} danger={isMuted} title={isMuted ? 'Unmute Mic' : 'Mute Mic'}>
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </ControlBtn>
          
          <ControlBtn onClick={toggleVideo} active={!isVideoOff} danger={isVideoOff} title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}>
            {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
          </ControlBtn>

          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

          <ControlBtn onClick={() => setShowChat(!showChat)} active={showChat} title="Toggle Chat">
            <MessageSquare size={18} />
          </ControlBtn>

          <Dropdown
            menu={{
              items: [
                {
                  key: 'share',
                  icon: isScreenSharing ? <MonitorOff size={16} /> : <Monitor size={16} />,
                  label: isScreenSharing ? 'Stop Screen Share' : 'Share Screen',
                  onClick: toggleScreenShare
                },
                {
                  key: 'layout',
                  label: `Grid: ${layoutMode.toUpperCase()}`,
                  onClick: () => setLayoutMode(layoutMode === 'host' ? 'split' : layoutMode === 'split' ? '4grid' : 'host')
                },
                {
                  key: 'fullscreen',
                  icon: isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />,
                  label: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen',
                  onClick: toggleFullscreen
                },
                {
                  key: 'copyLink',
                  icon: <Link2 size={16} />,
                  label: 'Copy Viewer Link',
                  onClick: copyViewerLink
                }
              ]
            }}
            placement="topRight"
            trigger={['click']}
          >
            <ControlBtn title="More Options">
              <MoreVertical size={18} />
            </ControlBtn>
          </Dropdown>

          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

          {/* End Broadcast */}
          <button
            onClick={requestStopBroadcast}
            title="End Broadcast"
            style={{
              height: '52px', padding: '0 24px', borderRadius: '16px', border: 'none',
              background: '#EF4444', color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '12px', fontWeight: 800, letterSpacing: '0.05em',
              boxShadow: '0 8px 20px -5px rgba(239,68,68,0.5)',
              transition: 'all 0.2s'
            }}
          >
            <PhoneOff size={18} /> End Broadcast
          </button>
        </div>

      </div>

      {/* --- Chat Sidebar Panel (Desktop) --- */}
      {showChat && !isMobile && (
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
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'white', textTransform: 'none', letterSpacing: '0.05em' }}>
                PanX Live Chat
              </span>
            </div>
            <button onClick={() => setShowChat(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
              ✕
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <RoomChat roomId={roomId.current} userName="Broadcaster" showHeader={false} />
          </div>
        </div>
      )}

      {/* ── Chat Drawer (Mobile) ── */}
      <Drawer
        title={<span style={{ color: 'white', fontWeight: 800, fontSize: '12px' }}>PanX Live Chat</span>}
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
        <RoomChat roomId={roomId.current} userName="Broadcaster" showHeader={false} />
      </Drawer>
      
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default LiveBroadcastContainer;
