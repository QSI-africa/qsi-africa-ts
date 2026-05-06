import React, { useState, useEffect } from 'react';
import { 
  Typography, Card, Row, Col, Tabs, 
  Tag, List, Button, Space, Empty, 
  Badge, Divider 
} from 'antd';
import { 
  RocketOutlined, EnvironmentOutlined, 
  CheckCircleOutlined, ClockCircleOutlined,
  CloseCircleOutlined, CarOutlined,
  FileTextOutlined, DownloadOutlined 
} from '@ant-design/icons';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const MyRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [siteVisits, setSiteVisits] = useState<any[]>([]);
  const [vehicleAccepts, setVehicleAccepts] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    setLoading(true);
    try {
      const [visitRes, docRes] = await Promise.all([
        api.get('/mobility/my-visits'),
        api.get('/upload/my-documents')
      ]);
      setSiteVisits(visitRes.data);
      setDocuments(docRes.data);
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusMap: any = {
    'PENDING': { color: 'orange', icon: <ClockCircleOutlined /> },
    'APPROVED': { color: 'green', icon: <CheckCircleOutlined /> },
    'REJECTED': { color: 'red', icon: <CloseCircleOutlined /> },
  };

  const getServerUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `http://localhost:3001${path}`;
  };

  return (
    <div style={{ padding: '80px 20px', maxWidth: 1200, margin: '0 auto', minHeight: '100vh', background: 'var(--canvas-white)' }}>
      <div style={{ marginBottom: 60, position: 'relative' }}>
        <div className="pattern-dots" style={{ position: 'absolute', top: -40, left: 0, right: 0, height: 200, opacity: 0.1, zIndex: 0 }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow" style={{ color: 'var(--baobab-emerald)', fontWeight: 900 }}>User Activity</span>
          <Title level={1} style={{ color: 'var(--onyx-black)', textTransform: 'uppercase', fontSize: '3rem', margin: 0 }}>My Sovereignty Dashboard</Title>
          <Paragraph style={{ color: 'var(--ash-grey)', marginTop: 8, fontFamily: 'var(--font-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Track your infrastructure engagements and manage your professional documentation.
          </Paragraph>
        </div>
      </div>

      <div className="geometric-card" style={{ padding: 0, background: 'var(--canvas-white)', overflow: 'hidden' }}>
        <CornerAccent position="tl" color="var(--baobab-emerald)" />
        <Tabs 
          defaultActiveKey="1" 
          style={{ padding: '32px' }}
          tabBarStyle={{ borderBottom: '2px solid var(--onyx-black)', marginBottom: '32px' }}
        >
          <TabPane tab={<span style={{ fontFamily: 'var(--font-accent)', textTransform: 'uppercase', fontWeight: 900, fontSize: '12px' }}><EnvironmentOutlined /> Site Visits</span>} key="1">
            <List
              loading={loading}
              dataSource={siteVisits}
              locale={{ emptyText: <Empty description={<Text style={{ color: 'var(--ash-grey)' }}>No site visit requests yet</Text>} /> }}
              renderItem={visit => (
                <div style={{ background: 'var(--papyrus-off-white)', border: '2px solid var(--onyx-black)', padding: '24px', marginBottom: '16px', boxShadow: '4px 4px 0px var(--onyx-black)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Title level={4} style={{ color: 'var(--onyx-black)', margin: 0, textTransform: 'uppercase' }}>{visit.project.title}</Title>
                      <Text style={{ color: 'var(--ash-grey)', fontSize: '12px', fontFamily: 'var(--font-accent)' }}>Requested on {new Date(visit.createdAt).toLocaleDateString()}</Text>
                    </div>
                    <Tag style={{ borderRadius: 0, border: '2px solid var(--onyx-black)', background: statusMap[visit.status]?.color === 'green' ? 'var(--baobab-emerald)' : statusMap[visit.status]?.color === 'orange' ? 'var(--ochre-yellow)' : 'var(--terracotta-clay)', color: 'white', fontWeight: 900 }}>
                      {visit.status}
                    </Tag>
                  </div>
                  <Divider style={{ margin: '16px 0', borderColor: 'var(--onyx-black)', opacity: 0.1 }} />
                  <Paragraph style={{ color: 'var(--ash-grey)', margin: 0, fontSize: '14px' }}>
                    <Text strong style={{ color: 'var(--baobab-emerald)', textTransform: 'uppercase', fontSize: '12px' }}>Lead Engineer:</Text> {visit.project.engineerProfile.user.name}
                  </Paragraph>
                </div>
              )}
            />
          </TabPane>

          <TabPane tab={<span style={{ fontFamily: 'var(--font-accent)', textTransform: 'uppercase', fontWeight: 900, fontSize: '12px' }}><CarOutlined /> Logistics Activity</span>} key="2">
            <List
              dataSource={vehicleAccepts}
              locale={{ emptyText: <Empty description={<Text style={{ color: 'var(--ash-grey)' }}>No logistics activity yet</Text>} /> }}
              renderItem={item => (
                <div style={{ background: 'var(--papyrus-off-white)', border: '2px solid var(--onyx-black)', padding: '24px', marginBottom: '16px', boxShadow: '4px 4px 0px var(--onyx-black)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <Space direction="vertical" size={0}>
                        <Text strong style={{ color: 'var(--onyx-black)', fontSize: 18, textTransform: 'uppercase' }}>{item.location}</Text>
                        <Text style={{ color: 'var(--ash-grey)', fontSize: '12px', fontFamily: 'var(--font-accent)' }}>{item.duration.toUpperCase()} MISSION</Text>
                     </Space>
                     <Text style={{ color: 'var(--baobab-emerald)', fontWeight: 900, fontSize: 24 }}>${item.price}</Text>
                   </div>
                </div>
              )}
            />
          </TabPane>

          <TabPane tab={<span style={{ fontFamily: 'var(--font-accent)', textTransform: 'uppercase', fontWeight: 900, fontSize: '12px' }}><FileTextOutlined /> Digital Vault</span>} key="3">
             <div style={{ textAlign: 'right', marginBottom: 24 }}>
               <AfroButton primary icon={<DownloadOutlined />}>UPLOAD NEW DOCUMENT</AfroButton>
             </div>
             <List
               dataSource={documents}
               locale={{ emptyText: <Empty description={<Text style={{ color: 'var(--ash-grey)' }}>Your vault is empty</Text>} /> }}
               renderItem={doc => (
                 <div style={{ background: 'var(--papyrus-off-white)', border: '2px solid var(--onyx-black)', padding: '16px 24px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size="large">
                      <FileTextOutlined style={{ color: 'var(--baobab-emerald)', fontSize: 24 }} />
                      <Text style={{ color: 'var(--onyx-black)', fontWeight: 700, textTransform: 'uppercase', fontSize: '13px' }}>{doc.originalName}</Text>
                    </Space>
                    <Button type="link" icon={<DownloadOutlined style={{ fontSize: 20 }} />} href={getServerUrl(doc.filePath)} target="_blank" style={{ color: 'var(--baobab-emerald)' }} />
                 </div>
               )}
             />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default MyRequestsPage;
