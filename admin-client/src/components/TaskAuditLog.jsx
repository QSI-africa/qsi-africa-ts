// admin-client/src/components/TaskAuditLog.jsx
import React from "react";
import { Timeline, Typography, Empty, theme } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserSwitchOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Text } = Typography;
const { useToken } = theme;

const getActionDetails = (action, token) => {
  switch (action) {
    case "TASK_CREATED":
      return { color: "#3b82f6", icon: <ClockCircleOutlined /> };
    case "TASK_ASSIGNED":
      return { color: "#06b6d4", icon: <UserSwitchOutlined /> };
    case "DOCUMENT_UPLOADED":
      return {
        color: token.colorPrimary,
        icon: <PaperClipOutlined />,
      };
    case "DESIGN_APPROVED":
    case "QUOTATION_APPROVED":
      return {
        color: token.colorSuccess,
        icon: <CheckCircleOutlined />,
      };
    case "DESIGN_REJECTED":
    case "QUOTATION_REJECTED":
      return {
        color: token.colorError,
        icon: <CloseCircleOutlined />,
      };
    default:
      return {
        color: token.colorTextTertiary,
        icon: <ClockCircleOutlined />,
      };
  }
};

const TaskAuditLog = ({ logs }) => {
  const { token } = useToken();

  if (!logs || logs.length === 0) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Empty
          description={
            <Text style={{ color: token.colorTextSecondary }}>
              No history for this task yet
            </Text>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Timeline>
        {logs.map((log) => {
          const { color, icon } = getActionDetails(log.action, token);
          // --- Get document details if available ---
          const isUpload = log.action === "DOCUMENT_UPLOADED";
          const docFilename = log.details?.filename;
          const docPath = log.details?.path || log.details?.url; // Handle both local path and S3/Firebase URL
          // ------------------------------------------
          return (
            <Timeline.Item
              key={log.id}
              color={color}
              dot={
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: `${color}20`,
                    border: `2px solid ${color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    color: color,
                  }}
                >
                  {icon}
                </div>
              }
            >
              <div style={{ paddingBottom: "16px" }}>
                {/* Action Title */}
                <Text
                  strong
                  style={{
                    color: token.colorText,
                    fontSize: "15px",
                    display: "block",
                    marginBottom: "6px",
                    textTransform: "capitalize",
                  }}
                >
                  {log.action.replace(/_/g, " ").toLowerCase()}
                </Text>

                {/* Timestamp */}
                <Text
                  style={{
                    color: token.colorTextSecondary,
                    fontSize: "12px",
                    display: "block",
                    marginBottom: "12px",
                  }}
                >
                  {new Date(log.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>

                {/* Rejection Reason */}
                {log.details?.reason && (
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      borderRadius: "8px",
                      marginTop: "8px",
                    }}
                  >
                    <Text
                      style={{
                        color: token.colorTextSecondary,
                        fontSize: "12px",
                        fontWeight: 500,
                        display: "block",
                        marginBottom: "4px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Rejection Reason
                    </Text>
                    <Text
                      style={{
                        color: token.colorText,
                        fontSize: "13px",
                        fontStyle: "italic",
                        lineHeight: 1.5,
                      }}
                    >
                      {log.details.reason}
                    </Text>
                  </div>
                )}

                {/* Uploaded Filename */}
                {log.details?.filename &&
                  isUpload &&
                  docFilename &&
                  docPath && (
                    <Link
                      href={docPath}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div
                        style={{
                          padding: "10px 14px",
                          background: "rgba(139, 92, 246, 0.08)",
                          border: "1px solid rgba(139, 92, 246, 0.2)",
                          borderRadius: "8px",
                          marginTop: "8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <PaperClipOutlined
                          style={{
                            color: token.colorPrimary,
                            fontSize: "16px",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: token.colorTextSecondary,
                              fontSize: "11px",
                              fontWeight: 500,
                              display: "block",
                              marginBottom: "2px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            File Uploaded
                          </Text>
                          <Text
                            style={{
                              color: token.colorText,
                              fontSize: "13px",
                            }}
                          >
                            {log.details.filename}
                          </Text>
                        </div>
                      </div>
                    </Link>
                  )}
              </div>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </div>
  );
};

export default TaskAuditLog;
