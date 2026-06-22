import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  message,
  Modal,
  Tabs,
  Typography,
  Empty,
  List,
  Popconfirm,
  Input,
  Form,
  Select,
  Switch
} from "antd";
import {
  ExperimentOutlined,
  DeleteOutlined,
  PlusOutlined,
  FolderOpenOutlined,
  EditOutlined,
  AudioOutlined,
  VideoCameraOutlined
} from "@ant-design/icons";
import api from "../api";

const { Title, Paragraph, Text } = Typography;

const LabManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [recordingsLoading, setRecordingsLoading] = useState(false);

  // Modals for Category & Package Editing
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  
  const [catForm] = Form.useForm();
  const [pkgForm] = Form.useForm();

  useEffect(() => {
    fetchCategories();
    fetchRecordings();
  }, []);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await api.get("/lab/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load lab categories.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchRecordings = async () => {
    setRecordingsLoading(true);
    try {
      const res = await api.get("/admin/lab/recordings");
      setRecordings(res.data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load recordings.");
    } finally {
      setRecordingsLoading(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(`/lab/categories/${id}`);
      message.success("Category deleted successfully.");
      fetchCategories();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete category.");
    }
  };

  // Delete Recording
  const handleDeleteRecording = async (id) => {
    try {
      await api.delete(`/admin/lab/recordings/${id}`);
      message.success("Recording moderated and deleted.");
      fetchRecordings();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete recording.");
    }
  };

  // Upsert Category Submit
  const handleCategorySubmit = async (values) => {
    try {
      await api.post("/lab/categories", {
        id: editingCategory ? editingCategory.id : undefined,
        ...values,
        order: Number(values.order || 0)
      });
      message.success(editingCategory ? "Category updated." : "Category created.");
      setIsCategoryModalOpen(false);
      catForm.resetFields();
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      message.error("Failed to save category.");
    }
  };

  // Upsert Package Submit
  const handlePackageSubmit = async (values) => {
    try {
      await api.post("/lab/packages", {
        id: editingPackage ? editingPackage.id : undefined,
        ...values,
        order: Number(values.order || 0),
        isActive: values.isActive ?? true
      });
      message.success(editingPackage ? "Package updated." : "Package created.");
      setIsPackageModalOpen(false);
      pkgForm.resetFields();
      setEditingPackage(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      message.error("Failed to save package.");
    }
  };

  // Open Category Modal for Create/Edit
  const openCategoryModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      catForm.setFieldsValue(category);
    } else {
      catForm.resetFields();
    }
    setIsCategoryModalOpen(true);
  };

  // Open Package Modal for Create/Edit
  const openPackageModal = (pkg = null, categoryId = null) => {
    setEditingPackage(pkg);
    if (pkg) {
      pkgForm.setFieldsValue({
        ...pkg,
        categoryId: pkg.categoryId
      });
    } else {
      pkgForm.resetFields();
      pkgForm.setFieldsValue({ categoryId });
    }
    setIsPackageModalOpen(true);
  };

  // Recordings Table columns
  const recordingColumns = [
    {
      title: "Lecture",
      key: "lecture",
      render: (_, record) => (
        <div>
          <Text strong>{record.title}</Text>
          <div style={{ fontSize: "12px", color: "gray" }}>{record.description}</div>
        </div>
      )
    },
    {
      title: "Category",
      dataIndex: ["category", "title"],
      key: "category",
      render: (catTitle) => <Tag color="blue">{catTitle || "N/A"}</Tag>
    },
    {
      title: "Teacher",
      key: "teacher",
      render: (_, record) => (
        <div>
          <div>{record.channel?.user?.name || "Unknown"}</div>
          <div style={{ fontSize: "11px", color: "#8c8c8c" }}>{record.channel?.user?.email}</div>
        </div>
      )
    },
    {
      title: "TV Channel",
      dataIndex: ["channel", "title"],
      key: "channel"
    },
    {
      title: "Type",
      dataIndex: "mimeType",
      key: "type",
      render: (mime) => {
        const isVideo = mime?.startsWith("video");
        return (
          <Tag color={isVideo ? "cyan" : "magenta"}>
            {isVideo ? <VideoCameraOutlined /> : <AudioOutlined />} {isVideo ? "Video" : "Audio"}
          </Tag>
        );
      }
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="Delete this lecture?"
          description="This will moderate and permanently delete the recording."
          onConfirm={() => handleDeleteRecording(record.id)}
          okText="Delete"
          cancelText="Cancel"
        >
          <Button type="primary" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
        <Col span={24}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ExperimentOutlined style={{ fontSize: "28px", color: "#52c41a" }} />
            <Title level={2} style={{ margin: 0 }}>PANX LAB Governance</Title>
          </div>
          <Paragraph type="secondary" style={{ marginTop: "8px" }}>
            Manage the academic catalog structure, add learning modules, and audit teacher recorded lectures.
          </Paragraph>
        </Col>
      </Row>

      {/* Stats KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: "32px" }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Active Categories" value={categories.length} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Total Learning Packages" value={categories.reduce((acc, cat) => acc + (cat.packages?.length || 0), 0)} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Uploaded Lectures" value={recordings.length} valueStyle={{ color: "#1890ff" }} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <Tabs
          defaultActiveKey="recordings"
          items={[
            {
              key: "recordings",
              label: "Auditing & Moderation",
              children: (
                <Table
                  dataSource={recordings}
                  columns={recordingColumns}
                  rowKey="id"
                  loading={recordingsLoading}
                  locale={{ emptyText: <Empty description="No lectures uploaded yet." /> }}
                />
              )
            },
            {
              key: "categories",
              label: "Categories & Modules Builder",
              children: (
                <div>
                  <div style={{ marginBottom: "16px", display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => openCategoryModal()}
                      style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                    >
                      New Category
                    </Button>
                  </div>
                  
                  <List
                    loading={categoriesLoading}
                    dataSource={categories}
                    renderItem={(cat) => (
                      <Card 
                        style={{ marginBottom: "24px" }}
                        title={
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Space>
                              <Tag color="cyan">{cat.icon}</Tag>
                              <Text strong>{cat.title}</Text>
                              <Text type="secondary" style={{ fontSize: "12px", fontWeight: "normal" }}>({cat.descriptor})</Text>
                            </Space>
                            <Space>
                              <Button size="small" icon={<PlusOutlined />} onClick={() => openPackageModal(null, cat.id)}>
                                Add Package
                              </Button>
                              <Button size="small" icon={<EditOutlined />} onClick={() => openCategoryModal(cat)}>
                                Edit
                              </Button>
                              <Popconfirm
                                title="Delete category?"
                                description="This will delete the category and all its packages."
                                onConfirm={() => handleDeleteCategory(cat.id)}
                              >
                                <Button size="small" danger icon={<DeleteOutlined />} />
                              </Popconfirm>
                            </Space>
                          </div>
                        }
                      >
                        <Table
                          dataSource={cat.packages || []}
                          rowKey="id"
                          pagination={false}
                          columns={[
                            {
                              title: "Package Name",
                              dataIndex: "name",
                              key: "name",
                              render: (text) => <Text strong>{text}</Text>
                            },
                            {
                              title: "Level",
                              dataIndex: "level",
                              key: "level",
                              render: (level) => <Tag color="purple">{level}</Tag>
                            },
                            {
                              title: "Duration",
                              dataIndex: "duration",
                              key: "duration"
                            },
                            {
                              title: "Status",
                              dataIndex: "isActive",
                              key: "isActive",
                              render: (active) => <Tag color={active ? "green" : "red"}>{active ? "Active" : "Disabled"}</Tag>
                            },
                            {
                              title: "Actions",
                              key: "actions",
                              render: (_, pkg) => (
                                <Button size="small" icon={<EditOutlined />} onClick={() => openPackageModal(pkg)}>
                                  Edit
                                </Button>
                              )
                            }
                          ]}
                        />
                      </Card>
                    )}
                  />
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* Category Upsert Modal */}
      <Modal
        title={editingCategory ? "Edit Category" : "New Category"}
        open={isCategoryModalOpen}
        onCancel={() => setIsCategoryModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={catForm} layout="vertical" onFinish={handleCategorySubmit} style={{ marginTop: "16px" }}>
          <Form.Item label="Category Title" name="title" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. Artificial Intelligence" />
          </Form.Item>
          <Form.Item label="Descriptor" name="descriptor" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. Train and deploy neural networks" />
          </Form.Item>
          <Form.Item label="Icon Name" name="icon" rules={[{ required: true, message: "Required" }]}>
            <Select placeholder="Select icon type">
              <Select.Option value="CodeOutlined">Code</Select.Option>
              <Select.Option value="CpuOutlined">CPU</Select.Option>
              <Select.Option value="LayersOutlined">Layers</Select.Option>
              <Select.Option value="BulbOutlined">Bulb/Sparkles</Select.Option>
              <Select.Option value="BinaryOutlined">Binary</Select.Option>
              <Select.Option value="RocketOutlined">Rocket</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Order index" name="order">
            <Input type="number" placeholder="e.g. 1" />
          </Form.Item>
          <Form.Item>
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Save</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Package Upsert Modal */}
      <Modal
        title={editingPackage ? "Edit Package" : "New Package"}
        open={isPackageModalOpen}
        onCancel={() => setIsPackageModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={pkgForm} layout="vertical" onFinish={handlePackageSubmit} style={{ marginTop: "16px" }}>
          <Form.Item name="categoryId" hidden rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Package Name" name="name" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. LLM Foundations" />
          </Form.Item>
          <Form.Item label="Complexity Level" name="level" rules={[{ required: true, message: "Required" }]}>
            <Select>
              <Select.Option value="Beginner">Beginner</Select.Option>
              <Select.Option value="Intermediate">Intermediate</Select.Option>
              <Select.Option value="Advanced">Advanced</Select.Option>
              <Select.Option value="All Levels">All Levels</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Duration" name="duration" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. 8 Weeks" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Syllabus/curriculum overview..." />
          </Form.Item>
          <Form.Item label="Order index" name="order">
            <Input type="number" placeholder="e.g. 1" />
          </Form.Item>
          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
          <Form.Item>
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={() => setIsPackageModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Save</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LabManagementPage;
