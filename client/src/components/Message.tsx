// src/components/Message.jsx
import React from "react";
import { Card, Button, App as AntApp, Tooltip, Typography, theme } from "antd";
import ReactMarkdown from "react-markdown";
import { CopyOutlined } from "@ant-design/icons";

const { Paragraph } = Typography;
const { useToken } = theme;

const Message = ({ sender, text }) => {
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
          maxWidth: "min(75%, 600px)",
          background: isUser
            ? `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`
            : token.lightGrayLight,
          border: isUser ? "none" : `1px solid ${token.colorBorder}`,
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding: `${token.paddingSM}px ${token.padding}px`,
          boxShadow: isUser ? token.boxShadowSecondary : token.boxShadowTertiary,
          position: "relative",
        }}
      >
        <Paragraph
          style={{
            color: isUser ? token.colorWhite : token.colorText,
            margin: 0,
            fontSize: token.fontSize,
            lineHeight: token.lineHeight,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <ReactMarkdown
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
                    margin: `${token.marginXS}px 0`,
                    lineHeight: token.lineHeight,
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
                    margin: `${token.marginXS}px 0`,
                    paddingLeft: token.paddingLG,
                    lineHeight: token.lineHeight,
                    color: "inherit",
                  }}
                  {...props}
                />
              ),
              ol: (props) => (
                <ol
                  style={{
                    margin: `${token.marginXS}px 0`,
                    paddingLeft: token.paddingLG,
                    lineHeight: token.lineHeight,
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
                    fontWeight: token.fontWeightMedium,
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
              code: ({ node, inline, ...props }) => {
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
                      border: `1px solid ${
                        isUser ? `${token.colorWhite}20` : token.colorBorder
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
                    borderLeft: `4px solid ${
                      isUser ? token.colorWhite : token.colorPrimary
                    }`,
                    margin: `${token.marginSM}px 0`,
                    paddingLeft: token.padding,
                    color: "inherit",
                    opacity: 0.8,
                    fontStyle: "italic",
                  }}
                  {...props}
                />
              ),
            }}
          >
            {text}
          </ReactMarkdown>
        </Paragraph>
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
