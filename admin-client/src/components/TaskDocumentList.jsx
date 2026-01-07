// admin-client/src/components/TaskDocumentList.jsx
import React, { useCallback } from "react";
import { List, Button, Typography, Tag, Space, Card, theme } from "antd";
import {
  DownloadOutlined,
  PaperClipOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { useToken } = theme;

const getDocumentTypeColor = (documentType, token) => {
  const colorMap = {
    DESIGN: token.colorInfo,
    ARCHITECT_DESIGN: token.colorInfo,
    ENGINEER_DESIGN: token.colorInfo,
    QUOTATION: token.colorSuccess,
    PROPOSAL: token.colorWarning,
    REPORT: token.colorPrimary,
    OTHER: token.colorTextTertiary,
  };
  return colorMap[documentType] || token.colorTextTertiary;
};

const TaskDocumentList = ({ documents }) => {
  const { token } = useToken();

  // Unified logic to extract the Origin from the API environment variable
  const getFileUrl = useCallback((filepath, fileName) => {
    const apiBase =
      import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
    let rootUrl;
    try {
      const urlObj = new URL(apiBase);
      rootUrl = urlObj.origin; // Extracts e.g., https://api.qsi.africa
    } catch {
      // Fallback if URL parsing fails
      rootUrl = apiBase.replace("/api", "");
    }

    // Prioritize filepath if available, fallback to fileName in the uploads directory
    if (filepath) return `${rootUrl}${filepath}`;
    return `${rootUrl}/uploads/${fileName}`;
  }, []);

  if (!documents || documents.length === 0) {
    return (
      <Card
        style={{
          background: token.colorFillTertiary,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadius,
          textAlign: "center",
        }}
        bodyStyle={{ padding: token.paddingLG }}
      >
        <FileTextOutlined
          style={{
            fontSize: "24px",
            color: token.colorTextTertiary,
            marginBottom: token.marginSM,
            display: "block",
          }}
        />
        <Text style={{ color: token.colorTextTertiary }}>
          No documents uploaded yet
        </Text>
      </Card>
    );
  }

  return (
    <div style={{ padding: token.paddingSM }}>
      <List
        itemLayout="horizontal"
        dataSource={documents}
        renderItem={(doc) => {
          // Generate the clean URL using the helper
          const fullFileUrl = getFileUrl(doc.filePath, doc.fileName);

          return (
            <List.Item
              style={{
                padding: token.padding,
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                marginBottom: token.marginSM,
                background: token.colorBgContainer,
                transition: `all ${token.motionDurationFast} ${token.motionEaseOut}`,
              }}
              actions={[
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  href={fullFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  style={{
                    borderRadius: token.borderRadius,
                    fontWeight: 500,
                  }}
                >
                  Download
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: token.borderRadius,
                      background: token.colorPrimaryBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${token.colorPrimaryBorder}`,
                    }}
                  >
                    <PaperClipOutlined
                      style={{
                        color: token.colorPrimary,
                        fontSize: "16px",
                      }}
                    />
                  </div>
                }
                title={
                  <a
                    href={fullFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: token.colorText,
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    {doc.originalName || doc.fileName || doc.filename}
                  </a>
                }
                description={
                  <Space size="small" wrap>
                    <Tag
                      color={getDocumentTypeColor(doc.documentType, token)}
                      style={{
                        borderRadius: token.borderRadiusSM,
                        border: "none",
                        fontSize: token.fontSizeSM,
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    >
                      {doc.documentType?.replace(/_/g, " ").toLowerCase()}
                    </Tag>
                    <Space size="small">
                      <CalendarOutlined
                        style={{
                          color: token.colorTextTertiary,
                          fontSize: token.fontSizeSM,
                        }}
                      />
                      <Text
                        style={{
                          color: token.colorTextSecondary,
                          fontSize: token.fontSizeSM,
                        }}
                      >
                        {new Date(doc.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          );
        }}
      />

      <style>
        {`
          .ant-list-item:hover {
            background: ${token.colorPrimaryBg} !important;
            border-color: ${token.colorPrimaryBorder} !important;
            transform: translateY(-1px);
            box-shadow: ${token.boxShadowSecondary};
          }
          .ant-list-item-meta-title a:hover {
            color: ${token.colorPrimary} !important;
          }
        `}
      </style>
    </div>
  );
};

export default TaskDocumentList;
