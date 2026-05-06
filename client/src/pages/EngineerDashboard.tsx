import React, { useState, useEffect } from 'react';
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
    <div style={{ padding: '80px 20px', maxWidth: 1400, margin: '0 auto', minHeight: '100vh', background: 'var(--canvas-white)' }}>
      <div style={{ marginBottom: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <span className="eyebrow" style={{ color: 'var(--baobab-emerald)', fontWeight: 900 }}>Network Operations</span>
          <Title level={1} style={{ color: 'var(--onyx-black)', margin: 0, textTransform: 'uppercase', fontSize: '3rem' }}>Professional Dashboard</Title>
          <Paragraph style={{ color: 'var(--ash-grey)', marginTop: 8, fontFamily: 'var(--font-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Orchestrating infrastructure milestones and professional documentation.
          </Paragraph>
        </div>
        <Badge count={siteVisits.length} offset={[-5, 5]}>
          <AfroButton primary size="large" icon={<PlusOutlined />} onClick={() => setIsProjectModalVisible(true)}>
             POST NEW PROJECT
          </AfroButton>
        </Badge>
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile & Document Management */}
        <Col xs={24} lg={8}>
          <div className="geometric-card" style={{ marginBottom: 24, padding: '32px' }}>
            <CornerAccent position="tl" />
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={120} icon={<UserOutlined />} src={getServerUrl(profile?.avatarUrl)} style={{ border: '4px solid var(--onyx-black)', background: 'var(--papyrus-off-white)', borderRadius: 0 }} />
              <Title level={4} style={{ color: 'var(--onyx-black)', marginTop: 24, marginBottom: 8, textTransform: 'uppercase' }}>{user?.name}</Title>
              <Tag style={{ borderRadius: 0, background: 'var(--baobab-emerald)', color: 'white', border: 'none', padding: '2px 12px', fontWeight: 700 }}>
                {profile?.specialization?.toUpperCase() || 'STRATEGIC ENGINEER'}
              </Tag>
            </div>
            
            <Divider style={{ borderColor: 'var(--onyx-black)', opacity: 0.1 }} />
            
            <Title level={5} style={{ color: 'var(--onyx-black)', marginBottom: 16, textTransform: 'uppercase', fontFamily: 'var(--font-accent)' }}>Professional Files</Title>
            <div style={{ background: 'var(--papyrus-off-white)', padding: 20, border: '2px solid var(--onyx-black)' }}>
               {profile?.resumeUrl ? (
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                   <Space><FilePdfOutlined style={{ color: 'var(--terracotta-clay)', fontSize: 24 }} /><Text style={{ color: 'var(--onyx-black)', fontWeight: 700 }}>Official Resume</Text></Space>
                   <Button type="link" icon={<EditOutlined />} href={getServerUrl(profile.resumeUrl)} target="_blank" style={{ color: 'var(--baobab-emerald)' }} />
                 </div>
               ) : (
                 <Text style={{ color: 'var(--ash-grey)', fontSize: 13, display: 'block', marginBottom: 12 }}>No resume uploaded yet.</Text>
               )}
               
               <Upload 
                 action="http://localhost:3001/api/upload/document"
                 headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
                 data={{ category: 'RESUME' }}
                 name="document"
                 showUploadList={false}
                 onChange={handleResumeUpload}
               >
                 <AfroButton style={{ width: '100%', fontSize: '11px', height: '40px' }} icon={<UploadOutlined />}>
                   {profile?.resumeUrl ? 'UPDATE RESUME' : 'UPLOAD RESUME (PDF)'}
                 </AfroButton>
               </Upload>
            </div>
          </div>

          <div className="geometric-card" style={{ padding: '32px' }}>
            <span className="eyebrow" style={{ fontSize: '10px' }}>Profile Details</span>
            <Form form={form} layout="vertical" onFinish={onProfileFinish} requiredMark={false}>
              <Form.Item name="specialization" label={<span className="eyebrow" style={{ fontSize: '10px', marginBottom: 0 }}>Expertise</span>}>
                <Input placeholder="e.g. Structural Systems" style={{ borderRadius: 0, border: '2px solid var(--onyx-black)' }} />
              </Form.Item>
              <Form.Item name="bio" label={<span className="eyebrow" style={{ fontSize: '10px', marginBottom: 0 }}>Professional Bio</span>}>
                <Input.TextArea rows={3} style={{ borderRadius: 0, border: '2px solid var(--onyx-black)' }} />
              </Form.Item>
              <Form.Item name="skills" label={<span className="eyebrow" style={{ fontSize: '10px', marginBottom: 0 }}>Key Competencies</span>}>
                <Select mode="tags" style={{ width: '100%' }} />
              </Form.Item>
              <AfroButton primary htmlType="submit" loading={loading} style={{ width: '100%' }}>UPDATE PROFILE</AfroButton>
            </Form>
          </div>
        </Col>

        {/* Project Showcase & Site Visits */}
        <Col xs={24} lg={16}>
          <div className="geometric-card" style={{ padding: '0', background: 'var(--canvas-white)', position: 'relative' }}>
            <CornerAccent position="tr" color="var(--baobab-emerald)" />
            <Tabs 
              defaultActiveKey="1" 
              style={{ padding: '24px 32px 32px' }}
              tabBarStyle={{ borderBottom: '2px solid var(--onyx-black)', marginBottom: '32px' }}
            >
              <TabPane tab={<span style={{ fontFamily: 'var(--font-accent)', textTransform: 'uppercase', fontWeight: 900, fontSize: '12px' }}><ProjectOutlined /> Infrastructure Showcase</span>} key="1">
                <List
                  dataSource={projects}
                  renderItem={item => (
                    <div key={item.id} style={{ background: 'var(--papyrus-off-white)', border: '2px solid var(--onyx-black)', padding: '24px', marginBottom: '24px', boxShadow: '6px 6px 0px var(--onyx-black)' }}>
                       <Row gutter={24} align="middle">
                         <Col xs={24} md={6}>
                            <img src={getServerUrl(item.imageUrl)} style={{ width: '100%', border: '2px solid var(--onyx-black)', height: 140, objectFit: 'cover' }} fallback="https://via.placeholder.com/150" />
                            <div style={{ marginTop: 12 }}>
                              <Upload
                                action="http://localhost:3001/api/upload/project-image"
                                headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
                                data={{ projectId: item.id }}
                                name="image"
                                showUploadList={false}
                                onChange={(info) => handleProjectImageUpload(item.id, info)}
                              >
                                <AfroButton style={{ width: '100%', fontSize: '10px', height: '32px', padding: 0 }} icon={<PlusOutlined />}>ADD IMAGE</AfroButton>
                              </Upload>
                            </div>
                         </Col>
                         <Col xs={24} md={18}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Title level={4} style={{ color: 'var(--onyx-black)', margin: 0, textTransform: 'uppercase' }}>{item.title}</Title>
                              <Tag style={{ borderRadius: 0, border: '2px solid var(--onyx-black)', background: item.status === 'COMPLETED' ? 'var(--baobab-emerald)' : 'var(--ochre-yellow)', color: 'white', fontWeight: 900 }}>
                                {item.status}
                              </Tag>
                            </div>
                            <Paragraph style={{ color: 'var(--ash-grey)', marginTop: 12, fontSize: '14px', lineHeight: 1.6 }}>{item.description}</Paragraph>
                            
                            {item.images && item.images.length > 0 && (
                              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                {item.images.map((img: any) => (
                                  <Avatar key={img.id} shape="square" size={48} src={getServerUrl(img.imageUrl)} style={{ border: '1px solid var(--onyx-black)', borderRadius: 0 }} />
                                ))}
                              </div>
                            )}
                         </Col>
                       </Row>
                    </div>
                  )}
                />
              </TabPane>

              <TabPane tab={<span style={{ fontFamily: 'var(--font-accent)', textTransform: 'uppercase', fontWeight: 900, fontSize: '12px' }}><CalendarOutlined /> Site Visit Requests</span>} key="2">
                <List
                  dataSource={siteVisits}
                  renderItem={visit => (
                    <div style={{ background: 'var(--papyrus-off-white)', border: '2px solid var(--onyx-black)', padding: '24px', marginBottom: '16px', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <Text strong style={{ color: 'var(--onyx-black)', fontSize: 18, textTransform: 'uppercase' }}>{visit.user.name}</Text>
                          <div style={{ marginTop: 8, display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <Tag style={{ borderRadius: 0, border: '1px solid var(--onyx-black)', background: 'var(--baobab-emerald)', color: 'white' }}>{visit.project.title.toUpperCase()}</Tag>
                            <Text style={{ color: 'var(--ash-grey)', fontSize: '12px', fontFamily: 'var(--font-accent)' }}>{new Date(visit.createdAt).toLocaleDateString()}</Text>
                          </div>
                          <div style={{ marginTop: 16, padding: '12px', borderLeft: '3px solid var(--baobab-emerald)', background: 'rgba(11, 97, 56, 0.05)' }}>
                            <Paragraph style={{ color: 'var(--onyx-black)', margin: 0, fontStyle: 'italic', fontSize: '13px' }}>
                              "{visit.message}"
                            </Paragraph>
                          </div>
                        </div>
                        <Space direction="vertical" align="end">
                           <div style={{ display: 'flex', gap: 12 }}>
                              <Button icon={<MailOutlined />} href={`mailto:${visit.user.email}`} style={{ borderRadius: 0, border: '2px solid var(--onyx-black)' }} />
                              {visit.user.phone && <Button icon={<PhoneOutlined />} href={`tel:${visit.user.phone}`} style={{ borderRadius: 0, border: '2px solid var(--onyx-black)' }} />}
                           </div>
                           {visit.status === 'PENDING' ? (
                             <Space style={{ marginTop: 8 }}>
                               <AfroButton 
                                 primary 
                                 style={{ height: '32px', fontSize: '10px', padding: '0 12px' }} 
                                 icon={<CheckCircleOutlined />} 
                                 onClick={() => handleUpdateVisitStatus(visit.id, 'APPROVED')}
                               >
                                 APPROVE
                               </AfroButton>
                               <AfroButton 
                                 style={{ height: '32px', fontSize: '10px', padding: '0 12px', color: 'var(--terracotta-clay)', borderColor: 'var(--terracotta-clay)' }} 
                                 onClick={() => handleUpdateVisitStatus(visit.id, 'REJECTED')}
                               >
                                 REJECT
                               </AfroButton>
                             </Space>
                           ) : (
                             <Tag style={{ borderRadius: 0, border: '2px solid var(--onyx-black)', background: visit.status === 'APPROVED' ? 'var(--baobab-emerald)' : 'var(--terracotta-clay)', color: 'white', fontWeight: 900 }}>
                               {visit.status}
                             </Tag>
                           )}
                        </Space>
                      </div>
                    </div>
                  )}
                />
              </TabPane>
            </Tabs>
          </div>
        </Col>
      </Row>

      {/* Post Project Modal */}
      <Modal
        title={null}
        open={isProjectModalVisible}
        onCancel={() => setIsProjectModalVisible(false)}
        footer={null}
        styles={{ 
          content: { 
            borderRadius: 0, 
            border: '4px solid var(--onyx-black)', 
            padding: '40px',
            boxShadow: '15px 15px 0px var(--onyx-black)'
          }
        }}
        centered
      >
        <CornerAccent position="tr" color="var(--baobab-emerald)" />
        <span className="eyebrow">Project Registry</span>
        <Title level={2} style={{ textTransform: 'uppercase', marginBottom: '32px' }}>Post New Infrastructure Project</Title>
        <Form form={projectForm} layout="vertical" onFinish={onProjectFinish} requiredMark={false}>
            <Form.Item name="title" label={<span className="eyebrow" style={{ fontSize: '10px', marginBottom: 0 }}>Project Title</span>} rules={[{ required: true }]}>
              <Input placeholder="e.g. Smart Utility Grid Expansion" style={{ borderRadius: 0, border: '2px solid var(--onyx-black)', height: '48px' }} />
            </Form.Item>
            <Form.Item name="status" label={<span className="eyebrow" style={{ fontSize: '10px', marginBottom: 0 }}>Current Status</span>} initialValue="PLANNED">
              <Select style={{ height: '48px' }}>
                <Select.Option value="PLANNED">Planned Phase</Select.Option>
                <Select.Option value="IN_PROGRESS">Execution Phase</Select.Option>
                <Select.Option value="COMPLETED">Actualized Milestone</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="description" label={<span className="eyebrow" style={{ fontSize: '10px', marginBottom: 0 }}>Detailed Description</span>} rules={[{ required: true }]}>
              <Input.TextArea rows={4} placeholder="What is the impact of this project?" style={{ borderRadius: 0, border: '2px solid var(--onyx-black)' }} />
            </Form.Item>
            <AfroButton primary htmlType="submit" block loading={loading} style={{ height: '64px', marginTop: '12px' }}>
              PUBLISH TO NETWORK
            </AfroButton>
        </Form>
      </Modal>
    </div>
  );
};

export default EngineerDashboard;
