import React, { useState, useEffect } from 'react';
import {
  Tv,
  Video,
  Play,
  ArrowLeft,
  User,
  Radio,
  Users,
  Signal,
  Plus,
  Lock,
  Globe,
  Upload,
  Shield,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
  Rss
} from 'lucide-react';
import { Tabs, Form, Input, Modal, message, Spin, Select, Radio as AntdRadio, Empty } from 'antd';
import { socketService } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import VideoCallContainer from '../components/VideoCallContainer';
import LiveBroadcastContainer from '../components/LiveBroadcastContainer';
import LiveViewerContainer from '../components/LiveViewerContainer';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import UnifiedHeader from '../components/layout/UnifiedHeader';

const GREEN = '#10B981';

const QsiTvPage: React.FC = () => {
  const { token, user } = useAuth() || { token: null, user: null };
  const [searchParams] = useSearchParams();
  const [streams, setStreams] = useState<any[]>([]);
  const [isLoadingStreams, setIsLoadingStreams] = useState<boolean>(true);
  
  // Navigation & session states
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastTitle, setBroadcastTitle] = useState<string>('');
  const [broadcastIsPrivate, setBroadcastIsPrivate] = useState<boolean>(false);
  const [activeViewerRoom, setActiveViewerRoom] = useState<{ id: string; title: string } | null>(null);

  // Gating & Channel Directory state
  const [channels, setChannels] = useState<any[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState<boolean>(false);
  const [selectedChannel, setSelectedChannel] = useState<any | null>(null);
  const [channelContents, setChannelContents] = useState<any[]>([]);
  const [isLoadingContents, setIsLoadingContents] = useState<boolean>(false);
  const [isSubscribedToSelected, setIsSubscribedToSelected] = useState<boolean>(false);

  // My Channel state
  const [myChannel, setMyChannel] = useState<any | null>(null);
  const [isLoadingMyChannel, setIsLoadingMyChannel] = useState<boolean>(false);
  const [myChannelContents, setMyChannelContents] = useState<any[]>([]);
  
  // Modals & Upload states
  const [isLiveSetupOpen, setIsLiveSetupOpen] = useState<boolean>(false);
  const [isPeerSessionSetupOpen, setIsPeerSessionSetupOpen] = useState<boolean>(false);
  const [isPublishingContent, setIsPublishingContent] = useState<boolean>(false);
  const [isRequestingChannel, setIsRequestingChannel] = useState<boolean>(false);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string>('');
  
  const [requestForm] = Form.useForm();
  const [contentForm] = Form.useForm();
  const [broadcastForm] = Form.useForm();
  const [peerSessionForm] = Form.useForm();

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = windowWidth <= 768;

  // Preview Modal
  const [previewContent, setPreviewContent] = useState<any | null>(null);

  // Socket sync
  useEffect(() => {
    socketService.connect(token || undefined);

    const callRoomId = searchParams.get('call');
    const viewRoomId = searchParams.get('view');

    if (callRoomId) setActiveRoomId(callRoomId);
    else if (viewRoomId) setActiveViewerRoom({ id: viewRoomId, title: 'Connecting...' });

    socketService.on('broadcast-list-updated', (updatedStreams: any[]) => {
      setStreams(updatedStreams);
      setIsLoadingStreams(false);
      if (viewRoomId && activeViewerRoom?.title === 'Connecting...') {
        const stream = updatedStreams.find(s => s.roomId === viewRoomId);
        if (stream) setActiveViewerRoom({ id: stream.roomId, title: stream.title });
      }
    });

    socketService.emit('get-active-broadcasts');

    const timer = setTimeout(() => setIsLoadingStreams(false), 8000);
    return () => {
      clearTimeout(timer);
      socketService.off('broadcast-list-updated');
    };
  }, [token, searchParams]);

  // Initial Fetch for Directory and My Channel
  useEffect(() => {
    const controller = new AbortController();
    fetchChannels(controller.signal);
    fetchMyChannel(controller.signal);
    return () => {
      controller.abort();
    };
  }, [token]);

  // Hide mobile navbar during active session
  useEffect(() => {
    if (activeRoomId || isBroadcasting || activeViewerRoom) {
      document.body.classList.add('hide-mobile-nav');
    } else {
      document.body.classList.remove('hide-mobile-nav');
    }
    return () => document.body.classList.remove('hide-mobile-nav');
  }, [activeRoomId, isBroadcasting, activeViewerRoom]);

  const fetchChannels = async (signal?: AbortSignal) => {
    setIsLoadingChannels(true);
    try {
      const res = await api.get('/tv/channels', { signal });
      setChannels(res.data);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.message?.includes('canceled')) return;
      console.error('Failed to load channels:', err);
    } finally {
      setIsLoadingChannels(false);
    }
  };

  const fetchMyChannel = async (signal?: AbortSignal) => {
    setIsLoadingMyChannel(true);
    try {
      const res = await api.get('/tv/channels/my-channel', { signal });
      setMyChannel(res.data);
      if (res.data && res.data.status === 'APPROVED') {
        fetchMyChannelContents(res.data.id, signal);
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.message?.includes('canceled')) return;
      console.error('Failed to load user channel:', err);
    } finally {
      setIsLoadingMyChannel(false);
    }
  };

  const fetchMyChannelContents = async (channelId: string, signal?: AbortSignal) => {
    try {
      const res = await api.get(`/tv/channels/${channelId}/content`, { signal });
      setMyChannelContents(res.data);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.message?.includes('canceled')) return;
      console.error('Failed to load my channel contents:', err);
    }
  };

  const handleChannelRequestSubmit = async (values: any) => {
    setIsRequestingChannel(true);
    try {
      await api.post('/tv/channels/request', {
        title: values.title,
        description: values.description
      });
      message.success('Channel request submitted for administrative review.');
      requestForm.resetFields();
      fetchMyChannel();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to submit request.');
    } finally {
      setIsRequestingChannel(false);
    }
  };

  const handleStartPeerSessionClick = () => {
    peerSessionForm.setFieldsValue({ title: `${user?.name || 'My'} Peer Session`, isPrivate: 'true' });
    setIsPeerSessionSetupOpen(true);
  };

  const handleCreateRoom = (values: any) => {
    const roomId = Math.random().toString(36).substring(2, 9);
    setActiveRoomId(roomId);
    setIsPeerSessionSetupOpen(false);
  };

  const handleLeaveCall = () => setActiveRoomId(null);
  
  const handleStartBroadcastClick = () => {
    broadcastForm.setFieldsValue({ title: `${user?.name || 'My'}'s Live Transmission`, isPrivate: 'false' });
    setIsLiveSetupOpen(true);
  };

  const handleLaunchBroadcast = (values: any) => {
    setBroadcastTitle(values.title);
    setBroadcastIsPrivate(values.isPrivate === 'true');
    setIsLiveSetupOpen(false);
    setIsBroadcasting(true);
  };

  const handleStopBroadcast = () => {
    setIsBroadcasting(false);
    socketService.emit('get-active-broadcasts');
  };

  const handleJoinViewer = (stream: any) => {
    setActiveViewerRoom({ id: stream.roomId, title: stream.title });
  };

  // Subscribe / Unsubscribe helper
  const toggleSubscription = async (channelId: string, currentSubscribed: boolean) => {
    try {
      if (currentSubscribed) {
        await api.post(`/tv/channels/${channelId}/unsubscribe`);
        message.success('Successfully unsubscribed.');
      } else {
        await api.post(`/tv/channels/${channelId}/subscribe`);
        message.success('Successfully subscribed.');
      }
      
      // Update local states
      fetchChannels();
      if (selectedChannel && selectedChannel.id === channelId) {
        const statusRes = await api.get(`/tv/channels/${channelId}/subscription-status`);
        setIsSubscribedToSelected(statusRes.data.subscribed);
        loadChannelDetails(selectedChannel);
      }
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to complete action.');
    }
  };

  // Load selected channel detail view
  const loadChannelDetails = async (channel: any) => {
    setSelectedChannel(channel);
    setIsLoadingContents(true);
    try {
      // Check subscription status
      const statusRes = await api.get(`/tv/channels/${channel.id}/subscription-status`);
      const isSub = statusRes.data.subscribed;
      setIsSubscribedToSelected(isSub);

      const isOwner = channel.userId === user?.id;

      if (isSub || isOwner) {
        const contentRes = await api.get(`/tv/channels/${channel.id}/content`);
        setChannelContents(contentRes.data);
      } else {
        setChannelContents([]);
      }
    } catch (err: any) {
      console.error('Failed to load channel contents:', err);
    } finally {
      setIsLoadingContents(false);
    }
  };

  // File Upload Helper
  const handleUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('category', 'TV_CONTENT');

    try {
      const res = await api.post('/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedMediaUrl(res.data.document.url);
      message.success('Media file synchronized successfully.');
    } catch (err: any) {
      console.error('Upload failed:', err);
      message.error(err?.response?.data?.error || err?.response?.data?.message || 'File upload failed.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Publish content
  const handlePublishContent = async (values: any) => {
    setIsPublishingContent(true);
    try {
      if (values.mimeType === 'TEXT') {
        await api.post('/tv/channels/my-channel/text-content', {
          title: values.title,
          description: values.description,
          textContent: values.textContent,
          crossPostToPanx: values.crossPostToPanx === 'YES'
        });
      } else {
        await api.post('/tv/channels/my-channel/content', {
          title: values.title,
          description: values.description,
          mediaUrl: uploadedMediaUrl,
          mimeType: values.mimeType
        });
      }
      message.success('Frequency content published successfully.');
      contentForm.resetFields();
      setUploadedMediaUrl('');
      if (myChannel) {
        fetchMyChannelContents(myChannel.id);
      }
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to publish.');
    } finally {
      setIsPublishingContent(false);
    }
  };

  // Delete own content
  const handleDeleteContent = async (contentId: string) => {
    try {
      await api.delete(`/tv/channels/my-channel/content/${contentId}`);
      message.success('Content deleted.');
      if (myChannel) {
        fetchMyChannelContents(myChannel.id);
      }
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to delete content.');
    }
  };

  const getServerUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    try { 
      const origin = new URL(baseURL).origin; 
      return `${origin}${path.startsWith('/') ? '' : '/'}${path}`; 
    } catch { 
      return path; 
    }
  };

  // ─── Active Session View (Live broadcast or peer session or viewer) ────────
  if (activeRoomId || isBroadcasting || activeViewerRoom) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#000' }}>
        {/* Session Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '12px 16px' : '16px 28px',
          background: 'rgba(10,16,24,0.9)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          zIndex: 50
        }}>
          <button
            onClick={() => { setActiveRoomId(null); setIsBroadcasting(false); setActiveViewerRoom(null); }}
            className="qsi-btn qsi-btn-secondary"
            style={{ padding: isMobile ? '8px 12px' : '8px 16px', borderRadius: '10px' }}
          >
            <ArrowLeft size={16} /> {!isMobile && 'Exit'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 8px #EF4444', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              {activeRoomId 
                ? (isMobile ? 'Session' : `Session · ${activeRoomId}`) 
                : isBroadcasting 
                  ? (isMobile ? 'Live' : 'Live Transmission') 
                  : (isMobile ? 'Viewing' : `Viewing · ${activeViewerRoom?.title}`)}
            </span>
          </div>

          <div style={{ width: isMobile ? '32px' : '80px' }} />
        </div>

        {/* Video Area */}
        <div style={{ flex: 1, position: 'relative', background: '#000' }}>
          {activeRoomId && <VideoCallContainer roomId={activeRoomId} onLeave={handleLeaveCall} />}
          {isBroadcasting && (
            <LiveBroadcastContainer
              onStop={handleStopBroadcast}
              title={broadcastTitle}
              isPrivate={broadcastIsPrivate}
            />
          )}
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

  // ─── Render Selected Channel Detail View ──────────────────────────────────
  if (selectedChannel) {
    const isOwner = selectedChannel.userId === user?.id;
    const isSubscribed = isSubscribedToSelected || isOwner;

    return (
      <div className="flex-1 flex flex-col h-full bg-bg-primary overflow-y-auto no-scrollbar">
        {/* Banner/Header */}
        <header className="p-8 lg:p-12 bg-bg-secondary relative overflow-hidden">
          <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <button
              onClick={() => { setSelectedChannel(null); fetchChannels(); }}
              className="qsi-btn qsi-btn-secondary mb-6"
              style={{ padding: '8px 16px', borderRadius: '10px' }}
            >
              <ArrowLeft size={16} /> Back to Channels
            </button>
            <div className="flex items-center justify-between flex-wrap gap-4 mt-4">
              <div>
                <h1 className="text-md lg:text-md font-black text-white uppercase tracking-tight mb-2">
                  {selectedChannel.title}
                </h1>
                <p className="text-xs text-text-tertiary font-bold uppercase tracking-widest flex items-center gap-2">
                  <User size={12} className="text-accent-primary" /> Creator: {selectedChannel.user?.name || 'Agent'}
                </p>
              </div>
              {!isOwner && (
                <button
                  onClick={() => toggleSubscription(selectedChannel.id, isSubscribedToSelected)}
                  className={`qsi-btn ${isSubscribedToSelected ? 'qsi-btn-outline' : 'qsi-btn-primary'}`}
                  style={{ borderRadius: '12px', padding: '12px 24px', fontWeight: 800 }}
                >
                  <Rss size={16} /> {isSubscribedToSelected ? 'Unsubscribe' : 'Subscribe'}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto w-full p-8">
          {!isSubscribed ? (
            <div style={{
              padding: '80px 40px', borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.01)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center'
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '24px',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B'
              }}>
                <Lock size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight mb-2">Locked Frequency</h3>
                <p className="text-text-secondary text-sm max-w-md">
                  This channel's digital archive and technical content are restricted. Subscribe to join their secure live sessions and view uploaded content.
                </p>
              </div>
              <button
                onClick={() => toggleSubscription(selectedChannel.id, false)}
                className="qsi-btn qsi-btn-primary"
                style={{ padding: '12px 28px', borderRadius: '12px', fontWeight: 800 }}
              >
                <Rss size={16} /> Subscribe to Unlock
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                <Signal size={16} className="text-accent-primary" /> Channel Contents
              </h2>
              {isLoadingContents ? (
                <div className="flex justify-center py-20"><Spin /></div>
              ) : channelContents.length === 0 ? (
                <div style={{
                  padding: '60px', borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(255,255,255,0.01)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
                }}>
                  <Empty description={<span className="text-text-tertiary">No uploaded content in this channel yet.</span>} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {channelContents.map((post) => (
                    <div key={post.id} className="feed-card bg-bg-secondary border-border-subtle p-6 flex flex-col justify-between">
                      <div>
                        <span className="eyebrow" style={{ color: GREEN }}>{post.mimeType || 'TRANSMISSION'}</span>
                        <h3 className="text-lg font-bold text-white uppercase tracking-tight mt-2 mb-3">
                          {post.title}
                        </h3>
                        <p className="text-text-secondary text-xs leading-relaxed mb-4">
                          {post.description}
                        </p>
                      </div>

                      {post.mediaUrl && (
                        <div className="mt-4 pt-4 border-t border-border-subtle">
                          {post.mimeType === 'VIDEO' ? (
                            <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setPreviewContent(post); }}>
                              <video
                                src={getServerUrl(post.mediaUrl)}
                                className="w-full rounded-xl border border-border-subtle bg-black"
                                style={{ maxHeight: '200px' }}
                                preload="metadata"
                              />
                            </div>
                          ) : post.mimeType === 'IMAGE' ? (
                            <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setPreviewContent(post); }}>
                              <img
                                src={getServerUrl(post.mediaUrl)}
                                alt={post.title}
                                className="w-full rounded-xl border border-border-subtle object-cover"
                                style={{ maxHeight: '200px' }}
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <a
                              href={getServerUrl(post.mediaUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="qsi-btn qsi-btn-outline w-full text-center"
                              style={{ display: 'block', borderRadius: '8px', padding: '10px' }}
                            >
                              Download Asset
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Main TV Portal View (Tabs Interface) ─────────────────────────────────
  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary">
      {/* Header */}
      <UnifiedHeader
        title={<>PanX <span className="text-accent-primary">TV</span></>}
        extra={
          <div className="flex gap-3">
            <button onClick={handleStartBroadcastClick} className="qsi-button primary flex items-center gap-2 py-3 px-6 text-xs">
              <Radio size={14} /> Go Live
            </button>
            <button onClick={handleStartPeerSessionClick} className="qsi-button flex items-center gap-2 py-3 px-6 text-xs">
              <Video size={14} /> Peer Session
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-8">
        <div className="max-w-5xl mx-auto">
          <Tabs
            defaultActiveKey="live"
            className="custom-tabs"
            onChange={(key) => {
              if (key === 'studio') {
                fetchMyChannel();
              } else if (key === 'directory') {
                fetchChannels();
              }
            }}
            items={[
              // TABS 1: Active Transmissions
              {
                key: 'live',
                label: <span className="flex items-center gap-2 py-2"><Radio size={16} /> Live Transmissions</span>,
                children: (
                  <div className="py-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Signal size={16} color={GREEN} />
                      <h2 className="text-lg font-bold text-white uppercase tracking-tight">Active Channels</h2>
                      {streams.length > 0 && <span className="qsi-tag qsi-tag-primary">{streams.length} Live</span>}
                    </div>

                    {isLoadingStreams ? (
                      <div className="flex justify-center py-20"><Spin /></div>
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
                          <p className="text-white text-base font-bold mb-1">No active broadcasts</p>
                          <p className="text-text-secondary text-xs">Initiate a livestream transmission to start sharing.</p>
                        </div>
                        <button onClick={handleStartBroadcastClick} className="qsi-btn qsi-btn-outline" style={{ padding: '10px 20px', borderRadius: '12px' }}>
                          <Plus size={14} /> Start Broadcast
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {streams.map((stream, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleJoinViewer(stream)}
                            className="feed-card bg-bg-secondary border-border-subtle p-6 flex flex-col justify-between text-left w-full hover:border-accent-primary/30 transition-all cursor-pointer"
                          >
                            <div className="flex items-center justify-between w-full mb-4">
                              <div className="flex items-center gap-2">
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 6px #EF4444' }} />
                                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">LIVE</span>
                              </div>
                              <span className="qsi-tag flex items-center gap-1.5 text-[9px]">
                                {stream.isPrivate ? <Lock size={10} color="#F59E0B" /> : <Globe size={10} color={GREEN} />}
                                {stream.isPrivate ? 'PRIVATE' : 'PUBLIC'}
                              </span>
                            </div>

                            <h3 className="text-white text-lg font-bold uppercase tracking-tight mb-4">
                              {stream.title}
                            </h3>

                            <div className="flex items-center justify-between w-full pt-4 border-t border-border-subtle mt-4 text-xs text-text-tertiary">
                              <span className="flex items-center gap-1"><User size={12} /> {stream.broadcasterName}</span>
                              <span>ID: {stream.roomId?.substring(5, 11).toUpperCase()}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              },

              // TABS 2: Creator Channels Directory
              {
                key: 'directory',
                label: <span className="flex items-center gap-2 py-2"><Users size={16} /> Channels Directory</span>,
                children: (
                  <div className="py-6">
                    <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-6">Approved Creators</h2>
                    
                    {isLoadingChannels ? (
                      <div className="flex justify-center py-20"><Spin /></div>
                    ) : channels.length === 0 ? (
                      <Empty description={<span className="text-text-tertiary">No approved creator channels found.</span>} />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {channels.map((chan) => {
                          const isOwn = chan.userId === user?.id;
                          return (
                            <div key={chan.id} className="feed-card bg-bg-secondary border-border-subtle p-6 flex flex-col justify-between">
                              <div>
                                <h3 className="text-white text-xl font-bold uppercase tracking-tight mb-2 flex items-center justify-between">
                                  {chan.title}
                                  {isOwn && <span className="qsi-tag text-[9px] uppercase tracking-wider bg-accent-primary/10 text-accent-primary border-accent-primary/20">My Channel</span>}
                                </h3>
                                <p className="text-xs text-text-tertiary font-bold mb-4">
                                  Broadcaster: {chan.user?.name || 'Agent'}
                                </p>
                                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                                  {chan.description}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                                <span className="text-xs text-text-tertiary font-bold">
                                  {chan._count?.subscriptions || 0} Subscribers
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => loadChannelDetails(chan)}
                                    className="qsi-btn qsi-btn-secondary text-xs"
                                    style={{ borderRadius: '8px', padding: '6px 12px' }}
                                  >
                                    View Archives
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )
              },

              // TABS 3: My Channel Creator Portal
              {
                key: 'studio',
                label: <span className="flex items-center gap-2 py-2"><User size={16} /> My Channel Studio</span>,
                children: (
                  <div className="py-6">
                    {isLoadingMyChannel ? (
                      <div className="flex justify-center py-20"><Spin /></div>
                    ) : !myChannel ? (
                      // Setup channel request form
                      <div className="feed-card bg-bg-secondary border-border-subtle p-8 max-w-2xl mx-auto">
                        <div className="flex items-center gap-3 mb-4 text-accent-primary">
                          <Shield size={20} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Creator Application</span>
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Request Creator Status</h2>
                        <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                          Request a dedicated broadcast frequency channel. Your application will be forwarded to the sovereign administrators for approval.
                        </p>

                        <Form form={requestForm} layout="vertical" onFinish={handleChannelRequestSubmit} className="space-y-6">
                          <Form.Item name="title" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Channel Title</span>} rules={[{ required: true, message: 'Please enter a title' }]}>
                            <Input className="bg-bg-primary border-border-subtle text-white h-12" placeholder="e.g. Technical Transmissions & Coherence Logs" />
                          </Form.Item>
                          
                          <Form.Item name="description" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Description / Scope</span>} rules={[{ required: true, message: 'Please write a description' }]}>
                            <Input.TextArea className="bg-bg-primary border-border-subtle text-white" rows={4} placeholder="Summarize the core concepts and materials you will share..." />
                          </Form.Item>

                          <button className="qsi-button primary w-full py-4 font-bold flex items-center justify-center gap-2" type="submit" disabled={isRequestingChannel}>
                            {isRequestingChannel ? 'Submitting...' : 'Submit Request'}
                          </button>
                        </Form>
                      </div>
                    ) : myChannel.status === 'PENDING' ? (
                      // Pending message
                      <div className="feed-card bg-bg-secondary border-border-subtle p-8 max-w-xl mx-auto text-center flex flex-col items-center gap-6">
                        <div style={{
                          width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(245,158,11,0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B'
                        }}>
                          <AlertTriangle size={32} />
                        </div>
                        <div className="w-full">
                          <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">Approval Pending</h3>
                          <p className="text-text-secondary text-sm leading-relaxed mb-6">
                            Your creator channel request is currently in the registry queue awaiting administrator approval.
                          </p>
                          <div className="bg-bg-primary border border-border-subtle rounded-xl p-6 text-left w-full">
                            <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-4">Submitted Details</h4>
                            <div className="mb-4">
                              <span className="text-[10px] text-text-tertiary uppercase block mb-1">Channel Title</span>
                              <p className="text-white font-bold">{myChannel.title}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-text-tertiary uppercase block mb-1">Description / Scope</span>
                              <p className="text-text-secondary text-sm">{myChannel.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : myChannel.status === 'REJECTED' ? (
                      // Rejected message
                      <div className="feed-card bg-bg-secondary border-border-subtle p-8 max-w-xl mx-auto text-center flex flex-col items-center gap-6">
                        <div style={{
                          width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444'
                        }}>
                          <X size={32} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">Request Rejected</h3>
                          <p className="text-text-secondary text-sm leading-relaxed mb-6">
                            Your channel request was not approved. You can submit a new request.
                          </p>
                          <button
                            onClick={async () => {
                              try {
                                await api.delete('/tv/channels/my-channel');
                                fetchMyChannel();
                              } catch (err: any) {
                                message.error(err?.response?.data?.error || err?.response?.data?.message || 'Failed to reset request.');
                              }
                            }}
                            className="qsi-btn qsi-btn-primary"
                          >
                            Submit New Request
                          </button>
                        </div>
                      </div>
                    ) : (
                      // APPROVED: Creator Dashboard Studio
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Publish content form */}
                        <div className="lg:col-span-1">
                          <div className="feed-card bg-bg-secondary border-border-subtle p-6">
                            <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                              <Plus size={16} className="text-accent-primary" /> Publish Frequency
                            </h3>

                            <Form form={contentForm} layout="vertical" onFinish={handlePublishContent} className="space-y-4" initialValues={{ mimeType: 'TEXT', crossPostToPanx: 'YES' }}>
                              <Form.Item name="title" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Title</span>} rules={[{ required: true }]}>
                                <Input className="bg-bg-primary border-border-subtle text-white h-10" />
                              </Form.Item>

                              <Form.Item name="description" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Summary</span>}>
                                <Input.TextArea className="bg-bg-primary border-border-subtle text-white" rows={2} />
                              </Form.Item>

                              <Form.Item name="mimeType" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Type</span>} rules={[{ required: true }]}>
                                <Select className="custom-select h-10" onChange={() => setUploadedMediaUrl('')}>
                                  <Select.Option value="TEXT">Text Post</Select.Option>
                                  <Select.Option value="VIDEO">Video File</Select.Option>
                                  <Select.Option value="IMAGE">Image File</Select.Option>
                                  <Select.Option value="DOCUMENT">Document / Link</Select.Option>
                                </Select>
                              </Form.Item>

                              <Form.Item noStyle dependencies={['mimeType']}>
                                {({ getFieldValue }) => {
                                  const type = getFieldValue('mimeType');
                                  if (type === 'TEXT') {
                                    return (
                                      <>
                                        <Form.Item name="textContent" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Post Content</span>} rules={[{ required: true }]}>
                                          <Input.TextArea className="bg-bg-primary border-border-subtle text-white" rows={6} placeholder="What's on your mind?" />
                                        </Form.Item>
                                        <Form.Item name="crossPostToPanx" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Cross-post to PanX Feed</span>}>
                                          <Select className="custom-select h-10">
                                            <Select.Option value="YES">Yes, Share to Ecosystem</Select.Option>
                                            <Select.Option value="NO">No, Channel Only</Select.Option>
                                          </Select>
                                        </Form.Item>
                                      </>
                                    );
                                  }
                                  return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                      <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Upload Media</span>
                                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input
                                          type="file"
                                          id="tv-studio-upload"
                                          onChange={handleUploadMedia}
                                          style={{ display: 'none' }}
                                        />
                                        <label
                                          htmlFor="tv-studio-upload"
                                          className="qsi-btn qsi-btn-secondary"
                                          style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                          <Upload size={14} /> Browse
                                        </label>
                                        {isUploadingFile && <Spin size="small" />}
                                        {uploadedMediaUrl && <span style={{ fontSize: '11px', color: GREEN }}>Uploaded!</span>}
                                      </div>
                                    </div>
                                  );
                                }}
                              </Form.Item>

                              <button
                                className="qsi-button primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 mt-4"
                                type="submit"
                                disabled={isPublishingContent || isUploadingFile}
                              >
                                {isPublishingContent ? 'Publishing...' : 'Publish Content'}
                              </button>
                            </Form>
                          </div>
                        </div>

                        {/* Contents list */}
                        <div className="lg:col-span-2">
                          <div className="feed-card bg-bg-secondary border-border-subtle p-6">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                                <CheckCircle2 size={16} color={GREEN} /> Live Archives
                              </h3>
                              <span className="text-xs text-text-tertiary font-bold">
                                {myChannel._count?.subscriptions || 0} Subscribers
                              </span>
                            </div>

                            {myChannelContents.length === 0 ? (
                              <Empty description={<span className="text-text-tertiary">No uploaded content yet. Use the sidebar to publish.</span>} />
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myChannelContents.map((post) => (
                                  <div key={post.id} className="sidebar-item p-4 flex flex-col justify-between group cursor-pointer" onClick={() => setPreviewContent(post)}>
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-accent-primary uppercase">{post.mimeType}</span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteContent(post.id);
                                          }}
                                          className="p-1.5 text-text-tertiary hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 bg-bg-primary border border-border-subtle hover:border-red-500/30 rounded-md"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                      <h4 className="font-bold text-white text-base mt-2">{post.title}</h4>
                                      <p className="text-text-tertiary text-xs mt-1 line-clamp-2">{post.description || post.textContent}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>

      {/* --- setup live stream modal --- */}
      <Modal
        title={null}
        open={isLiveSetupOpen}
        onCancel={() => setIsLiveSetupOpen(false)}
        footer={null}
        width={480}
        centered
        className="dark-modal"
      >
        <div className="p-8 bg-bg-secondary rounded-3xl border border-border-subtle shadow-2xl">
          <span className="eyebrow">Frequency Setup</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-2 mb-6">Broadcast Details</h3>
          <Form form={broadcastForm} layout="vertical" onFinish={handleLaunchBroadcast} className="space-y-6">
            <Form.Item name="title" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Broadcast Title</span>} rules={[{ required: true }]}>
              <Input className="bg-bg-primary border-border-subtle text-white h-12" />
            </Form.Item>

            <Form.Item name="isPrivate" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Visibility</span>} rules={[{ required: true }]}>
              <AntdRadio.Group className="custom-radio-group w-full grid grid-cols-2 gap-4">
                <AntdRadio.Button value="false" className="bg-bg-primary border-border-subtle text-white h-12 flex items-center justify-center">
                  <span className="flex items-center gap-2"><Globe size={14} /> Public</span>
                </AntdRadio.Button>
                <AntdRadio.Button value="true" className="bg-bg-primary border-border-subtle text-white h-12 flex items-center justify-center">
                  <span className="flex items-center gap-2"><Lock size={14} /> Private</span>
                </AntdRadio.Button>
              </AntdRadio.Group>
            </Form.Item>

            <div className="flex gap-4 pt-4">
              <button className="qsi-button primary flex-1 py-4 font-bold flex items-center justify-center gap-2" type="submit">
                <Radio size={16} /> Broadcast Live
              </button>
              <button className="qsi-button flex-1 py-4 font-bold" onClick={() => setIsLiveSetupOpen(false)}>
                Abort
              </button>
            </div>
          </Form>
        </div>
      </Modal>
      {/* --- setup peer session modal --- */}
      <Modal
        title={null}
        open={isPeerSessionSetupOpen}
        onCancel={() => setIsPeerSessionSetupOpen(false)}
        footer={null}
        width={480}
        centered
        className="dark-modal"
      >
        <div className="p-8 bg-bg-secondary rounded-3xl border border-border-subtle shadow-2xl">
          <span className="eyebrow">Peer Session Setup</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-2 mb-6">Session Details</h3>
          <Form form={peerSessionForm} layout="vertical" onFinish={handleCreateRoom} className="space-y-6">
            <Form.Item name="title" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Session Title</span>} rules={[{ required: true }]}>
              <Input className="bg-bg-primary border-border-subtle text-white h-12" />
            </Form.Item>

            <Form.Item name="isPrivate" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Visibility</span>} rules={[{ required: true }]}>
              <AntdRadio.Group className="custom-radio-group w-full grid grid-cols-2 gap-4">
                <AntdRadio.Button value="false" className="bg-bg-primary border-border-subtle text-white h-12 flex items-center justify-center">
                  <span className="flex items-center gap-2"><Globe size={14} /> Public</span>
                </AntdRadio.Button>
                <AntdRadio.Button value="true" className="bg-bg-primary border-border-subtle text-white h-12 flex items-center justify-center">
                  <span className="flex items-center gap-2"><Lock size={14} /> Private</span>
                </AntdRadio.Button>
              </AntdRadio.Group>
            </Form.Item>

            <div className="flex gap-4 pt-4">
              <button className="qsi-button primary flex-1 py-4 font-bold flex items-center justify-center gap-2" type="submit">
                <Video size={16} /> Start Session
              </button>
              <button className="qsi-button flex-1 py-4 font-bold" onClick={() => setIsPeerSessionSetupOpen(false)}>
                Abort
              </button>
            </div>
          </Form>
        </div>
      </Modal>
      {/* --- content preview modal --- */}
      <Modal
        title={null}
        open={!!previewContent}
        onCancel={() => setPreviewContent(null)}
        footer={null}
        width={800}
        centered
        className="dark-modal"
      >
        {previewContent && (
          <div className="p-8 bg-bg-secondary rounded-3xl border border-border-subtle shadow-2xl">
            <span className="eyebrow" style={{ color: GREEN }}>{previewContent.mimeType}</span>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-2 mb-4">{previewContent.title}</h3>
            {previewContent.description && (
              <p className="text-text-secondary text-sm leading-relaxed mb-6 border-l-2 border-accent-primary pl-4">{previewContent.description}</p>
            )}
            
            <div className="mt-6 bg-bg-primary border border-border-subtle p-6 rounded-xl">
              {previewContent.mimeType === 'TEXT' ? (
                <div className="text-white text-base leading-relaxed whitespace-pre-wrap font-mono text-sm">
                  {previewContent.textContent}
                </div>
              ) : previewContent.mimeType === 'VIDEO' ? (
                <video
                  src={getServerUrl(previewContent.mediaUrl)}
                  controls
                  className="w-full rounded-xl border border-border-subtle bg-black"
                />
              ) : previewContent.mimeType === 'IMAGE' ? (
                <img
                  src={getServerUrl(previewContent.mediaUrl)}
                  alt={previewContent.title}
                  className="w-full rounded-xl border border-border-subtle object-contain" style={{ maxHeight: "600px" }}
                />
              ) : (
                <a
                  href={getServerUrl(previewContent.mediaUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="qsi-btn qsi-btn-primary w-full text-center py-4 rounded-xl"
                >
                  Download Attached Document
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
};

export default QsiTvPage;
