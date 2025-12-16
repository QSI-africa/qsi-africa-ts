// admin-client/src/pages/PilotProjectsPage.jsx
import React, { useState, useEffect, useCallback  } from 'react';
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
  Grid,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import api from "../api";
import AddEditPilotModal from "../components/AddEditPilotModal";

const { Title, Paragraph, Text } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

const PilotProjectsPage: React.FC = () => {
  const [pilots, setPilots] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPilot, setEditingPilot] = useState<any>(null);
  const { message } = AntApp.useApp();
  const { token } = useToken();
  const screens = useBreakpoint();

  const isMobile = !screens.md;

  const fetchPilots = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/pilots");
      setPilots(response.data);
    } catch (error) {
      console.error("Failed to fetch pilots:", error);
      if (error.response?.status !== 401) {
        message.error(
          error.response?.data?.error || "Failed to load pilot projects."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchPilots();
  }, [fetchPilots]);

  const handleDelete = async (pilotId) => {
    try {
      await api.delete(`/admin/pilots/${pilotId}`);
      message.success("Pilot project deleted successfully.");
      fetchPilots();
    } catch (error) {
      console.error("Failed to delete pilot:", error);
      if (error.response?.status !== 401) {
        message.error(
          error.response?.data?.error || "Failed to delete pilot project."
        );
      }
    }
  };

  const openModal = (pilot = null) => {
    setEditingPilot(pilot);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPilot(null);
    fetchPilots();
  };

  const getStatusColor = (isActive) => {
    return isActive ? token.colorSuccess : token.colorError;
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => (
        <Text
          style={{
            color: token.colorText,
            fontWeight: 500,
            fontSize: token.fontSize,
          }}
        >
          {text}
        </Text>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      render: (key) => (
        <Tag
          style={{
            background: token.colorPrimaryBg,
            border: `1px solid ${token.colorPrimaryBorder}`,
            color: token.colorPrimaryText,
            borderRadius: token.borderRadiusSM,
            fontWeight: 500,
          }}
        >
          {key}
        </Tag>
      ),
    },
    {
      title: "Short Description",
      dataIndex: "shortDescription",
      key: "shortDescription",
      render: (text) => (
        <Text
          style={{
            color: token.colorTextSecondary,
            fontSize: token.fontSize,
          }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Space>
          <Switch checked={isActive} disabled />
          <Tag
            color={getStatusColor(isActive)}
            style={{
              borderRadius: token.borderRadiusSM,
              border: "none",
              color: token.colorTextLightSolid,
              fontWeight: 500,
            }}
          >
            {isActive ? "Active" : "Inactive"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            size="small"
            style={{
              background: token.colorPrimaryBg,
              border: `1px solid ${token.colorPrimaryBorder}`,
              color: token.colorPrimaryText,
              borderRadius: token.borderRadius,
              fontWeight: 500,
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this pilot project?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes, Delete"
            cancelText="No"
            okButtonProps={{
              danger: true,
              style: {
                background: token.colorError,
                borderColor: token.colorError,
                fontWeight: 500,
              },
            }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              style={{
                fontWeight: 500,
              }}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Calculate stats
  const activePilots = pilots.filter((pilot) => pilot.isActive).length;
  const totalPilots = pilots.length;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Enhanced Background Elements */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
          opacity: 0.4,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${token.colorPrimary}10 0%, transparent 70%)`,
            filter: "blur(40px)",
            top: "10%",
            left: "5%",
            animation: "float1 20s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${token.colorInfo}08 0%, transparent 70%)`,
            filter: "blur(40px)",
            bottom: "15%",
            right: "10%",
            animation: "float2 18s ease-in-out infinite",
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: isMobile ? token.padding : token.paddingLG,
        }}
      >
        {/* Header Section */}
        <div style={{ marginBottom: token.marginLG }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: token.margin,
              marginBottom: token.margin,
            }}
          >
            <div>
              <Title
                level={4}
                style={{
                  color: token.colorTextHeading,
                  marginBottom: token.marginXS,
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                Pilot Project Management
              </Title>
              <Paragraph
                style={{
                  color: token.colorTextSecondary,
                  fontSize: token.fontSizeLG,
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                Manage and monitor all pilot projects
              </Paragraph>
            </div>
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchPilots}
                loading={loading}
                style={{
                  background: token.colorPrimaryBg,
                  border: `1px solid ${token.colorPrimaryBorder}`,
                  color: token.colorPrimaryText,
                  borderRadius: token.borderRadius,
                  fontWeight: 500,
                }}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openModal()}
                style={{
                  background: token.colorPrimary,
                  borderColor: token.colorPrimary,
                  borderRadius: token.borderRadius,
                  fontWeight: 600,
                }}
              >
                Add New Pilot
              </Button>
            </Space>
          </div>

          {/* Stats Summary */}
          <Space
            size="large"
            wrap
            style={{
              background: token.colorBgContainer,
              padding: token.padding,
              borderRadius: token.borderRadiusLG,
              border: `1px solid ${token.colorBorder}`,
              boxShadow: token.boxShadowSecondary,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <RocketOutlined
                style={{
                  color: token.colorPrimary,
                  fontSize: "20px",
                  marginBottom: token.marginXS,
                  display: "block",
                }}
              />
              <Text
                style={{
                  color: token.colorTextTertiary,
                  fontSize: token.fontSizeSM,
                  display: "block",
                }}
              >
                Total Projects
              </Text>
              <Text
                style={{
                  color: token.colorPrimary,
                  fontSize: "24px",
                  fontWeight: 700,
                  display: "block",
                }}
              >
                {totalPilots}
              </Text>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  background: token.colorSuccess,
                  borderRadius: "50%",
                  margin: `0 auto ${token.marginXS}px`,
                }}
              />
              <Text
                style={{
                  color: token.colorTextTertiary,
                  fontSize: token.fontSizeSM,
                  display: "block",
                }}
              >
                Active
              </Text>
              <Text
                style={{
                  color: token.colorSuccess,
                  fontSize: "24px",
                  fontWeight: 700,
                  display: "block",
                }}
              >
                {activePilots}
              </Text>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  background: token.colorError,
                  borderRadius: "50%",
                  margin: `0 auto ${token.marginXS}px`,
                }}
              />
              <Text
                style={{
                  color: token.colorTextTertiary,
                  fontSize: token.fontSizeSM,
                  display: "block",
                }}
              >
                Inactive
              </Text>
              <Text
                style={{
                  color: token.colorError,
                  fontSize: "24px",
                  fontWeight: 700,
                  display: "block",
                }}
              >
                {totalPilots - activePilots}
              </Text>
            </div>
          </Space>
        </div>

        {/* Projects Table */}
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
            size= "small"
            columns={columns}
            dataSource={pilots}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} pilot projects`,
            }}
            scroll={isMobile ? { x: 800 } : {}}
          />
        </Card>
      </div>

      {/* Render Modal */}
      <AddEditPilotModal
        pilot={editingPilot}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingPilot(null);
        }}
        onSuccess={closeModal}
      />

      {/* Enhanced Custom Styles */}
      <style>
        {`
          @keyframes float1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(20px, -20px) scale(1.05); }
            66% { transform: translate(-15px, 15px) scale(0.95); }
          }

          @keyframes float2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-20px, 15px) scale(1.03); }
            66% { transform: translate(25px, -10px) scale(0.97); }
          }

          /* Enhanced Table Styling */
          .ant-table-thead > tr > th {
            background: ${token.colorFillTertiary} !important;
            color: ${token.colorText} !important;
            border-bottom: 2px solid ${token.colorBorder} !important;
            font-weight: 600 !important;
            font-size: ${token.fontSizeSM}px !important;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .ant-table-tbody > tr {
            background: ${token.colorBgContainer} !important;
            transition: all ${token.motionDurationFast} ${token.motionEaseOut} !important;
          }

          .ant-table-tbody > tr:hover > td {
            background: ${token.colorPrimaryBg} !important;
          }

          .ant-table-tbody > tr > td {
            border-bottom: 1px solid ${token.colorBorder} !important;
            color: ${token.colorText} !important;
          }

          /* Enhanced Pagination */
          .ant-pagination-item-active {
            background: ${token.colorPrimary} !important;
            border-color: ${token.colorPrimary} !important;
          }

          .ant-pagination-item-active a {
            color: ${token.colorTextLightSolid} !important;
            font-weight: 600;
          }

          /* Popconfirm Styling */
          .ant-popconfirm .ant-popconfirm-message {
            color: ${token.colorText} !important;
          }

          .ant-popconfirm .ant-popconfirm-description {
            color: ${token.colorTextSecondary} !important;
          }

          /* Switch Styling */
          .ant-switch-checked {
            background: ${token.colorSuccess} !important;
          }

          @media (max-width: 768px) {
            .ant-table-thead > tr > th,
            .ant-table-tbody > tr > td {
              padding: 8px 12px !important;
              font-size: 13px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PilotProjectsPage;
