import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Plus, 
  Settings, 
  LayoutGrid, 
  MessageSquare,
  FlaskConical,
  Activity,
  Heart,
  Globe,
  Flame,
  Users,
  Hammer,
  Menu,
  ChevronRight,
  MoreVertical,
  X,
  User,
  Tv,
  Download,
  Lightbulb,
  Search,
  Home,
  MessageCircle,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useSidebar } from '../../context/SidebarContext';
import api from '../../api';
import panxWordmark from '../../assets/images/panx_wordmark.png';
import qsiLogo from '../../assets/images/qsi_light_logo.png';
import panxIcon from '../../assets/images/panx.png';
import labIcon from '../../assets/images/smart-infrastructure.png';
import mobilityIcon from '../../assets/images/mobility.png';
import tvIcon from '../../assets/images/vision-space.png';

interface AppLayoutProps {
  children: React.ReactNode;
}

const renderCategoryIcon = (catName: string, isVertical: boolean, isActive: boolean) => {
  const iconStyle: React.CSSProperties = isVertical 
    ? { width: '24px', height: '24px', objectFit: 'contain' } 
    : { width: '22px', height: '22px', objectFit: 'contain' };

  // For horizontal/circular items (isVertical = false), we want a pure white/green stencil effect
  const filterStyle = !isVertical
    ? (isActive 
        ? { filter: 'brightness(0) invert(53%) sepia(93%) saturate(452%) hue-rotate(113deg) brightness(97%) contrast(90%)' }
        : { filter: 'brightness(0) invert(1)' }
      )
    : (isActive 
        ? { filter: 'brightness(0)' }
        : { filter: 'invert(1)' }
      );

  const mergedStyle = { ...iconStyle, ...filterStyle };

  switch (catName) {
    case 'PanX':
      return <img src={panxIcon} alt="PanX" style={mergedStyle} />;
    case 'Smart Infrastructure':
      return <img src={labIcon} alt={catName} style={mergedStyle} />;
    case 'PanX Lab':
      return <FlaskConical size={isVertical ? 24 : 22} />;
    case 'PanX Mobility':
      return <img src={mobilityIcon} alt="PanX Mobility" style={mergedStyle} />;
    case 'Vision Space':
      return <img src={tvIcon} alt={catName} style={mergedStyle} />;
    case 'PanX TV':
      return (
        <svg viewBox="0 0 100 100" style={iconStyle} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="32" width="80" height="56" rx="8" stroke={isActive ? "var(--accent-primary)" : "white"} strokeWidth="8" strokeLinejoin="round"/>
          <path d="M30 12L50 32L70 12" stroke={isActive ? "var(--accent-primary)" : "white"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="25" y1="72" x2="75" y2="72" stroke={isActive ? "var(--accent-primary)" : "white"} strokeWidth="6" strokeLinecap="round"/>
        </svg>
      );
    case 'PanX Music':
      return (
        <svg viewBox="0 0 100 100" style={iconStyle} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M40 68V32L68 24V60" stroke={isActive ? "var(--accent-primary)" : "white"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="32" cy="68" r="10" fill={isActive ? "var(--accent-primary)" : "white"}/>
          <circle cx="60" cy="60" r="10" fill={isActive ? "var(--accent-primary)" : "white"}/>
        </svg>
      );
    case 'Profiles':
      return <Users size={isVertical ? 24 : 22} />;
    case 'PanX Concepts':
      return <Lightbulb size={isVertical ? 24 : 22} />;
    case 'Smart City Demos':
      return <Building2 size={isVertical ? 24 : 22} />;
    case 'Admin Dashboard':
      return <Shield size={isVertical ? 24 : 22} />;
    default:
      return null;
  }
};

const DefaultSidebarContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsMobileMenuOpen } = useSidebar();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [concepts, setConcepts] = useState<any[]>([]);

  useEffect(() => {
    api.get("/submit/concepts")
      .then(res => {
        if (Array.isArray(res.data)) {
          setConcepts(res.data);
        }
      })
      .catch(err => console.error("Failed to load concepts for sidebar", err));
  }, []);

  const placeboConcept = concepts.find(c => c.key === "placebo");
  const heritageConcept = concepts.find(c => c.key === "heritage_flame");
  const futureCraftConcept = concepts.find(c => c.key === "futurecraft");

  const ecosystemItems = [
    {
      id: 'placebo',
      name: 'Placebo',
      description: 'Strategic healing & medical systems',
      path: '/concepts/placebo',
      icon: <Heart size={24} />
    },
    {
      id: 'heritage-flame',
      name: 'Heritage Flame',
      description: 'Cultural & renewable energy networks',
      path: '/concepts/heritage_flame',
      icon: <Flame size={24} />
    },
    {
      id: 'future-craft',
      name: 'Future Craft',
      description: 'Cooperative digital production',
      path: '/concepts/futurecraft',
      icon: <Hammer size={24} />
    }
  ];



  const categories = [
    { name: 'PanX', shortName: 'PanX', path: '/', description: 'Unified control center for the QSI infrastructure.' },
    { name: 'PanX Lab', shortName: 'PanX Lab', path: '/lab', description: 'Specialized research and lab documentation.' },
    { name: 'PanX Mobility', shortName: 'PanX Mobility', path: '/mobility', description: 'Advanced logistics and fleet optimization.' },
    { name: 'PanX TV', shortName: 'PanX TV', path: '/tv', description: 'HD broadcast and media streaming services.' },
  ];

  const panxTools = [
    { name: 'Smart Infrastructure', path: '/chat/infrastructure', description: 'Design, Plan, Execute.' },
    { name: 'Vision Space', path: '/chat/vision', description: 'Turn Ideas Into Reality.' },
    { name: 'Profiles', path: '/network', description: 'Verified professional network.' },
    { name: 'PanX Concepts', path: '/concepts', description: 'Digital concepts & frameworks.' },
    { name: 'Smart City Demos', path: '/demos', description: 'Physical demonstrators & systems.' },
    ...(user?.role === 'ADMIN' ? [{ name: 'Admin Dashboard', path: '/admin', description: 'Manage Ecosystem & Ventures.' }] : []),
  ];

  const [ventures, setVentures] = useState<any[]>([]);

  useEffect(() => {
    const fetchVentures = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
        const res = await axios.get(`${baseURL}/ventures`);
        setVentures(res.data);
      } catch (err) {
        console.error("Failed to load ventures", err);
      }
    };
    fetchVentures();
  }, []);

  const filteredTools = panxTools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVentures = ventures.filter(v => 
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="no-scrollbar" style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflowY: "auto", overflowX: "hidden", background: "transparent" }}>
      <header className="sidebar-header" style={{ padding: "24px 0", flexShrink: 0 }}>
        <div style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          padding: "0 24px"
        }}>
          <div className="flex items-center justify-between flex-1 mr-12 md:mr-4 gap-4">
            <Link to="/" className="flex items-center shrink-0">
              <img src={panxWordmark} alt="PANX" className="h-6 md:h-7 object-contain" />
            </Link>
            <div className="flex items-center gap-1.5 opacity-80 shrink-0">
              <span className="text-[12px] md:text-[14px] font-semibold text-white/50 tracking-wider">Powered by</span>
              <img src={qsiLogo} alt="QSI" className="h-4 w-4 md:h-5 md:w-5 object-contain" />
            </div>
          </div>
          {/* <div className="hidden md:flex" style={{ gap: "10px" }}>
            <button 
              onClick={() => {
                navigate('/chat/infrastructure');
                setIsMobileMenuOpen(false);
              }}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--accent-primary)",
                border: "none",
                boxShadow: "0 8px 16px -4px var(--accent-primary-glow), inset 0 0 8px rgba(255,255,255,0.4)",
                cursor: "pointer",
                color: "#000",
                transition: "all 0.3s ease"
              }}
            >
              <Plus size={18} strokeWidth={3} />
            </button>
            <button 
              onClick={() => {
                navigate('/');
                setIsMobileMenuOpen(false);
              }}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1.5px solid rgba(255, 255, 255, 0.1)",
                cursor: "pointer",
                color: "white",
                transition: "all 0.3s ease"
              }}
            >
              <MoreVertical size={18} />
            </button>
          </div> */}
        </div>
        
        <div style={{ padding: "0 24px", marginBottom: "32px" }}>
          <div style={{ 
            display: "flex", alignItems: "center", gap: "12px", 
            background: "rgba(255, 255, 255, 0.03)", 
            border: "1px solid rgba(255, 255, 255, 0.08)", 
            borderRadius: "14px", padding: "10px 16px",
            transition: "all 0.3s"
          }}
          className="focus-within:border-[#10B981] focus-within:bg-[#10B981]/05"
          >
            <Search size={16} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
            <input
              type="text"
              placeholder="Search Feed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                color: "white", outline: "none", background: "transparent", 
                border: "none", width: "100%", fontSize: "11px", fontWeight: 800,
                letterSpacing: "0.1em"
              }}
            />
          </div>
        </div>

        <div 
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "4px",
            padding: "8px 16px 24px 16px",
            overflowX: "hidden"
          }}
        >
          {categories.map((cat) => {
            const isActive = location.pathname === cat.path;
            return (
              <button
                key={cat.name}
                onClick={() => {
                  navigate(cat.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`category-btn ${isActive ? 'active' : ''}`}
              >
                <div className="category-btn-icon-wrapper">
                  {!isActive && (
                    <div style={{
                      position: "absolute",
                      inset: "2px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)",
                      pointerEvents: "none"
                    }} />
                  )}
                  {renderCategoryIcon(cat.name, false, isActive)}
                </div>
                <span className="category-btn-label">
                  {cat.shortName}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ padding: "0 24px", marginBottom: "12px" }}>
          <h3 style={{ 
            fontSize: "14px", 
            fontWeight: "900", 
            letterSpacing: "0.2em", 
            color: "white",
            opacity: 0.6
          }}>
            PanX Tools
          </h3>
        </div>
      </header>

      <div style={{ paddingBottom: "100px" }}>
        {/* PanX Tools Section */}
        <div className="panx-tools-container" >
          {filteredTools.map((tool) => {
            const isActive = location.pathname === tool.path;
            return (
              <Link 
                key={tool.name} 
                to={tool.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`panx-tool-card ${isActive ? 'active' : ''}`}
              >
                <div className="panx-tool-icon-wrapper">
                  {renderCategoryIcon(tool.name, true, isActive)}
                </div>

                <div className="flex-1 min-w-0" style={{ paddingLeft: "4px" }}>
                  <div className="flex items-center gap-2">
                    <h4 className="panx-tool-label truncate">
                      {tool.name}
                    </h4>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse shadow-[0_0_8px_var(--accent-primary)]"></div>}
                  </div>
                  <p className="panx-tool-description line-clamp-2">
                    {tool.description}
                  </p>
                </div>

                <div className={`transition-all duration-300 ${isActive ? 'text-accent-primary translate-x-1' : 'text-white opacity-20'}`}>
                  <ChevronRight size={16} strokeWidth={3} />
                </div>
              </Link>
            );
          })}

          {filteredTools.length === 0 && (
            <div className="py-10 text-center opacity-40 text-[10px] uppercase font-black tracking-widest">
              No Tools Match Search
            </div>
          )}
        </div>

        {/* Ecosystem Section */}
        <div className="ecosystem-container">
          <h3 className="ecosystem-heading">Pan African Engineers</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filteredVentures.map((venture) => {
              const isActive = location.pathname === `/ventures/${venture.slug}`;
              const initial = venture.name?.charAt(0)?.toUpperCase() || 'V';
              
              return (
                <div 
                  key={venture.id} 
                  className={`channel-card ${isActive ? 'active' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigate(`/ventures/${venture.slug}`);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <div className="panx-tool-icon-wrapper" style={{ overflow: 'hidden' }}>
                    {venture.logoUrl ? (
                      <img src={venture.logoUrl} alt={venture.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 900, fontSize: '12px' }}>
                        {initial}
                      </div>
                    )}
                  </div>
                  
                  <div className="channel-info">
                    <div className="channel-name-row">
                      <span className="channel-name" style={{ textTransform: 'capitalize' }}>{venture.name}</span>
                    </div>
                    <div className="channel-followers">
                      {venture.shortDescription}
                    </div>
                  </div>
                  
                  <ChevronRight size={14} className="opacity-40" />
                </div>
              );
            })}

            {filteredVentures.length === 0 && (
              <div className="py-6 text-center opacity-40 text-[9px] uppercase font-black tracking-widest">
                No Ventures
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarContent, isMobileMenuOpen, setIsMobileMenuOpen, deferredPrompt, setDeferredPrompt } = useSidebar();
  const [showDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { user } = useAuth();

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  const navItems = [
    { icon: <Home size={22} />, path: '/', id: 'home', label: 'Home' },
    { icon: <MessageCircle size={22} />, path: '/inbox', id: 'chats', label: 'Chats' },
    { icon: <Users size={22} />, path: '/network', id: 'sovereign-minds-shortcut', label: 'Sovereign Minds' },
    ...(user?.role === 'ADMIN' ? [{ icon: <Shield size={22} />, path: '/admin', id: 'admin', label: 'Admin Dashboard' }] : []),
  ];

  const bottomNavItems = [
    { icon: <User size={22} />, path: '/profile', id: 'profile' },
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`app-grid ${showDetails ? 'with-details' : ''} ${isMobileMenuOpen ? 'mobile-menu-open' : ''} ${!location.pathname.startsWith('/chat') ? 'has-bottom-nav' : ''}`}>
      {/* 0. Mobile Overlay */}
      <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />

      {/* 1. Left Rail (72px) - Hidden on Mobile */}
      {!isMobile && (
        <aside className="left-rail py-6 flex flex-col items-center">
          <div className="flex-1 w-full flex flex-col items-center">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <div 
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    background: isActive 
                      ? "white" 
                      : "rgba(255, 255, 255, 0.02)",
                    border: isActive 
                      ? "none" 
                      : "1.5px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: isActive 
                      ? "0 10px 20px -5px rgba(255, 255, 255, 0.1)" 
                      : "none",
                    color: isActive ? "var(--accent-primary)" : "white",
                    position: "relative"
                  }}
                  title={item.label}
                >
                  {isActive && (
                    <div style={{
                      position: "absolute",
                      left: "-20px",
                      width: "4px",
                      height: "24px",
                      background: "var(--accent-primary)",
                      borderRadius: "0 4px 4px 0",
                      boxShadow: "0 0 15px var(--accent-primary)"
                    }} />
                  )}
                  {item.icon}
                </div>
              );
            })}
          </div>

          <div className="w-full flex flex-col items-center gap-2 p-4 border-t border-white/5">
            {bottomNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <div 
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    background: isActive 
                      ? "white" 
                      : "rgba(255, 255, 255, 0.02)",
                    border: isActive 
                      ? "none" 
                      : "1.5px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: isActive 
                      ? "0 10px 20px -5px rgba(255, 255, 255, 0.1)" 
                      : "none",
                    color: isActive ? "var(--accent-primary)" : "white",
                    position: "relative"
                  }}
                  title="Profile"
                >
                  {isActive && (
                    <div style={{
                      position: "absolute",
                      left: "-20px",
                      width: "4px",
                      height: "24px",
                      background: "var(--accent-primary)",
                      borderRadius: "0 4px 4px 0",
                      boxShadow: "0 0 15px var(--accent-primary)"
                    }} />
                  )}
                  {item.icon}
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {/* 2. Sidebar Panel (360px) */}
      <aside className="sidebar-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="md:hidden" style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 50, width: 'max-content' }}>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(8px)'
            }}
            className="hover:scale-105 active:scale-95"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {sidebarContent || <DefaultSidebarContent />}
        </div>
        
        {/* {deferredPrompt && ( */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(10, 16, 24, 0.95)', flexShrink: 0 }}>
            <button 
              onClick={handleInstallClick}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '12px', borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.1)', color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              className="hover:bg-[#10B981]/20 hover:border-[#10B981]/40"
            >
              <Download size={16} />
              Install App
            </button>
          </div>
        {/* )} */}
      </aside>

      {/* 3. Main Workspace */}
      <main className="main-workspace">
        {children}
      </main>

      {/* 4. Mobile Bottom Bar */}
      {!location.pathname.startsWith('/chat') && (
        <nav className="mobile-nav-bar">
        <button 
          className={`mobile-nav-item ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu size={24} />
          <span className="mobile-nav-label">Menus</span>
        </button>
        <button 
          className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => {
            navigate('/');
            setIsMobileMenuOpen(false);
          }}
        >
          <img 
            src={panxIcon} 
            alt="Ecosystem" 
            style={{ 
              width: '24px', 
              height: '24px', 
              objectFit: 'contain',
              filter: location.pathname === '/' 
                ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8)) sepia(93%) saturate(452%) hue-rotate(113deg) brightness(97%) contrast(90%) drop-shadow(0 0 4px var(--accent-primary))' 
                : 'brightness(0) invert(0.6)',
              transition: 'all 0.3s ease'
            }} 
          />
          <span className="mobile-nav-label">Panx Ecosystem</span>
        </button>
        <button 
          className={`mobile-nav-item ${location.pathname === '/lab' ? 'active' : ''}`}
          onClick={() => {
            navigate('/lab');
            setIsMobileMenuOpen(false);
          }}
        >
          <FlaskConical size={24} />
          <span className="mobile-nav-label">Panx Lab</span>
        </button>
        <button 
          className={`mobile-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
        >
          <User size={24} />
          <span className="mobile-nav-label">Profile</span>
        </button>
      </nav>
      )}

      {/* 5. Details Panel (Optional) */}
      {showDetails && (
        <aside className="details-panel">
          <header className="p-6 border-b border-border-subtle">
            <h3 className="text-lg font-bold">Details</h3>
          </header>
          <div className="p-6">
            <div className="w-full aspect-square bg-bg-tertiary rounded-2xl mb-6"></div>
            <h4 className="font-bold mb-2">Module Metadata</h4>
            <p className="text-sm text-text-secondary mb-4">Detailed technical specifications and operational status for the active infrastructure module.</p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-text-tertiary">Uptime</span><span className="text-success-green">99.9%</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-tertiary">Location</span><span>Lagos Hub</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-tertiary">Encryption</span><span>AES-256</span></div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};


export default AppLayout;
