// client/src/components/LiveBroadcastContainer.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  MessageSquare, Radio, Eye, Lock, Globe, Link2, Maximize, Minimize
} from 'lucide-react';
import { App } from 'antd';
import { socketService } from '../services/socket';
import RoomChat from './RoomChat';

const GREEN = '#10B981';

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
  const { message } = App.useApp();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const roomId = useRef(`live-${Math.random().toString(36).substring(7)}`);
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
    socketService.off('broadcast-error');

    onStop();
  };

  useEffect(() => {
    const startBroadcasting = async () => {
      try {
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

        // Setup error handler first
        socketService.on('broadcast-error', ({ message: errMsg }) => {
          message.error(errMsg || 'Failed to start broadcast');
          handleStopBroadcast();
        });

        socketService.emit('start-broadcast', roomId.current, { title, isPrivate });

        socketService.on('viewer-joined', async ({ viewerId }) => {
          if (peerConnections.current.has(viewerId)) {
            peerConnections.current.get(viewerId)?.close();
          } else {
            setViewerCount(prev => prev + 1);
          }
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

      } catch (err: any) {
        console.error('Broadcast error:', err);
        message.error(err.message || 'Could not access media devices for broadcasting.');
        onStop();
      }
    };

    startBroadcasting();

    return () => {
      // Cleanup events just in case
      socketService.off('viewer-joined');
      socketService.off('answer');
      socketService.off('ice-candidate');
      socketService.off('user-disconnected');
      socketService.off('broadcast-error');
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
    } catch (err) {
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
    } catch (err) {
      console.error('Failed to restore camera track:', err);
    }
  };

  const copyViewerLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/tv?view=${roomId.current}`);
    message.success('Viewer link copied to clipboard!');
  };

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
          {/* Metadata Badges */}
          <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(239,68,68,0.15)', backdropFilter: 'blur(12px)',
              padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)'
            }}>
              <Radio size={14} className="animate-pulse" color="#EF4444" />
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ON AIR
              </span>
            </div>

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
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
          {localStream ? (
            <video
              ref={videoRef} autoPlay muted playsInline
              style={{
                width: '100%', height: '100%', objectFit: 'contain', display: 'block',
                transform: 'scaleX(-1)' // Mirror local stream for natural feel
              }}
            />
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
          padding: '20px 24px', background: 'linear-gradient(to top, rgba(7,12,20,1) 0%, rgba(7,12,20,0.8) 80%, rgba(7,12,20,0) 100%)',
          display: 'flex', justifyContent: 'center', gap: '12px', zIndex: 10
        }}>
          <ControlBtn onClick={toggleMute} active={!isMuted} danger={isMuted} title={isMuted ? 'Unmute Mic' : 'Mute Mic'}>
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </ControlBtn>
          
          <ControlBtn onClick={toggleVideo} active={!isVideoOff} danger={isVideoOff} title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}>
            {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
          </ControlBtn>

          <ControlBtn onClick={toggleScreenShare} active={isScreenSharing} title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}>
            {isScreenSharing ? <MonitorOff size={18} /> : <Monitor size={18} />}
          </ControlBtn>

          <ControlBtn onClick={() => setShowChat(!showChat)} active={showChat} title="Toggle Chat">
            <MessageSquare size={18} />
          </ControlBtn>

          <ControlBtn onClick={toggleFullscreen} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </ControlBtn>

          <ControlBtn onClick={copyViewerLink} title="Copy Viewer Link">
            <Link2 size={18} />
          </ControlBtn>

          <div style={{ width: '1px', height: '48px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />

          <button
            onClick={handleStopBroadcast}
            className="qsi-btn qsi-btn-primary"
            style={{
              padding: '0 24px', height: '48px', borderRadius: '14px',
              background: '#EF4444', border: 'none', color: 'white', fontWeight: 800,
              fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em',
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
            }}
          >
            End Live
          </button>
        </div>

      </div>

      {/* --- Chat Sidebar Panel --- */}
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
              Transmission Chat
            </span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <RoomChat roomId={roomId.current} userName="Broadcaster" />
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default LiveBroadcastContainer;
