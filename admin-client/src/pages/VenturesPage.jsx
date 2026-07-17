import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Tag, Modal, Form, 
  Input, Select, message, Popconfirm, Card, Typography, Upload
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined, UploadOutlined } from '@ant-design/icons';
import { Handshake, TrendingUp, Users, Lightbulb, Rocket, Eye, Send } from 'lucide-react';
import api from '../api';

const iconMap = {
  Handshake: <Handshake size={16} />,
  TrendingUp: <TrendingUp size={16} />,
  Users: <Users size={16} />,
  Lightbulb: <Lightbulb size={16} />,
  Rocket: <Rocket size={16} />,
  Eye: <Eye size={16} />,
  Send: <Send size={16} />,
};

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

  const [logoFileList, setLogoFileList] = useState([]);
  const [bannerFileList, setBannerFileList] = useState([]);
  const [postImageFileList, setPostImageFileList] = useState([]);
  const [postVideoFileList, setPostVideoFileList] = useState([]);

  // Loading states
  const [isSavingVenture, setIsSavingVenture] = useState(false);
  const [isAddingEngType, setIsAddingEngType] = useState(false);
  const [isPublishingPost, setIsPublishingPost] = useState(false);

  useEffect(() => {
    fetchVentures();
  }, []);

  const fetchVentures = async () => {
    try {
      const res = await api.get('/ventures/admin/all');
      setVenturesList(res.data);
    } catch (error) {
      console.error("Failed to fetch ventures", error);
      message.error("Failed to fetch ventures");
    }
  };

  const handleSaveVenture = async (values) => {
    setIsSavingVenture(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('shortDescription', values.shortDescription);
      if (values.fullDescription) formData.append('fullDescription', values.fullDescription);
      formData.append('isActive', values.isActive);

      if (logoFileList.length > 0) {
        formData.append('logo', logoFileList[0].originFileObj);
      } else if (editingVenture?.logoUrl) {
        formData.append('logoUrl', editingVenture.logoUrl);
      }

      if (bannerFileList.length > 0) {
        formData.append('banner', bannerFileList[0].originFileObj);
      } else if (editingVenture?.bannerUrl) {
        formData.append('bannerUrl', editingVenture.bannerUrl);
      }

      if (editingVenture) {
        await api.put(`/ventures/${editingVenture.id}`, formData);
      } else {
        await api.post('/ventures', formData);
      }
      message.success("Venture saved successfully");
      setIsVentureModalOpen(false);
      fetchVentures();
    } catch (error) {
      message.error(error?.response?.data?.error || "Failed to save venture");
    } finally {
      setIsSavingVenture(false);
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
    setIsAddingEngType(true);
    try {
      await api.post(`/ventures/${selectedVenture.id}/engagement-types`, values);
      message.success("Engagement type added");
      setIsEngTypModalOpen(false);
      
      const res = await api.get(`/ventures/${selectedVenture.slug}`);
      setSelectedVenture(res.data);
    } catch (error) {
      message.error("Failed to add engagement type");
    } finally {
      setIsAddingEngType(false);
    }
  };

  const handleAddVenturePost = async (values) => {
    if (!selectedVenture) return;
    setIsPublishingPost(true);
    try {
      const formData = new FormData();
      formData.append('content', values.content);

      if (postImageFileList.length > 0) {
        formData.append('image', postImageFileList[0].originFileObj);
      }
      if (postVideoFileList.length > 0) {
        formData.append('video', postVideoFileList[0].originFileObj);
      }

      await api.post(`/ventures/${selectedVenture.id}/posts`, formData);
      message.success("Post published");
      setIsVenturePostModalOpen(false);
      
      const res = await api.get(`/ventures/${selectedVenture.slug}`);
      setSelectedVenture(res.data);
    } catch (error) {
      message.error("Failed to publish post");
    } finally {
      setIsPublishingPost(false);
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
      await api.patch(`/ventures/${ventureId}/engagements/${engagementId}`, { status });
      message.success(`Status updated to ${status}`);
      fetchVentureEngagements(ventureId);
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {!selectedVenture ? (
        <Card
          title={<Title level={4} style={{ margin: 0 }}>Ventures Management</Title>}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingVenture(null);
                ventureForm.resetFields();
                setLogoFileList([]);
                setBannerFileList([]);
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
              { title: 'Name', dataIndex: 'name', key: 'name', render: (text) => <span style={{ textTransform: 'capitalize' }}>{text}</span> },
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
                        setLogoFileList([]);
                        setBannerFileList([]);
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
        </Card>
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>Managing: {selectedVenture.name}</Title>
                <Text type="secondary">{selectedVenture.shortDescription}</Text>
              </div>
              <Button onClick={() => setSelectedVenture(null)}>Back to Ventures</Button>
            </div>
          </Card>

          <Card title="Engagement Types" extra={<Button type="link" onClick={() => { engTypeForm.resetFields(); setIsEngTypModalOpen(true); }}>+ Add Type</Button>}>
            <Space wrap>
              {selectedVenture.engagementTypes?.map((et) => (
                <Tag key={et.id} color="cyan" style={{ padding: '4px 8px', fontSize: '14px' }}>
                  <Space>
                    {et.icon && iconMap[et.icon]}
                    {et.label}
                  </Space>
                </Tag>
              ))}
              {(!selectedVenture.engagementTypes || selectedVenture.engagementTypes.length === 0) && (
                <Text type="secondary">No engagement types configured</Text>
              )}
            </Space>
          </Card>

          <Card title={`Posts (${selectedVenture.posts?.length || 0})`} extra={<Button type="link" onClick={() => { venturePostForm.resetFields(); setPostImageFileList([]); setPostVideoFileList([]); setIsVenturePostModalOpen(true); }}>+ New Post</Button>}>
            {selectedVenture.posts?.map((p) => (
              <div key={p.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '16px', marginBottom: '16px' }}>
                <p style={{ fontSize: '16px' }}>{p.content}</p>
                <Space>
                  {p.imageUrl && <Tag color="blue">Image Attached</Tag>}
                  {p.videoUrl && <Tag color="purple">Video Attached</Tag>}
                  <Text type="secondary" style={{ fontSize: '12px' }}>{new Date(p.createdAt).toLocaleDateString()}</Text>
                </Space>
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
        </Space>
      )}

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
          <Form.Item label="Logo Image">
            <Upload 
              beforeUpload={() => false}
              maxCount={1}
              fileList={logoFileList}
              onChange={(info) => setLogoFileList(info.fileList.slice(-1))}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Select Logo</Button>
            </Upload>
            {editingVenture?.logoUrl && logoFileList.length === 0 && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Current Logo:</Text>
                <br />
                <img src={editingVenture.logoUrl} alt="Logo" style={{ maxHeight: 60, marginTop: 4, borderRadius: 4 }} />
              </div>
            )}
          </Form.Item>
          <Form.Item label="Banner Image">
            <Upload 
              beforeUpload={() => false}
              maxCount={1}
              fileList={bannerFileList}
              onChange={(info) => setBannerFileList(info.fileList.slice(-1))}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Select Banner</Button>
            </Upload>
            {editingVenture?.bannerUrl && bannerFileList.length === 0 && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Current Banner:</Text>
                <br />
                <img src={editingVenture.bannerUrl} alt="Banner" style={{ maxHeight: 80, marginTop: 4, borderRadius: 4 }} />
              </div>
            )}
          </Form.Item>
          <Form.Item name="isActive" label="Status" initialValue={true}>
            <Select>
              <Option value={true}>ACTIVE</Option>
              <Option value={false}>HIDDEN</Option>
            </Select>
          </Form.Item>
          <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={() => setIsVentureModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isSavingVenture}>{editingVenture ? 'Update' : 'Create'}</Button>
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
          <Form.Item name="icon" label="Icon Name (e.g. Handshake, Lightbulb)" rules={[{ required: true }]}>
            <Select placeholder="Select an Icon">
              {Object.entries(iconMap).map(([key, Icon]) => (
                <Option key={key} value={key}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {Icon} {key}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={() => setIsEngTypModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isAddingEngType}>Add Type</Button>
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
          <Form.Item label="Image Upload">
            <Upload 
              beforeUpload={() => false}
              maxCount={1}
              fileList={postImageFileList}
              onChange={(info) => setPostImageFileList(info.fileList.slice(-1))}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="Video Upload">
            <Upload 
              beforeUpload={() => false}
              maxCount={1}
              fileList={postVideoFileList}
              onChange={(info) => setPostVideoFileList(info.fileList.slice(-1))}
              accept="video/*"
            >
              <Button icon={<UploadOutlined />}>Select Video</Button>
            </Upload>
          </Form.Item>
          <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={() => setIsVenturePostModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isPublishingPost}>Publish Post</Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default VenturesPage;
