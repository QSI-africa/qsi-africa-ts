// admin-client/src/components/AddEditSuggestionModal.jsx
import React, { useState, useEffect  } from 'react';
import { Modal, Form, Input, Button, App as AntApp, Switch } from "antd";
import api from "../api";

const { TextArea } = Input;

const AddEditSuggestionModal = ({ suggestion, open, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const { message } = AntApp.useApp();
  const isEditing = !!suggestion;

  useEffect(() => {
    if (open) {
      if (isEditing) {
        form.setFieldsValue(suggestion);
      } else {
        form.resetFields();
        form.setFieldsValue({ isActive: true });
      }
    }
  }, [open, suggestion, form, isEditing]);

  const handleFinish = async (values) => {
    setLoading(true);
    const payload = {
      ...values,
      isActive: values.isActive === undefined ? true : values.isActive,
    };

    try {
      if (isEditing) {
        await api.put(`/admin/healing-suggestions/${suggestion.id}`, payload);
        message.success("Suggestion updated successfully!");
      } else {
        await api.post("/admin/healing-suggestions", payload);
        message.success("Suggestion added successfully!");
      }
      onSuccess();
    } catch (error) {
      message.error(
        error.response?.data?.error || "Failed to save suggestion."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEditing ? "Edit Suggestion" : "Add New Suggestion"}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ marginTop: 24 }}
        initialValues={{ isActive: true }}
      >
        <Form.Item
          name="text"
          label="Suggestion Text"
          rules={[{ required: true }]}
        >
          <TextArea
            rows={3}
            placeholder="e.g., I'm feeling overwhelmed with work stress"
          />
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
            {isEditing ? "Update" : "Add"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditSuggestionModal;
