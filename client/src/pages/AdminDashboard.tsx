import React, { useState, useEffect } from 'react';
import { 
  Layout, Tabs, Typography, Table, Button, Space, 
  Tag, Modal, Form, Input, InputNumber, Select, 
  message, Popconfirm, Card, Row, Col 
} from 'antd';
import { 
  SettingOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CodeOutlined, 
  BulbOutlined,
  AppstoreOutlined,
  CarOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { GeometricCard } from '../components/AfroBauhausComponents';

const { Title, Text } = Typography;
const { Content } = Layout;
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
        message.success("Category saved successfully");
        setIsCategoryModalOpen(false);
        fetchLabData();
      }
    } catch (error) {
      message.error("Failed to save category");
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
        message.success("Package saved successfully");
        setIsPackageModalOpen(false);
        fetchLabData();
      }
    } catch (error) {
      message.error("Failed to save package");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/lab/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success("Category deleted");
        fetchLabData();
      }
    } catch (error) {
      message.error("Failed to delete category");
    }
  };

  const categoryColumns = [
    { title: 'Order', dataIndex: 'order', key: 'order', width: 80 },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Descriptor', dataIndex: 'descriptor', key: 'descriptor' },
    { title: 'Icon', dataIndex: 'icon', key: 'icon' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => {
            setEditingCategory(record);
            categoryForm.setFieldsValue(record);
            setIsCategoryModalOpen(true);
          }} />
          <Button icon={<PlusOutlined />} onClick={() => {
            setActiveCategoryId(record.id);
            setIsPackageModalOpen(true);
          }}>Add Package</Button>
          <Popconfirm title="Delete this category?" onConfirm={() => handleDeleteCategory(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const packageColumns = [
    { title: 'Order', dataIndex: 'order', key: 'order', width: 80 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Level', dataIndex: 'level', key: 'level' },
    { title: 'Duration', dataIndex: 'duration', key: 'duration' },
    { 
      title: 'Status', 
      dataIndex: 'isActive', 
      key: 'isActive',
      render: (val: boolean) => <Tag color={val ? 'green' : 'red'}>{val ? 'Active' : 'Hidden'}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => {
            setEditingPackage(record);
            setActiveCategoryId(record.categoryId);
            packageForm.setFieldsValue(record);
            setIsPackageModalOpen(true);
          }} />
        </Space>
      ),
    },
  ];

  const items = [
    {
      key: 'lab',
      label: (<span><CodeOutlined />Lab Management</span>),
      children: (
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0, textTransform: 'uppercase' }}>Lab Sections & Packages</Title>
            <Button type="primary" className="afro-button" icon={<PlusOutlined />} onClick={() => {
              setEditingCategory(null);
              categoryForm.resetFields();
              setIsCategoryModalOpen(true);
            }}>
              New Category
            </Button>
          </div>

          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {categories.map(cat => (
              <Card 
                key={cat.id} 
                className="geometric-card" 
                title={<Text strong style={{ textTransform: 'uppercase' }}>{cat.title} ({cat.descriptor})</Text>}
                extra={
                  <Space>
                    <Button type="link" onClick={() => {
                      setEditingCategory(cat);
                      categoryForm.setFieldsValue(cat);
                      setIsCategoryModalOpen(true);
                    }}>Edit Category</Button>
                    <Button type="link" danger onClick={() => handleDeleteCategory(cat.id)}>Delete</Button>
                  </Space>
                }
              >
                <Table 
                  dataSource={cat.packages} 
                  columns={packageColumns} 
                  rowKey="id" 
                  pagination={false} 
                  size="small"
                  footer={() => (
                    <Button block type="dashed" icon={<PlusOutlined />} onClick={() => {
                      setActiveCategoryId(cat.id);
                      setEditingPackage(null);
                      packageForm.resetFields();
                      setIsPackageModalOpen(true);
                    }}>
                      Add New Package to {cat.title}
                    </Button>
                  )}
                />
              </Card>
            ))}
          </Space>
        </div>
      ),
    },
    {
      key: 'mobility',
      label: (<span><CarOutlined />Mobility</span>),
      children: (
        <div style={{ padding: '24px' }}>
          <Title level={3} style={{ textTransform: 'uppercase', marginBottom: '24px' }}>Platform Mobility Overview</Title>
          
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card title="SITE VISIT REQUESTS" className="geometric-card">
                <Table 
                  dataSource={siteVisits} 
                  rowKey="id"
                  columns={[
                    { title: 'Project', dataIndex: ['project', 'title'], key: 'project' },
                    { title: 'User', dataIndex: ['user', 'name'], key: 'user' },
                    { title: 'Email', dataIndex: ['user', 'email'], key: 'email' },
                    { 
                      title: 'Status', 
                      dataIndex: 'status', 
                      key: 'status',
                      render: (status) => <Tag color={status === 'APPROVED' ? 'green' : status === 'REJECTED' ? 'red' : 'gold'}>{status}</Tag>
                    },
                    { title: 'Date', dataIndex: 'createdAt', key: 'date', render: (d) => new Date(d).toLocaleDateString() },
                  ]}
                />
              </Card>
            </Col>
            
            <Col span={24}>
              <Card title="VEHICLE HIRE BROADCASTS" className="geometric-card">
                <Table 
                  dataSource={vehicleHires} 
                  rowKey="id"
                  columns={[
                    { title: 'Engineer', dataIndex: ['engineer', 'name'], key: 'engineer' },
                    { title: 'Location', dataIndex: 'location', key: 'location' },
                    { title: 'Price', dataIndex: 'price', key: 'price', render: (p) => `$${p}` },
                    { title: 'Accepted By', dataIndex: ['acceptedBy', 'name'], key: 'acceptedBy', render: (n) => n || 'PENDING' },
                    { 
                      title: 'Status', 
                      dataIndex: 'status', 
                      key: 'status',
                      render: (status) => <Tag color={status === 'ACCEPTED' ? 'blue' : 'orange'}>{status}</Tag>
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'overview',
      label: (<span><AppstoreOutlined />Overview</span>),
      children: <div style={{ padding: '40px' }}><Text>General admin statistics and system health will appear here.</Text></div>
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--canvas-white)', paddingTop: '100px' }}>
      <Content className="container">
        <GeometricCard style={{ padding: '40px', marginBottom: '40px' }}>
          <Title level={1} style={{ textTransform: 'uppercase', margin: 0 }}>Admin <span style={{ color: 'var(--baobab-emerald)' }}>Command Center</span></Title>
        </GeometricCard>

        <Tabs 
          defaultActiveKey="lab" 
          items={items} 
          className="afro-tabs"
          style={{ background: 'white', padding: '20px', border: '2px solid var(--onyx-black)', boxShadow: '8px 8px 0px var(--onyx-black)' }}
        />

        {/* Category Modal */}
        <Modal
          title={editingCategory ? "Edit Category" : "New Category"}
          open={isCategoryModalOpen}
          onCancel={() => setIsCategoryModalOpen(false)}
          onOk={() => categoryForm.submit()}
          okText="Save Category"
          className="geometric-modal"
        >
          <Form form={categoryForm} layout="vertical" onFinish={handleSaveCategory}>
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="descriptor" label="Descriptor" rules={[{ required: true }]}>
              <Input placeholder="e.g. Build with modern tools" />
            </Form.Item>
            <Form.Item name="icon" label="Icon Name" rules={[{ required: true }]}>
              <Select>
                <Option value="CodeOutlined">CodeOutlined</Option>
                <Option value="BulbOutlined">BulbOutlined</Option>
                <Option value="ThunderboltOutlined">ThunderboltOutlined</Option>
              </Select>
            </Form.Item>
            <Form.Item name="order" label="Display Order">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Package Modal */}
        <Modal
          title={editingPackage ? "Edit Package" : "New Package"}
          open={isPackageModalOpen}
          onCancel={() => setIsPackageModalOpen(false)}
          onOk={() => packageForm.submit()}
          okText="Save Package"
          className="geometric-modal"
        >
          <Form form={packageForm} layout="vertical" onFinish={handleSavePackage}>
            <Form.Item name="name" label="Package Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="level" label="Level" rules={[{ required: true }]}>
              <Select>
                <Option value="Beginner">Beginner</Option>
                <Option value="Intermediate">Intermediate</Option>
                <Option value="Advanced">Advanced</Option>
                <Option value="All Levels">All Levels</Option>
              </Select>
            </Form.Item>
            <Form.Item name="duration" label="Duration" rules={[{ required: true }]}>
              <Input placeholder="e.g. 12 Weeks" />
            </Form.Item>
            <Form.Item name="order" label="Display Order">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="isActive" label="Is Active" valuePropName="checked" initialValue={true}>
              <Select>
                <Option value={true}>Active</Option>
                <Option value={false}>Hidden</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default AdminDashboard;
