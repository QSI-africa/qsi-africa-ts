// admin-client/src/components/GenerateInvoiceModal.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  App as AntApp,
  Divider,
  Select,
  InputNumber,
  Row,
  Col,
  Space,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import api from "../api";

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Modal to generate a Quote/Invoice linked to a submission.
 * @param {object} props.submission - The submission object (Infrastructure or Healing)
 * @param {string} props.submissionType - 'infrastructure' or 'healing'
 * @param {boolean} props.open
 * @param {function} props.onCancel
 * @param {function} props.onSuccess - Called after successful invoice creation
 */
const GenerateInvoiceModal = ({
  submission,
  submissionType,
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = AntApp.useApp();
  const [totalAmount, setTotalAmount] = useState(0);

  // Initial item structure for the form
  const initialItems =
    submissionType === "healing" && submission?.packageTitle
      ? [{ title: submission.packageTitle, price: 0, key: 0 }]
      : [{ title: "", price: 0, key: 0 }];

  useEffect(() => {
    if (open && submission) {
      // Pre-fill client data
      const contactEmail =
        submission.contactInfo.match(/<([^>]+)>/)?.[1] ||
        submission.contactInfo;
      const clientName =
        submission.contactInfo.split("<")[0]?.trim() || "Client";

      form.setFieldsValue({
        sentToEmail: contactEmail,
        clientName: clientName,
        items: initialItems,
      });
      calculateTotal(initialItems);
    } else {
      form.resetFields();
      setTotalAmount(0);
    }
  }, [open, submission, submissionType, form]);

  // Function to calculate the running total
  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
    setTotalAmount(total);
  };

  const handleValuesChange = (_, allValues) => {
    if (allValues.items) {
      calculateTotal(allValues.items);
    }
  };

  const handleFinish = async (values) => {
    setLoading(true);
    const submissionIdKey =
      submissionType === "infrastructure"
        ? "infrastructureSubmissionId"
        : "healingSubmissionId";

    // Final payload for the server
    const payload = {
      submissionId: submission.id,
      submissionType: submissionType,
      sentToEmail: values.sentToEmail,
      clientName: values.clientName,
      clientId: submission.userId || null, // Use linked user ID if available
      items: values.items.map((item) => ({
        title: item.title,
        description: item.description,
        price: item.price,
        isHealingPackage: submissionType === "healing", // Mark healing packages
      })),
    };

    try {
      const response = await api.post("/invoicing/generate", payload);

      message.success(
        response.data.message || "Quotation generated and sent successfully!"
      );
      onSuccess();
    } catch (error) {
      console.error("Invoice generation failed:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to generate quotation.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <DollarOutlined /> Generate Quotation
        </Title>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={form.submit}
          loading={loading}
          icon={<FileTextOutlined />}
        >
          Generate & Send Quote
        </Button>,
      ]}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
        initialValues={{ items: initialItems }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="clientName"
              label={<Text strong>Client Name</Text>}
              rules={[{ required: true, message: "Client name is required." }]}
            >
              <Input placeholder="Client's Full Name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="sentToEmail"
              label={<Text strong>Recipient Email</Text>}
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Valid email is required.",
                },
              ]}
            >
              <Input placeholder="client@example.com" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain>
          Line Items
        </Divider>

        <Form.List name="items">
          {(fields, { add, remove }) => (
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              {fields.map(({ key, name, fieldKey, ...restField }) => (
                <Card
                  size="small"
                  key={key}
                  style={{
                    width: "100%",
                    background: "#f9f9f9",
                    border: "1px solid #eee",
                  }}
                >
                  <Row gutter={8} align="bottom">
                    <Col flex="auto">
                      <Form.Item
                        {...restField}
                        name={[name, "title"]}
                        fieldKey={[fieldKey, "title"]}
                        label={<Text strong>Item Title</Text>}
                        rules={[{ required: true, message: "Missing title" }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="Service or Product Name" />
                      </Form.Item>
                    </Col>
                    <Col style={{ width: 120 }}>
                      <Form.Item
                        {...restField}
                        name={[name, "price"]}
                        fieldKey={[fieldKey, "price"]}
                        label={<Text strong>Price (USD)</Text>}
                        rules={[{ required: true, message: "Missing price" }]}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber
                          min={0}
                          formatter={(value) =>
                            `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                          style={{ width: "100%" }}
                          placeholder="0.00"
                        />
                      </Form.Item>
                    </Col>
                    <Col flex="40px">
                      {fields.length > 1 ? (
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      ) : null}
                    </Col>
                  </Row>
                </Card>
              ))}
              <Form.Item style={{ marginBottom: 0, marginTop: 10 }}>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Line Item
                </Button>
              </Form.Item>
            </Space>
          )}
        </Form.List>

        <Divider />

        <Title level={4} style={{ textAlign: "right", margin: 0 }}>
          Total:{" "}
          <Text code style={{ fontSize: "1.2em" }}>
            ${totalAmount.toFixed(2)}
          </Text>
        </Title>
      </Form>
    </Modal>
  );
};

export default GenerateInvoiceModal;
