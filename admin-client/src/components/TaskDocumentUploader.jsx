// admin-client/src/components/TaskDocumentUploader.jsx
import React, { useState } from "react";
import {
  Upload,
  Button,
  App as AntApp,
  Card,
  Typography,
  Space,
  Tag,
  theme,
  List,
  Progress,
  Input,
  Alert,
  Tooltip,
} from "antd";
import {
  UploadOutlined,
  PaperClipOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import api from "../api";

const { Text, Title } = Typography;
const { TextArea } = Input;
const { useToken } = theme;

const getDocumentTypeColor = (documentType, token) => {
  const colorMap = {
    ARCHITECT_DESIGN: token.colorOrange,
    ENGINEER_DESIGN: token.colorBlue,
    QUOTATION: token.colorSuccess,
    PROPOSAL: token.colorWarning,
    REPORT: token.colorPrimary,
    REVISION: token.colorError,
    OTHER: token.colorTextTertiary,
  };
  return colorMap[documentType] || token.colorTextTertiary;
};

const getDocumentTypeDisplay = (documentType) => {
  const displayMap = {
    ARCHITECT_DESIGN: "Architect Design",
    ENGINEER_DESIGN: "Engineer Design",
    QUOTATION: "Quotation/Quantification",
    PROPOSAL: "Proposal",
    REPORT: "Report",
    REVISION: "Revision",
    OTHER: "Other",
  };
  return displayMap[documentType] || documentType;
};

const TaskDocumentUploader = ({ task, documentType, onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [comments, setComments] = useState("");
  const { message } = AntApp.useApp();
  const { token } = useToken();

  const handleUpload = async () => {
    if (files.length === 0) {
      message.error("Please select at least one file.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("documents", file);
    });
    formData.append("documentType", documentType);

    // Ensure comments is sent as an empty string if nothing is typed
    formData.append("comments", comments?.trim() || "");

    setUploading(true);
    setUploadProgress({});

    try {
      const response = await api.post(
        `/admin/tasks/${task.id}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress({ overall: percentCompleted });
          },
        }
      );

      message.success(
        response.data.message ||
          `Successfully uploaded ${files.length} file(s)!`
      );
      setFiles([]);
      setComments("");
      setUploadProgress({});
      onUploadSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      if (error.response?.status === 400) {
        message.error(error.response.data.error || "Invalid file(s).");
      } else if (error.response?.status === 413) {
        message.error("File(s) too large. Maximum 10MB per file.");
      } else if (error.response?.status !== 401) {
        message.error("Upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload = (file) => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error(`${file.name} is larger than 10MB!`);
      return Upload.LIST_IGNORE;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (!allowedTypes.includes(file.type)) {
      message.error(
        `${file.name} is not a supported file type. Only PDF, DOC, DOCX, JPG, PNG files are allowed.`
      );
      return Upload.LIST_IGNORE;
    }

    const isDuplicate = files.some(
      (existingFile) =>
        existingFile.name === file.name && existingFile.size === file.size
    );
    if (isDuplicate) {
      message.error(`${file.name} is already in the upload list.`);
      return Upload.LIST_IGNORE;
    }

    setFiles((prevFiles) => [...prevFiles, file]);
    return false;
  };

  const handleRemove = (file) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.uid !== file.uid));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getTotalFileSize = () => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  const uploadProps = {
    beforeUpload,
    multiple: true,
    showUploadList: false,
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    disabled: uploading,
  };

  return (
    <Card
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary,
        marginBottom: token.margin,
      }}
      bodyStyle={{ padding: token.paddingLG }}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <div>
          <Title
            level={5}
            style={{
              color: token.colorText,
              margin: 0,
              marginBottom: token.marginXS,
            }}
          >
            <CloudUploadOutlined
              style={{ marginRight: token.marginSM, color: token.colorPrimary }}
            />
            Upload {getDocumentTypeDisplay(documentType)} Documents
          </Title>
          <Text
            style={{
              color: token.colorTextSecondary,
              fontSize: token.fontSizeSM,
            }}
          >
            Upload multiple documents for task:{" "}
            <Text strong style={{ color: token.colorText }}>
              {task.title}
            </Text>
          </Text>
        </div>

        <Tag
          color={getDocumentTypeColor(documentType, token)}
          style={{
            borderRadius: token.borderRadiusSM,
            border: "none",
            fontSize: token.fontSizeSM,
            fontWeight: 600,
            color: token.colorTextLightSolid,
            alignSelf: "flex-start",
          }}
        >
          <FileTextOutlined style={{ marginRight: token.marginXS }} />
          {getDocumentTypeDisplay(documentType)}
        </Tag>

        <Upload {...uploadProps}>
          <Button
            icon={<UploadOutlined />}
            style={{
              background: token.colorPrimaryBg,
              border: `1px solid ${token.colorPrimaryBorder}`,
              color: token.colorPrimaryText,
              borderRadius: token.borderRadius,
              fontWeight: 500,
              width: "100%",
            }}
            disabled={uploading}
          >
            Select Files (PDF, DOC, DOCX, JPG, PNG)
          </Button>
        </Upload>

        {files.length > 0 && (
          <Card
            size="small"
            style={{
              background: token.colorFillTertiary,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadius,
            }}
            bodyStyle={{ padding: token.paddingSM }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text strong style={{ color: token.colorText }}>
                  Selected Files ({files.length})
                </Text>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => setFiles([])}
                  disabled={uploading}
                >
                  Clear All
                </Button>
              </div>

              <List
                size="small"
                dataSource={files}
                renderItem={(file) => (
                  <List.Item
                    style={{
                      padding: `${token.paddingXS}px ${token.paddingSM}px`,
                      borderBottom: `1px solid ${token.colorBorderSecondary}`,
                    }}
                    actions={[
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleRemove(file)}
                        disabled={uploading}
                      />,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <PaperClipOutlined
                          style={{ color: token.colorTextTertiary }}
                        />
                      }
                      title={
                        <Tooltip title={file.name}>
                          <Text
                            style={{
                              color: token.colorText,
                              fontSize: token.fontSizeSM,
                              maxWidth: "200px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {file.name}
                          </Text>
                        </Tooltip>
                      }
                      description={
                        <Text
                          style={{
                            color: token.colorTextSecondary,
                            fontSize: token.fontSizeXS,
                          }}
                        >
                          {formatFileSize(file.size)}
                          {file.type &&
                            ` • ${file.type.split("/")[1].toUpperCase()}`}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: `${token.paddingXS}px ${token.paddingSM}px`,
                  background: token.colorFillAlter,
                  borderRadius: token.borderRadiusSM,
                }}
              >
                <Text
                  style={{
                    color: token.colorTextSecondary,
                    fontSize: token.fontSizeSM,
                  }}
                >
                  Total Size:
                </Text>
                <Text
                  strong
                  style={{ color: token.colorText, fontSize: token.fontSizeSM }}
                >
                  {formatFileSize(getTotalFileSize())}
                </Text>
              </div>
            </Space>
          </Card>
        )}

        <div>
          <Text
            style={{
              color: token.colorText,
              fontSize: token.fontSizeSM,
              fontWeight: 500,
              marginBottom: token.marginXS,
              display: "block",
            }}
          >
            <InfoCircleOutlined style={{ marginRight: token.marginXS }} />
            Comments (Optional)
          </Text>
          <TextArea
            placeholder="Add any comments or notes about these documents..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorder}`,
              color: token.colorText,
              borderRadius: token.borderRadius,
            }}
            disabled={uploading}
          />
        </div>

        {uploading && uploadProgress.overall !== undefined && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: token.marginXS,
              }}
            >
              <Text
                style={{ color: token.colorText, fontSize: token.fontSizeSM }}
              >
                Uploading...
              </Text>
              <Text
                style={{
                  color: token.colorPrimary,
                  fontSize: token.fontSizeSM,
                }}
              >
                {uploadProgress.overall}%
              </Text>
            </div>
            <Progress
              percent={uploadProgress.overall}
              size="small"
              strokeColor={token.colorPrimary}
              showInfo={false}
            />
          </div>
        )}

        <Button
          type="primary"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          loading={uploading}
          icon={<CloudUploadOutlined />}
          style={{
            background: token.colorPrimary,
            borderColor: token.colorPrimary,
            borderRadius: token.borderRadius,
            fontWeight: 600,
            width: "100%",
          }}
          size="large"
        >
          {uploading
            ? `Uploading ${files.length} File(s)...`
            : `Upload ${files.length} File(s)`}
        </Button>

        <Alert
          message="Upload Guidelines"
          description={
            <Space direction="vertical" size={2}>
              <Text style={{ fontSize: token.fontSizeSM }}>
                • Maximum 5 files per upload
              </Text>
              <Text style={{ fontSize: token.fontSizeSM }}>
                • Maximum 10MB per file
              </Text>
              <Text style={{ fontSize: token.fontSizeSM }}>
                • Supported formats: PDF, DOC, DOCX, JPG, PNG
              </Text>
              <Text style={{ fontSize: token.fontSizeSM }}>
                • All files will be uploaded as "
                {getDocumentTypeDisplay(documentType)}" documents
              </Text>
            </Space>
          }
          type="info"
          showIcon
          style={{
            background: token.colorInfoBg,
            border: `1px solid ${token.colorInfoBorder}`,
            borderRadius: token.borderRadius,
          }}
        />
      </Space>

      <style>
        {`
          .ant-upload.ant-upload-select {
            display: block !important;
          }
          .ant-btn-primary:disabled {
            background: ${token.colorFill} !important;
            border-color: ${token.colorBorder} !important;
            color: ${token.colorTextDisabled} !important;
          }
          .ant-btn-primary:hover:not(:disabled) {
            background: ${token.colorPrimaryHover} !important;
            border-color: ${token.colorPrimaryHover} !important;
          }
          .ant-btn-primary:active:not(:disabled) {
            background: ${token.colorPrimaryActive} !important;
            border-color: ${token.colorPrimaryActive} !important;
          }
          .ant-list-item {
            transition: all ${token.motionDurationFast} !important;
          }
          .ant-list-item:hover {
            background: ${token.colorFillTertiary} !important;
          }
          .ant-list-item-meta-title {
            margin-bottom: 0 !important;
          }
          .ant-alert-info {
            background: ${token.colorInfoBg} !important;
            border-color: ${token.colorInfoBorder} !important;
          }
        `}
      </style>
    </Card>
  );
};

export default TaskDocumentUploader;
