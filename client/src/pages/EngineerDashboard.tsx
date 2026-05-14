import React, { useState, useEffect } from 'react';
import { 
  Typography, Row, Col, Button, Form, Input, 
  Select, Tabs, notification, Avatar, Upload, 
  Space, Divider, Tag, List, Badge, Modal, Spin 
} from 'antd';
import { 
  User, 
  Layers, 
  Plus, 
  Upload as UploadIcon, 
  ShieldCheck, 
  Edit3,
  FileText, 
  Eye, 
  CheckCircle2,
  Calendar, 
  Mail, 
  Phone,
  ArrowRight,
  MoreVertical,
  Activity,
  Zap
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;

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
      notification.success({ message: 'Operational Profile Updated' });
      fetchProfile();
    } catch (error) {
      notification.error({ message: 'Synchronization Failure' });
    } finally {
      setLoading(false);
    }
  };

  const onProjectFinish = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/network/projects', values);
      notification.success({ message: 'Infrastructure Project Registered' });
      setIsProjectModalVisible(false);
      projectForm.resetFields();
      fetchProjects();
    } catch (error) {
      notification.error({ message: 'Registry Failure' });
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (info: any) => {
    if (info.file.status === 'done') {
      notification.success({ message: 'Technical Resume Synchronized' });
      fetchProfile();
    } else if (info.file.status === 'error') {
      notification.error({ message: 'Upload Failed' });
    }
  };

  const handleProjectImageUpload = async (projectId: string, info: any) => {
    if (info.file.status === 'done') {
      notification.success({ message: 'Project Image Added' });
      fetchProjects();
    }
  };

  const handleUpdateVisitStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/mobility/site-visit/${id}/status`, { status });
      notification.success({ message: `Visit ${status.toLowerCase()}` });
      fetchSiteVisits();
    } catch (error) {
      notification.error({ message: 'Update Failure' });
    }
  };

  const getServerUrl = (path: string) => {
    if (!path) return '';
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    const origin = new URL(baseURL).origin;
    return path.startsWith('http') ? path : `${origin}${path}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary overflow-y-auto no-scrollbar">
      {/* Header */}
      <header className="p-8 lg:p-12 bg-bg-secondary border-b border-border-subtle relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
          <div>
            <span className="eyebrow">Network Operations</span>
            <h1 className="text-4xl lg:text-6xl font-black text-white mt-2 mb-4 tracking-tighter uppercase">
              Operational <span className="text-gold">Console</span>
            </h1>
            <p className="text-text-secondary max-w-xl text-lg">
              Orchestrating infrastructure milestones and professional documentation for the African Renaissance.
            </p>
          </div>
          <button 
            onClick={() => setIsProjectModalVisible(true)}
            className="qsi-button primary flex items-center gap-2 py-4 px-8 shadow-xl shadow-accent-gold/20"
          >
            <Plus size={20} /> Register New Project
          </button>
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-5 pointer-events-none">
           <Zap size={600} className="text-accent-gold" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto w-full p-8 lg:p-12">
        <Row gutter={[32, 32]}>
          {/* Profile Column */}
          <Col xs={24} lg={8}>
            <div className="space-y-8 sticky top-8">
              {/* Profile Card */}
              <div className="feed-card text-center relative pt-12">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                   <div className="w-24 h-24 rounded-3xl bg-bg-tertiary border-4 border-bg-primary overflow-hidden shadow-2xl flex items-center justify-center">
                      {profile?.avatarUrl ? (
                        <img src={getServerUrl(profile.avatarUrl)} className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="text-accent-gold opacity-50" />
                      )}
                   </div>
                </div>
                <h2 className="text-2xl font-bold text-white mt-4 uppercase tracking-tight">{user?.name}</h2>
                <Tag className="bg-accent-gold-soft text-accent-gold border-accent-gold-soft rounded-full px-4 py-1 text-[10px] font-black uppercase mt-2">
                  {profile?.specialization || 'Strategic Architect'}
                </Tag>
                
                <Divider className="border-border-subtle my-8 opacity-50" />
                
                <div className="text-left">
                  <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-4">Secured Vault</h4>
                  <div className="p-4 rounded-2xl bg-bg-primary border border-border-subtle group hover:border-accent-gold/30 transition-all">
                    {profile?.resumeUrl ? (
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <FileText size={20} className="text-accent-gold" />
                            <span className="text-xs font-bold text-white uppercase tracking-tight">Technical Resume</span>
                         </div>
                         <a href={getServerUrl(profile.resumeUrl)} target="_blank" className="text-text-tertiary hover:text-white"><Eye size={18} /></a>
                      </div>
                    ) : (
                      <p className="text-[10px] text-text-tertiary italic mb-4">No documentation uploaded.</p>
                    )}
                    <Upload 
                      action={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/upload/document`}
                      headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
                      data={{ category: 'RESUME' }}
                      name="document"
                      showUploadList={false}
                      onChange={handleResumeUpload}
                    >
                      <button className="qsi-button w-full py-2 text-[9px] mt-4 flex items-center justify-center gap-2">
                         <UploadIcon size={14} /> {profile?.resumeUrl ? 'Update Resume' : 'Initialize Vault'}
                      </button>
                    </Upload>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <div className="feed-card">
                 <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-6">Update Credentials</h4>
                 <Form form={form} layout="vertical" onFinish={onProfileFinish} className="space-y-4">
                    <Form.Item name="specialization" label={<span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Core Expertise</span>}>
                      <Input className="bg-bg-primary border-border-subtle text-white h-10 text-xs" />
                    </Form.Item>
                    <Form.Item name="bio" label={<span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Operational Bio</span>}>
                      <Input.TextArea rows={3} className="bg-bg-primary border-border-subtle text-white text-xs" />
                    </Form.Item>
                    <Form.Item name="skills" label={<span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Competencies</span>}>
                      <Select mode="tags" className="custom-select" />
                    </Form.Item>
                    <button className="qsi-button primary w-full py-3 text-xs flex items-center justify-center gap-2" type="submit" disabled={loading}>
                       <ShieldCheck size={16} /> Update Operations
                    </button>
                 </Form>
              </div>
            </div>
          </Col>

          {/* Activity Column */}
          <Col xs={24} lg={16}>
            <div className="feed-card p-0 overflow-hidden min-h-[600px]">
              <Tabs 
                defaultActiveKey="1" 
                className="custom-tabs"
                items={[
                  {
                    key: '1',
                    label: <span className="flex items-center gap-2 py-4 px-6"><Layers size={18} /> Projects</span>,
                    children: (
                      <div className="p-8">
                        <List
                          dataSource={projects}
                          locale={{ emptyText: <Empty description={<span className="text-text-tertiary">No registered projects found.</span>} /> }}
                          renderItem={item => (
                            <div className="p-6 rounded-3xl bg-bg-secondary border border-border-subtle mb-6 group hover:border-accent-gold/20 transition-all">
                               <Row gutter={24}>
                                 <Col xs={24} md={8}>
                                    <div className="h-40 rounded-2xl overflow-hidden border border-border-subtle relative group/img">
                                       <img src={getServerUrl(item.imageUrl)} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                          <Upload
                                            action={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/upload/project-image`}
                                            headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
                                            data={{ projectId: item.id }}
                                            name="image"
                                            showUploadList={false}
                                            onChange={(info) => handleProjectImageUpload(item.id, info)}
                                          >
                                            <button className="p-2 rounded-full bg-white text-black"><Plus size={18} /></button>
                                          </Upload>
                                       </div>
                                    </div>
                                 </Col>
                                 <Col xs={24} md={16}>
                                    <div className="flex justify-between items-start mb-4">
                                       <h3 className="text-xl font-bold text-white uppercase tracking-tight">{item.title}</h3>
                                       <Tag className="bg-bg-primary text-accent-gold border-accent-gold-soft rounded-full uppercase text-[9px] font-black">{item.status}</Tag>
                                    </div>
                                    <p className="text-sm text-text-secondary leading-relaxed mb-6 line-clamp-2">{item.description}</p>
                                    {item.images && item.images.length > 0 && (
                                      <div className="flex gap-2">
                                        {item.images.slice(0, 4).map((img: any) => (
                                          <div key={img.id} className="w-10 h-10 rounded-lg border border-border-subtle overflow-hidden">
                                             <img src={getServerUrl(img.imageUrl)} className="w-full h-full object-cover" />
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                 </Col>
                               </Row>
                            </div>
                          )}
                        />
                      </div>
                    )
                  },
                  {
                    key: '2',
                    label: <span className="flex items-center gap-2 py-4 px-6"><Calendar size={18} /> Requests <Badge count={siteVisits.length} className="ml-1 scale-75" /></span>,
                    children: (
                      <div className="p-8">
                        <List
                          dataSource={siteVisits}
                          locale={{ emptyText: <Empty description={<span className="text-text-tertiary">No incoming requests found.</span>} /> }}
                          renderItem={visit => (
                            <div className="p-6 rounded-3xl bg-bg-secondary border border-border-subtle mb-4 group hover:border-accent-gold/20 transition-all">
                               <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-bg-primary flex items-center justify-center font-bold text-accent-gold">
                                        {visit.user.name[0]}
                                     </div>
                                     <div>
                                        <h4 className="text-lg font-bold text-white uppercase tracking-tight">{visit.user.name}</h4>
                                        <span className="text-[10px] text-accent-gold font-bold uppercase tracking-widest">{visit.project.title}</span>
                                     </div>
                                  </div>
                                  <Tag className="bg-bg-primary text-text-tertiary border-border-subtle rounded-full uppercase text-[9px] font-black">{visit.status}</Tag>
                               </div>
                               <div className="p-4 rounded-2xl bg-bg-primary border border-border-subtle italic text-sm text-text-secondary mb-6">
                                 "{visit.message}"
                               </div>
                               <div className="flex items-center justify-between">
                                  <div className="flex gap-4">
                                     <a href={`mailto:${visit.user.email}`} className="text-text-tertiary hover:text-white transition-colors"><Mail size={18} /></a>
                                     <a href={`tel:${visit.user.phone}`} className="text-text-tertiary hover:text-white transition-colors"><Phone size={18} /></a>
                                  </div>
                                  {visit.status === 'PENDING' ? (
                                    <div className="flex gap-4">
                                       <button onClick={() => handleUpdateVisitStatus(visit.id, 'APPROVED')} className="text-[10px] font-bold text-success-green uppercase tracking-widest flex items-center gap-1 hover:underline">
                                          <CheckCircle2 size={14} /> Approve
                                       </button>
                                       <button onClick={() => handleUpdateVisitStatus(visit.id, 'REJECTED')} className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1 hover:underline">
                                          Reject
                                       </button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-1">
                                       <CheckCircle2 size={14} /> {visit.status}
                                    </span>
                                  )}
                               </div>
                            </div>
                          )}
                        />
                      </div>
                    )
                  }
                ]}
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* Registry Modal */}
      <Modal
        title={null}
        open={isProjectModalVisible}
        onCancel={() => setIsProjectModalVisible(false)}
        footer={null}
        width={500}
        centered
        className="dark-modal"
      >
        <div className="p-8 bg-bg-secondary rounded-3xl border border-border-subtle shadow-2xl">
          <span className="eyebrow">Project Registry</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-2 mb-6">Register New Project</h3>
          <Form form={projectForm} layout="vertical" onFinish={onProjectFinish} className="space-y-6">
              <Form.Item name="title" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Project Title</span>} rules={[{ required: true }]}>
                <Input className="bg-bg-primary border-border-subtle text-white h-12" placeholder="e.g. Smart Utility Grid Expansion" />
              </Form.Item>
              <Form.Item name="status" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Current Phase</span>} initialValue="PLANNED">
                <Select className="custom-select h-12">
                  <Select.Option value="PLANNED">Planning Phase</Select.Option>
                  <Select.Option value="IN_PROGRESS">Execution Phase</Select.Option>
                  <Select.Option value="COMPLETED">Actualized Milestone</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="description" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Briefing</span>} rules={[{ required: true }]}>
                <Input.TextArea rows={4} className="bg-bg-primary border-border-subtle text-white" placeholder="Describe the operational impact..." />
              </Form.Item>
              <div className="flex gap-4 pt-4">
                <button className="qsi-button primary flex-1 py-4 font-bold flex items-center justify-center gap-2" type="submit">
                  <Plus size={18} /> Register
                </button>
                <button className="qsi-button flex-1 py-4 font-bold" onClick={() => setIsProjectModalVisible(false)}>
                  Cancel
                </button>
              </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default EngineerDashboard;
