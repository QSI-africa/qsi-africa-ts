// admin-client/src/components/TaskDocumentList.jsx
import React from "react";
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
    QUOTATION: token.colorSuccess,
    PROPOSAL: token.colorWarning,
    REPORT: token.colorPrimary,
    OTHER: token.colorTextTertiary,
  };
  return colorMap[documentType] || token.colorTextTertiary;
};

const TaskDocumentList = ({ documents }) => {
  const { token } = useToken();

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

  // const BACKEND_URL = "http://localhost:3001";
  const BACKEND_URL = "https://api.qsi.africa";

  return (
    <div style={{ padding: token.paddingSM }}>
      <List
        itemLayout="horizontal"
        dataSource={documents}
        renderItem={(doc) => {
          const fullFileUrl = `${BACKEND_URL}${doc.filepath}`;
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
                    background: token.colorPrimary,
                    borderColor: token.colorPrimary,
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
                    onMouseEnter={(e: React.FormEvent) => {
                      e.target.style.color = token.colorPrimary;
                    }}
                    onMouseLeave={(e: React.FormEvent) => {
                      e.target.style.color = token.colorText;
                    }}
                  >
                    {doc.filename}
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
                        color: token.colorTextLightSolid,
                        textTransform: "capitalize",
                      }}
                    >
                      {doc.documentType?.toLowerCase()}
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
                          hour: "2-digit",
                          minute: "2-digit",
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

      {/* Enhanced Custom Styles */}
      <style>
        {`
          .ant-list-item {
            transition: all ${token.motionDurationFast} ${token.motionEaseOut} !important;
          }

          .ant-list-item:hover {
            background: ${token.colorPrimaryBg} !important;
            border-color: ${token.colorPrimaryBorder} !important;
            transform: translateY(-1px);
            box-shadow: ${token.boxShadowSecondary};
          }

          .ant-list-item-meta-title {
            margin-bottom: 4px !important;
          }

          .ant-list-item-meta-description {
            margin-top: 0 !important;
          }

          .ant-btn-primary:hover {
            background: ${token.colorPrimaryHover} !important;
            border-color: ${token.colorPrimaryHover} !important;
          }

          .ant-btn-primary:active {
            background: ${token.colorPrimaryActive} !important;
            border-color: ${token.colorPrimaryActive} !important;
          }
        `}
      </style>
    </div>
  );
};

export default TaskDocumentList;
