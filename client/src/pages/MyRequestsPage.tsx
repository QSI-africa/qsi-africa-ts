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
    <div style={{ padding: '60px 20px', maxWidth: 1000, margin: '0 auto', minHeight: '100vh' }}>
      <div style={{ marginBottom: 40 }}>
        <Title level={2} style={{ color: '#fff' }}>My Sovereignty Dashboard</Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.6)' }}>
          Track your infrastructure engagements and manage your professional documentation.
        </Paragraph>
      </div>

      <Tabs defaultActiveKey="1" className="glass-card" style={{ padding: 24 }}>
        <TabPane tab={<span><EnvironmentOutlined /> Site Visits</span>} key="1">
          <List
            loading={loading}
            dataSource={siteVisits}
            locale={{ emptyText: <Empty description={<Text style={{ color: 'rgba(255,255,255,0.3)' }}>No site visit requests yet</Text>} /> }}
            renderItem={visit => (
              <Card style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Title level={4} style={{ color: '#fff', margin: 0 }}>{visit.project.title}</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.45)' }}>Requested on {new Date(visit.createdAt).toLocaleDateString()}</Text>
                  </div>
                  <Tag color={statusMap[visit.status]?.color} icon={statusMap[visit.status]?.icon}>
                    {visit.status}
                  </Tag>
                </div>
                <Divider style={{ margin: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }} />
                <Paragraph style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                  <Text strong style={{ color: '#10b981' }}>Lead Engineer:</Text> {visit.project.engineerProfile.user.name}
                </Paragraph>
              </Card>
            )}
          />
        </TabPane>

        <TabPane tab={<span><CarOutlined /> Logistics Activity</span>} key="2">
          <List
            dataSource={vehicleAccepts}
            locale={{ emptyText: <Empty description={<Text style={{ color: 'rgba(255,255,255,0.3)' }}>No logistics activity yet</Text>} /> }}
            renderItem={item => (
              <Card style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 16 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <Space direction="vertical" size={0}>
                      <Text strong style={{ color: '#fff', fontSize: 16 }}>{item.location}</Text>
                      <Text style={{ color: 'rgba(255,255,255,0.45)' }}>{item.duration} mission</Text>
                   </Space>
                   <Text style={{ color: '#10b981', fontWeight: 700, fontSize: 18 }}>${item.price}</Text>
                 </div>
              </Card>
            )}
          />
        </TabPane>

        <TabPane tab={<span><FileTextOutlined /> Digital Vault</span>} key="3">
           <div style={{ textAlign: 'right', marginBottom: 20 }}>
             <Button type="primary" icon={<DownloadOutlined />}>Upload New Document</Button>
           </div>
           <List
             dataSource={documents}
             locale={{ emptyText: <Empty description={<Text style={{ color: 'rgba(255,255,255,0.3)' }}>Your vault is empty</Text>} /> }}
             renderItem={doc => (
               <Card size="small" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', marginBottom: 12 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <Space>
                     <FileTextOutlined style={{ color: '#10b981', fontSize: 20 }} />
                     <Text style={{ color: '#fff' }}>{doc.originalName}</Text>
                   </Space>
                   <Button type="link" icon={<DownloadOutlined />} href={getServerUrl(doc.filePath)} target="_blank" />
                 </div>
               </Card>
             )}
           />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MyRequestsPage;
