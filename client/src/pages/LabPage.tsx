import React, { useState, useEffect } from 'react';
import { Typography, Button, Tag, Row, Col, Space } from 'antd';
import { 
  PlayCircleOutlined, 
  ArrowRightOutlined, 
  CodeOutlined, 
  RocketOutlined, 
  BulbOutlined,
  ThunderboltOutlined 
} from '@ant-design/icons';
import { GeometricCard, GridLine } from '../components/AfroBauhausComponents';
import { socketService } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const LabPage: React.FC = () => {
  const { token } = useAuth() || { token: null };
  const navigate = useNavigate();
  const [activeBroadcast, setActiveBroadcast] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch Lab Categories
    const fetchLabData = async () => {
      try {
        const res = await fetch('/api/lab/categories');
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch lab categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabData();

    socketService.connect(token || undefined);

    socketService.on('broadcast-list-updated', (streams: any[]) => {
      if (streams.length > 0) {
        setActiveBroadcast(streams[0]);
      } else {
        setActiveBroadcast(null);
      }
    });

    socketService.emit('get-active-broadcasts');

    return () => {
      socketService.off('broadcast-list-updated');
    };
  }, [token]);

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'CodeOutlined': return <CodeOutlined />;
      case 'BulbOutlined': return <BulbOutlined />;
      default: return <ThunderboltOutlined />;
    }
  };

  return (
    <div style={{ background: 'var(--canvas-white)', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Hero Section */}
      <section className="pattern-mudcloth" style={{ paddingTop: '160px', paddingBottom: '60px', borderBottom: '3px solid var(--onyx-black)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '32px' }}>
            <div>
              <span className="eyebrow" style={{ color: 'var(--baobab-emerald)' }}>Build. Learn. Apply.</span>
              <Title level={1} style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', margin: '12px 0', textTransform: 'uppercase', letterSpacing: '-0.02em', fontWeight: 900 }}>
                THE <span style={{ color: 'var(--baobab-emerald)' }}>LAB</span>
              </Title>
            </div>

            {activeBroadcast && (
              <div 
                className="geometric-card" 
                style={{ 
                  padding: '24px 32px', 
                  background: 'var(--onyx-black)', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '24px',
                  boxShadow: '8px 8px 0px var(--baobab-emerald)'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div className="pulse-dot" style={{ width: '12px', height: '12px', background: '#ff4d4f', borderRadius: '50%' }} />
                </div>
                <div>
                  <Text style={{ color: 'white', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '12px', display: 'block' }}>Live Now on PanX TV</Text>
                  <Text style={{ color: 'var(--baobab-emerald)', fontWeight: 700 }}>{activeBroadcast.title}</Text>
                </div>
                <Button 
                  type="primary" 
                  danger 
                  icon={<PlayCircleOutlined />} 
                  style={{ borderRadius: 0, fontWeight: 900, textTransform: 'uppercase', height: '48px', padding: '0 24px' }}
                  onClick={() => navigate(`/tv?view=${activeBroadcast.roomId}`)}
                >
                  Join Live
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Core Sections */}
      <div className="container" style={{ marginTop: '80px' }}>
        {isLoading ? (
          <div className="flex-center" style={{ minHeight: '400px' }}>
            <div className="loading-spinner" />
          </div>
        ) : (
          <Space direction="vertical" size={100} style={{ width: '100%' }}>
            {categories.map((cat, index) => (
              <div key={cat.id || index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', borderBottom: '2px solid var(--onyx-black)', paddingBottom: '24px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ color: 'var(--baobab-emerald)', fontSize: '24px' }}>{getIcon(cat.icon)}</div>
                      <Title level={2} style={{ margin: 0, textTransform: 'uppercase', fontSize: '2.5rem' }}>{cat.title}</Title>
                    </div>
                    <Paragraph style={{ margin: 0, color: 'var(--ash-grey)', fontWeight: 700, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.05em' }}>
                      {cat.descriptor}
                    </Paragraph>
                  </div>
                  <Button 
                    type="link" 
                    icon={<ArrowRightOutlined />} 
                    style={{ color: 'var(--onyx-black)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  >
                    View All
                  </Button>
                </div>

                <div className="no-scrollbar" style={{ display: 'flex', gap: '32px', overflowX: 'auto', paddingBottom: '40px', paddingLeft: '4px' }}>
                  {cat.packages?.map((pkg: any) => (
                    <div 
                      key={pkg.id}
                      className="geometric-card"
                      style={{ 
                        flexShrink: 0, 
                        width: '320px', 
                        backgroundColor: 'var(--canvas-white)', 
                        border: '3px solid var(--onyx-black)',
                        boxShadow: '8px 8px 0px var(--onyx-black)',
                        padding: '40px 32px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '380px',
                        cursor: 'pointer',
                        transition: 'var(--snappy)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '12px 12px 0px var(--baobab-emerald)';
                        e.currentTarget.style.borderColor = 'var(--baobab-emerald)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '8px 8px 0px var(--onyx-black)';
                        e.currentTarget.style.borderColor = 'var(--onyx-black)';
                      }}
                    >
                      {/* Background Accent */}
                      <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.05 }}>
                        <ThunderboltOutlined style={{ fontSize: '120px', color: 'var(--onyx-black)' }} />
                      </div>

                      <div>
                        <Tag style={{ borderRadius: 0, border: '1px solid var(--onyx-black)', background: 'var(--papyrus-off-white)', fontWeight: 900, marginBottom: '24px' }}>
                          {pkg.level}
                        </Tag>
                        <Title level={3} style={{ textTransform: 'uppercase', margin: 0, fontSize: '24px', lineHeight: 1.2 }}>{pkg.name}</Title>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                          <RocketOutlined style={{ color: 'var(--baobab-emerald)' }} />
                          <Text style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '12px' }}>{pkg.duration}</Text>
                        </div>
                        <Button block className="afro-button" style={{ height: '54px' }}>ENROLL NOW</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Space>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .pulse-dot {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 77, 79, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); }
        }
      `}} />
    </div>
  );
};

export default LabPage;
