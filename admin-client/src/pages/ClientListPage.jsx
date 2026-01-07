// admin-client/src/pages/ClientListPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Typography,
  App as AntApp,
  Spin,
  Input,
  Card,
  theme,
} from "antd";
import { UserOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../api";

const { Title } = Typography;
const { useToken } = theme;
const ClientListPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { message } = AntApp.useApp();
  const navigate = useNavigate();
  const { token } = useToken();

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/clients");
      setClients(response.data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      if (error.response?.status !== 401) {
        message.error(error.response?.data?.error || "Failed to load clients.");
      }
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleViewDetails = (clientId) => {
    navigate(`/clients/${clientId}`);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      defaultSortOrder: "ascend",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Has Profile",
      dataIndex: "frequencyProfile",
      key: "frequencyProfile",
      render: (profile) => (profile ? "Yes" : "No"),
      filters: [
        { text: "Yes", value: true },
        { text: "No", value: false },
      ],
      onFilter: (value, record) => !!record.frequencyProfile === value,
    },
    {
      title: "Joined On",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record.id)}
        >
          View Profile
        </Button>
      ),
    },
  ];

  return (
    <>
      <Title level={2}>Client Management</Title>
      <Input
        placeholder="Search by name or email..."
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 400 }}
        allowClear
      />
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
          dataSource={filteredClients}
          loading={loading}
          rowKey="id"
        />
      </Card>
    </>
  );
};

export default ClientListPage;
