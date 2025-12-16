// client/src/pages/InvoicesPage.jsx
import React, { useState, useEffect  } from 'react';
import {
  Table,
  Tag,
  Button,
  Typography,
  Card,
  Space,
  Spin,
  Empty,
  App as AntApp,
  theme,
  Grid
} from "antd";
import {
  DownloadOutlined,
  FilePdfOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined
} from "@ant-design/icons";
import api from "../api";

const { Title, Text } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { message } = AntApp.useApp();
  const { token } = useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  
  // Use environment variable or fallback
  const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get("/invoicing/my-invoices");
        setInvoices(response.data);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        message.error("Failed to load your invoices.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [message]);

  const handleDownload = async (invoiceId, invoiceNumber) => {
      try {
        // Construct direct download URL with auth token handling if needed 
        // (Ideally, we use window.open if cookie-based, or fetch blob if header-based)
        // For simplicity with header-based auth (Bearer), we often use a blob fetch:
        
        const response = await api.get(`/invoicing/invoices/${invoiceId}/download`, {
            responseType: 'blob',
        });
        
        // Create a blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Invoice-${invoiceNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
          console.error("Download failed", error);
          message.error("Could not download PDF.");
      }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "PAID":
        return <Tag icon={<CheckCircleOutlined />} color="success">Paid</Tag>;
      case "PENDING":
      case "QUOTATION":
        return <Tag icon={<ClockCircleOutlined />} color="warning">Pending Payment</Tag>;
      case "CANCELLED":
        return <Tag color="default">Cancelled</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Ref #",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Date",
      dataIndex: "issueDate",
      key: "issueDate",
      render: (text) => new Date(text).toLocaleDateString(),
      responsive: ["sm"],
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => <Text strong>${amount.toFixed(2)}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button 
            icon={<DownloadOutlined />} 
            size="small"
            onClick={() => handleDownload(record.id, record.invoiceNumber)}
          >
            PDF
          </Button>
          {/* Placeholder for Payment Integration */}
          {(record.status === 'PENDING' || record.status === 'QUOTATION') && (
             <Button 
                type="primary" 
                size="small" 
                icon={<DollarOutlined />}
                onClick={() => message.info("Online payment integration coming soon. Please pay via bank transfer as per invoice details.")}
             >
               Pay
             </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: isMobile ? token.padding : token.paddingLG 
    }}>
      <Card
        title={
          <Space>
            <FilePdfOutlined style={{ color: token.colorPrimary }} />
            <Title level={4} style={{ margin: 0 }}>My Quotations & Invoices</Title>
          </Space>
        }
        style={{ borderRadius: token.borderRadiusLG, boxShadow: token.boxShadowSecondary }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : invoices.length === 0 ? (
          <Empty description="No invoices or quotations found." />
        ) : (
          <Table
            dataSource={invoices}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            scroll={{ x: 600 }}
          />
        )}
      </Card>
    </div>
  );
};

export default InvoicesPage;