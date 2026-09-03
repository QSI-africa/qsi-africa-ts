import React, { useState, useEffect, useRef } from 'react';
import {
  Tv,
  Video,
  Play,
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
import EntityProfileView from '../components/panx/EntityProfileView';
import { setMobileNavigationSuppressed } from '../config/mobileNavigation';

const GREEN = '#008751';

const getCreatorInitials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'PX';
};

const CreatorCard: React.FC<{
  channel: any;
  isOwn: boolean;
  onOpen: () => void;
}> = ({ channel, isOwn, onOpen }) => {
  const creatorName = channel.user?.name || 'PanX Creator';
  const subscribers = channel._count?.subscriptions || 0;

  return (
    <article
      className="panx-content-card relative overflow-hidden rounded-[24px] p-3"
      style={{ minHeight: '350px' }}
    >
      <div
        className="relative h-28 overflow-hidden rounded-[17px] border border-white/10"
        style={{
          background: 'radial-gradient(circle at 78% 18%, rgba(255,255,255,0.18), transparent 25%), radial-gradient(circle at 14% 90%, rgba(0,135,81,0.9), transparent 52%), linear-gradient(125deg, #0b1913 0%, #1f4f37 100%)'
        }}
      >
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[9px] font-black tracking-[0.12em] text-white backdrop-blur-sm">
          <Radio size={10} color={GREEN} fill={GREEN} /> Approved Creator
        </div>
        {isOwn && (
          <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 text-[9px] font-black tracking-wide text-[#0d2117]">
            My Channel
          </span>
        )}
      </div>

      <div className="relative px-3 pb-3 pt-0">
        <div className="-mt-9 mb-4 flex items-end justify-between">
          <div className="grid h-[72px] w-[72px] place-items-center rounded-[22px] border-4 border-[#15241d] bg-[#008751] text-lg font-black text-[#06110b] shadow-lg">
            {getCreatorInitials(creatorName)}
          </div>
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold text-emerald-300">
            <CheckCircle2 size={13} fill={GREEN} color="#07140d" /> Verified Channel
          </div>
        </div>

        <div className="mb-4">
          <h3 className="line-clamp-1 text-xl font-black tracking-tight text-white">{channel.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-white/55">
            <Tv size={13} color={GREEN} /> {creatorName}
          </p>
        </div>

        <p className="mb-5 line-clamp-3 min-h-[60px] text-sm leading-relaxed text-white/60">
          {channel.description || 'A verified PanX broadcast node sharing knowledge, stories, and live programming.'}
        </p>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-black/15 px-3 py-2.5">
            <div className="mb-1 flex items-center gap-1 text-[10px] text-white/40"><Users size={12} /> Audience</div>
            <strong className="text-sm text-white">{subscribers.toLocaleString()}</strong>
          </div>
          <div className="rounded-xl bg-black/15 px-3 py-2.5">
            <div className="mb-1 text-[10px] text-white/40">Channel Node</div>
            <strong className="font-mono text-xs text-white">TV-{channel.id.slice(-4).toUpperCase()}</strong>
          </div>
        </div>

        <button
          onClick={onOpen}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#008751] px-4 py-3 text-xs font-black text-[#06110b] transition-colors hover:bg-[#16a466]"
        >
          View Creator Profile <Play size={13} fill="currentColor" />
        </button>
      </div>
    </article>
  );
};

const QsiTvPage: React.FC = () => {
  const { token, user } = useAuth() || { token: null, user: null };
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'live';
  const [streams, setStreams] = useState<any[]>([]);
  const [isLoadingStreams, setIsLoadingStreams] = useState<boolean>(true);
  
  // Navigation & session states
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [peerSessionTitle, setPeerSessionTitle] = useState<string>('Peer Session');
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
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const stopPreviewPlayback = () => {
    const video = previewVideoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    video.removeAttribute('src');
    video.load();
  };

  const closePreview = () => {
    stopPreviewPlayback();
    setPreviewContent(null);
  };

  useEffect(() => () => stopPreviewPlayback(), []);

  const handleChannelBack = () => {
    closePreview();
    setSelectedChannel(null);
    fetchChannels();
  };

  const renderPreviewModal = () => (
    <Modal
      title={null}
      open={!!previewContent}
      onCancel={closePreview}
      footer={null}
      width={920}
      centered
      className="dark-modal"
      destroyOnClose
      afterClose={stopPreviewPlayback}
    >
      {previewContent && (
        <div className="p-4 md:p-8 bg-bg-secondary rounded-3xl border border-border-subtle shadow-2xl">
          <span className="eyebrow" style={{ color: GREEN }}>{previewContent.mimeType}</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-2 mb-4">{previewContent.title}</h3>
          {previewContent.description && (
            <p className="text-text-secondary text-sm leading-relaxed mb-6 border-l-2 border-accent-primary pl-4">{previewContent.description}</p>
          )}
          
          <div className="mt-6 bg-bg-primary border border-border-subtle p-4 md:p-6 rounded-xl">
            {previewContent.mimeType === 'TEXT' ? (
              <div className="text-white text-base leading-relaxed whitespace-pre-wrap font-mono text-sm">
                {previewContent.textContent}
              </div>
            ) : previewContent.mimeType === 'VIDEO' ? (
              <div className="tv-media-stage">
                <video
                  ref={previewVideoRef}
                  src={getServerUrl(previewContent.mediaUrl)}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                />
              </div>
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
  );

  // Socket sync
  useEffect(() => {
    socketService.connect(token || undefined);

    const callRoomId = searchParams.get('call');
    const callTitle = searchParams.get('title');
    const viewRoomId = searchParams.get('view');

    if (callRoomId) {
      setActiveRoomId(callRoomId);
      if (callTitle) setPeerSessionTitle(callTitle);
    }
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
    if (activeRoomId || isBroadcasting || activeViewerRoom || previewContent) {
      setMobileNavigationSuppressed('tv-media', true);
    } else {
      setMobileNavigationSuppressed('tv-media', false);
    }
    return () => setMobileNavigationSuppressed('tv-media', false);
  }, [activeRoomId, isBroadcasting, activeViewerRoom, previewContent]);

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
    const roomId = window.crypto.randomUUID();
    setPeerSessionTitle(values.title.trim());
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
    setIsLoadingContents(true);
    try {
      const channelRes = await api.get(`/tv/channels/${channel.id}`);
      const fullChannel = channelRes.data;
      setSelectedChannel(fullChannel);

      // Check subscription status
      const statusRes = await api.get(`/tv/channels/${channel.id}/subscription-status`);
      const isSub = statusRes.data.subscribed;
      setIsSubscribedToSelected(isSub);

      const isOwner = fullChannel.userId === user?.id;

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
      <div className="panx-session-page">
        {/* Session Header */}
        <div className="panx-session-page-header">
          <div className="panx-session-page-mark">
            {activeRoomId ? <Video size={16} /> : <Radio size={16} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="panx-session-page-kicker">
              {activeRoomId ? 'Peer Session' : isBroadcasting ? 'Live Broadcast' : 'Watching Live'}
            </div>
            <div className="panx-session-page-title">
              {activeRoomId ? peerSessionTitle : isBroadcasting ? broadcastTitle : activeViewerRoom?.title}
            </div>
          </div>
        </div>

        {/* Video Area */}
        <div style={{ flex: 1, position: 'relative', background: '#000' }}>
          {activeRoomId && <VideoCallContainer roomId={activeRoomId} title={peerSessionTitle} onLeave={handleLeaveCall} />}
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
      <>
      <EntityProfileView
          name={selectedChannel.title}
          role="PanX TV Channel"
          bio={selectedChannel.description || `Broadcast by ${selectedChannel.user?.name || 'PanX Creator'}`}
          isVerified={selectedChannel.status === 'APPROVED'}
          followersCount={selectedChannel._count?.subscriptions || 0}
          onBackClick={handleChannelBack}
          extraActions={
            !isOwner ? (
              <button
                onClick={() => toggleSubscription(selectedChannel.id, isSubscribedToSelected)}
                style={{
                  padding: '8px 20px', borderRadius: '12px',
                  background: isSubscribedToSelected ? 'rgba(255,255,255,0.06)' : GREEN,
                  border: isSubscribedToSelected ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  color: isSubscribedToSelected ? 'rgba(255,255,255,0.6)' : 'black',
                  fontWeight: 900, fontSize: '11px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Rss size={14} /> {isSubscribedToSelected ? 'Subscribed' : 'Subscribe'}
              </button>
            ) : null
          }
        contentWidthClassName="max-w-5xl"
      >
        <div className="feed-card bg-bg-secondary border-border-subtle p-8 lg:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="eyebrow">Broadcast Node</span>
              <h3 className="text-2xl font-black text-white tracking-tight mt-2 mb-3">
                {selectedChannel.user?.name || 'PanX Creator'}
              </h3>
              <p className="text-text-secondary text-sm max-w-2xl leading-relaxed">
                {selectedChannel.description || 'A dedicated creator frequency for live transmissions and archived channel content.'}
              </p>
            </div>
            {!isOwner && (
              <button
                onClick={() => toggleSubscription(selectedChannel.id, isSubscribedToSelected)}
                className="qsi-button primary"
                style={{ padding: '14px 22px', textTransform: 'none' }}
              >
                {isSubscribedToSelected ? 'Unsubscribe' : 'Subscribe to Unlock'}
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="eyebrow">Channel Archives</span>
              <h2 className="text-3xl font-black text-white tracking-tight">Frequency Content</h2>
            </div>
            <span className="qsi-tag qsi-tag-primary">{channelContents.length} items</span>
          </div>

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
            isLoadingContents ? (
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
                  <div
                    key={post.id}
                    className="feed-card bg-bg-secondary border-border-subtle p-6 flex flex-col justify-between cursor-pointer"
                    onClick={() => setPreviewContent(post)}
                  >
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
                          <div className="tv-content-thumbnail cursor-pointer" onClick={(e) => { e.stopPropagation(); setPreviewContent(post); }}>
                            <video
                              src={getServerUrl(post.mediaUrl)}
                              className="w-full bg-black"
                              muted
                              playsInline
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
                            onClick={(e) => e.stopPropagation()}
                          >
                            Download Asset
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <div className="feed-card bg-bg-secondary border-border-subtle p-8 lg:p-10">
          <h4 className="text-[10px] font-black text-text-tertiary tracking-widest mb-6" style={{ textTransform: 'none' }}>
            Channel Metadata
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex justify-between items-center sm:flex-col sm:items-start sm:gap-2">
              <span className="text-xs text-text-secondary">Channel ID</span>
              <span className="text-xs font-mono text-white">TV-{selectedChannel.id.slice(-4).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center sm:flex-col sm:items-start sm:gap-2">
              <span className="text-xs text-text-secondary">Visibility</span>
              <span className="text-xs font-black text-white">{selectedChannel.status}</span>
            </div>
            <div className="flex justify-between items-center sm:flex-col sm:items-start sm:gap-2">
              <span className="text-xs text-text-secondary">Subscribers</span>
              <span className="text-xs font-black text-success-green">{selectedChannel._count?.subscriptions || 0}</span>
            </div>
          </div>
        </div>
      </EntityProfileView>
      {renderPreviewModal()}
      </>
    );
  }

  // ─── Main TV Portal View (Tabs Interface) ─────────────────────────────────
  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary">
      {/* Header */}
      <UnifiedHeader
        title="PanX TV"
        extra={
          <div className="flex gap-2 items-center">
            <button 
              onClick={handleStartBroadcastClick} 
              className="qsi-button primary flex items-center gap-1.5 py-1.5 px-4 text-xs font-bold"
              style={{ background: '#008751', color: 'black', textTransform: 'none', borderRadius: '10px' }}
            >
              <Radio size={13} /> Go Live
            </button>
            <button 
              onClick={handleStartPeerSessionClick} 
              className="qsi-btn qsi-btn-secondary text-xs" 
              style={{ padding: '6px 12px', textTransform: 'none', borderRadius: '10px' }}
              title="Start private Peer Session"
            >
              Peer Session
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-8">
        <div className="max-w-5xl mx-auto">
          <Tabs
            activeKey={currentTab}
            className="custom-tabs"
            onChange={(key) => {
              setSearchParams(prev => {
                prev.set('tab', key);
                return prev;
              });
              if (key === 'studio') {
                fetchMyChannel();
              } else if (key === 'channels') {
                fetchChannels();
              }
            }}
            items={[
              // TABS 1: Active Transmissions
              {
                key: 'live',
                label: <span className="flex items-center gap-2 py-2"><Radio size={14} /> Live</span>,
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
                key: 'channels',
                label: <span className="flex items-center gap-2 py-2"><Users size={16} /> Channels</span>,
                children: (
                  <div className="py-6">
                    <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-6">Approved Creators</h2>
                    
                    {isLoadingChannels ? (
                      <div className="flex justify-center py-20"><Spin /></div>
                    ) : channels.length === 0 ? (
                      <Empty description={<span className="text-text-tertiary">No approved creator channels found.</span>} />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {channels.map((chan) => {
                          const isOwn = chan.userId === user?.id;
                          return (
                            <CreatorCard
                              key={chan.id}
                              channel={chan}
                              isOwn={isOwn}
                              onOpen={() => loadChannelDetails(chan)}
                            />
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
                label: <span className="flex items-center gap-2 py-2"><User size={16} /> My Studio</span>,
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
        <div className="panx-session-setup-card">
          <div className="panx-session-setup-icon"><Radio size={20} /></div>
          <span className="eyebrow">PanX TV Live</span>
          <h3 className="text-2xl font-black text-white tracking-tight mt-2 mb-2">Start a live broadcast</h3>
          <p className="text-sm text-white/50 leading-relaxed mb-6">Share a one-way live video feed with your audience. You can invite viewers after your camera is ready.</p>
          <Form form={broadcastForm} layout="vertical" onFinish={handleLaunchBroadcast} className="space-y-6">
            <Form.Item name="title" label={<span className="text-xs font-bold text-text-tertiary">Broadcast title</span>} rules={[{ required: true, whitespace: true, message: 'Enter a broadcast title' }]}>
              <Input className="bg-bg-primary border-border-subtle text-white h-12" placeholder="What are you broadcasting?" />
            </Form.Item>

            <Form.Item name="isPrivate" label={<span className="text-xs font-bold text-text-tertiary">Audience</span>} rules={[{ required: true }]}>
              <AntdRadio.Group className="custom-radio-group w-full grid grid-cols-2 gap-4">
                <AntdRadio.Button value="false" className="bg-bg-primary border-border-subtle text-white h-12 flex items-center justify-center">
                  <span className="flex items-center gap-2"><Globe size={14} /> Public</span>
                </AntdRadio.Button>
                <AntdRadio.Button value="true" className="bg-bg-primary border-border-subtle text-white h-12 flex items-center justify-center">
                  <span className="flex items-center gap-2"><Lock size={14} /> Private</span>
                </AntdRadio.Button>
              </AntdRadio.Group>
            </Form.Item>

            <div className="flex gap-3 pt-2">
              <button type="button" className="qsi-button flex-1 py-3 font-bold" onClick={() => setIsLiveSetupOpen(false)}>
                Cancel
              </button>
              <button className="qsi-button primary flex-[1.4] py-3 font-bold flex items-center justify-center gap-2" type="submit">
                <Radio size={16} /> Go Live
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
        <div className="panx-session-setup-card">
          <div className="panx-session-setup-icon"><Users size={20} /></div>
          <span className="eyebrow">Peer Session Setup</span>
          <h3 className="text-2xl font-black text-white tracking-tight mt-2 mb-2">Start a peer video session</h3>
          <p className="text-sm text-white/50 leading-relaxed mb-6">Create a private room for a two-way call. Once connected, copy the secure invite link for the other participant.</p>
          <Form form={peerSessionForm} layout="vertical" onFinish={handleCreateRoom} className="space-y-6">
            <Form.Item name="title" label={<span className="text-xs font-bold text-text-tertiary">Session title</span>} rules={[{ required: true, whitespace: true, message: 'Enter a session title' }]}>
              <Input className="bg-bg-primary border-border-subtle text-white h-12" placeholder="Name this conversation" />
            </Form.Item>

            <div className="rounded-xl bg-black/15 px-4 py-3 flex items-center gap-3 text-xs text-white/55">
              <Lock size={15} color={GREEN} /> Invite-only session with encrypted media transport
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" className="qsi-button flex-1 py-3 font-bold" onClick={() => setIsPeerSessionSetupOpen(false)}>
                Cancel
              </button>
              <button className="qsi-button primary flex-[1.4] py-3 font-bold flex items-center justify-center gap-2" type="submit">
                <Video size={16} /> Start Session
              </button>
            </div>
          </Form>
        </div>
      </Modal>
      {/* --- content preview modal --- */}
      {renderPreviewModal()}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
};

export default QsiTvPage;
