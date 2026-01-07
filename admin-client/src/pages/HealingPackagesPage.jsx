// admin-client/src/pages/HealingPackagesPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Typography,
  App as AntApp,
  Space,
  Popconfirm,
  Switch,
  Tag,
  Card,
  theme,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../api";
import AddEditPackageModal from "../components/AddEditPackageModal";
const { useToken } = theme;

const { Title } = Typography;

const HealingPackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const { message } = AntApp.useApp();
  const { token } = useToken();

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/healing-packages");
      setPackages(response.data);
    } catch (error) {
      message.error(error.response?.data?.error || "Failed to load packages.");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleDelete = async (packageId) => {
    try {
      await api.delete(`/admin/healing-packages/${packageId}`);
      message.success("Package deleted successfully.");
      fetchPackages();
    } catch (error) {
      message.error(error.response?.data?.error || "Failed to delete package.");
    }
  };

  const openModal = (pkg = null) => {
    setEditingPackage(pkg);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
    fetchPackages(); // Refresh list on close
  };

  const columns = [
    { title: "Title", dataIndex: "title", key: "title", width: "20%" },
    {
      title: "Preview",
      dataIndex: "shortPreview",
      key: "shortPreview",
      width: "30%",
    },
    { title: "Fee", dataIndex: "fee", key: "fee" },
    { title: "Duration", dataIndex: "duration", key: "duration" },
    { title: "CTA", dataIndex: "cta", key: "cta" },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => <Switch checked={isActive} disabled />,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => openModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this package?"
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
      <Title level={2}>Healing Package Management</Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => openModal()}
        style={{ marginBottom: 16 }}
      >
        Add New Package
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
          dataSource={packages}
          loading={loading}
          rowKey="id"
        />
      </Card>
      <AddEditPackageModal
        pkg={editingPackage}
        open={isModalOpen}
        onCancel={closeModal}
        onSuccess={closeModal}
      />
    </>
  );
};

export default HealingPackagesPage;
