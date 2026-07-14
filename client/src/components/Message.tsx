// src/components/Message.jsx
import React from "react";
import { Button, App as AntApp, Tooltip, theme } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CopyOutlined } from "@ant-design/icons";

const { useToken } = theme;

interface MessageProps {
  sender: string;
  text: string;
}

const Message: React.FC<MessageProps> = ({ sender, text }) => {
  const isUser = sender === "user";
  const { message } = AntApp.useApp();
  const { token } = useToken();

  const handleCopy = () => {
    if (text) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          message.success("Copied to clipboard!"); // Show success feedback
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          message.error("Failed to copy text."); // Show error feedback
        });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: token.marginXS,
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "min(85%, 700px)",
          background: isUser
            ? "var(--success-green)"
            : "var(--bg-primary)",
          border: "3px solid var(--border-subtle)",
          borderRadius: 0,
          padding: "20px 24px",
          boxShadow: "6px 6px 0px var(--border-subtle)",
          position: "relative",
          color: isUser ? "var(--canvas-white)" : "var(--border-subtle)",
          fontSize: "14px",
          lineHeight: 1.6,
          fontWeight: 500,
          fontFamily: "var(--font-primary)",
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Headings
            h1: (props) => (
              <h1
                style={{
                  margin: `${token.marginXS}px 0`,
                  fontSize: token.fontSizeHeading1,
                  fontWeight: token.fontWeightStrong,
                  lineHeight: token.lineHeightHeading1,
                  color: "inherit",
                }}
                {...props}
              />
            ),
            h2: (props) => (
              <h2
                style={{
                  margin: `${token.marginXS}px 0`,
                  fontSize: token.fontSizeHeading2,
                  fontWeight: token.fontWeightStrong,
                  lineHeight: token.lineHeightHeading2,
                  color: "inherit",
                }}
                {...props}
              />
            ),
            h3: (props) => (
              <h3
                style={{
                  margin: `${token.marginSM}px 0`,
                  fontSize: token.fontSizeHeading3,
                  fontWeight: token.fontWeightStrong,
                  lineHeight: token.lineHeightHeading3,
                  color: "inherit",
                }}
                {...props}
              />
            ),

            // Paragraphs
            p: (props) => (
              <p
                style={{
                  margin: "0 0 8px 0",
                  lineHeight: 1.5,
                  fontSize: token.fontSize,
                  color: "inherit",
                }}
                {...props}
              />
            ),

            // Lists
            ul: (props) => (
              <ul
                style={{
                  margin: "8px 0",
                  paddingLeft: token.paddingLG,
                  lineHeight: 1.5,
                  color: "inherit",
                }}
                {...props}
              />
            ),
            ol: (props) => (
              <ol
                style={{
                  margin: "8px 0",
                  paddingLeft: token.paddingLG,
                  lineHeight: 1.5,
                  color: "inherit",
                }}
                {...props}
              />
            ),
            li: (props) => (
              <li
                style={{
                  margin: "4px 0",
                  lineHeight: 1.5,
                  color: "inherit",
                }}
                {...props}
              />
            ),

            // Bold text
            strong: (props) => (
              <strong
                style={{
                  fontWeight: token.fontWeightStrong,
                  color: "inherit",
                }}
                {...props}
              />
            ),

            // Links
            a: (props) => (
              <a
                style={{
                  color: isUser ? token.colorWhite : token.colorPrimary,
                  textDecoration: "none",
                  fontWeight: 500,
                  opacity: isUser ? 0.9 : 1,
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.textDecoration = "underline")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.textDecoration = "none")
                }
                {...props}
              />
            ),

            // Code blocks
            code: ({ node, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || "");
              const inline = !match && !className?.includes("language-");
              if (inline) {
                return (
                  <code
                    style={{
                      background: isUser
                        ? `${token.colorWhite}20`
                        : token.colorFillSecondary,
                      padding: `${token.paddingXXS}px ${token.paddingXS}px`,
                      borderRadius: token.borderRadiusSM,
                      fontSize: token.fontSizeSM,
                      fontFamily: "monospace",
                      color: "inherit",
                    }}
                    {...props}
                  />
                );
              }
              return (
                <code
                  style={{
                    background: isUser
                      ? `${token.colorWhite}15`
                      : token.colorFillAlter,
                    padding: token.paddingSM,
                    borderRadius: token.borderRadius,
                    fontSize: token.fontSizeSM,
                    fontFamily: "monospace",
                    display: "block",
                    color: "inherit",
                    border: `1px solid ${isUser ? `${token.colorWhite}20` : token.colorBorder
                      }`,
                  }}
                  {...props}
                />
              );
            },

            // Blockquotes
            blockquote: (props) => (
              <blockquote
                style={{
                  borderLeft: `4px solid ${isUser ? token.colorWhite : token.colorPrimary
                    }`,
                  margin: "12px 0",
                  paddingLeft: token.padding,
                  color: "inherit",
                  opacity: 0.8,
                  fontStyle: "italic",
                }}
                {...props}
              />
            ),

            // Table support
            table: ({ node, ...props }) => (
              <div style={{ overflowX: "auto", margin: "12px 0" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: token.fontSizeSM,
                    border: `1px solid ${isUser ? `${token.colorWhite}40` : token.colorBorder}`,
                  }}
                  {...props}
                />
              </div>
            ),
            thead: (props) => <thead style={{ background: isUser ? `${token.colorWhite}20` : token.colorFillAlter }} {...props} />,
            th: (props) => (
              <th
                style={{
                  padding: "8px",
                  border: `1px solid ${isUser ? `${token.colorWhite}40` : token.colorBorder}`,
                  fontWeight: token.fontWeightStrong,
                  textAlign: "left",
                }}
                {...props}
              />
            ),
            td: (props) => (
              <td
                style={{
                  padding: "8px",
                  border: `1px solid ${isUser ? `${token.colorWhite}40` : token.colorBorder}`,
                }}
                {...props}
              />
            ),
          }}
        >
          {text}
        </ReactMarkdown>
      </div>

      {!isUser && text && (
        <Tooltip title="Copy text">
          <Button
            type="text"
            icon={<CopyOutlined />}
            size="small"
            onClick={handleCopy}
            style={{
              alignSelf: "flex-start",
              marginLeft: token.marginXS,
              color: token.colorTextTertiary,
              background: token.colorFillTertiary,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadius,
            }}
          />
        </Tooltip>
      )}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(${token.marginXS}px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Message;
