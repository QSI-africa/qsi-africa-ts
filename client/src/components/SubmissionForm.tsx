// src/components/SubmissionForm.jsx
import React, { useState  } from 'react';
import { axios } from "axios";
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Spin,
  App as AntApp,
  Alert,
  theme,
} from "antd";

const { Option } = Select;
const { TextArea } = Input;
const { useToken } = theme;

const SubmissionForm: React.FC = () => {
  const { message } = AntApp.useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedModule, setSelectedModule] = useState<string>("infrastructure");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [form] = Form.useForm();
  const { token } = useToken();

  const handleModuleChange = (value) => {
    setSelectedModule(value);
    setApiResponse(null);
    form.resetFields(["description", "contactInfo"]);
  };

  const onFinish = async (values) => {
    setLoading(true);
    setApiResponse(null);
    const endpointMap = {
      infrastructure: "/infrastructure",
      healing: "/healing",
      vision: "/vision",
    };

    const payloadMap = {
      infrastructure: {
        description: values.description,
        contactInfo: values.contactInfo,
      },
      healing: {
        struggleDescription: values.description,
        contactInfo: values.contactInfo,
      },
      vision: {
        visionDescription: values.description,
        contactInfo: values.contactInfo,
      },
    };

    try {
      const endpoint = `https://api.qsi.africa/apisubmit${endpointMap[selectedModule]}`;
      const response = await axios.post(endpoint, payloadMap[selectedModule]);

      message.success("Your submission has been received.");
      setApiResponse(response.data);
      form.resetFields();
    } catch (error) {
      console.error("Submission failed:", error);
      message.error("There was an error with your submission.");
    } finally {
      setLoading(false);
    }
  };

  const getFormLabel = () => {
    switch (selectedModule) {
      case "healing":
        return "Describe your internal state or struggle...";
      case "vision":
        return "Describe your vision or problem...";
      case "infrastructure":
      default:
        return "Describe your infrastructure need (Water, Road, Housing, etc.)...";
    }
  };

  const cardStyles = {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowSecondary,
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
    <>
      <Card
        title="Submit your problem. Receive your solution."
        bordered={false}
        styles={{
          body: {
            background: token.colorBgContainer,
            padding: token.paddingLG,
          },
          header: {
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            color: token.colorText,
            fontSize: token.fontSizeHeading4,
            fontWeight: token.fontWeightStrong,
          },
        }}
        style={cardStyles}
      >
        <Spin spinning={loading}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              label={
                <span
                  style={{
                    color: token.colorText,
                    fontWeight: token.fontWeightMedium,
                  }}
                >
                  Select Module
                </span>
              }
            >
              <Select
                defaultValue="infrastructure"
                onChange={handleModuleChange}
                style={{
                  width: "100%",
                }}
                styles={{
                  selector: {
                    background: token.colorBgContainer,
                    border: `1px solid ${token.colorBorder}`,
                    borderRadius: token.borderRadius,
                    color: token.colorText,

                    "&:hover": {
                      borderColor: token.colorPrimaryHover,
                    },
                  },
                }}
              >
                <Option value="infrastructure">Smart Infrastructure</Option>
                <Option value="healing">Healing & Therapy</Option>
                <Option value="vision">Vision Space</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label={
                <span
                  style={{
                    color: token.colorText,
                    fontWeight: token.fontWeightMedium,
                  }}
                >
                  {getFormLabel()}
                </span>
              }
              rules={[{ required: true, message: "This field is required." }]}
            >
              <TextArea
                rows={6}
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadius,
                  color: token.colorText,
                  fontSize: token.fontSize,
                  resize: "vertical",
                }}
                onFocus={(e: React.FormEvent) => {
                  e.target.style.borderColor = token.colorPrimary;
                  e.target.style.boxShadow = `0 0 0 2px ${token.colorPrimaryBg}`;
                }}
                onBlur={(e: React.FormEvent) => {
                  e.target.style.borderColor = token.colorBorder;
                  e.target.style.boxShadow = "none";
                }}
              />
            </Form.Item>

            <Form.Item
              name="contactInfo"
              label={
                <span
                  style={{
                    color: token.colorText,
                    fontWeight: token.fontWeightMedium,
                  }}
                >
                  Your Email or Phone Number
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Please provide your contact information.",
                },
              ]}
            >
              <Input
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadius,
                  color: token.colorText,
                  fontSize: token.fontSize,
                }}
                onFocus={(e: React.FormEvent) => {
                  e.target.style.borderColor = token.colorPrimary;
                  e.target.style.boxShadow = `0 0 0 2px ${token.colorPrimaryBg}`;
                }}
                onBlur={(e: React.FormEvent) => {
                  e.target.style.borderColor = token.colorBorder;
                  e.target.style.boxShadow = "none";
                }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{
                  height: token.controlHeightLG,
                  background: token.colorPrimary,
                  borderColor: token.colorPrimary,
                  borderRadius: token.borderRadius,
                  fontSize: token.fontSize,
                  fontWeight: token.fontWeightStrong,
                  boxShadow: token.boxShadowSecondary,

                  "&:hover": {
                    background: token.colorPrimaryHover,
                    borderColor: token.colorPrimaryHover,
                    transform: "translateY(-1px)",
                    boxShadow: token.boxShadow,
                  },

                  "&:active": {
                    background: token.colorPrimaryActive,
                    borderColor: token.colorPrimaryActive,
                    transform: "translateY(0)",
                  },
                }}
                onMouseEnter={(e: React.FormEvent) => {
                  e.target.style.background = token.colorPrimaryHover;
                  e.target.style.borderColor = token.colorPrimaryHover;
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = token.boxShadow;
                }}
                onMouseLeave={(e: React.FormEvent) => {
                  e.target.style.background = token.colorPrimary;
                  e.target.style.borderColor = token.colorPrimary;
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = token.boxShadowSecondary;
                }}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>

      {apiResponse && apiResponse.generatedPlan && (
        <Alert
          message="Your Liberation Plan"
          description={
            <div
              style={{
                whiteSpace: "pre-wrap",
                color: token.colorText,
                fontSize: token.fontSize,
                lineHeight: token.lineHeight,
              }}
            >
              {apiResponse.generatedPlan}
            </div>
          }
          type="success"
          showIcon
          style={{
            marginTop: token.marginLG,
            background: token.colorSuccessBg,
            border: `1px solid ${token.colorSuccessBorder}`,
            borderRadius: token.borderRadiusLG,
            color: token.colorText,
          }}
        />
      )}
    </>
  );
};

export default SubmissionForm;
