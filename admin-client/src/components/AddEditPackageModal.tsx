// admin-client/src/components/AddEditPackageModal.jsx
import React, { useState, useEffect  } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  App as AntApp,
  Switch,
  InputNumber,
} from "antd";
import api from "../api";

const { TextArea } = Input;

const AddEditPackageModal = ({ pkg, open, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const { message } = AntApp.useApp();
  const isEditing = !!pkg;

  // Set form fields when the modal opens or the 'pkg' prop changes
  useEffect(() => {
    if (open) {
      if (isEditing) {
        form.setFieldsValue(pkg);
      } else {
        form.resetFields();
        form.setFieldsValue({ isActive: true });
      }
    }
  }, [open, pkg, form, isEditing]);

  const handleFinish = async (values) => {
    setLoading(true);
    const payload = {
      ...values,
      isActive: values.isActive === undefined ? true : values.isActive, // Ensure boolean
    };

    try {
      if (isEditing) {
        await api.put(`/admin/healing-packages/${pkg.id}`, payload);
        message.success("Package updated successfully!");
      } else {
        await api.post("/admin/healing-packages", payload);
        message.success("Package added successfully!");
      }
      onSuccess(); // Close modal and refresh table
    } catch (error) {
      console.error("Failed to save package:", error);
      message.error(error.response?.data?.error || "Failed to save package.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        isEditing ? `Edit Package: ${pkg?.title}` : "Add New Healing Package"
      }
      open={open}
      onCancel={onCancel}
      footer={null} // Footer is inside the form
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ marginTop: 24 }}
        initialValues={{ isActive: true }}
      >
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input placeholder="e.g., Relationship Realignment" />
        </Form.Item>
        <Form.Item
          name="shortPreview"
          label="Short Preview"
          rules={[{ required: true }]}
        >
          <TextArea
            rows={2}
            placeholder="e.g., Heal love, rebuild trust, restore resonance."
          />
        </Form.Item>
        <Form.Item name="fee" label="Fee" rules={[{ required: true }]}>
          <Input placeholder="e.g., $80" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item
          name="duration"
          label="Duration"
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g., 60 min" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item
          name="cta"
          label="Call to Action (CTA) Text"
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g., Start Healing Relationship" />
        </Form.Item>
        <Form.Item name="isActive" label="Active" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
          <Button
            onClick={onCancel}
            style={{ marginRight: 8 }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditing ? "Update Package" : "Add Package"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditPackageModal;
