import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Table,
  Typography,
  Divider,
  Space,
  theme,
  Card,
  Popconfirm,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SendOutlined,
  DollarCircleOutlined,
  UserOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import api from "../api";

const { Title, Text } = Typography;
const { useToken } = theme;

const InvoiceGeneratorModal = ({
  referenceId,
  referenceType,
  onClose,
  initialClient = { name: "", email: "" },
  invoice = null, // Prop for editing existing invoice
}) => {
  const { token } = useToken();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Line items state
  const [items, setItems] = useState([
    { key: Date.now(), description: "", quantity: 1, unitPrice: 0 },
  ]);

  // Sync initial client data or existing invoice data
  useEffect(() => {
    if (invoice) {
      // Edit Mode
      form.setFieldsValue({
        invoiceType: invoice.type,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        clientAddress: invoice.clientAddress,
        notes: invoice.notes,
      });

      if (invoice.items && invoice.items.length > 0) {
        setItems(
          invoice.items.map((item) => ({
            key: item.id || Date.now() + Math.random(),
            description: item.description,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
          }))
        );
      }
    } else {
      // Create Mode (Pre-fill client if provided)
      form.setFieldsValue({
        clientName: initialClient.name,
        clientEmail: initialClient.email,
        invoiceType: "QUOTATION",
      });
    }
  }, [initialClient, invoice, form]);

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const handleItemChange = (key, field, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => {
    setItems([
      ...items,
      { key: Date.now(), description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeItem = (key) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.key !== key));
    }
  };

  const preparePayload = (values) => {
    return {
      client: {
        name: values.clientName,
        email: values.clientEmail,
        address: values.clientAddress,
      },
      items: items.map(({ description, quantity, unitPrice }) => ({
        description,
        quantity: parseFloat(quantity),
        unitPrice: parseFloat(unitPrice),
      })),
      type: values.invoiceType,
      referenceId: invoice ? invoice.referenceId : referenceId,
      referenceType: invoice ? invoice.referenceType : referenceType,
      notes: values.notes,
    };
  };

  // Action: Generate & Email (Create Mode Only)
  const onGenerateAndSend = async () => {
    setIsSubmitting(true);
    try {
      const values = await form.validateFields();
      const payload = preparePayload(values);
      
      const response = await api.post("/invoicing/generate", payload);
      // Adapted for different API response structures (axios vs fetch wrapper)
      const success = response.data?.message || response.success; 
      
      if (success) {
        message.success(`Successfully sent to ${values.clientEmail}`);
        onClose();
      } else {
        message.error("Failed to generate invoice.");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      message.error(error.response?.data?.details || "Failed to generate invoice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Save Draft (Create View) OR Update (Edit View)
  const onSave = async () => {
    setIsSubmitting(true);
    try {
      const values = await form.validateFields();
      const payload = preparePayload(values);
      payload.status = "DRAFT"; // Force draft status on save

      let response;
      if (invoice) {
        // Update existing
        response = await api.put(`/invoicing/${invoice.id}`, payload);
        message.success("Invoice updated successfully.");
      } else {
        // Create new draft
        response = await api.post("/invoicing", payload);
        message.success("Draft saved successfully.");
      }
      onClose();
    } catch (error) {
        console.error("Save Error:", error);
        message.error("Failed to save invoice.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Description",
      dataIndex: "description",
      render: (_, record) => (
        <Input
          placeholder="Service or Item name"
          value={record.description}
          onChange={(e) =>
            handleItemChange(record.key, "description", e.target.value)
          }
        />
      ),
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      width: 100,
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(val) => handleItemChange(record.key, "quantity", val)}
        />
      ),
    },
    {
      title: "Unit Price (USD)",
      dataIndex: "unitPrice",
      width: 150,
      render: (_, record) => (
        <InputNumber
          min={0}
          precision={2}
          prefix="$"
          style={{ width: "100%" }}
          value={record.unitPrice}
          onChange={(val) => handleItemChange(record.key, "unitPrice", val)}
        />
      ),
    },
    {
      title: "Total",
      width: 120,
      render: (_, record) => (
        <Text strong>${(record.quantity * record.unitPrice).toFixed(2)}</Text>
      ),
    },
    {
      title: "",
      width: 50,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.key)}
          disabled={items.length === 1}
        />
      ),
    },
  ];

  return (
    <Modal
      open={true}
      onCancel={onClose}
      width={900}
      title={
        <Space>
          <DollarCircleOutlined style={{ color: token.colorInfo }} />
          <Title level={4} style={{ margin: 0 }}>
            {invoice ? "Edit Document" : "Financial Document Generator"}
          </Title>
        </Space>
      }
      footer={null}
      styles={{
        mask: { backdropFilter: "blur(4px)" },
        content: { borderRadius: token.borderRadiusLG },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ invoiceType: "QUOTATION" }}
      >
        <Card
          size="small"
          style={{ background: token.colorFillTertiary, marginBottom: 24 }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            <Form.Item
              name="invoiceType"
              label="Document Type"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: "QUOTATION", label: "Quotation (QTE)" },
                  { value: "INVOICE", label: "Invoice (INV)" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="clientName"
              label="Client Name"
              rules={[{ required: true }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Full Name" />
            </Form.Item>

            <Form.Item
              name="clientEmail"
              label="Client Email"
              rules={[{ required: true, type: "email" }]}
            >
              <Input placeholder="email@address.com" />
            </Form.Item>
          </div>
          <Form.Item name="clientAddress" label="Billing Address">
            <Input.TextArea
              rows={1}
              placeholder="Physical address (optional)"
            />
          </Form.Item>
        </Card>

        <Title level={5}>Line Items</Title>
        <Table
          dataSource={items}
          columns={columns}
          pagination={false}
          size="small"
          rowKey="key"
          footer={() => (
            <Button
              type="dashed"
              onClick={addItem}
              block
              icon={<PlusOutlined />}
            >
              Add Line Item
            </Button>
          )}
          style={{ marginBottom: 24 }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Form.Item
            name="notes"
            label="Terms & Notes"
            style={{ flex: 1, marginRight: 40 }}
          >
            <Input.TextArea
              rows={3}
              placeholder="Payment terms, valid for 30 days, etc."
            />
          </Form.Item>

          <div style={{ textAlign: "right", minWidth: 200 }}>
            <Text type="secondary">Grand Total</Text>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: token.colorPrimary,
              }}
            >
              USD{" "}
              {calculateTotal().toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        <Divider />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          
          <Button 
            onClick={onSave} 
            loading={isSubmitting}
            icon={<SaveOutlined />}
          >
            {invoice ? "Update" : "Save Draft"}
          </Button>

          {!invoice && (
            <Popconfirm
                title="Confirm Action"
                description="This will generate a PDF and email the client. Continue?"
                onConfirm={onGenerateAndSend}
                okText="Yes, Send"
                cancelText="No"
            >
                <Button
                type="primary"
                icon={<SendOutlined />}
                loading={isSubmitting}
                size="large"
                style={{ paddingLeft: 40, paddingRight: 40 }}
                >
                Generate & Email
                </Button>
            </Popconfirm>
          )}
        </div>
      </Form>

      <style>{`
        .ant-table-thead > tr > th {
          background: ${token.colorFillTertiary} !important;
          font-size: 11px !important;
          text-transform: uppercase;
        }
      `}</style>
    </Modal>
  );
};

export default InvoiceGeneratorModal;

