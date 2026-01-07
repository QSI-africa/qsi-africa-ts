import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button,
  Typography,
  Table,
  Space,
  Card,
  Tag,
  Modal,
  Form,
  Input,
  Switch,
  App as AntApp,
  theme,
  Tabs,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BulbOutlined,
  CloudOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HomeOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import api from "../api";

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

// ====================================================================
// Reusable Hook: useSuggestions
// ====================================================================

const useSuggestions = (moduleName) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { message } = AntApp.useApp();

  const API_BASE = `/admin/${moduleName}-suggestions`;

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(API_BASE);
      setSuggestions(response.data);
    } catch (error) {
      console.error(`Failed to fetch ${moduleName} suggestions:`, error);
      message.error(`Failed to load ${moduleName} suggestions.`);
    } finally {
      setLoading(false);
    }
  }, [moduleName, message]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleAddOrUpdate = useCallback(
    async (values, id = null) => {
      try {
        if (id) {
          await api.put(`${API_BASE}/${id}`, values);
          message.success(`Suggestion updated successfully.`);
        } else {
          await api.post(API_BASE, values);
          message.success(`Suggestion added successfully.`);
        }
        fetchSuggestions();
        return true;
      } catch (error) {
        const errorMsg = error.response?.data?.error || "Operation failed.";
        message.error(errorMsg);
        return false;
      }
    },
    [API_BASE, fetchSuggestions, message]
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        console.log(`Attempting to delete suggestion with ID: ${id}`);
        console.log(`API endpoint: ${API_BASE}/${id}`);

        await api.delete(`${API_BASE}/${id}`);
        message.success("Suggestion deleted successfully.");

        // Refresh the list after successful deletion
        fetchSuggestions();
      } catch (error) {
        console.error("Delete error details:", error);
        console.error("Error response:", error.response);

        const errorMsg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to delete suggestion. Please try again.";

        message.error(`Deletion failed: ${errorMsg}`);
      }
    },
    [API_BASE, fetchSuggestions, message]
  );

  return {
    suggestions,
    loading,
    fetchSuggestions,
    handleAddOrUpdate,
    handleDelete,
  };
};

// ====================================================================
// Reusable Component: SuggestionModal
// ====================================================================

const SuggestionModal = ({
  moduleName,
  initialData,
  open,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!initialData;
  const { token } = useToken();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        text: initialData?.text || "",
        isActive:
          initialData?.isActive !== undefined ? initialData.isActive : true,
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = async (values) => {
    const success = await onSubmit(values, initialData?.id);
    if (success) {
      form.resetFields();
      onClose();
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          {isEditing
            ? `Edit ${moduleName} Suggestion`
            : `Add New ${moduleName} Suggestion`}
        </Title>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ isActive: true }}
      >
        <Form.Item
          name="text"
          label="Suggestion Text (Must be unique)"
          rules={[
            { required: true, message: "Please enter the suggestion text." },
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder="e.g., I need a sustainable housing blueprint."
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Active Status"
          valuePropName="checked"
          tooltip="If deactivated, this suggestion will not appear in the client chat window."
        >
          <Switch
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<CloseCircleOutlined />}
          />
        </Form.Item>

        <Form.Item style={{ marginTop: token.marginLG }}>
          <Button
            type="primary"
            htmlType="submit"
            style={{ fontWeight: 600, width: "100%" }}
          >
            {isEditing ? "Save Changes" : "Add Suggestion"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ====================================================================
// Reusable Component: ModuleSuggestionTable
// ====================================================================

const ModuleSuggestionTable = ({ moduleName, title }) => {
  const { token } = useToken();
  const { suggestions, loading, handleAddOrUpdate, handleDelete } =
    useSuggestions(moduleName);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState(null);

  const openModal = (data = null) => {
    setEditingSuggestion(data);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSuggestion(null);
  };

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: "10%",
        render: (id) => (
          <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            #{id}
          </Text>
        ),
      },
      {
        title: "Suggestion Text",
        dataIndex: "text",
        key: "text",
        width: "55%",
        render: (text) => (
          <Text style={{ color: token.colorText, fontSize: token.fontSize }}>
            {text}
          </Text>
        ),
      },
      {
        title: "Status",
        dataIndex: "isActive",
        key: "isActive",
        width: "15%",
        render: (isActive) => (
          <Tag
            icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            color={isActive ? "success" : "error"}
            style={{ borderRadius: token.borderRadiusSM }}
          >
            {isActive ? "Active" : "Hidden"}
          </Tag>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        width: "20%",
        render: (_, record) => (
          <Space size="small">
            <Button
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
              size="small"
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete Suggestion"
              description={
                <div>
                  <p>Are you sure you want to delete this suggestion?</p>
                  <Text strong style={{ color: token.colorError }}>
                    "{record.text}"
                  </Text>
                  <p style={{ marginTop: 8, color: token.colorTextSecondary }}>
                    This action cannot be undone.
                  </p>
                </div>
              }
              icon={
                <QuestionCircleOutlined style={{ color: token.colorError }} />
              }
              okText="Yes, Delete"
              cancelText="Cancel"
              okType="danger"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button icon={<DeleteOutlined />} size="small" danger>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [token, handleDelete]
  );

  return (
    <>
      <Card
        title={
          <Space>
            <BulbOutlined style={{ color: token.colorPrimary }} />
            <Title level={4} style={{ margin: 0 }}>
              {title} Suggestions
            </Title>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            style={{ fontWeight: 600 }}
          >
            Add New
          </Button>
        }
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowSecondary,
          minHeight: 400,
        }}
        bodyStyle={{ padding: token.paddingSM }}
      >
        <Paragraph type="secondary" style={{ marginBottom: token.margin }}>
          Manage the pre-defined conversation starters for the{" "}
          <strong>{title}</strong> chat module.
        </Paragraph>

        <Table
          columns={columns}
          dataSource={suggestions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          size="middle"
          scroll={{ x: 800 }}
        />
      </Card>

      <SuggestionModal
        moduleName={moduleName}
        open={modalOpen}
        initialData={editingSuggestion}
        onClose={closeModal}
        onSubmit={handleAddOrUpdate}
      />
    </>
  );
};

// ====================================================================
// Main Management Page
// ====================================================================

const SuggestionManagementPage = () => {
  const { token } = useToken();

  const tabItems = [
    {
      key: "infrastructure",
      label: (
        <Space>
          <HomeOutlined />
          Smart Infrastructure
        </Space>
      ),
      children: (
        <ModuleSuggestionTable
          moduleName="infrastructure"
          title="Smart Infrastructure"
        />
      ),
    },
    {
      key: "vision",
      label: (
        <Space>
          <EyeOutlined />
          Vision Space
        </Space>
      ),
      children: (
        <ModuleSuggestionTable moduleName="vision" title="Vision Space" />
      ),
    },
  ];

  return (
    <div
      style={{
        padding: token.paddingLG,
        margin: "0 auto",
        background: token.colorBgLayout,
        minHeight: "100vh",
      }}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <div>
          <Title level={4} style={{ margin: 0, color: token.colorTextHeading }}>
            <CloudOutlined style={{ marginRight: token.margin }} />
            Module Suggestion Management
          </Title>
          <Paragraph type="secondary" style={{ marginTop: token.marginXS }}>
            Manage conversation starters for different chat modules
          </Paragraph>
        </div>

        <Tabs
          defaultActiveKey="infrastructure"
          type="card"
          size="large"
          items={tabItems}
          style={{
            background: token.colorBgContainer,
            padding: token.paddingMD,
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadowSecondary,
          }}
        />
      </Space>
    </div>
  );
};

export default SuggestionManagementPage;
