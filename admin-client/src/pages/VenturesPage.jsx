import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Tag, Modal, Form, 
  Input, Select, message, Popconfirm, Card, Typography 
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import api from '../api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const VenturesPage = () => {
  const [venturesList, setVenturesList] = useState([]);
  const [isVentureModalOpen, setIsVentureModalOpen] = useState(false);
  const [editingVenture, setEditingVenture] = useState(null);
  
  const [selectedVenture, setSelectedVenture] = useState(null);
  const [ventureEngagements, setVentureEngagements] = useState([]);
  const [isEngTypModalOpen, setIsEngTypModalOpen] = useState(false);
  const [isVenturePostModalOpen, setIsVenturePostModalOpen] = useState(false);

  const [ventureForm] = Form.useForm();
  const [engTypeForm] = Form.useForm();
  const [venturePostForm] = Form.useForm();

  useEffect(() => {
    fetchVentures();
  }, []);

  const fetchVentures = async () => {
    try {
      const res = await api.get('/ventures');
      setVenturesList(res.data);
    } catch (error) {
      console.error("Failed to fetch ventures", error);
      message.error("Failed to fetch ventures");
    }
  };

  const handleSaveVenture = async (values) => {
    try {
      if (editingVenture) {
        await api.put(`/ventures/${editingVenture.id}`, values);
      } else {
        await api.post('/ventures', values);
      }
      message.success("Venture saved successfully");
      setIsVentureModalOpen(false);
      fetchVentures();
    } catch (error) {
      message.error(error?.response?.data?.error || "Failed to save venture");
    }
  };

  const handleDeleteVenture = async (id) => {
    try {
      await api.delete(`/ventures/${id}`);
      message.success("Venture deleted");
      fetchVentures();
    } catch (error) {
      message.error("Failed to delete venture");
    }
  };

  const handleAddEngType = async (values) => {
    if (!selectedVenture) return;
    try {
      await api.post(`/ventures/${selectedVenture.id}/engagement-types`, values);
      message.success("Engagement type added");
      setIsEngTypModalOpen(false);
      
      const res = await api.get(`/ventures/${selectedVenture.slug}`);
      setSelectedVenture(res.data);
    } catch (error) {
      message.error("Failed to add engagement type");
    }
  };

  const handleAddVenturePost = async (values) => {
    if (!selectedVenture) return;
    try {
      await api.post(`/ventures/${selectedVenture.id}/posts`, values);
      message.success("Post published");
      setIsVenturePostModalOpen(false);
      
      const res = await api.get(`/ventures/${selectedVenture.slug}`);
      setSelectedVenture(res.data);
    } catch (error) {
      message.error("Failed to publish post");
    }
  };

  const fetchVentureEngagements = async (ventureId) => {
    try {
      const res = await api.get(`/ventures/${ventureId}/engagements`);
      setVentureEngagements(res.data);
    } catch (error) {
      console.error("Failed to fetch engagements");
    }
  };

  const handleUpdateEngagementStatus = async (ventureId, engagementId, status) => {
    try {
      await api.put(`/ventures/${ventureId}/engagements/${engagementId}`, { status });
      message.success(`Status updated to ${status}`);
      fetchVentureEngagements(ventureId);
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  return (
    <div>
      <Card
        title={<Title level={4}>Ventures Management</Title>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingVenture(null);
              ventureForm.resetFields();
              setIsVentureModalOpen(true);
            }}
          >
            Create Venture
          </Button>
        }
      >
        <Table
          dataSource={venturesList}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          columns={[
            { title: 'Name', dataIndex: 'name', key: 'name' },
            { title: 'Slug', dataIndex: 'slug', key: 'slug' },
            {
              title: 'Status',
              dataIndex: 'isActive',
              key: 'isActive',
              render: (val) => <Tag color={val ? 'green' : 'red'}>{val ? 'ACTIVE' : 'HIDDEN'}</Tag>
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingVenture(record);
                      ventureForm.setFieldsValue(record);
                      setIsVentureModalOpen(true);
                    }}
                  />
                  <Button
                    type="primary"
                    ghost
                    icon={<SettingOutlined />}
                    onClick={async () => {
                      try {
                        const res = await api.get(`/ventures/${record.slug}`);
                        setSelectedVenture(res.data);
                        fetchVentureEngagements(record.id);
                      } catch (error) {
                        message.error("Failed to load venture details");
                      }
                    }}
                  >
                    Manage
                  </Button>
                  <Popconfirm
                    title="Delete this venture?"
                    onConfirm={() => handleDeleteVenture(record.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />

        {selectedVenture && (
          <div style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={4}>Managing: {selectedVenture.name}</Title>
              <Button onClick={() => setSelectedVenture(null)}>Close Management</Button>
            </div>

            <Card style={{ marginBottom: '16px' }} title="Engagement Types" extra={<Button type="link" onClick={() => { engTypeForm.resetFields(); setIsEngTypModalOpen(true); }}>+ Add Type</Button>}>
              <Space wrap>
                {selectedVenture.engagementTypes?.map((et) => (
                  <Tag key={et.id} color="cyan">{et.label} {et.icon && `(${et.icon})`}</Tag>
                ))}
                {(!selectedVenture.engagementTypes || selectedVenture.engagementTypes.length === 0) && (
                  <Text type="secondary">No engagement types configured</Text>
                )}
              </Space>
            </Card>

            <Card style={{ marginBottom: '16px' }} title={`Posts (${selectedVenture.posts?.length || 0})`} extra={<Button type="link" onClick={() => { venturePostForm.resetFields(); setIsVenturePostModalOpen(true); }}>+ New Post</Button>}>
              {selectedVenture.posts?.map((p) => (
                <div key={p.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', marginBottom: '12px' }}>
                  <p>{p.content}</p>
                  <Text type="secondary" style={{ fontSize: '12px' }}>{new Date(p.createdAt).toLocaleDateString()}</Text>
                </div>
              ))}
              {(!selectedVenture.posts || selectedVenture.posts.length === 0) && (
                  <Text type="secondary">No posts published yet</Text>
              )}
            </Card>

            <Card title={`Engagements Inbox (${ventureEngagements.length})`}>
              <Table
                dataSource={ventureEngagements}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                columns={[
                  { title: 'Type', dataIndex: 'engagementType', key: 'type' },
                  { title: 'Name', dataIndex: 'contactName', key: 'name' },
                  { title: 'Email', dataIndex: 'contactEmail', key: 'email' },
                  { title: 'Message', dataIndex: 'message', key: 'message', render: (m) => m ? (m.length > 50 ? m.substring(0, 50) + '...' : m) : '-' },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (s) => <Tag color={s === 'PENDING' ? 'orange' : s === 'REVIEWED' ? 'green' : 'default'}>{s}</Tag>
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: (_, record) => (
                      <Space>
                        {record.status !== 'REVIEWED' && (
                          <Button size="small" type="primary" onClick={() => handleUpdateEngagementStatus(selectedVenture.id, record.id, 'REVIEWED')}>Review</Button>
                        )}
                        {record.status !== 'ARCHIVED' && (
                          <Button size="small" onClick={() => handleUpdateEngagementStatus(selectedVenture.id, record.id, 'ARCHIVED')}>Archive</Button>
                        )}
                      </Space>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        )}
      </Card>

      <Modal
        title={editingVenture ? "Update Venture" : "Create Venture"}
        open={isVentureModalOpen}
        onCancel={() => setIsVentureModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form form={ventureForm} layout="vertical" onFinish={handleSaveVenture}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="shortDescription" label="Short Description" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fullDescription" label="Full Description">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="logoUrl" label="Logo URL">
            <Input />
          </Form.Item>
          <Form.Item name="bannerUrl" label="Banner URL">
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="Status" valuePropName="checked" initialValue={true}>
            <Select>
              <Option value={true}>ACTIVE</Option>
              <Option value={false}>HIDDEN</Option>
            </Select>
          </Form.Item>
          <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={() => setIsVentureModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save Venture</Button>
          </Space>
        </Form>
      </Modal>

      <Modal
        title="Add Engagement Type"
        open={isEngTypModalOpen}
        onCancel={() => setIsEngTypModalOpen(false)}
        footer={null}
      >
        <Form form={engTypeForm} layout="vertical" onFinish={handleAddEngType}>
          <Form.Item name="label" label="Label (e.g. Invest, Apply)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="icon" label="Icon Name (e.g. Handshake, Lightbulb)">
            <Input />
          </Form.Item>
          <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={() => setIsEngTypModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Add Type</Button>
          </Space>
        </Form>
      </Modal>

      <Modal
        title="New Venture Post"
        open={isVenturePostModalOpen}
        onCancel={() => setIsVenturePostModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={venturePostForm} layout="vertical" onFinish={handleAddVenturePost}>
          <Form.Item name="content" label="Post Content" rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="imageUrl" label="Image URL">
            <Input />
          </Form.Item>
          <Form.Item name="videoUrl" label="Video URL">
            <Input />
          </Form.Item>
          <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={() => setIsVenturePostModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Publish Post</Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default VenturesPage;
