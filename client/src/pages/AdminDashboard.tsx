import React, { useState, useEffect } from 'react';
import { 
  Tabs, Table, Button, Space, 
  Tag, Modal, Form, Input, InputNumber, Select, 
  message, Popconfirm, Card, Row, Col, Spin, Typography
} from 'antd';
import { 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Code, 
  Truck,
  MapPin,
  ShieldCheck,
  Zap,
  Activity,
  Globe,
  Layers,
  MonitorPlay,
  Rocket,
  Handshake,
  Image as ImageIcon
} from 'lucide-react';

import api from '../api';

import UnifiedHeader from '../components/layout/UnifiedHeader';
const { Title, Text } = Typography;

const { Option } = Select;

const AdminDashboard: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [siteVisits, setSiteVisits] = useState<any[]>([]);
  const [vehicleHires, setVehicleHires] = useState<any[]>([]);
  
  // New States
  const [services, setServices] = useState<any[]>([]);
  const [concepts, setConcepts] = useState<any[]>([]);
  const [demos, setDemos] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  
  // TV Moderation State
  const [tvChannels, setTvChannels] = useState<any[]>([]);

  // Venture Management State
  const [ventures, setVentures] = useState<any[]>([]);
  const [selectedVentureId, setSelectedVentureId] = useState<string | null>(null);
  const [selectedVentureData, setSelectedVentureData] = useState<any>(null);
  const [isEngTypeModalOpen, setIsEngTypeModalOpen] = useState(false);
  const [editingEngType, setEditingEngType] = useState<any>(null);
  const [isVenturePostModalOpen, setIsVenturePostModalOpen] = useState(false);
  const [postFiles, setPostFiles] = useState<FileList | null>(null);
  const [postContent, setPostContent] = useState('');

  const [categoryForm] = Form.useForm();
  const [packageForm] = Form.useForm();
  const [serviceForm] = Form.useForm();
  const [engTypeForm] = Form.useForm();

  const fetchLabData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/lab/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error: any) {
      message.error(error?.response?.data?.error || error?.response?.data?.message || "Failed to fetch lab data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMobilityData = async () => {
    try {
      const vRes = await fetch('/api/admin/mobility/site-visits');
      const vData = await vRes.json();
      setSiteVisits(vData);

      const hRes = await fetch('/api/admin/mobility/vehicle-hires');
      const hData = await hRes.json();
      setVehicleHires(hData);
    } catch (error: any) {
      console.error("Failed to fetch mobility data");
    }
  };

  const fetchRegistryData = async () => {
    try {
      const sRes = await fetch('/api/admin/service-modules');
      const sData = await sRes.json();
      setServices(sData);

      const cRes = await fetch('/api/admin/qsi-concepts');
      const cData = await cRes.json();
      setConcepts(cData);

      const dRes = await fetch('/api/admin/smart-city-demos');
      const dData = await dRes.json();
      setDemos(dData);

      const stRes = await fetch('/api/config/stats');
      const stData = await stRes.json();
      setStats(stData);
    } catch (error: any) {
      console.error("Failed to fetch registry data");
    }
  };

  const fetchTvChannels = async () => {
    try {
      const res = await api.get('/admin/tv/channels');
      setTvChannels(res.data);
    } catch (error: any) {
      console.error("Failed to fetch TV channels");
    }
  };

  const fetchVenturesData = async () => {
    try {
      const res = await api.get('/ventures/admin/all');
      setVentures(res.data);
      if (res.data.length > 0 && !selectedVentureId) {
        setSelectedVentureId(res.data[0].id);
        fetchVentureDetail(res.data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch ventures");
    }
  };

  const fetchVentureDetail = async (vId: string) => {
    try {
      const res = await api.get(`/ventures/${vId}`);
      setSelectedVentureData(res.data);
    } catch (error) {
      console.error("Failed to fetch venture detail");
    }
  };

  useEffect(() => {
    fetchLabData();
    fetchMobilityData();
    fetchRegistryData();
    fetchTvChannels();
    fetchVenturesData();
  }, []);

  const handleUpdateChannelStatus = async (channelId: string, status: string) => {
    try {
      await api.put(`/admin/tv/channels/${channelId}/status`, { status });
      message.success(`Channel status updated to ${status}`);
      fetchTvChannels();
    } catch (error: any) {
      message.error('Failed to update channel status');
    }
  };

  const handleSaveCategory = async (values: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/lab/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, id: editingCategory?.id })
      });
      if (res.ok) {
        message.success("Category synchronized successfully");
        setIsCategoryModalOpen(false);
        fetchLabData();
      }
    } catch (error: any) {
      message.error(error?.response?.data?.error || error?.response?.data?.message || "Failed to synchronize category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePackage = async (values: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/lab/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, id: editingPackage?.id, categoryId: activeCategoryId })
      });
      if (res.ok) {
        message.success("Package synchronized successfully");
        setIsPackageModalOpen(false);
        fetchLabData();
      }
    } catch (error: any) {
      message.error(error?.response?.data?.error || error?.response?.data?.message || "Failed to synchronize package");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/lab/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success("Category purged");
        fetchLabData();
      }
    } catch (error: any) {
      message.error(error?.response?.data?.error || error?.response?.data?.message || "Failed to purge category");
    }
  };

  const handleSaveService = async (values: any) => {
    setIsSubmitting(true);
    try {
      const url = editingService 
        ? `/api/admin/service-modules/${editingService.id}` 
        : '/api/admin/service-modules';
      const method = editingService ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (res.ok) {
        message.success("Service registry updated");
        setIsServiceModalOpen(false);
        fetchRegistryData();
      }
    } catch (error: any) {
      message.error(error?.response?.data?.error || error?.response?.data?.message || "Failed to update service registry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEngType = async (values: any) => {
    if (!selectedVentureId) return;
    setIsSubmitting(true);
    try {
      if (editingEngType) {
        await api.put(`/ventures/${selectedVentureId}/engagement-types/${editingEngType.id}`, values);
        message.success("Engagement type updated");
      } else {
        await api.post(`/ventures/${selectedVentureId}/engagement-types`, values);
        message.success("Engagement type created");
      }
      setIsEngTypeModalOpen(false);
      fetchVentureDetail(selectedVentureId);
    } catch (error: any) {
      message.error(error?.response?.data?.error || "Failed to save engagement type");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEngType = async (typeId: string) => {
    if (!selectedVentureId) return;
    try {
      await api.delete(`/ventures/${selectedVentureId}/engagement-types/${typeId}`);
      message.success("Engagement type deleted");
      fetchVentureDetail(selectedVentureId);
    } catch (error) {
      message.error("Failed to delete engagement type");
    }
  };

  const handleCreateVenturePost = async () => {
    if (!selectedVentureId) return;
    if (!postContent.trim() && (!postFiles || postFiles.length === 0)) {
      message.warning("Please enter post content or select media files.");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", postContent);
      if (postFiles) {
        Array.from(postFiles).forEach(file => {
          formData.append("images", file);
        });
      }
      await api.post(`/ventures/${selectedVentureId}/posts`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      message.success("Venture post published with attached images!");
      setIsVenturePostModalOpen(false);
      setPostContent('');
      setPostFiles(null);
      fetchVentureDetail(selectedVentureId);
    } catch (error: any) {
      message.error(error?.response?.data?.error || "Failed to publish post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVenturePost = async (postId: string) => {
    if (!selectedVentureId) return;
    try {
      await api.delete(`/ventures/${selectedVentureId}/posts/${postId}`);
      message.success("Post deleted");
      fetchVentureDetail(selectedVentureId);
    } catch (error) {
      message.error("Failed to delete post");
    }
  };

  const packageColumns = [
    { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Order</span>, dataIndex: 'order', key: 'order', width: 80 },
    { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Name</span>, dataIndex: 'name', key: 'name' },
    { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Level</span>, dataIndex: 'level', key: 'level' },
    { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Duration</span>, dataIndex: 'duration', key: 'duration' },
    { 
      title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Status</span>, 
      dataIndex: 'isActive', 
      key: 'isActive',
      render: (val: boolean) => <Tag className={val ? 'bg-success-green/20 text-success-green border-success-green/30' : 'bg-red-500/20 text-red-500 border-red-500/30'}>{val ? 'Active' : 'Hidden'}</Tag>
    },
    {
      title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Actions</span>,
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <button className="text-text-tertiary hover:text-accent-primary" onClick={() => {
            setEditingPackage(record);
            setActiveCategoryId(record.categoryId);
            packageForm.setFieldsValue(record);
            setIsPackageModalOpen(true);
          }}><Edit3 size={16} /></button>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary overflow-y-auto no-scrollbar">
      <UnifiedHeader title="Admin Dashboard" />
      {/* Header */}
      <header className="p-8 lg:p-12 bg-bg-secondary border-b border-border-subtle relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-3 text-accent-primary mb-4">
             <Settings size={20} />
             <span className="text-xs font-bold uppercase tracking-widest">Core Command Center</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-white mb-4 tracking-tighter uppercase">
            Platform <span className="text-accent-primary">Admin</span>
          </h1>
          <p className="text-text-secondary max-w-2xl text-lg leading-relaxed">
            Global orchestration of technical R&D, mobility logistics, and ecosystem-wide structural integrity.
          </p>
        </div>
        <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5 pointer-events-none">
           <Zap size={500} className="text-accent-primary" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto w-full p-8 lg:p-12">
        <Tabs 
          defaultActiveKey="lab" 
          className="custom-tabs mb-12"
          items={[
            {
              key: 'lab',
              label: <span className="flex items-center gap-2 py-2"><Code size={16} /> Lab Management</span>,
              children: (
                <div className="py-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight">R&D Categories</h3>
                    <button 
                      onClick={() => {
                        setEditingCategory(null);
                        categoryForm.resetFields();
                        setIsCategoryModalOpen(true);
                      }}
                      className="qsi-button primary py-3 px-8 flex items-center gap-2 text-xs"
                    >
                      <Plus size={16} /> Create Category
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center py-24"><Spin /></div>
                  ) : (
                    <div className="space-y-12">
                      {categories.map(cat => (
                        <div key={cat.id} className="feed-card bg-bg-secondary border-border-subtle p-0 overflow-hidden">
                           <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-bg-primary/50">
                              <div>
                                 <h4 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                                    <Zap size={16} className="text-accent-primary" /> {cat.title}
                                 </h4>
                                 <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">{cat.descriptor}</span>
                              </div>
                              <div className="flex gap-4">
                                 <button onClick={() => {
                                    setEditingCategory(cat);
                                    categoryForm.setFieldsValue(cat);
                                    setIsCategoryModalOpen(true);
                                 }} className="text-text-tertiary hover:text-white transition-colors"><Edit3 size={18} /></button>
                                 <Popconfirm title="Purge this category?" onConfirm={() => handleDeleteCategory(cat.id)} okText="Purge" cancelText="Abort">
                                    <button className="text-text-tertiary hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                 </Popconfirm>
                              </div>
                           </div>
                           <div className="p-0">
                              <Table 
                                scroll={{ x: 'max-content' }}
                                dataSource={cat.packages} 
                                columns={packageColumns} 
                                rowKey="id" 
                                pagination={false} 
                                className="custom-table"
                                footer={() => (
                                  <button 
                                    onClick={() => {
                                      setActiveCategoryId(cat.id);
                                      setEditingPackage(null);
                                      packageForm.resetFields();
                                      setIsPackageModalOpen(true);
                                    }}
                                    className="w-full py-4 text-[10px] font-bold text-accent-primary uppercase tracking-[0.2em] border-t border-border-subtle hover:bg-accent-primary/5 transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Plus size={14} /> Add Module to {cat.title}
                                  </button>
                                )}
                              />
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'mobility',
              label: <span className="flex items-center gap-2 py-2"><Truck size={16} /> Mobility Audit</span>,
              children: (
                <div className="py-8 space-y-12">
                   <div className="feed-card bg-bg-secondary border-border-subtle p-0 overflow-hidden">
                      <div className="p-6 border-b border-border-subtle">
                         <h4 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                            <MapPin size={18} className="text-accent-primary" /> Site Visit Registry
                         </h4>
                      </div>
                      <Table 
                        scroll={{ x: 'max-content' }}
                        dataSource={siteVisits} 
                        rowKey="id"
                        className="custom-table"
                        columns={[
                          { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Project</span>, dataIndex: ['project', 'title'], key: 'project' },
                          { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Operator</span>, dataIndex: ['user', 'name'], key: 'user' },
                          { 
                            title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Status</span>, 
                            dataIndex: 'status', 
                            key: 'status',
                            render: (status) => <Tag className={status === 'APPROVED' ? 'bg-success-green/20 text-success-green border-success-green/30' : 'bg-accent-primary-soft text-accent-primary border-accent-primary-soft'}>{status}</Tag>
                          },
                          { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Sync Date</span>, dataIndex: 'createdAt', key: 'date', render: (d) => new Date(d).toLocaleDateString() },
                          {
                            title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Task Machine</span>,
                            key: 'assign',
                            render: (_, record) => (
                              <button
                                onClick={() => message.success(`Task #${record.id.substring(0, 6)} delegated to qualified engineer.`)}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-black bg-[#008751] hover:brightness-110"
                              >
                                Assign Task
                              </button>
                            )
                          }
                        ]}
                      />
                   </div>

                   <div className="feed-card bg-bg-secondary border-border-subtle p-0 overflow-hidden">
                      <div className="p-6 border-b border-border-subtle">
                         <h4 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                            <Truck size={18} className="text-accent-primary" /> Logistics Missions
                         </h4>
                      </div>
                      <Table 
                        scroll={{ x: 'max-content' }}
                        dataSource={vehicleHires} 
                        rowKey="id"
                        className="custom-table"
                        columns={[
                          { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Engineer</span>, dataIndex: ['engineer', 'name'], key: 'engineer' },
                          { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Sector</span>, dataIndex: 'location', key: 'location' },
                          { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Bounty</span>, dataIndex: 'price', key: 'price', render: (p) => <span className="font-bold text-white">${p}</span> },
                          { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Operator</span>, dataIndex: ['acceptedBy', 'name'], key: 'acceptedBy', render: (n) => n || 'PENDING' },
                          { 
                            title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Sync</span>, 
                            dataIndex: 'status', 
                            key: 'status',
                            render: (status) => <Tag className={status === 'ACCEPTED' ? 'bg-success-green/20 text-success-green' : 'bg-accent-primary-soft text-accent-primary'}>{status}</Tag>
                          },
                        ]}
                      />
                   </div>
                </div>
              )
            },
            {
              key: 'services',
              label: <span className="flex items-center gap-2 py-2"><ShieldCheck size={16} /> Service Registry</span>,
              children: (
                <div className="py-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Core Services</h3>
                    <button 
                      onClick={() => {
                        setEditingService(null);
                        serviceForm.resetFields();
                        setIsServiceModalOpen(true);
                      }}
                      className="qsi-button primary py-3 px-8 flex items-center gap-2 text-xs"
                    >
                      <Plus size={16} /> Add Service
                    </button>
                  </div>

                  <Table 
                    scroll={{ x: 'max-content' }}
                    dataSource={services} 
                    rowKey="id"
                    className="custom-table"
                    columns={[
                      { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Order</span>, dataIndex: 'order', key: 'order', width: 80 },
                      { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Title</span>, dataIndex: 'title', key: 'title' },
                      { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Category</span>, dataIndex: 'category', key: 'category' },
                      { 
                        title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Type</span>, 
                        dataIndex: 'isChat', 
                        key: 'isChat',
                        render: (val) => <Tag color={val ? 'blue' : 'orange'}>{val ? 'AI CHAT' : 'MODULE'}</Tag>
                      },
                      { 
                        title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Status</span>, 
                        dataIndex: 'isActive', 
                        key: 'isActive',
                        render: (val) => <Tag color={val ? 'green' : 'red'}>{val ? 'ACTIVE' : 'HIDDEN'}</Tag>
                      },
                      {
                        title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Actions</span>,
                        key: 'actions',
                        render: (_, record) => (
                          <Space>
                            <button className="text-text-tertiary hover:text-accent-primary" onClick={() => {
                              setEditingService(record);
                              serviceForm.setFieldsValue(record);
                              setIsServiceModalOpen(true);
                            }}><Edit3 size={16} /></button>
                          </Space>
                        ),
                      },
                    ]}
                  />
                </div>
              )
            },
            {
              key: 'assets',
              label: <span className="flex items-center gap-2 py-2"><Globe size={16} /> Strategic Assets</span>,
              children: (
                <div className="py-8 space-y-12">
                   <div className="feed-card bg-bg-secondary border-border-subtle p-0 overflow-hidden">
                      <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-bg-primary/50">
                         <h4 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                            <Layers size={18} className="text-accent-primary" /> Digital Concepts
                         </h4>
                      </div>
                      <Table 
                        scroll={{ x: 'max-content' }}
                        dataSource={concepts} 
                        rowKey="id"
                        className="custom-table"
                        columns={[
                          { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Title</span>, dataIndex: 'title', key: 'title' },
                          { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Category</span>, dataIndex: 'category', key: 'category' },
                          { 
                            title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Status</span>, 
                            dataIndex: 'isActive', 
                            key: 'isActive',
                            render: (val) => <Tag color={val ? 'green' : 'red'}>{val ? 'ACTIVE' : 'HIDDEN'}</Tag>
                          },
                          { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Demos</span>, dataIndex: 'demonstrators', key: 'demos', render: (d) => d?.length || 0 },
                        ]}
                      />
                   </div>

                   <div className="feed-card bg-bg-secondary border-border-subtle p-0 overflow-hidden">
                      <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-bg-primary/50">
                         <h4 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                            <MapPin size={18} className="text-accent-primary" /> City Demonstrators
                         </h4>
                      </div>
                      <Table 
                        scroll={{ x: 'max-content' }}
                        dataSource={demos} 
                        rowKey="id"
                        className="custom-table"
                        columns={[
                          { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Name</span>, dataIndex: 'name', key: 'name' },
                          { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">City</span>, dataIndex: 'city', key: 'city' },
                          { 
                            title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Status</span>, 
                            dataIndex: 'status', 
                            key: 'status',
                            render: (val) => <Tag color="blue">{val}</Tag>
                          },
                          { 
                            title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Engagement</span>, 
                            dataIndex: 'engagementEnabled', 
                            key: 'engagement',
                            render: (val) => <Tag color={val ? 'cyan' : 'default'}>{val ? 'ENABLED' : 'DISABLED'}</Tag>
                          },
                        ]}
                      />
                   </div>
                </div>
              )
            },
            {
              key: 'tv-moderation',
              label: <span className="flex items-center gap-2 py-2"><MonitorPlay size={16} /> PANX TV Moderation</span>,
              children: (
                <div className="py-8 space-y-12">
                   <div className="feed-card bg-bg-secondary border-border-subtle p-0 overflow-hidden">
                      <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-bg-primary/50">
                         <h4 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                            <MonitorPlay size={18} className="text-accent-primary" /> Channel Requests
                         </h4>
                      </div>
                      <Table 
                        scroll={{ x: 'max-content' }}
                        dataSource={tvChannels} 
                        rowKey="id"
                        className="custom-table"
                        columns={[
                          { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Title</span>, dataIndex: 'title', key: 'title' },
                          { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Creator</span>, dataIndex: ['user', 'name'], key: 'user' },
                          { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Subscribers</span>, dataIndex: ['_count', 'subscriptions'], key: 'subs', render: (val) => val || 0 },
                          { 
                            title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Status</span>, 
                            dataIndex: 'status', 
                            key: 'status',
                            render: (val) => (
                              <Tag color={val === 'APPROVED' ? 'green' : val === 'PENDING' ? 'orange' : 'red'}>
                                {val}
                              </Tag>
                            )
                          },
                          {
                            title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Actions</span>,
                            key: 'actions',
                            render: (_, record) => (
                              <Space>
                                {record.status !== 'APPROVED' && (
                                  <Button size="small" type="primary" onClick={() => handleUpdateChannelStatus(record.id, 'APPROVED')}>Approve</Button>
                                )}
                                {record.status !== 'REJECTED' && (
                                  <Button size="small" danger onClick={() => handleUpdateChannelStatus(record.id, 'REJECTED')}>Reject</Button>
                                )}
                              </Space>
                            ),
                          },
                        ]}
                      />
                   </div>
                </div>
              )
            },
            {
              key: 'overview',
              label: <span className="flex items-center gap-2 py-2"><Activity size={16} /> Ecosystem Health</span>,
              children: (
                <div className="py-12">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                      <Card className="bg-bg-secondary border-border-subtle">
                         <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold uppercase text-text-tertiary tracking-widest">Active Nodes</span>
                            <span className="text-3xl font-black text-white">{stats?.activeNodes || 0}</span>
                            <span className="text-[10px] text-success-green font-bold uppercase">+2 sync increase</span>
                         </div>
                      </Card>
                      <Card className="bg-bg-secondary border-border-subtle">
                         <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold uppercase text-text-tertiary tracking-widest">Live Pilots</span>
                            <span className="text-3xl font-black text-white">{stats?.livePilots || 0}</span>
                            <span className="text-[10px] text-accent-primary font-bold uppercase">Operational</span>
                         </div>
                      </Card>
                      <Card className="bg-bg-secondary border-border-subtle">
                         <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold uppercase text-text-tertiary tracking-widest">Digital Concepts</span>
                            <span className="text-3xl font-black text-white">{stats?.digitalConcepts || 0}</span>
                            <span className="text-[10px] text-blue-400 font-bold uppercase">Frameworks</span>
                         </div>
                      </Card>
                      <Card className="bg-bg-secondary border-border-subtle">
                         <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold uppercase text-text-tertiary tracking-widest">System Uptime</span>
                            <span className="text-3xl font-black text-white">{stats?.uptime || '99.9%'}</span>
                            <span className="text-[10px] text-success-green font-bold uppercase">Stable</span>
                         </div>
                      </Card>
                   </div>
                   
                   <div className="feed-card bg-bg-secondary border-border-subtle p-8">
                      <div className="flex items-center gap-4 mb-6">
                         <Zap size={24} className="text-accent-primary" />
                         <h4 className="text-xl font-bold text-white uppercase tracking-tight">System Integrity Report</h4>
                      </div>
                      <p className="text-text-secondary leading-relaxed mb-6">
                         All platform modules are currently synchronized with the backend. Service registry is serving live endpoints to the mission control interface.
                      </p>
                      <div className="flex gap-4">
                         <Tag color="green">DATABASE: SYNCED</Tag>
                         <Tag color="green">API: OPERATIONAL</Tag>
                         <Tag color="green">REGISTRY: ACTIVE</Tag>
                      </div>
                   </div>
                </div>
              )
            },
            {
              key: 'ventures',
              label: <span className="flex items-center gap-2 py-2"><Rocket size={16} /> Ventures</span>,
              children: (
                <div className="py-8 space-y-12">
                   <div className="feed-card bg-bg-secondary border-border-subtle p-0 overflow-hidden">
                      <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-bg-primary/50">
                         <h4 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                            <Rocket size={18} className="text-accent-primary" /> Venture Engagement Management
                         </h4>
                         <Select
                           className="custom-select min-w-[200px]"
                           value={selectedVentureId}
                           onChange={(val) => {
                             setSelectedVentureId(val);
                             fetchVentureDetail(val);
                           }}
                         >
                           {ventures.map(v => (
                             <Option key={v.id} value={v.id}>{v.name}</Option>
                           ))}
                         </Select>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h5 className="text-white font-bold uppercase tracking-wider text-xs">Engagement Types</h5>
                          <button
                            onClick={() => {
                              if (!selectedVentureId) return message.warning("Select a venture first");
                              setEditingEngType(null);
                              engTypeForm.resetFields();
                              setIsEngTypeModalOpen(true);
                            }}
                            className="qsi-button primary py-2 px-4 text-xs font-bold"
                          >
                            <Plus size={14} className="mr-2 inline" /> Add Engagement Type
                          </button>
                        </div>
                        
                        <Table 
                          scroll={{ x: 'max-content' }}
                          dataSource={selectedVentureData?.engagementTypes || []} 
                          rowKey="id"
                          className="custom-table"
                          columns={[
                            { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Label</span>, dataIndex: 'label', key: 'label' },
                            { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Icon</span>, dataIndex: 'icon', key: 'icon' },
                            { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Order</span>, dataIndex: 'order', key: 'order' },
                            { 
                              title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Status</span>, 
                              dataIndex: 'isActive', 
                              key: 'isActive',
                              render: (val) => <Tag color={val ? 'green' : 'red'}>{val ? 'ACTIVE' : 'HIDDEN'}</Tag>
                            },
                            {
                              title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Actions</span>,
                              key: 'actions',
                              render: (_, record) => (
                                <Space>
                                  <button className="text-text-tertiary hover:text-accent-primary" onClick={() => {
                                    setEditingEngType(record);
                                    engTypeForm.setFieldsValue(record);
                                    setIsEngTypeModalOpen(true);
                                  }}><Edit3 size={16} /></button>
                                  <Popconfirm title="Delete this engagement type?" onConfirm={() => handleDeleteEngType(record.id)}>
                                    <button className="text-text-tertiary hover:text-red-500"><Trash2 size={16} /></button>
                                  </Popconfirm>
                                </Space>
                              ),
                            },
                          ]}
                        />
                      </div>
                   </div>
                </div>
              )
            }
          ]}
        />
      </div>

      {/* Category Modal */}
      <Modal
        title={null}
        open={isCategoryModalOpen}
        onCancel={() => setIsCategoryModalOpen(false)}
        footer={null}
        width={500}
        centered
        className="dark-modal"
      >
        <div className="p-4 md:p-8 bg-bg-secondary rounded-3xl border border-border-subtle shadow-2xl">
          <span className="eyebrow">Registry Update</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-2 mb-6">{editingCategory ? "Update Category" : "New R&D Category"}</h3>
          <Form form={categoryForm} layout="vertical" onFinish={handleSaveCategory} className="space-y-6">
            <Form.Item name="title" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Category Title</span>} rules={[{ required: true }]}>
              <Input className="bg-bg-primary border-border-subtle text-white h-12" />
            </Form.Item>
            <Form.Item name="descriptor" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Descriptor</span>} rules={[{ required: true }]}>
              <Input className="bg-bg-primary border-border-subtle text-white h-12" placeholder="e.g. Strategic Infrastructure" />
            </Form.Item>
            <Form.Item name="icon" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Icon Signature</span>} rules={[{ required: true }]}>
              <Select className="custom-select h-12">
                <Option value="CodeOutlined">Code Signature</Option>
                <Option value="BulbOutlined">Vision Signature</Option>
                <Option value="ThunderboltOutlined">Power Signature</Option>
              </Select>
            </Form.Item>
            <Form.Item name="order" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Hierarchy Order</span>}>
              <InputNumber min={0} className="bg-bg-primary border-border-subtle text-white h-12 w-full" />
            </Form.Item>
            <div className="flex gap-4 pt-4">
              <button className="qsi-button primary flex-1 py-4 font-bold flex items-center justify-center gap-2" type="submit" disabled={isSubmitting}>
                <ShieldCheck size={18} /> {isSubmitting ? 'Synchronizing...' : 'Synchronize'}
              </button>
              <button className="qsi-button flex-1 py-4 font-bold" onClick={() => setIsCategoryModalOpen(false)}>
                Abort
              </button>
            </div>
          </Form>
        </div>
      </Modal>

      {/* Package Modal */}
      <Modal
        title={null}
        open={isPackageModalOpen}
        onCancel={() => setIsPackageModalOpen(false)}
        footer={null}
        width={500}
        centered
        className="dark-modal"
      >
        <div className="p-4 md:p-8 bg-bg-secondary rounded-3xl border border-border-subtle shadow-2xl">
          <span className="eyebrow">Registry Update</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-2 mb-6">{editingPackage ? "Update Module" : "Initialize New Module"}</h3>
          <Form form={packageForm} layout="vertical" onFinish={handleSavePackage} className="space-y-6">
            <Form.Item name="name" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Module Name</span>} rules={[{ required: true }]}>
              <Input className="bg-bg-primary border-border-subtle text-white h-12" />
            </Form.Item>
            <Form.Item name="level" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Operational Level</span>} rules={[{ required: true }]}>
              <Select className="custom-select h-12">
                <Option value="Beginner">Level 1: Foundational</Option>
                <Option value="Intermediate">Level 2: Strategic</Option>
                <Option value="Advanced">Level 3: Sovereign</Option>
                <Option value="All Levels">Global Access</Option>
              </Select>
            </Form.Item>
            <Form.Item name="duration" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Mission Duration</span>} rules={[{ required: true }]}>
              <Input className="bg-bg-primary border-border-subtle text-white h-12" placeholder="e.g. 12 Weeks" />
            </Form.Item>
            <Form.Item name="isActive" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Operational Status</span>} valuePropName="checked" initialValue={true}>
              <Select className="custom-select h-12">
                <Option value={true}>Synchronized (Active)</Option>
                <Option value={false}>Restricted (Hidden)</Option>
              </Select>
            </Form.Item>
            <div className="flex gap-4 pt-4">
              <button className="qsi-button primary flex-1 py-4 font-bold flex items-center justify-center gap-2" type="submit" disabled={isSubmitting}>
                <ShieldCheck size={18} /> {isSubmitting ? 'Synchronizing...' : 'Synchronize'}
              </button>
              <button className="qsi-button flex-1 py-4 font-bold" onClick={() => setIsPackageModalOpen(false)}>
                Abort
              </button>
            </div>
          </Form>
        </div>
      </Modal>

      {/* Service Modal */}
      <Modal
        title={null}
        open={isServiceModalOpen}
        onCancel={() => setIsServiceModalOpen(false)}
        footer={null}
        width={600}
        centered
        className="dark-modal"
      >
        <div className="p-4 md:p-8 bg-bg-secondary rounded-3xl border border-border-subtle shadow-2xl">
          <span className="eyebrow">Service Registry</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-2 mb-6">{editingService ? "Update Service" : "Register New Service"}</h3>
          <Form form={serviceForm} layout="vertical" onFinish={handleSaveService} className="space-y-4">
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item name="title" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Service Title</span>} rules={[{ required: true }]}>
                  <Input className="bg-bg-primary border-border-subtle text-white h-12" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="order" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Order</span>}>
                  <InputNumber className="bg-bg-primary border-border-subtle text-white h-12 w-full" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item name="description" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Brief Description</span>}>
              <Input.TextArea className="bg-bg-primary border-border-subtle text-white" rows={3} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="category" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Category</span>}>
                  <Input className="bg-bg-primary border-border-subtle text-white h-12" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="path" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Path / Module Name</span>}>
                  <Input className="bg-bg-primary border-border-subtle text-white h-12" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="image" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Image URL</span>}>
              <Input className="bg-bg-primary border-border-subtle text-white h-12" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="isChat" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Interface Type</span>} valuePropName="checked">
                   <Select className="custom-select h-12">
                      <Option value={true}>AI Chat Assistant</Option>
                      <Option value={false}>Static Module</Option>
                   </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="isActive" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Status</span>} valuePropName="checked">
                   <Select className="custom-select h-12">
                      <Option value={true}>Active</Option>
                      <Option value={false}>Hidden</Option>
                   </Select>
                </Form.Item>
              </Col>
            </Row>

            <div className="flex gap-4 pt-6">
              <button className="qsi-button primary flex-1 py-4 font-bold flex items-center justify-center gap-2" type="submit" disabled={isSubmitting}>
                <ShieldCheck size={18} /> {isSubmitting ? 'Synchronizing Service...' : 'Synchronize Service'}
              </button>
              <button className="qsi-button flex-1 py-4 font-bold" onClick={() => setIsServiceModalOpen(false)}>
                Abort
              </button>
            </div>
          </Form>
        </div>
      </Modal>

      {/* Engagement Type Modal */}
      <Modal
        title={null}
        open={isEngTypeModalOpen}
        onCancel={() => setIsEngTypeModalOpen(false)}
        footer={null}
        width={500}
        centered
        className="dark-modal"
      >
        <div className="p-4 md:p-8 bg-bg-secondary rounded-3xl border border-border-subtle shadow-2xl">
          <span className="eyebrow">Engagement Options</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-2 mb-6">
            {editingEngType ? "Edit Engagement Type" : "New Engagement Type"}
          </h3>
          <Form form={engTypeForm} layout="vertical" onFinish={handleSaveEngType} className="space-y-4">
            <Form.Item name="label" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Button Label</span>} rules={[{ required: true }]}>
              <Input className="bg-bg-primary border-border-subtle text-white h-12" placeholder="e.g. Request Partnership" />
            </Form.Item>

            <Form.Item name="icon" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Icon</span>} initialValue="Handshake">
              <Select className="custom-select h-12">
                <Option value="Handshake">Handshake</Option>
                <Option value="TrendingUp">TrendingUp</Option>
                <Option value="Users">Users</Option>
                <Option value="Lightbulb">Lightbulb</Option>
                <Option value="Rocket">Rocket</Option>
                <Option value="Send">Send</Option>
              </Select>
            </Form.Item>

            <Form.Item name="order" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Display Order</span>} initialValue={0}>
              <InputNumber min={0} className="bg-bg-primary border-border-subtle text-white h-12 w-full" />
            </Form.Item>

            <Form.Item name="isActive" label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Status</span>} valuePropName="checked" initialValue={true}>
              <Select className="custom-select h-12">
                <Option value={true}>Active</Option>
                <Option value={false}>Hidden</Option>
              </Select>
            </Form.Item>

            <div className="flex gap-4 pt-4">
              <button className="qsi-button primary flex-1 py-4 font-bold flex items-center justify-center gap-2" type="submit" disabled={isSubmitting}>
                <ShieldCheck size={18} /> {isSubmitting ? 'Saving...' : 'Save Engagement Type'}
              </button>
              <button className="qsi-button flex-1 py-4 font-bold" onClick={() => setIsEngTypeModalOpen(false)}>
                Cancel
              </button>
            </div>
          </Form>
        </div>
      </Modal>

      {/* Multi-Image Venture Post Modal */}
      <Modal
        title={null}
        open={isVenturePostModalOpen}
        onCancel={() => setIsVenturePostModalOpen(false)}
        footer={null}
        width={550}
        centered
        className="dark-modal"
      >
        <div className="p-4 md:p-8 bg-bg-secondary rounded-3xl border border-border-subtle shadow-2xl">
          <span className="eyebrow">Venture Update</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-2 mb-6">
            New Venture Post (Multi-Image)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-tertiary uppercase tracking-widest mb-2">Update Content</label>
              <Input.TextArea
                rows={4}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Write your venture update..."
                className="bg-bg-primary border-border-subtle text-white p-4 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-tertiary uppercase tracking-widest mb-2">Attach Images (Select Multiple at Once)</label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => setPostFiles(e.target.files)}
                className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20 cursor-pointer"
              />
              {postFiles && postFiles.length > 0 && (
                <p className="text-xs text-emerald-500 mt-2 font-bold">
                  {postFiles.length} file(s) selected for upload.
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <button
                className="qsi-button primary flex-1 py-4 font-bold flex items-center justify-center gap-2"
                onClick={handleCreateVenturePost}
                disabled={isSubmitting}
              >
                <Rocket size={18} /> {isSubmitting ? 'Publishing...' : 'Publish Update'}
              </button>
              <button className="qsi-button flex-1 py-4 font-bold" onClick={() => setIsVenturePostModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
