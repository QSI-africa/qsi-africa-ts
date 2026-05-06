import React, { useState, useEffect } from 'react';
import { 
  Layout, Row, Col, Typography, Button, 
  Empty, Badge, Card, Space as AntSpace, theme
} from 'antd';
import { 
  VideoCameraOutlined, PlaySquareOutlined, RocketOutlined, ArrowLeftOutlined 
} from '@ant-design/icons';
import { socketService } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import VideoCallContainer from '../components/VideoCallContainer';
import LiveBroadcastContainer from '../components/LiveBroadcastContainer';
import LiveViewerContainer from '../components/LiveViewerContainer';
import { useSearchParams } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { useToken } = theme;

const QsiTvPage: React.FC = () => {
    const { token } = useAuth() || { token: null };
    const [searchParams] = useSearchParams();
    const [streams, setStreams] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [activeRoomId, setActiveRoomId] = React.useState<string | null>(null);
    const [isBroadcasting, setIsBroadcasting] = React.useState<boolean>(false);
    const [activeViewerRoom, setActiveViewerRoom] = React.useState<{id: string, title: string} | null>(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const { token: antdToken } = useToken();

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth <= 768;

    useEffect(() => {
        socketService.connect(token || undefined);
        
        const callRoomId = searchParams.get('call');
        const viewRoomId = searchParams.get('view');
        
        if (callRoomId) {
            setActiveRoomId(callRoomId);
        } else if (viewRoomId) {
            setActiveViewerRoom({ id: viewRoomId, title: "Connecting..." });
        }

        socketService.on('broadcast-list-updated', (updatedStreams: any[]) => {
            setStreams(updatedStreams);
            setIsLoading(false);
            
            if (viewRoomId && activeViewerRoom?.title === "Connecting...") {
                const stream = updatedStreams.find(s => s.roomId === viewRoomId);
                if (stream) {
                    setActiveViewerRoom({ id: stream.roomId, title: stream.title });
                }
            }
        });

        socketService.emit('get-active-broadcasts');

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 8000);

        return () => {
            clearTimeout(timer);
            socketService.off('broadcast-list-updated');
        };
    }, [token, searchParams]);

    const handleCreateRoom = () => {
        const roomId = Math.random().toString(36).substring(2, 9);
        setActiveRoomId(roomId);
    };

    const handleLeaveCall = () => {
        setActiveRoomId(null);
    };

    const handleStartBroadcast = () => {
        setIsBroadcasting(true);
    };

    const handleStopBroadcast = () => {
        setIsBroadcasting(false);
    };

    const handleJoinViewer = (stream: any) => {
        setActiveViewerRoom({ id: stream.roomId, title: stream.title });
    };

    return (
        <Layout style={{ minHeight: '100vh', background: 'var(--canvas-white)' }}>
            {/* Hero Section */}
            <div 
                className="pattern-dots"
                style={{
                    padding: isMobile ? "100px 5% 40px" : "120px 5% 60px",
                    borderBottom: "3px solid var(--onyx-black)",
                    position: "relative",
                    background: "var(--canvas-white)"
                }}
            >
                <div className="container" style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <span className="eyebrow reveal-up" style={{ color: 'var(--baobab-emerald)' }}>Live Intelligence</span>
                    <Title level={1} className="reveal-up" style={{ 
                        fontSize: isMobile ? "48px" : "80px", 
                        margin: "12px 0", 
                        color: "var(--onyx-black)",
                        textTransform: 'uppercase',
                        fontWeight: 900
                    }}>
                        PanX TV
                    </Title>
                    
                    {/* Colourful Brand Accent Line */}
                    <div 
                        style={{ 
                            height: '8px', 
                            width: isMobile ? '100%' : '300px', 
                            background: 'repeating-linear-gradient(to right, #0B6138 0, #0B6138 24px, #D15B35 24px, #D15B35 48px, #E2B142 48px, #E2B142 72px, #4D7A51 72px, #4D7A51 96px, #111111 96px, #111111 120px)',
                            border: '1px solid var(--onyx-black)',
                            margin: '24px 0'
                        }} 
                    />

                    <Paragraph className="reveal-up" style={{ 
                        fontSize: isMobile ? "16px" : "20px", 
                        color: "var(--onyx-black)", 
                        maxWidth: 600,
                        opacity: 0.8,
                        fontFamily: 'var(--font-body)'
                    }}>
                        Real-time video infrastructure for sovereign African insights. Experience live technical broadcasts and collaborative video sessions.
                    </Paragraph>
                </div>
            </div>

            <Content style={{ 
                padding: (activeRoomId || isBroadcasting || activeViewerRoom) ? '0' : '60px 5%', 
                maxWidth: (activeRoomId || isBroadcasting || activeViewerRoom) ? '100%' : 1400, 
                margin: '0 auto', 
                width: '100%',
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
            }}>
                {activeRoomId ? (
                    <div className="reveal-up" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px 40px', borderBottom: '3px solid var(--onyx-black)', background: 'var(--canvas-white)' }}>
                            <Button 
                                onClick={handleLeaveCall} 
                                className="afro-button"
                                icon={<ArrowLeftOutlined />}
                            >
                                Leave
                            </Button>
                            <span className="eyebrow" style={{ margin: 0 }}>Active Room: {activeRoomId}</span>
                        </div>
                        <div style={{ flex: 1, borderBottom: '3px solid var(--onyx-black)' }}>
                            <VideoCallContainer roomId={activeRoomId} onLeave={handleLeaveCall} />
                        </div>
                    </div>
                ) : isBroadcasting ? (
                    <div className="reveal-up" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px 40px', borderBottom: '3px solid var(--onyx-black)', background: 'var(--canvas-white)' }}>
                            <Button 
                                onClick={handleStopBroadcast} 
                                className="afro-button"
                                icon={<ArrowLeftOutlined />}
                            >
                                Stop
                            </Button>
                            <span className="eyebrow" style={{ margin: 0 }}>Live Transmission</span>
                        </div>
                        <div style={{ flex: 1, borderBottom: '3px solid var(--onyx-black)' }}>
                            <LiveBroadcastContainer onStop={handleStopBroadcast} />
                        </div>
                    </div>
                ) : activeViewerRoom ? (
                    <div className="reveal-up" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px 40px', borderBottom: '3px solid var(--onyx-black)', background: 'var(--canvas-white)' }}>
                            <Button 
                                onClick={() => setActiveViewerRoom(null)} 
                                className="afro-button"
                                icon={<ArrowLeftOutlined />}
                            >
                                Hub
                            </Button>
                            <span className="eyebrow" style={{ margin: 0 }}>Viewing: {activeViewerRoom.title}</span>
                        </div>
                        <div style={{ flex: 1, borderBottom: '3px solid var(--onyx-black)' }}>
                            <LiveViewerContainer 
                                roomId={activeViewerRoom.id} 
                                title={activeViewerRoom.title} 
                                onClose={() => setActiveViewerRoom(null)} 
                            />
                        </div>
                    </div>
                ) : (
                    <Row gutter={[40, 40]}>
                        {/* Live Streams Section */}
                        <Col xs={24} lg={16}>
                            <div 
                                className="geometric-card pattern-mudcloth"
                                style={{ 
                                    padding: '40px',
                                    border: '3px solid var(--onyx-black)',
                                    boxShadow: '10px 10px 0px var(--onyx-black)',
                                    background: 'var(--canvas-white)',
                                    height: '500px',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <PlaySquareOutlined style={{ fontSize: '24px', color: 'var(--baobab-emerald)' }} />
                                        <Title level={3} style={{ margin: 0, textTransform: 'uppercase', fontWeight: 900 }}>Live Streams</Title>
                                    </div>
                                    <Button 
                                        className="afro-button primary"
                                        icon={<RocketOutlined />} 
                                        onClick={handleStartBroadcast}
                                    >
                                        GO LIVE
                                    </Button>
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {isLoading ? (
                                        <div className="flex-center" style={{ minHeight: 200 }}>
                                            <div className="loading-spinner" />
                                        </div>
                                    ) : streams.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                            <Empty 
                                                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                                description={<span className="eyebrow">No active broadcasts</span>} 
                                            />
                                        </div>
                                    ) : (
                                        <Row gutter={[24, 24]}>
                                            {streams.map((stream, idx) => (
                                                <Col key={idx} xs={24} sm={12}>
                                                    <div
                                                        className="geometric-card"
                                                        style={{ 
                                                            background: 'var(--papyrus-off-white)', 
                                                            border: '2px solid var(--onyx-black)',
                                                            padding: '24px',
                                                            cursor: 'pointer',
                                                            transition: 'transform 0.1s ease',
                                                            boxShadow: '4px 4px 0px var(--onyx-black)'
                                                        }}
                                                        onClick={() => handleJoinViewer(stream)}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = "translateY(-4px)";
                                                            e.currentTarget.style.boxShadow = "8px 8px 0px var(--onyx-black)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = "translateY(0)";
                                                            e.currentTarget.style.boxShadow = "4px 4px 0px var(--onyx-black)";
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                            <Badge status="processing" text={<span className="eyebrow" style={{ color: '#10b981', margin: 0 }}>LIVE</span>} />
                                                            <div style={{ padding: '4px 8px', border: '1px solid var(--onyx-black)', fontSize: '10px', fontWeight: 900, background: 'var(--savanna-moss)', color: 'white' }}>
                                                                TRANS
                                                            </div>
                                                        </div>
                                                        <Title level={4} style={{ margin: '0 0 8px 0', textTransform: 'uppercase', fontSize: '16px' }}>{stream.title}</Title>
                                                        <Text style={{ fontSize: '12px', fontFamily: 'var(--font-accent)', opacity: 0.7 }}>
                                                            BROADCASTER: {stream.broadcasterId.substring(0,8).toUpperCase()}
                                                        </Text>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    )}
                                </div>
                            </div>
                        </Col>

                        {/* Video Calls Section */}
                        <Col xs={24} lg={8}>
                            <div 
                                className="geometric-card pattern-lines"
                                style={{ 
                                    padding: '40px',
                                    border: '3px solid var(--onyx-black)',
                                    boxShadow: '10px 10px 0px var(--onyx-black)',
                                    background: 'var(--canvas-white)',
                                    height: '500px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                                    <VideoCameraOutlined style={{ fontSize: '24px', color: 'var(--terracotta-clay)' }} />
                                    <Title level={3} style={{ margin: 0, textTransform: 'uppercase', fontWeight: 900 }}>Video Sessions</Title>
                                </div>
                                
                                <Paragraph style={{ color: 'var(--onyx-black)', opacity: 0.8, marginBottom: '40px', fontSize: '16px' }}>
                                    Initiate or join a private real-time collaborative video session. Encrypted and sovereign.
                                </Paragraph>
                                
                                <Button 
                                    className="afro-button primary" 
                                    icon={<VideoCameraOutlined />} 
                                    onClick={handleCreateRoom}
                                    style={{ width: '100%', height: '64px', fontSize: '16px' }}
                                >
                                    CREATE SESSION
                                </Button>
                            </div>
                        </Col>
                    </Row>
                )}
            </Content>
        </Layout>
    );
};

export default QsiTvPage;
