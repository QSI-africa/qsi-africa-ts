import React, { useState, useEffect, useCallback  } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  App as AntApp,
  Switch,
  Typography,
  Space,
  theme,
  Divider,
  Select,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import api from "../api";

const { TextArea } = Input;
const { Text, Title } = Typography;
const { useToken } = theme;

const AddEditPilotModal = ({ pilot, open, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [isExtracting, setIsExtracting] = useState<boolean>(false); // <-- NEW state for extraction loading
  const { message } = AntApp.useApp();
  const { token } = useToken();
  const isEditing = !!pilot;

  useEffect(() => {
    if (open) {
      setFileList([]);
      setIsExtracting(false);

      if (isEditing) {
        form.setFieldsValue({
          key: pilot.key,
          title: pilot.title,
          subtext: pilot.subtext,
          shortDescription: pilot.shortDescription,
          expandedView: pilot.expandedView,
          imageUrl: pilot.imageUrl,
          isActive: pilot.isActive,
          type: pilot.type,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ isActive: true, type: "CONCEPT" });
      }
    }
  }, [open, pilot, form, isEditing]);

  const handleExtractContent = useCallback(
    async (file) => {
      if (!file) return;

      setIsExtracting(true);
      const formData = new FormData();
      formData.append("contentFile", file);

      try {
        // Send file to the dedicated extraction endpoint
        const response = await api.post(
          "/admin/pilots/extract-text",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        // Pre-fill the Expanded View field with the extracted content
        form.setFieldsValue({
          expandedView: response.data.markdownText,
        });
        message.success(
          `Content extracted successfully from ${response.data.originalName}. Please review.`
        );
      } catch (error) {
        console.error("Extraction API error:", error);
        message.error(
          "Failed to extract text. Please input manually or check server logs."
        );
        setFileList([]);
      } finally {
        setIsExtracting(false);
      }
    },
    [form, message]
  );
  // --------------------------------------------------------------------

  // --- 2. File Change Handler (Triggers extraction) ---
  const handleFileChange = (info) => {
    // Take the most recent file
    const newFile = info.fileList.slice(-1)[0];

    setFileList(newFile ? [newFile] : []);

    if (newFile && newFile.originFileObj) {
      handleExtractContent(newFile.originFileObj);
    }
    // Returning the list allows AntD to display the file name
    return info.fileList;
  };
  // ---------------------------------------------------

  const handleFinish = async (values) => {
    setLoading(true);

    // CRITICAL: File content is already in values.expandedView.
    // Do NOT send the file object again.

    // Use FormData for all text fields, as the backend API endpoints (POST/PUT pilots)
    // are configured to handle multipart form data for field inputs.
    const formData = new FormData();
    formData.append("key", values.key || "");
    formData.append("title", values.title);
    formData.append("subtext", values.subtext || "");
    formData.append("shortDescription", values.shortDescription);
    // Send the pre-filled content
    formData.append("expandedView", values.expandedView || "");
    formData.append("imageUrl", values.imageUrl || "");
    formData.append(
      "isActive",
      values.isActive === undefined ? true : values.isActive
    );
    formData.append("type", values.type);

    try {
      if (isEditing) {
        await api.put(`/admin/pilots/${pilot.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Pilot project updated successfully!");
      } else {
        await api.post("/admin/pilots", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Pilot project added successfully!");
      }
      onSuccess();
    } catch (error) {
      console.error(`Failed to ${isEditing ? "update" : "add"} pilot:`, error);
      let errorMessage = `Failed to ${
        isEditing ? "update" : "add"
      } pilot project.`;
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (!error.response) {
        errorMessage = "Network error. Please check your connection.";
      }
      if (error.response?.status !== 401) {
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Updated Upload Props ---
  const uploadProps = {
    onRemove: (file) => {
      // Clear file list state AND clear content from text area
      setFileList([]);
      form.setFieldsValue({ expandedView: "" });
    },
    beforeUpload: (file) => {
      // Prevent automatic upload
      return false;
    },
    onChange: handleFileChange, // <-- NEW: Triggers extraction
    fileList,
    maxCount: 1,
    accept: ".pdf, .docx, .txt",
  };
  // ----------------------------

  return (
    <Modal
      title={
        <div>
          <Title level={4} style={{ color: token.colorTextHeading, margin: 0 }}>
            {isEditing
              ? `Edit Pilot: ${pilot?.title}`
              : "Add New Pilot Project"}
          </Title>
          <Text
            style={{
              color: token.colorTextSecondary,
              fontSize: token.fontSizeSM,
            }}
          >
            {isEditing
              ? "Update pilot project details"
              : "Create a new pilot project for the chatbot"}
          </Text>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={"70%"}
      destroyOnClose
      styles={{
        content: {
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadiusLG,
        },
        header: {
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorder}`,
          padding: token.paddingLG,
        },
        body: {
          color: token.colorText,
          padding: `${token.paddingLG}px ${token.paddingLG}px 0`,
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ marginTop: token.margin }}
      >
        {/* Basic Information Section */}
        <div style={{ marginBottom: token.marginLG }}>
          <Title
            level={5}
            style={{ color: token.colorText, marginBottom: token.margin }}
          >
            Basic Information
          </Title>

          <Form.Item
            name="key"
            label={
              <Text style={{ color: token.colorText, fontWeight: 500 }}>
                Unique Key
              </Text>
            }
            rules={[
              {
                required: true,
                message: "Please input a unique key (e.g., udmp, glenview).",
              },
            ]}
            extra={
              <Text
                style={{
                  color: token.colorTextTertiary,
                  fontSize: token.fontSizeSM,
                }}
              >
                This should be a short, unique identifier used internally.
              </Text>
            }
          >
            <Input
              disabled={isEditing}
              placeholder="e.g., udmp"
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorder}`,
                color: token.colorText,
                borderRadius: token.borderRadius,
              }}
            />
          </Form.Item>

          <Form.Item
            name="title"
            label={
              <Text style={{ color: token.colorText, fontWeight: 500 }}>
                Title
              </Text>
            }
            rules={[{ required: true, message: "Please input the title." }]}
          >
            <Input
              placeholder="e.g., Urban Decongestion & Mobility Planning (UDMP)"
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorder}`,
                color: token.colorText,
                borderRadius: token.borderRadius,
              }}
            />
          </Form.Item>

          <Form.Item
            name="subtext"
            label={
              <Text style={{ color: token.colorText, fontWeight: 500 }}>
                Subtext/Theme (Optional)
              </Text>
            }
          >
            <Input
              placeholder="e.g., Decentralizing pressure and optimizing movement..."
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorder}`,
                color: token.colorText,
                borderRadius: token.borderRadius,
              }}
            />
          </Form.Item>
        </div>

        <Divider
          style={{
            borderColor: token.colorBorder,
            margin: `${token.marginLG}px 0`,
          }}
        />

        {/* Description Section */}
        <div style={{ marginBottom: token.marginLG }}>
          <Title
            level={5}
            style={{ color: token.colorText, marginBottom: token.margin }}
          >
            Descriptions
          </Title>

          <Form.Item
            name="shortDescription"
            label={
              <Text style={{ color: token.colorText, fontWeight: 500 }}>
                Short Description
              </Text>
            }
            rules={[
              {
                required: true,
                message: "Please input the short description.",
              },
            ]}
            extra={
              <Text
                style={{
                  color: token.colorTextTertiary,
                  fontSize: token.fontSizeSM,
                }}
              >
                Displayed in the chatbot sidebar.
              </Text>
            }
          >
            <TextArea
              rows={3}
              placeholder="A concise summary..."
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorder}`,
                color: token.colorText,
                borderRadius: token.borderRadius,
                resize: "vertical",
              }}
            />
          </Form.Item>

          {/* --- FILE UPLOAD FIELD --- */}
          <Form.Item
            label={
              <Text style={{ color: token.colorText, fontWeight: 500 }}>
                Upload Content Document (PDF/Word)
              </Text>
            }
            extra={
              <Text
                style={{
                  color: token.colorTextTertiary,
                  fontSize: token.fontSizeSM,
                }}
              >
                Upload a file (PDF, DOCX, TXT) to automatically extract text
                into the 'Expanded View' below.
              </Text>
            }
          >
            <Upload {...uploadProps}>
              <Button
                icon={<UploadOutlined />}
                loading={isExtracting} // <-- Uses new extraction loading state
                style={{
                  background: token.colorPrimaryBg,
                  border: `1px solid ${token.colorPrimaryBorder}`,
                  color: token.colorPrimaryText,
                  borderRadius: token.borderRadius,
                  fontWeight: 500,
                }}
              >
                {isExtracting ? "Extracting Content..." : "Select File"}
              </Button>
            </Upload>
          </Form.Item>
          {/* ----------------------------- */}

          <Form.Item
            name="expandedView"
            label={
              <Text style={{ color: token.colorText, fontWeight: 500 }}>
                Expanded View / Full Description (Markdown)
              </Text>
            }
            extra={
              <Text
                style={{
                  color: token.colorTextTertiary,
                  fontSize: token.fontSizeSM,
                }}
              >
                Detailed explanation (Markdown format). Content is pre-filled
                from uploaded files.
              </Text>
            }
          >
            <TextArea
              rows={6}
              placeholder="Detailed explanation of the pilot project..."
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorder}`,
                color: token.colorText,
                borderRadius: token.borderRadius,
                resize: "vertical",
              }}
            />
          </Form.Item>
        </div>

        <Divider
          style={{
            borderColor: token.colorBorder,
            margin: `${token.marginLG}px 0`,
          }}
        />

        {/* Media & Status Section */}
        <div style={{ marginBottom: token.marginLG }}>
          <Title
            level={5}
            style={{ color: token.colorText, marginBottom: token.margin }}
          >
            Media & Status
          </Title>

          <Form.Item
            name="imageUrl"
            label={
              <Text style={{ color: token.colorText, fontWeight: 500 }}>
                Image URL (Optional)
              </Text>
            }
            extra={
              <Text
                style={{
                  color: token.colorTextTertiary,
                  fontSize: token.fontSizeSM,
                }}
              >
                Link to a relevant image for the pilot.
              </Text>
            }
          >
            <Input
              placeholder="https://example.com/image.jpg"
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorder}`,
                color: token.colorText,
                borderRadius: token.borderRadius,
              }}
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label={
              <Text style={{ color: token.colorText, fontWeight: 500 }}>
                Active Status
              </Text>
            }
            valuePropName="checked"
            extra={
              <Text
                style={{
                  color: token.colorTextTertiary,
                  fontSize: token.fontSizeSM,
                }}
              >
                Inactive pilots will not be shown in the chatbot.
              </Text>
            }
          >
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              style={{
                background: token.colorPrimary,
              }}
            />
          </Form.Item>
        </div>

        <div style={{ marginBottom: token.marginLG }}>
          <Title
            level={5}
            style={{ color: token.colorText, marginBottom: token.margin }}
          >
            Type & Theme
          </Title>

          <Form.Item
            name="type"
            label={
              <Text style={{ color: token.colorText, fontWeight: 500 }}>
                Type
              </Text>
            }
            rules={[{ required: true, message: "Please select a type." }]}
            extra={
              <Text
                style={{
                  color: token.colorTextTertiary,
                  fontSize: token.fontSizeSM,
                }}
              >
                Choose whether this pilot represents a Concept or a Framework.
              </Text>
            }
          >
            <Select
              placeholder="Select Type"
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorder}`,
                color: token.colorText,
                borderRadius: token.borderRadius,
              }}
              options={[
                { label: "Concept", value: "CONCEPT" },
                { label: "Framework", value: "FRAMEWORK" },
              ]}
            />
          </Form.Item>
        </div>

        {/* Form Actions */}
        <Form.Item
          style={{
            textAlign: "right",
            marginBottom: 0,
            paddingTop: token.padding,
            borderTop: `1px solid ${token.colorBorder}`,
          }}
        >
          <Space>
            <Button
              onClick={onCancel}
              disabled={loading}
              style={{
                background: token.colorPrimaryBg,
                border: `1px solid ${token.colorPrimaryBorder}`,
                color: token.colorPrimaryText,
                borderRadius: token.borderRadius,
                fontWeight: 500,
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                background: token.colorPrimary,
                borderColor: token.colorPrimary,
                borderRadius: token.borderRadius,
                fontWeight: 600,
              }}
            >
              {isEditing ? "Update Pilot" : "Add Pilot"}
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* Enhanced Custom Styles */}
      <style>
        {`
          .ant-input:focus,
          .ant-input-focused {
            border-color: ${token.colorPrimary} !important;
            box-shadow: 0 0 0 2px ${token.colorPrimaryBg} !important;
          }

          .ant-input:hover {
            border-color: ${token.colorPrimaryHover} !important;
          }

          .ant-input::placeholder {
            color: ${token.colorTextTertiary} !important;
          }

          .ant-form-item-label > label {
            color: ${token.colorText} !important;
          }

          .ant-form-item-extra {
            color: ${token.colorTextTertiary} !important;
          }

          .ant-switch-checked {
            background: ${token.colorPrimary} !important;
          }

          .ant-switch-checked:hover:not(.ant-switch-disabled) {
            background: ${token.colorPrimaryHover} !important;
          }

          .ant-divider {
            color: ${token.colorBorder} !important;
          }
          
          // Style for the Upload button to match AntD primary style
          .ant-upload-list-item-name {
            color: ${token.colorText};
          }
          .ant-upload-wrapper .ant-upload-list-item-error .ant-upload-list-item-name {
            color: ${token.colorError};
          }
        `}
      </style>
    </Modal>
  );
};

export default AddEditPilotModal;
