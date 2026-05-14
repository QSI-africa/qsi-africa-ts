import React, { useState, useEffect } from 'react';
import {
  Tv,
  Video,
  Play,
  ArrowLeft,
  User,
  Zap,
  Radio,
  Users,
  Signal,
  Plus,
} from 'lucide-react';
import { socketService } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import VideoCallContainer from '../components/VideoCallContainer';
import LiveBroadcastContainer from '../components/LiveBroadcastContainer';
import LiveViewerContainer from '../components/LiveViewerContainer';
import { useSearchParams } from 'react-router-dom';

const GREEN = '#10B981';

const QsiTvPage: React.FC = () => {
  const { token } = useAuth() || { token: null };
  const [searchParams] = useSearchParams();
  const [streams, setStreams] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [activeRoomId, setActiveRoomId] = React.useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = React.useState<boolean>(false);
  const [activeViewerRoom, setActiveViewerRoom] = React.useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    socketService.connect(token || undefined);

    const callRoomId = searchParams.get('call');
    const viewRoomId = searchParams.get('view');

    if (callRoomId) setActiveRoomId(callRoomId);
    else if (viewRoomId) setActiveViewerRoom({ id: viewRoomId, title: 'Connecting...' });

    socketService.on('broadcast-list-updated', (updatedStreams: any[]) => {
      setStreams(updatedStreams);
      setIsLoading(false);
      if (viewRoomId && activeViewerRoom?.title === 'Connecting...') {
        const stream = updatedStreams.find(s => s.roomId === viewRoomId);
        if (stream) setActiveViewerRoom({ id: stream.roomId, title: stream.title });
      }
    });

    socketService.emit('get-active-broadcasts');

    const timer = setTimeout(() => setIsLoading(false), 8000);
    return () => {
      clearTimeout(timer);
      socketService.off('broadcast-list-updated');
    };
  }, [token, searchParams]);

  const handleCreateRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 9);
    setActiveRoomId(roomId);
  };

  const handleLeaveCall = () => setActiveRoomId(null);
  const handleStartBroadcast = () => setIsBroadcasting(true);
  const handleStopBroadcast = () => setIsBroadcasting(false);
  const handleJoinViewer = (stream: any) =>
    setActiveViewerRoom({ id: stream.roomId, title: stream.title });

  // ─── Active Session View ───────────────────────────────────────────────────
  if (activeRoomId || isBroadcasting || activeViewerRoom) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#000' }}>
        {/* Session Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 28px',
          background: 'rgba(10,16,24,0.9)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <button
            onClick={() => { setActiveRoomId(null); setIsBroadcasting(false); setActiveViewerRoom(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
              borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', color: 'white', cursor: 'pointer',
              fontSize: '12px', fontWeight: 700
            }}
          >
            <ArrowLeft size={16} /> Exit
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 8px #EF4444', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              {activeRoomId ? `Session · ${activeRoomId}` : isBroadcasting ? 'Live Transmission' : `Viewing · ${activeViewerRoom?.title}`}
            </span>
          </div>

          <div style={{ width: '80px' }} />
        </div>

        {/* Video Area */}
        <div style={{ flex: 1, position: 'relative', background: '#000' }}>
          {activeRoomId && <VideoCallContainer roomId={activeRoomId} onLeave={handleLeaveCall} />}
          {isBroadcasting && <LiveBroadcastContainer onStop={handleStopBroadcast} />}
          {activeViewerRoom && (
            <LiveViewerContainer
              roomId={activeViewerRoom.id}
              title={activeViewerRoom.title}
              onClose={() => setActiveViewerRoom(null)}
            />
          )}
        </div>
      </div>
    );
  }

  // ─── Main TV View ──────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'transparent' }} className="no-scrollbar">

      {/* Header */}
      <div style={{
        padding: '24px 32px',
        background: 'rgba(10,16,24,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: `${GREEN}18`, border: `1px solid ${GREEN}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN
          }}>
            <Tv size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
              PANX TV
            </h1>
            <p style={{ fontSize: '10px', fontWeight: 700, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8 }}>
              Live Broadcast Network
            </p>
          </div>
        </div>

        <button
          onClick={handleStartBroadcast}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 22px',
            borderRadius: '12px', border: 'none', background: GREEN, color: 'white',
            cursor: 'pointer', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.12em', boxShadow: `0 8px 20px -5px ${GREEN}60`
          }}
        >
          <Radio size={15} /> Go Live
        </button>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Hero Banner */}
        <div style={{
          borderRadius: '24px', overflow: 'hidden', position: 'relative',
          background: `linear-gradient(135deg, ${GREEN}10 0%, rgba(255,255,255,0.01) 100%)`,
          border: `1px solid ${GREEN}20`, marginBottom: '32px', padding: '48px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 50%, rgba(16,185,129,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: '10px', fontWeight: 800, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>
              Sovereign Broadcasting
            </p>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '16px' }}>
              Real-Time Intelligence<br />Across Africa
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '420px' }}>
              Live broadcasts, collaborative sessions, and technical transmissions — all on sovereign African infrastructure.
            </p>
          </div>

          <div style={{ flexShrink: 0, color: GREEN, opacity: 0.08 }}>
            <Tv size={160} />
          </div>
        </div>

        {/* Quick Action Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
          {/* Start Broadcast */}
          <button
            onClick={handleStartBroadcast}
            style={{
              padding: '28px', borderRadius: '20px', border: `1px solid ${GREEN}25`,
              background: `${GREEN}08`, cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.25s', position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${GREEN}14`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${GREEN}08`; }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: `${GREEN}20`, border: `1px solid ${GREEN}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN, marginBottom: '16px'
            }}>
              <Radio size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'white', marginBottom: '6px', letterSpacing: '-0.02em' }}>Go Live</h3>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>Broadcast to your audience in real time</p>
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', color: GREEN, opacity: 0.2 }}>
              <Zap size={40} />
            </div>
          </button>

          {/* Collaborative Session */}
          <button
            onClick={handleCreateRoom}
            style={{
              padding: '28px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.25s', position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = `${GREEN}25`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)';
            }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '16px'
            }}>
              <Video size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'white', marginBottom: '6px', letterSpacing: '-0.02em' }}>New Session</h3>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>Private peer-to-peer encrypted call</p>
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', color: 'white', opacity: 0.05 }}>
              <Users size={40} />
            </div>
          </button>
        </div>

        {/* Live Streams Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Signal size={16} color={GREEN} />
              <h2 style={{ fontSize: '14px', fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>
                Active Transmissions
              </h2>
              {streams.length > 0 && (
                <span style={{
                  padding: '3px 10px', borderRadius: '8px',
                  background: `${GREEN}15`, border: `1px solid ${GREEN}25`,
                  fontSize: '10px', fontWeight: 800, color: GREEN
                }}>
                  {streams.length} Live
                </span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div style={{
              padding: '60px', borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.01)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                border: `2px solid ${GREEN}25`, borderTop: `2px solid ${GREEN}`,
                animation: 'spin 1s linear infinite'
              }} />
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                Scanning Frequencies...
              </span>
            </div>
          ) : streams.length === 0 ? (
            <div style={{
              padding: '60px', borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.01)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '20px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.15)'
              }}>
                <Play size={28} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>No active broadcasts</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Be the first to go live</p>
              </div>
              <button
                onClick={handleStartBroadcast}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                  borderRadius: '12px', border: `1px solid ${GREEN}30`, background: `${GREEN}10`,
                  color: GREEN, cursor: 'pointer', fontSize: '11px', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.1em'
                }}
              >
                <Plus size={14} /> Start Broadcast
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {streams.map((stream, idx) => (
                <button
                  key={idx}
                  onClick={() => handleJoinViewer(stream)}
                  style={{
                    padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.25s', position: 'relative', overflow: 'hidden'
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = `${GREEN}30`;
                    (e.currentTarget as HTMLButtonElement).style.background = `${GREEN}06`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)';
                  }}
                >
                  {/* Live Badge */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px'
                  }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 6px #EF4444' }} />
                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Live</span>
                    <div style={{ flex: 1 }} />
                    <span style={{
                      fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.25)',
                      background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px'
                    }}>
                      {stream.roomId?.substring(0, 6)}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'white', marginBottom: '12px', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                    {stream.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.3)' }}>
                    <User size={12} />
                    <span style={{ fontSize: '10px', fontWeight: 600 }}>{stream.broadcasterId?.substring(0, 10)}...</span>
                  </div>

                  {/* Join CTA */}
                  <div style={{
                    marginTop: '20px', padding: '10px', borderRadius: '12px',
                    background: `${GREEN}10`, border: `1px solid ${GREEN}20`,
                    color: GREEN, fontSize: '11px', fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center'
                  }}>
                    Join Stream
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
};

export default QsiTvPage;
