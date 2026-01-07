import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Typography,
  Tag,
  Space,
  App as AntApp,
  Card,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import api from "../api";
import InvoiceGeneratorModal from "../components/InvoiceGeneratorModal";

const { Title } = Typography;

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { message, modal } = AntApp.useApp();

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await api.get("/invoicing");
      setInvoices(response.data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      message.error("Failed to fetch invoices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCreate = () => {
    setSelectedInvoice(null);
    setIsModalVisible(true);
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    modal.confirm({
      title: "Delete Invoice?",
      content: "This action cannot be undone.",
      onOk: async () => {
        try {
          await api.delete(`/invoicing/${id}`);
          message.success("Invoice deleted.");
          fetchInvoices();
        } catch (error) {
          message.error("Failed to delete invoice.");
        }
      },
    });
  };

  const handleDownload = async (id, number) => {
    try {
      const response = await api.get(`/invoicing/download/${id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error("Failed to download PDF.");
    }
  };

  const columns = [
    {
      title: "Number",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "INVOICE" ? "blue" : "orange"}>{type}</Tag>
      ),
    },
    {
      title: "Client",
      dataIndex: "clientName",
      key: "clientName",
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount, record) => (
        <span>{record.currency} {parseFloat(amount).toFixed(2)}</span>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "PAID") color = "success";
        if (status === "SENT") color = "processing";
        if (status === "DRAFT") color = "default";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
           <Tooltip title="Edit">
            <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Download PDF">
            <Button
              icon={<DownloadOutlined />}
              size="small"
              onClick={() => handleDownload(record.id, record.invoiceNumber)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={2}>Invoices & Quotations</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchInvoices}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Create New
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {isModalVisible && (
        <InvoiceGeneratorModal
          invoice={selectedInvoice}
          onClose={() => {
            setIsModalVisible(false);
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
};

export default InvoicesPage;
