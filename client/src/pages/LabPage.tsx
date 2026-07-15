import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, Cpu, Code, Layers, Sparkles, Binary, Rocket, 
  ArrowRight, Search, BookOpen, CheckCircle, Award, Hourglass,
  Video, Music, Lock, Play, Upload, X, Trash2, 
  Tv, AlertCircle, RefreshCw, Radio
} from 'lucide-react';
import { message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { socketService } from '../services/socket';
import LiveBroadcastContainer from '../components/LiveBroadcastContainer';
import LiveViewerContainer from '../components/LiveViewerContainer';
import { Modal, Form, Input } from 'antd';
import UnifiedHeader from '../components/layout/UnifiedHeader';

const GREEN = '#10B981';

interface LabPackage {
  id: string;
  name: string;
  level: string;
  duration: string;
  description: string | null;
  isActive: boolean;
  order: number;
}

interface LabCategory {
  id: string;
  title: string;
  descriptor: string;
  icon: string;
  packages: LabPackage[];
}

interface LabRecording {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryTitle: string;
  channelId: string;
  channelTitle: string;
  teacherName: string;
  mimeType: string;
  createdAt: string;
  isLocked: boolean;
  mediaUrl: string | null;
}

interface TvChannel {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const LabPage: React.FC = () => {
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

  const [activeTab, setActiveTab] = useState<'programs' | 'lectures' | 'studio'>('programs');
  
  // Dynamic categories & packages
  const [categories, setCategories] = useState<LabCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [enrolledPackageIds, setEnrolledPackageIds] = useState<string[]>([]);
  const [onlyEnrolledMissions, setOnlyEnrolledMissions] = useState(false);

  // Recordings & Search
  const [recordings, setRecordings] = useState<LabRecording[]>([]);
  const [recordingsLoading, setRecordingsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Channel (Teacher Profile)
  const [myChannel, setMyChannel] = useState<TvChannel | null>(null);
  const [channelLoading, setChannelLoading] = useState(true);
  
  // Applications & uploads
  const [newChannelTitle, setNewChannelTitle] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [isSubmittingChannel, setIsSubmittingChannel] = useState(false);

  const [newRecTitle, setNewRecTitle] = useState('');
  const [newRecDesc, setNewRecDesc] = useState('');
  const [newRecMime, setNewRecMime] = useState('video/mp4');
  const [newRecCategory, setNewRecCategory] = useState('');
  const [newRecFile, setNewRecFile] = useState<File | null>(null);
  const [isUploadingRec, setIsUploadingRec] = useState(false);

  // Playback Modal
  const [playbackRecording, setPlaybackRecording] = useState<LabRecording | null>(null);
  const [subscribingChannelId, setSubscribingChannelId] = useState<string | null>(null);

  // Live Lectures State
  const [streams, setStreams] = useState<any[]>([]);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastTitle, setBroadcastTitle] = useState<string>('');
  const [activeViewerRoom, setActiveViewerRoom] = useState<{ id: string; title: string } | null>(null);
  const [isLiveSetupOpen, setIsLiveSetupOpen] = useState<boolean>(false);
  const [broadcastForm] = Form.useForm();

  const navigate = useNavigate();
  const authContext = useAuth();
  const isAuthenticated = authContext?.isAuthenticated ?? false;

  useEffect(() => {
    fetchCategories();
    fetchRecordings();
    if (isAuthenticated) {
      fetchMyChannel();
      fetchEnrollments();
    } else {
      setChannelLoading(false);
      setEnrolledPackageIds([]);
    }

    socketService.connect(authContext?.token || undefined);
    socketService.on('broadcast-list-updated', (updatedStreams: any[]) => {
      setStreams(updatedStreams);
    });
    socketService.emit('get-active-broadcasts');

    return () => {
      socketService.off('broadcast-list-updated');
    };
  }, [isAuthenticated]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const res = await api.get('/lab/categories');
      setCategories(res.data);
      if (res.data.length > 0 && !newRecCategory) {
        setNewRecCategory(res.data[0].id);
      }
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.error || err?.response?.data?.message || "Failed to load categories.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch recordings
  const fetchRecordings = async (search = searchQuery, catId = selectedCategoryId) => {
    try {
      setRecordingsLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (catId) params.categoryId = catId;
      
      const res = await api.get('/lab/recordings', { params });
      setRecordings(res.data);
    } catch (err: any) {
      console.error(err);
      // Only show error message if it is not an expected 401 Unauthorized
      if (err.response?.status !== 401) {
        message.error(err.response?.data?.error || err.response?.data?.message || "Failed to load recordings.");
      }
    } finally {
      setRecordingsLoading(false);
    }
  };

  // Fetch teacher/channel status
  const fetchMyChannel = async () => {
    try {
      setChannelLoading(true);
      const res = await api.get('/tv/channels/my-channel');
      setMyChannel(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setChannelLoading(false);
    }
  };

  // Fetch user package enrollments from backend
  const fetchEnrollments = async () => {
    try {
      const res = await api.get('/lab/enrollments');
      setEnrolledPackageIds(res.data);
    } catch (err: any) {
      console.error("Failed to load enrollments:", err);
    }
  };

  // Handle Search Trigger
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecordings(searchQuery, selectedCategoryId);
  };

  // Handle Category Filter Pill Click
  const handleCategoryFilter = (catId: string) => {
    const updatedCatId = selectedCategoryId === catId ? '' : catId;
    setSelectedCategoryId(updatedCatId);
    fetchRecordings(searchQuery, updatedCatId);
  };

  // Toggle Module Enrollment in backend
  const handleEnrollToggle = async (packageId: string) => {
    if (!isAuthenticated) {
      message.info("Please log in or register to enroll in academy modules.");
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    try {
      const res = await api.post(`/lab/packages/${packageId}/enroll`);
      setEnrolledPackageIds(res.data);
      const isEnrolled = res.data.includes(packageId);
      if (isEnrolled) {
        message.success("Successfully enrolled in mission!");
      } else {
        message.success("Successfully left mission.");
      }
    } catch (err: any) {
      message.error(err.response?.data?.error || "Failed to toggle enrollment.");
    }
  };

  // Request/create Teacher channel
  const handleRequestChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      message.info("Authentication required.");
      navigate('/login');
      return;
    }
    const title = newChannelTitle.trim();
    const desc = newChannelDesc.trim();

    if (!title || !desc) {
      message.warning("Channel title and description are required.");
      return;
    }
    
    if (title.length < 3) {
      message.warning("Channel title must be at least 3 characters long.");
      return;
    }
    
    if (desc.length < 10) {
      message.warning("Channel description must be at least 10 characters long.");
      return;
    }
    try {
      setIsSubmittingChannel(true);
      const res = await api.post('/tv/channels/request', {
        title,
        description: desc
      });
      setMyChannel(res.data);
      message.success("Teacher profile requested! Admin approval pending.");
    } catch (err: any) {
      message.error(err.response?.data?.error || "Failed to submit request.");
    } finally {
      setIsSubmittingChannel(false);
    }
  };

  // Upload and publish recording
  const handlePublishRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newRecTitle.trim();
    const desc = newRecDesc.trim();

    if (!title || !desc || !newRecCategory || !newRecFile) {
      message.warning("Please fill out all fields and select a media file.");
      return;
    }

    if (title.length < 3) {
      message.warning("Lecture title must be at least 3 characters long.");
      return;
    }

    if (desc.length < 10) {
      message.warning("Lecture description must be at least 10 characters long.");
      return;
    }

    // Backend limit is 20MB
    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    if (newRecFile.size > MAX_FILE_SIZE) {
      message.warning("Media file size must be less than 20MB.");
      return;
    }

    try {
      setIsUploadingRec(true);
      
      // 1. Upload media file via /api/upload/document
      const formData = new FormData();
      formData.append('document', newRecFile);
      formData.append('category', 'LAB_RECORDING');
      
      const uploadRes = await api.post('/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const fileUrl = uploadRes.data.document.url;

      // 2. Create the LabRecording record
      await api.post('/lab/recordings', {
        title,
        description: desc,
        mediaUrl: fileUrl,
        mimeType: newRecMime,
        categoryId: newRecCategory
      });

      message.success("Recording published successfully!");
      setNewRecTitle('');
      setNewRecDesc('');
      setNewRecFile(null);
      
      // Refresh recordings and update channel view
      fetchRecordings();
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.error || "Failed to publish recording.");
    } finally {
      setIsUploadingRec(false);
    }
  };

  // Delete recording (as teacher)
  const handleDeleteRecording = async (recordingId: string) => {
    try {
      await api.delete(`/lab/recordings/${recordingId}`);
      message.success("Recording deleted.");
      fetchRecordings();
    } catch (err: any) {
      message.error(err?.response?.data?.error || err?.response?.data?.message || "Failed to delete recording.");
    }
  };

  // Subscribe directly to a channel
  const handleSubscribe = async (channelId: string) => {
    if (!isAuthenticated) {
      message.info("Please sign in or create an account to subscribe to channels.");
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    try {
      setSubscribingChannelId(channelId);
      await api.post(`/tv/channels/${channelId}/subscribe`);
      message.success("Subscribed successfully! Content unlocked.");
      
      // Refresh recordings list
      const updatedRecordings = await api.get('/lab/recordings');
      console.log(updatedRecordings.data, 'updatedRecordings.data');
      setRecordings(updatedRecordings.data);
      
      // Update playback record
      const match = updatedRecordings.data.find((r: any) => r.id === playbackRecording?.id);
      console.log(match, 'match');
      if (match) {
        setPlaybackRecording(match);
      }
    } catch (err: any) {
      message.error(err.response?.data?.error || "Failed to subscribe.");
    } finally {
      setSubscribingChannelId(null);
    }
  };

  // Helper for Lucide icons based on category icon string
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'CodeOutlined': return <Code size={20} />;
      case 'CpuOutlined': return <Cpu size={20} />;
      case 'LayersOutlined': return <Layers size={20} />;
      case 'BulbOutlined': return <Sparkles size={20} />;
      case 'BinaryOutlined': return <Binary size={20} />;
      case 'RocketOutlined': return <Rocket size={20} />;
      default: return <FlaskConical size={20} />;
    }
  };

  // Filter dynamic categories based on enrollment tab
  const filteredCategories = categories.map(cat => {
    const matchingPackages = cat.packages.filter(pkg => {
      return !onlyEnrolledMissions || enrolledPackageIds.includes(pkg.id);
    });
    return { ...cat, packages: matchingPackages };
  }).filter(cat => cat.packages.length > 0);

  const handleLaunchBroadcast = (values: any) => {
    setBroadcastTitle(values.title);
    setIsLiveSetupOpen(false);
    setIsBroadcasting(true);
  };

  const handleStopBroadcast = () => {
    setIsBroadcasting(false);
    socketService.emit('get-active-broadcasts');
  };

  if (isBroadcasting || activeViewerRoom) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#000' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 28px',
          background: 'rgba(10,16,24,0.9)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <button
            onClick={() => { setIsBroadcasting(false); setActiveViewerRoom(null); }}
            className="qsi-btn qsi-btn-secondary"
            style={{ padding: '8px 16px', borderRadius: '10px' }}
          >
            <X size={16} /> Exit
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 8px #EF4444', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              {isBroadcasting ? 'Live Lecture Transmission' : `Viewing · ${activeViewerRoom?.title}`}
            </span>
          </div>
          <div style={{ width: '80px' }} />
        </div>
        <div style={{ flex: 1, position: 'relative', background: '#000' }}>
          {isBroadcasting && (
            <LiveBroadcastContainer
              onStop={handleStopBroadcast}
              title={broadcastTitle}
              isPrivate={false}
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

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'transparent' }} className="no-scrollbar">
      {/* Header */}
      <UnifiedHeader
        title="PanX Lab"
        extra={
          <div style={{ display: 'flex', gap: '20px' }} className="lab-metrics">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={16} color={GREEN} />
              <div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 800 }}>Missions Active</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: 'white' }}>{enrolledPackageIds.length} Modules</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={16} color="#3B82F6" />
              <div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 800 }}>Channel Status</div>
                <div style={{ 
                  fontSize: '11px', 
                  fontWeight: 900, 
                  color: myChannel?.status === 'APPROVED' ? GREEN : myChannel?.status === 'PENDING' ? '#F59E0B' : '#E5E7EB' 
                }}>
                  {myChannel ? myChannel.status : 'STUDENT'}
                </div>
              </div>
            </div>
          </div>
        }
      />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px 100px 24px' }} className="lab-container">
        
        {!isAuthenticated && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(16,185,129,0.06) 0%, rgba(59,130,246,0.03) 100%)',
            border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h4 style={{ color: 'white', fontSize: '14px', fontWeight: 800, margin: 0 }}>Browsing in Guest Mode</h4>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '2px 0 0 0' }}>
                  Create an account or log in to enroll in dynamic syllabus modules, subscribe to teacher channels, or broadcast live.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => navigate('/login')}
                style={{
                  background: GREEN, border: 'none', color: 'black', padding: '8px 16px',
                  borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer'
                }}
              >
                Log In
              </button>
              <button 
                onClick={() => navigate('/register')}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'white',
                  padding: '8px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer'
                }}
              >
                Register
              </button>
            </div>
          </div>
        )}
        
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex', 
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '4px',
          marginBottom: '32px',
          maxWidth: '520px',
          overflowX: 'auto',
          gap: '4px'
        }} className="lab-tabs no-scrollbar">
          <button 
            onClick={() => setActiveTab('programs')}
            className={`pill ${activeTab === 'programs' ? 'active' : ''}`}
            style={{
              textTransform: 'uppercase', fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', padding: '8px 16px', borderRadius: '20px',
              border: activeTab === 'programs' ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
              background: activeTab === 'programs' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
              color: activeTab === 'programs' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap'
            }}
          >
            Academic Programs
          </button>
          <button 
            onClick={() => setActiveTab('lectures')}
            className={`pill ${activeTab === 'lectures' ? 'active' : ''}`}
            style={{
              textTransform: 'uppercase', fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', padding: '8px 16px', borderRadius: '20px',
              border: activeTab === 'lectures' ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
              background: activeTab === 'lectures' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
              color: activeTab === 'lectures' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap'
            }}
          >
            Virtual Lectures
          </button>
          <button 
            onClick={() => setActiveTab('studio')}
            className={`pill ${activeTab === 'studio' ? 'active' : ''}`}
            style={{
              textTransform: 'uppercase', fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', padding: '8px 16px', borderRadius: '20px',
              border: activeTab === 'studio' ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
              background: activeTab === 'studio' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
              color: activeTab === 'studio' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap'
            }}
          >
            Teacher Studio
          </button>
        </div>

        {/* Dynamic Tab Panels */}

        {/* 1. Academic Programs Tab */}
        {activeTab === 'programs' && (
          <div>

            {/* Program Filters */}
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)'
            }} className="lab-filters">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setOnlyEnrolledMissions(false)}
                  className={`pill ${!onlyEnrolledMissions ? 'active' : ''}`}
                  style={{
                    textTransform: 'uppercase', fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', padding: '8px 16px', borderRadius: '20px',
                    border: !onlyEnrolledMissions ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
                    background: !onlyEnrolledMissions ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
                    color: !onlyEnrolledMissions ? 'var(--accent-primary)' : 'rgba(255,255,255,0.6)',
                    cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  All Programs
                </button>
                <button 
                  onClick={() => setOnlyEnrolledMissions(true)}
                  className={`pill ${onlyEnrolledMissions ? 'active' : ''}`}
                  style={{
                    textTransform: 'uppercase', fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', padding: '8px 16px', borderRadius: '20px',
                    border: onlyEnrolledMissions ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
                    background: onlyEnrolledMissions ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
                    color: onlyEnrolledMissions ? 'var(--accent-primary)' : 'rgba(255,255,255,0.6)',
                    cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  Active Missions ({enrolledPackageIds.length})
                </button>
              </div>
            </div>

            {/* Categories */}
            {categoriesLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                {filteredCategories.map((cat) => (
                  <div key={cat.id}>
                    {/* Category Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                      <div style={{ color: GREEN, background: `${GREEN}12`, padding: '8px', borderRadius: '10px' }}>
                        {getIcon(cat.icon)}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
                          {cat.title}
                        </h3>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0 0' }}>
                          {cat.descriptor}
                        </p>
                      </div>
                    </div>

                    {/* Modules Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                      {cat.packages.map((pkg) => {
                        const isEnrolled = enrolledPackageIds.includes(pkg.id);
                        return (
                          <div 
                            key={pkg.id}
                            style={{
                              background: 'rgba(255,255,255,0.015)', 
                              border: isEnrolled ? `1px solid ${GREEN}40` : '1px solid rgba(255,255,255,0.05)',
                              borderRadius: '20px', 
                              padding: '24px', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              justifyContent: 'space-between',
                              minHeight: '260px',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            {isEnrolled && (
                              <div style={{ position: 'absolute', top: 0, right: 0, width: '4px', height: '100%', background: GREEN }} />
                            )}

                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <span style={{ 
                                  fontSize: '9px', fontWeight: 900, 
                                  color: pkg.level === 'Advanced' ? '#8B5CF6' : pkg.level === 'Intermediate' ? '#3B82F6' : GREEN, 
                                  background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase'
                                }}>
                                  {pkg.level}
                                </span>
                                {isEnrolled && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontWeight: 900, color: GREEN, textTransform: 'uppercase' }}>
                                    <CheckCircle size={10} /> Active
                                  </div>
                                )}
                              </div>
                              <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'white', marginBottom: '8px', letterSpacing: '-0.01em', margin: 0 }}>
                                {pkg.name}
                              </h4>
                              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginTop: '8px' }}>
                                {pkg.description || "Interactive engineering module designed for high-impact capability acquisition."}
                              </p>
                            </div>

                            <div style={{ marginTop: '20px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                                <Hourglass size={12} />
                                <span>{pkg.duration} Duration</span>
                              </div>
                              
                              <button 
                                onClick={() => handleEnrollToggle(pkg.id)}
                                style={{
                                  width: '100%', padding: '12px', borderRadius: '12px', 
                                  border: isEnrolled ? `1px solid ${GREEN}40` : '1px solid rgba(255,255,255,0.1)',
                                  background: isEnrolled ? 'rgba(16, 185, 129, 0.08)' : 'transparent', 
                                  color: isEnrolled ? GREEN : 'white', 
                                  cursor: 'pointer',
                                  fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                              >
                                {isEnrolled ? 'Leave Mission' : 'Enroll Module'} <ArrowRight size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {filteredCategories.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.3 }}>
                    <FlaskConical size={48} style={{ margin: '0 auto 16px auto', color: GREEN }} />
                    <h4 style={{ color: 'white', fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>No Enrolled Modules</h4>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Enroll in modules to see them in this view.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. Virtual Lectures Tab */}
        {activeTab === 'lectures' && (
          <div>
            {/* Search and Category Filter Pllls */}
            <div style={{ marginBottom: '32px' }}>
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '20px' }} className="lab-search-form">
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px', padding: '12px 18px'
                }}>
                  <Search size={16} color="rgba(255,255,255,0.3)" />
                  <input 
                    type="text" 
                    placeholder="Search recorded lectures, topics, or teachers..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '14px', width: '100%'
                    }}
                  />
                </div>
                <button type="submit" style={{
                  background: GREEN, color: 'black', border: 'none', padding: '12px 24px', 
                  borderRadius: '16px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer'
                }}>
                  Search
                </button>
              </form>

              {/* Category Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }} className="lab-filter-pills">
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginRight: '8px' }}>Filter by:</span>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryFilter(cat.id)}
                    className={`pill ${selectedCategoryId === cat.id ? 'active' : ''}`}
                    style={{
                      textTransform: 'uppercase', fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', padding: '8px 16px', borderRadius: '20px',
                      border: selectedCategoryId === cat.id ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
                      background: selectedCategoryId === cat.id ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
                      color: selectedCategoryId === cat.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Lectures Grid */}
            {streams.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <Radio size={16} color="#EF4444" />
                  <h3 style={{ fontSize: '16px', fontWeight: 900, color: 'white', margin: 0, textTransform: 'uppercase' }}>Active Live Lectures</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                  {streams.map((stream, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveViewerRoom({ id: stream.roomId, title: stream.title })}
                      style={{
                        background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '20px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        minHeight: '160px', textAlign: 'left', width: '100%'
                      }}
                      className="recording-card"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 6px #EF4444' }} />
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#EF4444', textTransform: 'uppercase' }}>LIVE NOW</span>
                        </div>
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'white', margin: '16px 0 8px 0' }}>{stream.title}</h4>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Prof. {stream.broadcasterName}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Code size={16} color={GREEN} />
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: 'white', margin: 0, textTransform: 'uppercase' }}>Recorded Archives</h3>
            </div>

            {/* Recordings Grid */}
            {recordingsLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {recordings.map(rec => (
                  <div
                    key={rec.id}
                    onClick={() => setPlaybackRecording(rec)}
                    style={{
                      background: 'rgba(255,255,255,0.015)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '20px',
                      padding: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '220px',
                      position: 'relative'
                    }}
                    className="recording-card"
                  >
                    {/* Media Type Tag (Floating) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ 
                        fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.5)', 
                        background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase'
                      }}>
                        {rec.categoryTitle}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: rec.mimeType.startsWith('video') ? '#3B82F6' : '#EC4899' }}>
                        {rec.mimeType.startsWith('video') ? <Video size={12} /> : <Music size={12} />}
                        <span style={{ fontWeight: 800, textTransform: 'uppercase' }}>{rec.mimeType.split('/')[0]}</span>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'white', marginBottom: '6px', margin: 0 }}>
                        {rec.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineBreak: 'anywhere', margin: '4px 0 12px 0' }}>
                        {rec.description}
                      </p>
                    </div>

                    <div style={{ 
                      marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>{rec.teacherName}</div>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginTop: '2px' }}>{rec.channelTitle}</div>
                      </div>
                      
                      {rec.isLocked ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#EF4444', background: 'rgba(239,68,68,0.1)', padding: '6px 10px', borderRadius: '10px' }}>
                          <Lock size={12} />
                          <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}>Locked</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: GREEN, background: 'rgba(16,185,129,0.1)', padding: '6px 10px', borderRadius: '10px' }}>
                          <Play size={12} fill={GREEN} />
                          <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}>Watch</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {recordings.length === 0 && (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', opacity: 0.3 }}>
                    <Video size={48} style={{ margin: '0 auto 16px auto', color: GREEN }} />
                    <h4 style={{ color: 'white', fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>No Lectures Found</h4>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Try another search query or category filter.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. Teacher Studio Tab */}
        {activeTab === 'studio' && (
          <div>
            {!isAuthenticated ? (
              /* Guest mode for Studio */
              <div style={{
                maxWidth: '600px', margin: '0 auto', background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px',
                textAlign: 'center', backdropFilter: 'blur(20px)'
              }}>
                <Tv size={48} color={GREEN} style={{ marginBottom: '20px', opacity: 0.8 }} />
                <h3 style={{ fontSize: '22px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', margin: '0 0 12px 0' }}>
                  Broadcaster Account Required
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '28px' }}>
                  To request a broadcaster profile, stream live lectures, and publish virtual academy courses, you need a registered account.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => navigate('/login')}
                    style={{
                      background: GREEN, border: 'none', color: 'black', padding: '10px 16px',
                      borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px'
                    }}
                  >
                    Log In <ArrowRight size={14} />
                  </button>
                  <button 
                    onClick={() => navigate('/register')}
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'white',
                      padding: '10px 16px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '13px'
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            ) : channelLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
            ) : !myChannel ? (
              /* No Channel - Request Profile */
              <div style={{
                maxWidth: '600px', margin: '0 auto', background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <Tv size={40} color={GREEN} style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '22px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', margin: 0 }}>
                    Become a Teacher & Broadcaster
                  </h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '8px', lineHeight: 1.5 }}>
                    Teachers can publish audio/visual lessons to the Panx Lab, configure subscription access gating, and run live TV streams.
                  </p>
                </div>

                <form onSubmit={handleRequestChannel}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
                      Channel/Profile Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dr. Kwame's Tech Lab"
                      value={newChannelTitle}
                      onChange={(e) => setNewChannelTitle(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', outline: 'none'
                      }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '28px' }}>
                    <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
                      Teaching Focus & Description
                    </label>
                    <textarea 
                      placeholder="Provide details about your experience and the syllabus you plan to deliver..."
                      value={newChannelDesc}
                      onChange={(e) => setNewChannelDesc(e.target.value)}
                      rows={4}
                      style={{
                        width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', outline: 'none', resize: 'vertical'
                      }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingChannel}
                    style={{
                      width: '100%', padding: '14px', background: GREEN, color: 'black',
                      border: 'none', borderRadius: '14px', fontSize: '12px', fontWeight: 900,
                      textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    {isSubmittingChannel ? 'Submitting...' : 'Submit Profile Application'}
                    <ArrowRight size={14} />
                  </button>
                </form>
              </div>
            ) : myChannel.status === 'PENDING' ? (
              /* Application Pending Approval */
              <div style={{
                maxWidth: '600px', margin: '0 auto', background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px',
                textAlign: 'center'
              }}>
                <AlertCircle size={40} color="#F59E0B" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: 0 }}>
                  Application Under Review
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '8px', lineHeight: 1.5, marginBottom: '24px' }}>
                  Your profile request is currently pending review by our administrator. Once approved, you can start streaming and publishing lessons.
                </p>
                <div style={{ 
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px', padding: '20px', textAlign: 'left', marginBottom: '24px'
                }}>
                  <h4 style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '16px', margin: 0 }}>
                    Submitted Details
                  </h4>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 800 }}>Profile Name</span>
                    <strong style={{ color: 'white', fontSize: '14px' }}>{myChannel.title}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 800 }}>Teaching Focus</span>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>{myChannel.description}</p>
                  </div>
                </div>
                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '8px', 
                  background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                  padding: '8px 16px', borderRadius: '12px', fontSize: '11px', color: '#F59E0B', fontWeight: 800
                }}>
                  <RefreshCw size={12} className="animate-spin" /> Pending Approval
                </div>
              </div>
            ) : myChannel.status === 'REJECTED' ? (
              /* Application Rejected */
              <div style={{
                maxWidth: '600px', margin: '0 auto', background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px',
                textAlign: 'center'
              }}>
                <AlertCircle size={40} color="#EF4444" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: 0 }}>
                  Application Rejected
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '8px', lineHeight: 1.5 }}>
                  Unfortunately, your request to become an instructor was not approved at this time. Please contact support or revise your request specifications.
                </p>
                <button
                  onClick={async () => {
                    try {
                      setChannelLoading(true);
                      await api.delete('/tv/channels/my-channel');
                      setMyChannel(null);
                    } catch (err: any) {
                      message.error(err?.response?.data?.error || err?.response?.data?.message || "Failed to reset application.");
                    } finally {
                      setChannelLoading(false);
                    }
                  }}
                  style={{
                    marginTop: '24px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                    padding: '10px 20px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer'
                  }}
                >
                  Create New Application
                </button>
              </div>
            ) : (
              /* Approved Teacher Console */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }} className="teacher-console-grid">
                
                {/* Upload & Stream Actions */}
                <div style={{
                  background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '24px', padding: '24px'
                }}>
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 900, color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Radio size={16} color="#EF4444" /> Live Lecture
                    </h3>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', marginBottom: '16px' }}>
                      Start a live virtual lecture session for your students.
                    </p>
                    <button
                      onClick={() => setIsLiveSetupOpen(true)}
                      style={{
                        width: '100%', padding: '12px', background: 'rgba(239,68,68,0.1)', color: '#EF4444',
                        border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', fontSize: '11px', fontWeight: 900,
                        textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      Start Virtual Lecture
                    </button>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 900, color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Upload size={16} color={GREEN} /> Publish Lecture
                  </h3>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', marginBottom: '20px' }}>
                    Upload educational media under a category. Access is subscription-gated automatically.
                  </p>

                  <form onSubmit={handlePublishRecording}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                        Lecture Title
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. Intro to Modern Rust"
                        value={newRecTitle}
                        onChange={(e) => setNewRecTitle(e.target.value)}
                        style={{
                          width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', 
                          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'white', outline: 'none', fontSize: '12px'
                        }}
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                        Short Description
                      </label>
                      <textarea 
                        placeholder="Provide details about what students will learn in this lecture."
                        value={newRecDesc}
                        onChange={(e) => setNewRecDesc(e.target.value)}
                        rows={3}
                        style={{
                          width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', 
                          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'white', outline: 'none', fontSize: '12px', resize: 'vertical'
                        }}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                          Category
                        </label>
                        <select
                          value={newRecCategory}
                          onChange={(e) => setNewRecCategory(e.target.value)}
                          style={{
                            width: '100%', padding: '10px', background: 'rgba(20, 25, 35, 1)', 
                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'white', outline: 'none', fontSize: '12px'
                          }}
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                          Media Type
                        </label>
                        <select
                          value={newRecMime}
                          onChange={(e) => setNewRecMime(e.target.value)}
                          style={{
                            width: '100%', padding: '10px', background: 'rgba(20, 25, 35, 1)', 
                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'white', outline: 'none', fontSize: '12px'
                          }}
                        >
                          <option value="video/mp4">Video (MP4)</option>
                          <option value="audio/mpeg">Audio (MP3)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                        Media File
                      </label>
                      <input 
                        type="file" 
                        accept={newRecMime.startsWith('video') ? 'video/*' : 'audio/*'}
                        onChange={(e) => setNewRecFile(e.target.files ? e.target.files[0] : null)}
                        style={{
                          width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.01)', 
                          border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', outline: 'none', fontSize: '11px'
                        }}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isUploadingRec}
                      style={{
                        width: '100%', padding: '12px', background: GREEN, color: 'black',
                        border: 'none', borderRadius: '12px', fontSize: '11px', fontWeight: 900,
                        textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      {isUploadingRec ? 'Uploading Media...' : 'Publish Recording'}
                      <Upload size={12} />
                    </button>
                  </form>
                </div>

                {/* Teacher's Recorded Lectures list */}
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 900, color: 'white', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                    Your Published Lectures
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {recordings
                      .filter(rec => rec.channelId === myChannel.id)
                      .map(rec => (
                        <div
                          key={rec.id}
                          style={{
                            background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                          }}
                        >
                          <div>
                            <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'white', margin: 0 }}>
                              {rec.title}
                            </h4>
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0 0' }}>
                              {rec.categoryTitle} • {rec.mimeType.startsWith('video') ? 'Video' : 'Audio'}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteRecording(rec.id)}
                            style={{
                              background: 'rgba(239,68,68,0.1)', border: 'none', padding: '8px', 
                              borderRadius: '8px', color: '#EF4444', cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}

                    {recordings.filter(rec => rec.channelId === myChannel.id).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.3, border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                        <BookOpen size={24} style={{ margin: '0 auto 8px auto', color: GREEN }} />
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 800 }}>No Lectures Published</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>

      {/* 4. Playback / Subscription Modal */}
      {playbackRecording && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(5, 5, 8, 0.85)', backdropFilter: 'blur(10px)', padding: '20px'
        }}>
          <div style={{
            background: 'rgba(15, 20, 30, 0.95)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '28px', maxWidth: '640px', width: '100%', overflow: 'hidden', position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div>
                <span style={{ fontSize: '9px', fontWeight: 900, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {playbackRecording.categoryTitle} Lecture
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'white', margin: '2px 0 0 0', letterSpacing: '-0.02em' }}>
                  {playbackRecording.title}
                </h3>
              </div>
              <button 
                onClick={() => setPlaybackRecording(null)}
                style={{
                  background: 'rgba(255,255,255,0.03)', border: 'none', padding: '8px', 
                  borderRadius: '10px', color: 'white', cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              {playbackRecording.isLocked ? (
                /* LOCKED SCREEN (Access Denied) */
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#EF4444', margin: '0 auto 20px auto'
                  }}>
                    <Lock size={28} />
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'white', margin: 0 }}>
                    Subscription Required
                  </h4>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '8px', lineHeight: 1.5, maxWidth: '400px', margin: '8px auto 24px auto' }}>
                    This lecture is locked. Subscribe to <strong>{playbackRecording.teacherName}</strong>'s channel (<strong>{playbackRecording.channelTitle}</strong>) on Panx TV to unlock this and all of their premium recorded content.
                  </p>

                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '320px', margin: '0 auto'
                  }}>
                    <button
                      onClick={() => handleSubscribe(playbackRecording.channelId)}
                      disabled={subscribingChannelId !== null}
                      style={{
                        width: '100%', padding: '14px', background: GREEN, color: 'black', border: 'none',
                        borderRadius: '14px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      {subscribingChannelId ? 'Processing...' : `Subscribe to Channel ($5.00/mo)`}
                      <Tv size={14} />
                    </button>
                    
                    <button
                      onClick={() => setPlaybackRecording(null)}
                      style={{
                        width: '100%', padding: '12px', background: 'transparent', color: 'rgba(255,255,255,0.6)', 
                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '11px', 
                        fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer'
                      }}
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                /* UNLOCKED SCREEN (Media Player) */
                <div>
                  {playbackRecording.mimeType.startsWith('video') ? (
                    /* Video Player */
                    <div style={{ background: 'black', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <video 
                        src={getServerUrl(playbackRecording.mediaUrl || '')} 
                        controls 
                        autoPlay 
                        style={{ width: '100%', display: 'block', maxHeight: '360px' }}
                        preload="metadata"
                      />
                    </div>
                  ) : (
                    /* Audio Player */
                    <div style={{
                      background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '20px', padding: '32px', textAlign: 'center'
                    }}>
                      <div style={{
                        width: '96px', height: '96px', borderRadius: '50%', background: `${GREEN}12`,
                        border: `1px solid ${GREEN}30`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: GREEN, margin: '0 auto 24px auto', position: 'relative'
                      }} className="rotating-audio-disc">
                        <Music size={40} />
                      </div>
                      
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>{playbackRecording.title}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                          Voice Lesson by {playbackRecording.teacherName}
                        </div>
                      </div>

                      <audio 
                        src={getServerUrl(playbackRecording.mediaUrl || '')} 
                        controls 
                        autoPlay 
                        style={{ width: '100%', outline: 'none' }}
                      />
                    </div>
                  )}

                  <div style={{ marginTop: '20px' }}>
                    <h5 style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 800, margin: '0 0 4px 0' }}>
                      Lecture Synopsis
                    </h5>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: 0 }}>
                      {playbackRecording.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
          <span className="eyebrow" style={{ color: '#EF4444' }}>Virtual Lecture Setup</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-2 mb-6">Lecture Details</h3>
          <Form form={broadcastForm} layout="vertical" onFinish={handleLaunchBroadcast} className="space-y-6">
            <Form.Item name="title" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Topic</span>} rules={[{ required: true }]}>
              <Input className="bg-bg-primary border-border-subtle text-white h-12" placeholder="e.g. Introduction to Quantum Computing" />
            </Form.Item>

            <div className="flex gap-4 pt-4">
              <button className="qsi-button flex-1 py-4 font-bold flex items-center justify-center gap-2" style={{ background: '#EF4444', color: 'white' }} type="submit">
                <Radio size={16} /> Start Class
              </button>
              <button className="qsi-button flex-1 py-4 font-bold" onClick={() => setIsLiveSetupOpen(false)}>
                Cancel
              </button>
            </div>
          </Form>
        </div>
      </Modal>

      <style>{`
        @media (max-width: 768px) {
          .teacher-console-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .lab-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
            padding: 16px 20px !important;
          }
          .lab-metrics {
            width: 100% !important;
            justify-content: space-between !important;
          }
          .lab-container {
            padding: 16px 12px !important;
          }
          .lab-tabs {
            width: 100% !important;
            overflow-x: auto !important;
            white-space: nowrap !important;
          }
          .lab-tabs button {
            flex-shrink: 0 !important;
            min-width: 120px !important;
            padding: 8px 4px !important;
            font-size: 10px !important;
          }
          .lab-hero {
            padding: 32px 20px !important;
            margin-bottom: 24px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 20px !important;
          }
          .lab-hero-title {
            font-size: 24px !important;
            line-height: 1.2 !important;
          }
          .lab-hero-logo {
            display: none !important;
          }
          .lab-filters {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 16px !important;
          }
          .lab-filters > div {
            width: 100% !important;
            justify-content: space-between !important;
          }
        }
        
        @media (max-width: 500px) {
          .lab-search-form {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .lab-search-form button {
            width: 100% !important;
            text-align: center !important;
            padding: 12px !important;
          }
          .lab-filter-pills {
            width: 100% !important;
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            padding-bottom: 4px !important;
          }
          .lab-filter-pills span {
            display: none !important;
          }
          .lab-filter-pills button {
            flex-shrink: 0 !important;
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .recording-card:hover {
          background: rgba(255, 255, 255, 0.035) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default LabPage;
