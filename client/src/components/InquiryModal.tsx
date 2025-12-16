// src/components/InquiryModal.jsx
import React from "react";
import { Modal, Form, Input, Button, Typography, App as AntApp } from "antd";
import { qsiTheme } from "./theme/theme"; // Adjust path

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const InquiryModal = ({ open, onCancel, onFinish, packageName }) => {
  const [form] = Form.useForm();
  const { token } = qsiTheme; // Use our theme

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onFinish(values); // values will be { description: "..." }
      form.resetFields();
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0, color: token.colorText }}>
          Healing Inquiry: {packageName || "General"}
        </Title>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Submit Inquiry
        </Button>,
      ]}
      styles={{ body: { backgroundColor: token.colorBgElevated } }}
    >
      <Paragraph style={{ color: token.colorTextSecondary }}>
        Please describe your current situation or the challenge you're facing.
        This will help our team prepare a personalized quote for you.
      </Paragraph>
      <Form form={form} layout="vertical">
        <Form.Item
          name="description"
          label="Your Situation"
          rules={[{ required: true, message: "Please describe your issue." }]}
        >
          <TextArea
            rows={6}
            placeholder="e.g., I'm feeling overwhelmed with work stress..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InquiryModal;
