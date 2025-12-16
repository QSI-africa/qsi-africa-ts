// src/components/ContactModal.jsx
import React from "react";
import { Modal, Form, Input, theme } from "antd";

const { useToken } = theme;

const ContactModal = ({ open, onCancel, onFinish }) => {
  const [form] = Form.useForm();
  const { token } = useToken();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        form.resetFields();
        onFinish(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const modalStyles = {
    body: {
      background: token.colorBgContainer,
      padding: `${token.padding}px ${token.paddingLG}px`,
    },
    content: {
      background: token.colorBgContainer,
      borderRadius: token.borderRadiusLG,
      border: `1px solid ${token.colorBorder}`,
      boxShadow: token.boxShadowSecondary,
    },
    header: {
      background: token.colorBgContainer,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      color: token.colorText,
      borderRadius: `${token.borderRadiusLG}px ${token.borderRadiusLG}px 0 0`,
    },
    footer: {
      borderTop: `1px solid ${token.colorBorderSecondary}`,
      padding: `${token.paddingSM}px ${token.paddingLG}px`,
      // Remove any default outlines
      outline: "none",
      boxShadow: "none",
    },
  };

  const inputStyles = {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: token.borderRadius,
    color: token.colorText,
    fontSize: token.fontSize,

    "&:hover": {
      borderColor: token.colorPrimaryHover,
    },

    "&:focus": {
      borderColor: token.colorPrimary,
      boxShadow: `0 0 0 2px ${token.colorPrimaryBg}`,
    },
  };

  return (
    <Modal
      title="Contact Information"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Start Conversation"
      cancelText="Cancel"
      styles={modalStyles}
      okButtonProps={{
        style: {
          // background: token.colorPrimary,
          borderColor: token.colorPrimary,
          borderRadius: token.borderRadius,
          fontWeight: token.fontWeightStrong,
        },
      }}
      cancelButtonProps={{
        style: {
          borderColor: token.colorBorder,
          color: token.colorText,
          borderRadius: token.borderRadius,
        },
      }}
    >
      <p
        style={{
          color: token.colorTextSecondary,
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          marginBottom: token.margin,
        }}
      >
        Before we begin, please provide your contact details so our team can
        follow up with your quotation.
      </p>
      <Form
        form={form}
        layout="vertical"
        name="contact_form"
        style={{
          marginTop: token.marginLG,
        }}
      >
        <Form.Item
          name="name"
          label={
            <span
              style={{
                color: token.colorText,
                fontWeight: token.fontWeightMedium,
              }}
            >
              Your Name
            </span>
          }
          rules={[{ required: true, message: "Please input your name!" }]}
        >
          <Input
            placeholder="Enter your full name"
            styles={{
              input: inputStyles,
            }}
          />
        </Form.Item>
        <Form.Item
          name="email"
          label={
            <span
              style={{
                color: token.colorText,
                fontWeight: token.fontWeightMedium,
              }}
            >
              Your Email
            </span>
          }
          rules={[
            {
              required: true,
              message: "Please input a valid email!",
            },
            {
              validator: (_, value) => {
                if (!value) return Promise.reject();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?\d{7,15}$/;
                return emailRegex.test(value) || phoneRegex.test(value)
                  ? Promise.resolve()
                  : Promise.reject("Enter a valid email or phone number");
              },
            },
          ]}
        >
          <Input
            placeholder="Enter your email address or phone number"
            styles={{
              input: {
                ...inputStyles,
              },
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ContactModal;
