// admin-client/src/pages/PilotEnquiriesPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Typography,
  App as AntApp,
  Button,
  Modal,
  Card,
  Divider,
  theme,
  Space,
  Tag,
  Grid,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  RocketOutlined,
  MailOutlined,
} from "@ant-design/icons";
import api from "../api";
import { useNavigate } from "react-router-dom";
import InvoiceGeneratorModal from "../components/InvoiceGeneratorModal";

const { Title, Paragraph, Text } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

const PilotEnquiriesPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  // Invoicing State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [enquiryToInvoice, setEnquiryToInvoice] = useState(null);

  const { message } = AntApp.useApp();
  const { token } = useToken();
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const isMobile = !screens.md;

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/pilot-engagements");
      setEnquiries(response.data);
    } catch (error) {
      console.error("Failed to fetch enquiries:", error);
      message.error("Failed to load pilot enquiries.");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const showDetails = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsModalVisible(true);
  };

  const handleOpenInvoiceModal = () => {
    setEnquiryToInvoice(selectedEnquiry);
    setIsModalVisible(false);
    setIsInvoiceModalOpen(true);
  };

  const getTypeTagColor = (type) => {
    const colors = {
      partner: "blue",
      investor: "purple",
      client: "green",
      other: "default",
    };
    return colors[type?.toLowerCase()] || "default";
  };

  const columns = [
    {
      title: "Pilot Project",
      dataIndex: "pilotTitle",
      key: "pilotTitle",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.pilotKey}
          </Text>
        </Space>
      ),
    },
    {
      title: "Contact",
      dataIndex: "contactName",
      key: "contactName",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text>{text}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.contactEmail}
          </Text>
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "engagementType",
      key: "engagementType",
      render: (type) => (
        <Tag
          color={getTypeTagColor(type)}
          style={{ textTransform: "capitalize" }}
        >
          {type}
        </Tag>
      ),
    },
    {
      title: "Submitted",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (
        <Text type="secondary">{new Date(text).toLocaleDateString()}</Text>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => showDetails(record)}
          type="primary"
          ghost
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Background Elements */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.4,
        }}
      >
        <div
          className="bg-blob-1"
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${token.colorPrimary}10 0%, transparent 70%)`,
            filter: "blur(40px)",
            top: "10%",
            left: "5%",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: isMobile ? token.padding : token.paddingLG,
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: token.marginLG,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title level={4} style={{ margin: 0 }}>
              <RocketOutlined /> Pilot Enquiries
            </Title>
            <Paragraph type="secondary">
              Manage shows of interest and potential partnerships
            </Paragraph>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchEnquiries}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Table */}
        <Card
          bodyStyle={{ padding: 12 }}
          style={{
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadowSecondary,
          }}
        >
          <Table
            columns={columns}
            dataSource={enquiries}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>

      {/* Details Modal */}
      <Modal
        title="Pilot Enquiry Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button
            key="invoice"
            icon={<DollarCircleOutlined />}
            onClick={handleOpenInvoiceModal}
            type="primary"
          >
            Generate Quote
          </Button>,
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedEnquiry && (
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Card size="small" className="info-card">
              <Space direction="vertical">
                <Text type="secondary">
                  <UserOutlined /> Contact Person
                </Text>
                <Text strong>{selectedEnquiry.contactName}</Text>
                <Text>
                  <MailOutlined /> {selectedEnquiry.contactEmail}
                </Text>
                {selectedEnquiry.contactPhone && (
                  <Text>📞 {selectedEnquiry.contactPhone}</Text>
                )}
              </Space>
            </Card>

            <div>
              <Title level={5}>Message / Interest Detail</Title>
              <Card style={{ background: token.colorFillTertiary }}>
                <Paragraph>{selectedEnquiry.message}</Paragraph>
              </Card>
            </div>

            <Divider />
            <Space>
              <Tag color="blue">{selectedEnquiry.pilotTitle}</Tag>
              <Tag color="gold">
                {selectedEnquiry.engagementType?.toUpperCase()}
              </Tag>
              <Text type="secondary">
                Submitted on{" "}
                {new Date(selectedEnquiry.createdAt).toLocaleString()}
              </Text>
            </Space>
          </Space>
        )}
      </Modal>

      {/* Invoicing Modal */}
      {enquiryToInvoice && isInvoiceModalOpen && (
        <InvoiceGeneratorModal
          referenceId={enquiryToInvoice.id}
          referenceType="PILOT"
          onClose={() => setIsInvoiceModalOpen(false)}
          initialClient={{
            name: enquiryToInvoice.contactName,
            email: enquiryToInvoice.contactEmail,
          }}
        />
      )}

      <style>{`
        .info-card { background: ${token.colorFillTertiary}; border: 1px solid ${token.colorBorder}; }
        .ant-table-thead > tr > th { 
          background: ${token.colorFillTertiary} !important; 
          text-transform: uppercase; 
          font-size: 11px; 
          letter-spacing: 1px; 
        }
      `}</style>
    </div>
  );
};

export default PilotEnquiriesPage;
