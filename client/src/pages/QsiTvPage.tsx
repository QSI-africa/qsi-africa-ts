import React, { useEffect } from 'react';
import { 
  Layout, Row, Col, Typography, Button, 
  Empty, Badge, Card, Space as AntSpace 
} from 'antd';
import { 
  VideoCameraOutlined, PlaySquareOutlined, RocketOutlined 
} from '@ant-design/icons';
import { socketService } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import VideoCallContainer from '../components/VideoCallContainer';
import LiveBroadcastContainer from '../components/LiveBroadcastContainer';
import LiveViewerContainer from '../components/LiveViewerContainer';
import { useSearchParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { Content } = Layout;

const QsiTvPage: React.FC = () => {
    const { token } = useAuth() || { token: null };
    const [searchParams] = useSearchParams();
    const [streams, setStreams] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [activeRoomId, setActiveRoomId] = React.useState<string | null>(null);
    const [isBroadcasting, setIsBroadcasting] = React.useState<boolean>(false);
    const [activeViewerRoom, setActiveViewerRoom] = React.useState<{id: string, title: string} | null>(null);

    useEffect(() => {
        socketService.connect(token || undefined);
        
        // Check for call param on mount
        const callRoomId = searchParams.get('call');
        if (callRoomId) {
            setActiveRoomId(callRoomId);
        }

        socketService.on('broadcast-list-updated', (updatedStreams: any[]) => {
            setStreams(updatedStreams);
            setIsLoading(false);
            
            // Check for view param if not already viewing or in a call
            const viewRoomId = searchParams.get('view');
            if (viewRoomId && !activeViewerRoom && !activeRoomId && !isBroadcasting) {
                const stream = updatedStreams.find(s => s.roomId === viewRoomId);
                if (stream) {
                    setActiveViewerRoom({ id: stream.roomId, title: stream.title });
                }
            }
        });

        // Request initial list
        socketService.emit('get-active-broadcasts');

        // Safety timeout to prevent infinite loading state
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 8000); // 8 seconds safety

        return () => {
            clearTimeout(timer);
            socketService.off('broadcast-list-updated');
        };
    }, [token]);

    const handleCreateRoom = () => {
        const roomId = Math.random().toString(36).substring(2, 9);
        setActiveRoomId(roomId);
        console.log('Creating room:', roomId);
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
        <Layout style={{ minHeight: '100vh', background: 'transparent', padding: '100px 20px 20px' }}>
            <Content style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Title level={1} style={{ color: '#fff' }}>QSI TV</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 18 }}>
                        Experience live intelligence through real-time video and streams.
                    </Text>
                </div>

                {activeRoomId ? (
                    <div style={{ marginBottom: 40 }}>
                        <Title level={3} style={{ color: '#fff' }}>Room: {activeRoomId}</Title>
                        <VideoCallContainer roomId={activeRoomId} onLeave={handleLeaveCall} />
                    </div>
                ) : isBroadcasting ? (
                    <div style={{ marginBottom: 40 }}>
                        <LiveBroadcastContainer onStop={handleStopBroadcast} />
                    </div>
                ) : activeViewerRoom ? (
                    <div style={{ marginBottom: 40 }}>
                        <Button style={{ marginBottom: 20 }} onClick={() => setActiveViewerRoom(null)}>Back to Hub</Button>
                        <LiveViewerContainer 
                            roomId={activeViewerRoom.id} 
                            title={activeViewerRoom.title} 
                            onClose={() => setActiveViewerRoom(null)} 
                        />
                    </div>
                ) : (
                    <Row gutter={[24, 24]}>
                        {/* Live Streams Section */}
                        <Col xs={24} lg={16}>
                            <Card 
                                title={<AntSpace><PlaySquareOutlined /> Live Streams</AntSpace>}
                                extra={
                                    <Button 
                                        type="primary" 
                                        icon={<RocketOutlined />} 
                                        onClick={handleStartBroadcast}
                                        size="small"
                                    >
                                        Go Live
                                    </Button>
                                }
                                loading={isLoading}
                                style={{ 
                                    background: 'rgba(30, 41, 59, 0.7)', 
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(10px)',
                                    minHeight: 300,
                                    borderRadius: 16
                                }}
                                headStyle={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                {streams.length === 0 ? (
                                    <Empty 
                                        image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                        description={<span style={{ color: 'rgba(255,255,255,0.45)' }}>No live streams at the moment</span>} 
                                    />
                                ) : (
                                    <Row gutter={[16, 16]}>
                                        {streams.map((stream, idx) => (
                                            <Col key={idx} xs={24} sm={12}>
                                                <Card
                                                    hoverable
                                                    style={{ 
                                                        background: 'rgba(255,255,255,0.05)', 
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: 12
                                                    }}
                                                    onClick={() => handleJoinViewer(stream)}
                                                >
                                                    <Card.Meta 
                                                        title={<span style={{ color: '#fff' }}>{stream.title}</span>}
                                                        description={<span style={{ color: 'rgba(255,255,255,0.45)' }}>Broadcaster: {stream.broadcasterId.substring(0,6)}...</span>}
                                                    />
                                                    <div style={{ marginTop: 10 }}>
                                                        <Badge status="processing" text={<Text style={{ color: '#10b981' }}>Live Now</Text>} />
                                                    </div>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                )}
                            </Card>
                        </Col>

                        {/* Video Calls Section */}
                        <Col xs={24} lg={8}>
                            <Card 
                                title={<AntSpace><VideoCameraOutlined /> Quick Video Call</AntSpace>}
                                loading={isLoading}
                                style={{ 
                                    background: 'rgba(30, 41, 59, 0.7)', 
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 16
                                }}
                                headStyle={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <Text style={{ color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: 20 }}>
                                        Start or join a private video session.
                                    </Text>
                                    <Button 
                                        type="primary" 
                                        icon={<VideoCameraOutlined />} 
                                        size="large" 
                                        block 
                                        onClick={handleCreateRoom}
                                        style={{ borderRadius: 8, height: 48 }}
                                    >
                                        Create New Room
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Content>
        </Layout>
    );
};

export default QsiTvPage;
