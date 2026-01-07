// admin-client/src/pages/HealingSuggestionsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Typography,
  App as AntApp,
  Space,
  Popconfirm,
  Switch,
  theme,
  Card,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../api";
import AddEditSuggestionModal from "../components/AddEditSuggestionModal";
const { useToken } = theme;

const { Title } = Typography;

const HealingSuggestionsPage = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState(null);
  const { message } = AntApp.useApp();
  const { token } = useToken();
  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/healing-suggestions");
      setSuggestions(response.data);
    } catch (error) {
      message.error(
        error.response?.data?.error || "Failed to load suggestions."
      );
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleDelete = async (suggestionId) => {
    try {
      await api.delete(`/admin/healing-suggestions/${suggestionId}`);
      message.success("Suggestion deleted successfully.");
      fetchSuggestions();
    } catch (error) {
      message.error(
        error.response?.data?.error || "Failed to delete suggestion."
      );
    }
  };

  const openModal = (suggestion = null) => {
    setEditingSuggestion(suggestion);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSuggestion(null);
    fetchSuggestions(); // Refresh list on close
  };

  const columns = [
    { title: "Suggestion Text", dataIndex: "text", key: "text" },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => <Switch checked={isActive} disabled />,
    },
    {
      title: "Actions",
      key: "actions",
      width: 250,
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => openModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this suggestion?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Title level={2}>Healing Suggestion Management</Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => openModal()}
        style={{ marginBottom: 16 }}
      >
        Add New Suggestion
      </Button>
      <Card
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowSecondary,
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 12 }}
      >
        <Table
          size="small"
          columns={columns}
          dataSource={suggestions}
          loading={loading}
          rowKey="id"
        />
      </Card>
      <AddEditSuggestionModal
        suggestion={editingSuggestion}
        open={isModalOpen}
        onCancel={closeModal}
        onSuccess={closeModal}
      />
    </>
  );
};

export default HealingSuggestionsPage;
