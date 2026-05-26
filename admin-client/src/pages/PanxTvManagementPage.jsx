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
  Popconfirm
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  VideoCameraOutlined,
  EyeOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import api from "../api";

const { Title, Text, Paragraph } = Typography;

const PanxTvManagementPage = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedChannelContents, setSelectedChannelContents] = useState([]);
  const [loadingContents, setLoadingContents] = useState(false);
  const [isContentsModalOpen, setIsContentsModalOpen] = useState(false);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/tv/channels");
      setChannels(res.data);
    } catch (err) {
      console.error("Failed to fetch channels:", err);
      message.error("Failed to load TV channels.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (channelId, status) => {
    try {
      await api.put(`/admin/tv/channels/${channelId}/status`, { status });
      message.success(`Channel successfully ${status.toLowerCase()}.`);
      fetchChannels();
    } catch (err) {
      console.error("Failed to update status:", err);
      message.error("Failed to update channel status.");
    }
  };

  const handleDeleteChannel = async (channelId) => {
    try {
      await api.delete(`/admin/tv/channels/${channelId}`);
      message.success("Channel deleted successfully.");
      fetchChannels();
    } catch (err) {
      console.error("Failed to delete channel:", err);
      message.error("Failed to delete channel.");
    }
  };

  const handleViewContents = async (channel) => {
    setSelectedChannel(channel);
    setIsContentsModalOpen(true);
    setLoadingContents(true);
    try {
      const res = await api.get(`/admin/tv/channels/${channel.id}/content`);
      setSelectedChannelContents(res.data);
    } catch (err) {
      console.error("Failed to load channel contents:", err);
      message.error("Failed to load channel contents.");
    } finally {
      setLoadingContents(false);
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!selectedChannel) return;
    try {
      await api.delete(`/admin/tv/channels/${selectedChannel.id}/content/${contentId}`);
      message.success("Content deleted successfully.");
      // Refresh content list
      const res = await api.get(`/admin/tv/channels/${selectedChannel.id}/content`);
      setSelectedChannelContents(res.data);
    } catch (err) {
      console.error("Failed to delete content:", err);
      message.error("Failed to delete content.");
    }
  };

  // KPIs
  const totalChannels = channels.length;
  const pendingChannels = channels.filter(c => c.status === "PENDING").length;
  const approvedChannels = channels.filter(c => c.status === "APPROVED").length;

  const approvalColumns = [
    {
      title: "Requested Channel",
      key: "channel",
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: "15px" }}>{record.title}</Text>
          <div style={{ marginTop: "4px" }}>
            <Text type="secondary" style={{ fontSize: "12px" }}>{record.description}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Broadcaster",
      key: "broadcaster",
      render: (_, record) => (
        <div>
          <Space>
            <UserOutlined />
            <Text>{record.user?.name || "Agent"}</Text>
          </Space>
          <div style={{ fontSize: "11px", color: "#8c8c8c" }}>{record.user?.email}</div>
        </div>
      ),
    },
    {
      title: "Requested Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{new Date(date).toLocaleDateString()}</Text>
        </Space>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleUpdateStatus(record.id, "APPROVED")}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            Approve
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => handleUpdateStatus(record.id, "REJECTED")}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  const registryColumns = [
    {
      title: "Channel Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => <Text strong>{text}</Text>
    },
    {
      title: "Owner",
      key: "owner",
      render: (_, record) => record.user?.name || "Unknown"
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "orange";
        if (status === "APPROVED") color = "green";
        if (status === "REJECTED") color = "red";
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: "Subscribers",
      key: "subs",
      render: (_, record) => record.subscriptionsCount || 0
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={() => handleViewContents(record)}
            disabled={record.status !== "APPROVED"}
          >
            Manage Content
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this channel?"
            description="This will delete the channel and all its subscriptions/contents permanently."
            onConfirm={() => handleDeleteChannel(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
        <Col span={24}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <VideoCameraOutlined style={{ fontSize: "28px", color: "#1890ff" }} />
            <Title level={2} style={{ margin: 0, uppercase: true }}>PANX TV Governance</Title>
          </div>
          <Paragraph type="secondary" style={{ marginTop: "8px" }}>
            Moderate creator requests, approve/reject broadcast status, and manage published frequency content.
          </Paragraph>
        </Col>
      </Row>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "32px" }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="kpi-card shadow-sm">
            <Statistic title="Total Requested Channels" value={totalChannels} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="kpi-card shadow-sm">
            <Statistic
              title="Pending Approval"
              value={pendingChannels}
              valueStyle={{ color: pendingChannels > 0 ? "#faad14" : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="kpi-card shadow-sm">
            <Statistic
              title="Approved Creators"
              value={approvedChannels}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabbed view */}
      <Card bordered={false}>
        <Tabs
          defaultActiveKey="approvals"
          items={[
            {
              key: "approvals",
              label: `Pending Approvals (${pendingChannels})`,
              children: (
                <Table
                  dataSource={channels.filter(c => c.status === "PENDING")}
                  columns={approvalColumns}
                  rowKey="id"
                  loading={loading}
                  locale={{ emptyText: <Empty description="No pending channels in approval queue." /> }}
                />
              )
            },
            {
              key: "registry",
              label: "Channel Registry",
              children: (
                <Table
                  dataSource={channels}
                  columns={registryColumns}
                  rowKey="id"
                  loading={loading}
                />
              )
            }
          ]}
        />
      </Card>

      {/* Contents Moderation Modal */}
      <Modal
        title={selectedChannel ? `Content Archives: ${selectedChannel.title}` : "Manage Content"}
        open={isContentsModalOpen}
        onCancel={() => setIsContentsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsContentsModalOpen(false)}>
            Close
          </Button>
        ]}
        width={720}
        destroyOnClose
      >
        <div style={{ marginTop: "16px" }}>
          {loadingContents ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
              <Spin />
            </div>
          ) : selectedChannelContents.length === 0 ? (
            <Empty description="No content published in this channel." />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={selectedChannelContents}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Popconfirm
                      title="Delete this item?"
                      onConfirm={() => handleDeleteContent(item.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="text" danger icon={<DeleteOutlined />}>
                        Delete Post
                      </Button>
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<FileTextOutlined style={{ fontSize: "24px", color: "#1890ff", marginTop: "4px" }} />}
                    title={<Text strong>{item.title}</Text>}
                    description={
                      <div>
                        <div><Text type="secondary">{item.description || "No description provided."}</Text></div>
                        <div style={{ marginTop: "4px", fontSize: "11px", color: "#8c8c8c" }}>
                          Type: <Tag size="small">{item.mimeType}</Tag> | Created: {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PanxTvManagementPage;
