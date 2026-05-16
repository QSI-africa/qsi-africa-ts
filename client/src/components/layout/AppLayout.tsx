import React, { useState, useEffect } from 'react';
import {
  Home,
  Rss,
  Layers,
  MessageSquare,
  Bot,
  FileText,
  Gavel,
  Truck,
  BarChart3,
  Bell,
  Settings,
  User,
  Search,
  Filter,
  Plus,
  Briefcase,
  MessageCircle,
  MoreHorizontal,
  MoreVertical,
  Tv,
  Zap,
  Shield,
  Activity,
  Globe,
  Building2,
  CreditCard,
  Lightbulb,
  ChevronRight,
  Cpu,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { Button } from 'antd';

interface AppLayoutProps {
  children: React.ReactNode;
}

const DefaultSidebarContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsMobileMenuOpen } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = [
    { name: 'Ecosystem', icon: <Globe size={28} />, path: '/', description: 'Unified control center for the QSI infrastructure.' },
    { name: 'QSI TV', icon: <Tv size={28} />, path: '/tv', description: 'HD broadcast and media streaming services.' },
    { name: 'Infrastructure', icon: <Cpu size={28} />, path: '/chat/infrastructure', description: 'Strategic AI interface for structural building.' },
    { name: 'Mobility', icon: <Truck size={28} />, path: '/mobility', description: 'Advanced logistics and fleet optimization.' },
    { name: 'Healing', icon: <Activity size={28} />, path: '/chat/healing', description: 'Integrated healthcare and wellness management.' },
    { name: 'Vision', icon: <Sparkles size={28} />, path: '/chat/vision', description: 'Translate imagination into actionable frameworks.' },
    { name: 'Digital Lab', icon: <Zap size={28} />, path: '/lab', description: 'Specialized research and lab documentation.' },
    { name: 'Sovereign', icon: <Lightbulb size={28} />, path: '/network', description: 'Strategic intelligence and mental sovereignty.' },
    { name: 'Concepts', icon: <Lightbulb size={28} />, path: '/concepts', description: 'Strategic conceptual frameworks and blueprints.' },
    { name: 'Smart City', icon: <Building2 size={28} />, path: '/demos', description: 'Next-gen urban planning and simulation.' },
    { name: 'Finance', icon: <CreditCard size={28} />, path: '/invoices', description: 'Automated billing and transaction tracking.' },
  ];

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
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
          <div className="flex items-baseline gap-3">
            <h2 className="text-lg md:text-3xl font-black text-white tracking-tighter uppercase leading-none">PANX</h2>
            <p className="text-[7px] md:text-[9px] font-black text-accent-primary uppercase tracking-[0.2em] opacity-70 whitespace-nowrap">Powered by QSI</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={() => {}}
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
              onClick={() => {}}
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
          </div>
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
              placeholder="SEARCH ECOSYSTEM..."
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
          className="no-scrollbar"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "32px",
            overflowX: "auto",
            padding: "8px 24px 32px 24px",
            scrollBehavior: "smooth"
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
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "14px",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: isActive ? "translateY(-4px)" : "none"
                }}
              >
                <div 
                  style={{
                    width: "68px",
                    height: "68px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    background: isActive 
                      ? "var(--accent-primary)" 
                      : "rgba(255, 255, 255, 0.03)",
                    border: isActive 
                      ? "none" 
                      : "1.5px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: isActive 
                      ? "0 12px 24px -8px var(--accent-primary-glow), inset 0 0 12px rgba(255,255,255,0.4)" 
                      : "0 4px 12px rgba(0,0,0,0.2)",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    color: isActive ? "#000" : "white"
                  }}
                >
                  {!isActive && (
                    <div style={{
                      position: "absolute",
                      inset: "2px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)",
                      pointerEvents: "none"
                    }} />
                  )}
                  {cat.icon}
                </div>
                <span 
                  style={{
                    fontSize: "9px",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    textAlign: "center",
                    width: "72px",
                    lineHeight: "1.4",
                    color: isActive ? "var(--accent-primary)" : "white",
                    transition: "color 0.4s ease"
                  }}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ padding: "0 24px", marginBottom: "12px" }}>
          <h3 style={{ 
            fontSize: "11px", 
            fontWeight: "900", 
            textTransform: "uppercase", 
            letterSpacing: "0.2em", 
            color: "white",
            opacity: 0.6
          }}>
            PANX Tools
          </h3>
        </div>
      </header>

      <div className="p-4 flex flex-col" style={{ paddingBottom: "100px" }}>
        {filteredCategories.map((cat, i) => {
          const isActive = location.pathname === cat.path;
          return (
            <Link 
              key={cat.name} 
              to={cat.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`operation-card !p-3 group mb-2 ${isActive ? 'active' : ''}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                width: "100%",
                borderRadius: "16px",
                minHeight: "68px",
                textDecoration: "none",
                color: "inherit",
                background: isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(255, 255, 255, 0.02)",
                border: isActive ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(255, 255, 255, 0.05)"
              }}
            >
              <div className={`w-10 h-10 rounded-xl hidden md:flex items-center justify-center font-black text-lg shrink-0 transition-all ${isActive ? 'bg-accent-primary text-black' : 'bg-white/5 text-white border border-white/10 group-hover:border-accent-primary/40 group-hover:text-accent-primary'}`}>
                {React.cloneElement(cat.icon as React.ReactElement, { size: 18 })}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                   <h4 className={`font-black truncate text-[11px] uppercase tracking-tighter transition-colors ${isActive ? 'text-accent-primary' : 'text-white group-hover:text-accent-primary'}`}>
                    {cat.name}
                  </h4>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse shadow-[0_0_8px_var(--accent-primary)]"></div>}
                </div>
                <p className={`text-[9px] font-medium leading-tight line-clamp-1 transition-colors ${isActive ? 'text-accent-primary opacity-70' : 'text-white opacity-40 group-hover:opacity-70 group-hover:text-accent-primary'}`}>
                  {cat.description}
                </p>
              </div>

              <div className={`transition-all duration-300 ${isActive ? 'text-accent-primary translate-x-1' : 'text-white opacity-20 group-hover:opacity-100 group-hover:text-white group-hover:translate-x-1'}`}>
                <ChevronRight size={16} strokeWidth={3} />
              </div>
            </Link>
          );
        })}
        
        {filteredCategories.length === 0 && (
          <div className="py-10 text-center opacity-40 text-[10px] uppercase font-black tracking-widest">
            No clusters found
          </div>
        )}

      </div>
    </div>
  );
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarContent, isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar();
  const [showDetails, setShowDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const navItems = [
    { icon: <Home size={22} />, path: '/', id: 'home', label: 'Home' },
    { icon: <Bell size={22} />, path: '/notifications', id: 'updates', label: 'Updates' },
    { icon: <MessageCircle size={22} />, path: '/inbox', id: 'chats', label: 'Chats' },
    { icon: <Settings size={22} />, path: '/settings', id: 'settings', label: 'Settings' },
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
    <div className={`app-grid ${showDetails ? 'with-details' : ''} ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
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
                      ? "var(--accent-primary)" 
                      : "rgba(255, 255, 255, 0.02)",
                    border: isActive 
                      ? "none" 
                      : "1.5px solid rgba(16, 185, 129, 0.1)",
                    boxShadow: isActive 
                      ? "0 10px 20px -5px var(--accent-primary-glow)" 
                      : "none",
                    color: isActive ? "#000" : "var(--text-tertiary)",
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
                    transition: "all 0.4s ease",
                    background: isActive 
                      ? "var(--accent-primary)" 
                      : "rgba(255, 255, 255, 0.05)",
                    border: isActive 
                      ? "none" 
                      : "1.5px solid rgba(255, 255, 255, 0.1)",
                    color: isActive ? "#000" : "var(--text-tertiary)"
                  }}
                  title="Profile"
                >
                  {item.icon}
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {/* 2. Sidebar Panel (360px) */}
      <aside className="sidebar-panel">
        <div className="md:hidden flex justify-end p-6 border-b border-white/5">
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
              color: 'rgba(255, 255, 255, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
            className="hover:scale-105 active:scale-95"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        {sidebarContent || <DefaultSidebarContent />}
      </aside>

      {/* 3. Main Workspace */}
      <main className="main-workspace">
        {children}
      </main>

      {/* 4. Mobile Bottom Bar */}
      <nav className="mobile-nav-bar">
        <button 
          className={`mobile-nav-item ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu size={24} />
          <span className="mobile-nav-label">Menus</span>
        </button>
        <button 
          className={`mobile-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
        >
          <User size={24} />
          <span className="mobile-nav-label">Profile</span>
        </button>
      </nav>

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
