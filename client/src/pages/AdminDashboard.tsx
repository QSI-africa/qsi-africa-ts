import React, { useState, useEffect } from 'react';
import { 
  Tabs, Typography, Table, Button, Space, 
  Tag, Modal, Form, Input, InputNumber, Select, 
  message, Popconfirm, Card, Row, Col, Spin 
} from 'antd';
import { 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Code, 
  Lightbulb,
  AppWindow,
  Truck,
  MapPin,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight
} from 'lucide-react';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminDashboard: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [siteVisits, setSiteVisits] = useState<any[]>([]);
  const [vehicleHires, setVehicleHires] = useState<any[]>([]);

  const [categoryForm] = Form.useForm();
  const [packageForm] = Form.useForm();

  const fetchLabData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/lab/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      message.error("Failed to fetch lab data");
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
    } catch (error) {
      console.error("Failed to fetch mobility data");
    }
  };

  useEffect(() => {
    fetchLabData();
    fetchMobilityData();
  }, []);

  const handleSaveCategory = async (values: any) => {
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
    } catch (error) {
      message.error("Failed to synchronize category");
    }
  };

  const handleSavePackage = async (values: any) => {
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
    } catch (error) {
      message.error("Failed to synchronize package");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/lab/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success("Category purged");
        fetchLabData();
      }
    } catch (error) {
      message.error("Failed to purge category");
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
          <button className="text-text-tertiary hover:text-accent-gold" onClick={() => {
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
      {/* Header */}
      <header className="p-8 lg:p-12 bg-bg-secondary border-b border-border-subtle relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-3 text-accent-gold mb-4">
             <Settings size={20} />
             <span className="text-xs font-bold uppercase tracking-widest">Core Command Center</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-white mb-4 tracking-tighter uppercase">
            Platform <span className="text-gold">Admin</span>
          </h1>
          <p className="text-text-secondary max-w-2xl text-lg leading-relaxed">
            Global orchestration of technical R&D, mobility logistics, and ecosystem-wide structural integrity.
          </p>
        </div>
        <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5 pointer-events-none">
           <Zap size={500} className="text-accent-gold" />
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
                  <div className="flex justify-between items-center mb-10">
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
                                    <Zap size={16} className="text-accent-gold" /> {cat.title}
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
                                    className="w-full py-4 text-[10px] font-bold text-accent-gold uppercase tracking-[0.2em] border-t border-border-subtle hover:bg-accent-gold/5 transition-colors flex items-center justify-center gap-2"
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
                            <MapPin size={18} className="text-accent-gold" /> Site Visit Registry
                         </h4>
                      </div>
                      <Table 
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
                            render: (status) => <Tag className={status === 'APPROVED' ? 'bg-success-green/20 text-success-green border-success-green/30' : 'bg-accent-gold-soft text-accent-gold border-accent-gold-soft'}>{status}</Tag>
                          },
                          { title: <span className="text-[10px] font-bold uppercase text-text-tertiary">Sync Date</span>, dataIndex: 'createdAt', key: 'date', render: (d) => new Date(d).toLocaleDateString() },
                        ]}
                      />
                   </div>

                   <div className="feed-card bg-bg-secondary border-border-subtle p-0 overflow-hidden">
                      <div className="p-6 border-b border-border-subtle">
                         <h4 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                            <Truck size={18} className="text-accent-gold" /> Logistics Missions
                         </h4>
                      </div>
                      <Table 
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
                            render: (status) => <Tag className={status === 'ACCEPTED' ? 'bg-success-green/20 text-success-green' : 'bg-accent-gold-soft text-accent-gold'}>{status}</Tag>
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
                <div className="py-24 flex flex-col items-center justify-center text-center opacity-30">
                   <Zap size={64} className="text-accent-gold mb-8 animate-pulse" />
                   <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Operational Coherence</h2>
                   <p className="text-text-tertiary max-w-xs">Global system statistics and real-time health metrics are being synchronized.</p>
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
        <div className="p-8 bg-bg-secondary rounded-3xl border border-border-subtle shadow-2xl">
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
              <button className="qsi-button primary flex-1 py-4 font-bold flex items-center justify-center gap-2" type="submit">
                <ShieldCheck size={18} /> Synchronize
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
        <div className="p-8 bg-bg-secondary rounded-3xl border border-border-subtle shadow-2xl">
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
              <button className="qsi-button primary flex-1 py-4 font-bold flex items-center justify-center gap-2" type="submit">
                <ShieldCheck size={18} /> Synchronize
              </button>
              <button className="qsi-button flex-1 py-4 font-bold" onClick={() => setIsPackageModalOpen(false)}>
                Abort
              </button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
