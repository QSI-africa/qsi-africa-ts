import { 
  Typography, Card, Row, Col, Button, Form, Input, 
  Select, Tabs, notification, Avatar, Upload, 
  Space, Divider, Tag, List, Badge, Modal 
} from 'antd';
import { 
  UserOutlined, ProjectOutlined, PlusOutlined, 
  UploadOutlined, SafeOutlined, EditOutlined,
  FilePdfOutlined, EyeOutlined, CheckCircleOutlined,
  CalendarOutlined, MailOutlined, PhoneOutlined 
} from '@ant-design/icons';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const EngineerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [siteVisits, setSiteVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [projectForm] = Form.useForm();
  const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchProjects();
    fetchSiteVisits();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/network/engineers');
      const myProfile = response.data.find((p: any) => p.userId === user.id);
      if (myProfile) {
        setProfile(myProfile);
        form.setFieldsValue({
          ...myProfile,
          skills: myProfile.skills || []
        });
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/network/projects');
      setProjects(response.data.filter((p: any) => p.engineerProfile.userId === user.id));
    } catch (error) {
      console.error("Fetch projects error:", error);
    }
  };

  const fetchSiteVisits = async () => {
    try {
      const response = await api.get('/mobility/my-project-visits');
      setSiteVisits(response.data);
    } catch (error) {
      console.error("Fetch visits error:", error);
    }
  };

  const onProfileFinish = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/network/profile', values);
      notification.success({ message: 'Profile Updated' });
      fetchProfile();
    } catch (error) {
      notification.error({ message: 'Update Failed' });
    } finally {
      setLoading(false);
    }
  };

  const onProjectFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await api.post('/network/projects', values);
      notification.success({ message: 'Project Added' });
      setIsProjectModalVisible(false);
      projectForm.resetFields();
      fetchProjects();
    } catch (error) {
      notification.error({ message: 'Failed to add project' });
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (info: any) => {
    if (info.file.status === 'done') {
      notification.success({ message: 'Resume Uploaded' });
      fetchProfile();
    } else if (info.file.status === 'error') {
      notification.error({ message: 'Upload Failed' });
    }
  };

  const handleProjectImageUpload = async (projectId: string, info: any) => {
    if (info.file.status === 'done') {
      notification.success({ message: 'Image Added to Project' });
      fetchProjects();
    }
  };

  const handleUpdateVisitStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/mobility/site-visit/${id}/status`, { status });
      notification.success({ message: `Visit ${status.toLowerCase()}` });
      fetchSiteVisits();
    } catch (error) {
      notification.error({ message: 'Failed to update status' });
    }
  };

  const getServerUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `http://localhost:3001${path}`;
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto', minHeight: '100vh' }}>
      <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
        <div>
          <Title level={2} style={{ color: '#fff', margin: 0 }}>Professional Dashboard</Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.6)' }}>
            Orchestrating infrastructure milestones and professional documentation.
          </Paragraph>
        </div>
        <Badge count={siteVisits.length} offset={[-10, 10]}>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsProjectModalVisible(true)}>
             Post New Project
          </Button>
        </Badge>
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile & Document Management */}
        <Col xs={24} lg={8}>
          <Card className="glass-card" style={{ marginBottom: 24 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={120} icon={<UserOutlined />} src={getServerUrl(profile?.avatarUrl)} style={{ border: '4px solid rgba(255,255,255,0.1)', background: '#1A3D63' }} />
              <Title level={4} style={{ color: '#fff', marginTop: 16, marginBottom: 4 }}>{user?.name}</Title>
              <Tag color="green">{profile?.specialization || 'Strategic Engineer'}</Tag>
            </div>
            
            <Divider style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
            
            <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>Professional Files</Title>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 12 }}>
               {profile?.resumeUrl ? (
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <Space><FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 24 }} /><Text style={{ color: '#fff' }}>Official Resume</Text></Space>
                   <Button type="link" icon={<EditOutlined />} href={getServerUrl(profile.resumeUrl)} target="_blank" />
                 </div>
               ) : (
                 <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, display: 'block', marginBottom: 12 }}>No resume uploaded yet.</Text>
               )}
               
               <Upload 
                 action="http://localhost:3001/api/upload/document"
                 headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
                 data={{ category: 'RESUME' }}
                 name="document"
                 showUploadList={false}
                 onChange={handleResumeUpload}
               >
                 <Button icon={<UploadOutlined />} block style={{ marginTop: 10 }}>
                   {profile?.resumeUrl ? 'Update Resume' : 'Upload Resume (PDF)'}
                 </Button>
               </Upload>
            </div>
          </Card>

          <Card className="glass-card" title={<span style={{ color: '#fff' }}>Profile Details</span>}>
            <Form form={form} layout="vertical" onFinish={onProfileFinish}>
              <Form.Item name="specialization" label={<Text style={{ color: 'rgba(255,255,255,0.6)' }}>Expertise</Text>}>
                <Input placeholder="e.g. Structural Systems" />
              </Form.Item>
              <Form.Item name="bio" label={<Text style={{ color: 'rgba(255,255,255,0.6)' }}>Professional Bio</Text>}>
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item name="skills" label={<Text style={{ color: 'rgba(255,255,255,0.6)' }}>Key Competencies</Text>}>
                <Select mode="tags" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>Update Profile</Button>
            </Form>
          </Card>
        </Col>

        {/* Project Showcase & Site Visits */}
        <Col xs={24} lg={16}>
          <Tabs defaultActiveKey="1" className="glass-card" style={{ padding: '0 20px 20px' }}>
            <TabPane tab={<span><ProjectOutlined /> Infrastructure Showcase</span>} key="1">
              <List
                dataSource={projects}
                renderItem={item => (
                  <Card key={item.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 20 }}>
                     <Row gutter={20}>
                       <Col xs={24} md={6}>
                          <img src={getServerUrl(item.imageUrl)} style={{ width: '100%', borderRadius: 8, height: 120, objectFit: 'cover' }} fallback="https://via.placeholder.com/150" />
                          <div style={{ marginTop: 10 }}>
                            <Upload
                              action="http://localhost:3001/api/upload/project-image"
                              headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
                              data={{ projectId: item.id }}
                              name="image"
                              showUploadList={false}
                              onChange={(info) => handleProjectImageUpload(item.id, info)}
                            >
                              <Button size="small" icon={<PlusOutlined />} block>Add Gallery Image</Button>
                            </Upload>
                          </div>
                       </Col>
                       <Col xs={24} md={18}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Title level={4} style={{ color: '#fff', margin: 0 }}>{item.title}</Title>
                            <Tag color={item.status === 'COMPLETED' ? 'green' : 'blue'}>{item.status}</Tag>
                          </div>
                          <Paragraph style={{ color: 'rgba(255,255,255,0.45)', marginTop: 8 }}>{item.description}</Paragraph>
                          
                          {item.images && item.images.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                              {item.images.map((img: any) => (
                                <Avatar key={img.id} shape="square" size={40} src={getServerUrl(img.imageUrl)} />
                              ))}
                            </div>
                          )}
                       </Col>
                     </Row>
                  </Card>
                )}
              />
            </TabPane>

            <TabPane tab={<span><CalendarOutlined /> Site Visit Requests</span>} key="2">
              <List
                dataSource={siteVisits}
                renderItem={visit => (
                  <Card style={{ background: 'rgba(0,0,0,0.2)', border: 'none', marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong style={{ color: '#fff', fontSize: 16 }}>{visit.user.name}</Text>
                        <div style={{ marginTop: 4 }}>
                          <Tag icon={<RocketOutlined />}>{visit.project.title}</Tag>
                          <Text style={{ color: 'rgba(255,255,255,0.45)', marginLeft: 12 }}>{new Date(visit.createdAt).toLocaleDateString()}</Text>
                        </div>
                        <Paragraph style={{ color: 'rgba(255,255,255,0.6)', marginTop: 10, fontStyle: 'italic' }}>
                          "{visit.message}"
                        </Paragraph>
                      </div>
                      <Space direction="vertical" align="end">
                         <div style={{ display: 'flex', gap: 12 }}>
                            <Tooltip title={visit.user.email}><Button icon={<MailOutlined />} href={`mailto:${visit.user.email}`} /></Tooltip>
                            {visit.user.phone && <Tooltip title={visit.user.phone}><Button icon={<PhoneOutlined />} href={`tel:${visit.user.phone}`} /></Tooltip>}
                         </div>
                         {visit.status === 'PENDING' ? (
                           <Space>
                             <Button 
                               type="primary" 
                               size="small" 
                               icon={<CheckCircleOutlined />} 
                               onClick={() => handleUpdateVisitStatus(visit.id, 'APPROVED')}
                             >
                               Approve
                             </Button>
                             <Button 
                               danger 
                               size="small" 
                               onClick={() => handleUpdateVisitStatus(visit.id, 'REJECTED')}
                             >
                               Reject
                             </Button>
                           </Space>
                         ) : (
                           <Tag color={visit.status === 'APPROVED' ? 'green' : 'red'}>{visit.status}</Tag>
                         )}
                      </Space>
                    </div>
                  </Card>
                )}
              />
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      {/* Post Project Modal */}
      <Modal
        title="Post New Infrastructure Project"
        open={isProjectModalVisible}
        onCancel={() => setIsProjectModalVisible(false)}
        footer={null}
        className="glass-card"
      >
        <Form form={projectForm} layout="vertical" onFinish={onProjectFinish}>
            <Form.Item name="title" label="Project Title" rules={[{ required: true }]}>
              <Input placeholder="e.g. Smart Utility Grid Expansion" />
            </Form.Item>
            <Form.Item name="status" label="Current Status" initialValue="PLANNED">
              <Select>
                <Select.Option value="PLANNED">Planned Phase</Select.Option>
                <Select.Option value="IN_PROGRESS">Execution Phase</Select.Option>
                <Select.Option value="COMPLETED">Actualized Milestone</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="description" label="Detailed Description" rules={[{ required: true }]}>
              <Input.TextArea rows={4} placeholder="What is the impact of this project?" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} size="large">
              Publish to Network
            </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default EngineerDashboard;
