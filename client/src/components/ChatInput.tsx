import React, { useState, useCallback  } from 'react';
import {
  Input,
  Button,
  theme,
  Upload,
  Typography,
  Space,
  App as AntApp,
  List,
  Tag,
  Tooltip,
  Badge,
} from "antd";
import {
  SendOutlined,
  PaperClipOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { useToken } = theme;
const { Text } = Typography;

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Helper function to get file icon
const getFileIcon = (fileType) => {
  if (fileType?.includes("pdf")) return "📄";
  if (fileType?.includes("image")) return "🖼️";
  if (fileType?.includes("document") || fileType?.includes("word")) return "📝";
  if (fileType?.includes("text")) return "📃";
  return "📎";
};

// Helper function to display file type
const getFileTypeDisplay = (fileType) => {
  if (fileType?.includes("pdf")) return "PDF";
  if (fileType?.includes("jpeg") || fileType?.includes("jpg")) return "JPG";
  if (fileType?.includes("png")) return "PNG";
  if (fileType?.includes("openxmlformats")) return "DOCX";
  if (fileType?.includes("word") || fileType?.includes("document")) return "DOC";
  if (fileType?.includes("text")) return "TXT";
  return fileType?.split("/")?.[1]?.toUpperCase() || "FILE";
};

const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total
const MAX_FILES = 10;

const ChatInput = ({
  onSendMessage,
  loading,
  isMobile,
  moduleName,
  selectedFiles = [],
  setSelectedFiles,
}) => {
  const { token } = useToken();
  const { message: antMessage } = AntApp.useApp();
  const [userInput, setUserInput] = useState<string>("");

  const isInfrastructure = moduleName === "infrastructure";

  // Total file size
  const getTotalFileSize = useCallback(
    () =>
      selectedFiles.reduce(
        (acc, f) => acc + (f.originFileObj?.size || f.size || 0),
        0
      ),
    [selectedFiles]
  );

  /**
   * 🚀 FIXED — Correct AntD Upload behavior
   * We now treat fileList as the single source of truth.
   * No duplicate issues anymore.
   */
  const handleFileChange = useCallback(
    ({ fileList }) => {
      // Validate count
      if (fileList.length > MAX_FILES) {
        antMessage.error(`You can upload a maximum of ${MAX_FILES} files.`);
        return;
      }

      // Validate each file
      for (const f of fileList) {
        const file = f.originFileObj;
        if (!file) continue;

        if (file.size > 10 * 1024 * 1024) {
          antMessage.error(`${file.name} exceeds 10MB limit.`);
          return;
        }

        const allowed = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg",
          "image/png",
          "image/webp",
          "text/plain",
        ];

        if (!allowed.includes(file.type)) {
          antMessage.error(`${file.name} is not a supported file type.`);
          return;
        }
      }

      setSelectedFiles(fileList);
    },
    [antMessage, setSelectedFiles]
  );

  const handleRemoveFile = useCallback(
    (fileToRemove) => {
      setSelectedFiles((prev) =>
        prev.filter((f) => f.uid !== fileToRemove.uid)
      );
    },
    [setSelectedFiles]
  );

  const handleClearAllFiles = useCallback(() => {
    setSelectedFiles([]);
  }, [setSelectedFiles]);

  const handleSend = useCallback(() => {
    const messageText = userInput.trim();

    const hasFiles = selectedFiles.length > 0;

    if (!messageText && !hasFiles) {
      antMessage.warning("Please type a message or attach files.");
      return;
    }

    if (getTotalFileSize() > MAX_TOTAL_SIZE) {
      antMessage.error(`Total file size exceeds 50MB.`);
      return;
    }

    // IMPORTANT: convert AntD fileList → raw File objects
    const rawFiles = selectedFiles.map((f) => f.originFileObj);

    onSendMessage(messageText, rawFiles);

    setUserInput("");
    setSelectedFiles([]);
  }, [
    userInput,
    selectedFiles,
    onSendMessage,
    antMessage,
    setSelectedFiles,
    getTotalFileSize,
  ]);

  const uploadProps = {
    accept: ".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.webp",
    multiple: true,
    beforeUpload: () => false,
    onChange: handleFileChange,
    showUploadList: false,
    fileList: selectedFiles,
    disabled: loading || !isInfrastructure,
  };

  const handleKeyDown = (e: React.FormEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: token.marginXS }}>
      {/* FILE PREVIEW SECTION */}
      {selectedFiles.length > 0 && isInfrastructure && (
        <div
          style={{
            background: token.colorFillAlter,
            borderRadius: token.borderRadius,
            padding: token.paddingSM,
            border: `1px solid ${token.colorBorder}`,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: token.marginXS,
            }}
          >
            <Space>
              <Badge
                count={selectedFiles.length}
                style={{
                  backgroundColor: token.colorPrimary,
                  color: token.colorTextLightSolid,
                }}
              />
              <Text style={{ fontWeight: 500 }}>
                {selectedFiles.length} file
                {selectedFiles.length > 1 ? "s" : ""} selected
              </Text>
              <Tag color="blue">Total: {formatFileSize(getTotalFileSize())}</Tag>
            </Space>

            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={handleClearAllFiles}
              disabled={loading}
            >
              Clear All
            </Button>
          </div>

          <List
            size="small"
            dataSource={selectedFiles}
            style={{ maxHeight: "150px", overflowY: "auto" }}
            renderItem={(file) => (
              <List.Item
                actions={[
                  <Button
                    key="remove"
                    type="text"
                    size="small"
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleRemoveFile(file)}
                    disabled={loading}
                    style={{ color: token.colorError }}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={<div>{getFileIcon(file.type)}</div>}
                  title={
                    <Tooltip title={file.name}>
                      <Text
                        style={{
                          maxWidth: isMobile ? "150px" : "250px",
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
                    <Space size="small">
                      <Tag>{getFileTypeDisplay(file.type)}</Tag>
                      <Text type="secondary">
                        {formatFileSize(file.originFileObj?.size || file.size)}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />

          <Text type="secondary" style={{ fontSize: token.fontSizeXS }}>
            Max 10 files, 10MB each. Supported: PDF, DOC, DOCX, JPG, PNG, TXT
          </Text>
        </div>
      )}

      {/* INPUT BAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: token.marginSM,
        }}
      >
        {isInfrastructure && (
          <Upload {...uploadProps}>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              disabled={loading}
              style={{
                height: isMobile ? "36px" : "48px",
                width: isMobile ? "36px" : "48px",
                borderRadius: token.borderRadiusLG,
              }}
            />
          </Upload>
        )}

        {/* Textbox */}
        <Input.TextArea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isInfrastructure && selectedFiles.length > 0
              ? "Add a message (optional)..."
              : isInfrastructure
              ? "Describe your infrastructure needs..."
              : "Type your message..."
          }
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={loading}
          style={{
            flexGrow: 1,
            borderRadius: token.borderRadiusLG,
          }}
        />

        {/* Send */}
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={loading}
          disabled={!userInput.trim() && selectedFiles.length === 0}
          style={{
            height: isMobile ? "36px" : "48px",
            width: isMobile ? "36px" : "48px",
            borderRadius: token.borderRadiusLG,
          }}
        />
      </div>
    </div>
  );
};

export default ChatInput;
