import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Spin,
  Typography,
  Button,
  Tag,
  Card,
  Divider,
  Grid,
  Space,
  theme,
  Modal,
  Form,
  Input,
  message,
  Radio,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  MessageOutlined,
  TeamOutlined,
  BulbOutlined,
  EnvironmentOutlined,
  PhoneOutlined
} from "@ant-design/icons";
import axios from "axios";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { FaRegHandshake } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;
const { useToken } = theme;

const SmartCityDemoDetail: React.FC = () => {
  const { id } = useParams();
  const [demo, setDemo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [engagementModalVisible, setEngagementModalVisible] = useState<boolean>(false);
  const [engagementLoading, setEngagementLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const { token } = useToken();
  const navigate = useNavigate();
  const [selectedEngagementType, setSelectedEngagementType] =
    useState<string>("partner");

  const engagementOptions = useMemo(
    () => [
      {
        value: "invest",
        label: "Invest",
        description: "Explore investment opportunities",
        icon: <FaMoneyBillTrendUp />,
        color: "var(--terracotta-clay)",
      },
      {
        value: "participate",
        label: "Participate",
        description: "Engage as a participant",
        icon: <TeamOutlined />,
        color: "var(--baobab-emerald)",
      },
      {
        value: "learn",
        label: "Learn",
        description: "Request more information",
        icon: <BulbOutlined />,
        color: "var(--ochre-yellow)",
      },
      {
        value: "collaborate",
        label: "Collaborate",
        description: "Offer technical collaboration",
        icon: <FaRegHandshake />,
        color: "var(--onyx-black)",
      },
    ],
    []
  );

  const fetchDemoDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDemo(null);

    try {
      const baseURL =
        import.meta.env.VITE_API_BASE_URL ||
        "https://api.qsi.africa/api";
      const response = await axios.get(`${baseURL}/submit/demos/${id}`);
      setDemo(response.data);
    } catch (err: any) {
      setError("Could not load demonstrator details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleEngagementSubmit = useCallback(
    async (values: any) => {
      setEngagementLoading(true);
      try {
        const baseURL =
          import.meta.env.VITE_API_BASE_URL ||
          "https://api.qsi.africa/api";

        const payload = {
          pilotKey: id,
          pilotTitle: demo?.title,
          engagementType: values.engagementType,
          customIntent: values.customIntent,
          message: values.message,
          contactName: values.contactName,
          contactEmail: values.contactEmail,
          contactPhone: values.contactPhone,
          timestamp: new Date().toISOString(),
        };

        await axios.post(`${baseURL}/submit/pilot-engagement`, payload);
        message.success("Submission successful!");
        setEngagementModalVisible(false);
        form.resetFields();
      } catch (error) {
        message.error("Failed to submit request.");
      } finally {
        setEngagementLoading(false);
      }
    },
    [id, demo?.title, form]
  );

  const openEngagementModal = useCallback(() => {
    setEngagementModalVisible(true);
  }, []);

  const closeEngagementModal = useCallback(() => {
    setEngagementModalVisible(false);
    form.resetFields();
    setSelectedEngagementType("invest");
  }, [form]);

  const handleEngagementTypeChange = useCallback(
    (optionValue: string) => {
      setSelectedEngagementType(optionValue);
      form.setFieldValue("engagementType", optionValue);
    },
    [form]
  );

  useEffect(() => {
    if (id) {
      fetchDemoDetail();
    }
  }, [fetchDemoDetail, id]);

  const styles = useMemo(() => {
    return {
      markdown: {
        h3: (props: any) => (
          <Title level={3} style={{ marginTop: '48px', marginBottom: '24px', textTransform: 'uppercase' }} {...props} />
        ),
        h4: (props: any) => (
          <Title level={4} style={{ marginTop: '32px', marginBottom: '16px', textTransform: 'uppercase' }} {...props} />
        ),
        p: (props: any) => <Paragraph style={{ fontSize: '18px', lineHeight: '1.8', marginBottom: '24px', color: 'var(--onyx-black)' }} {...props} />,
        li: (props: any) => <li style={{ fontSize: '18px', marginBottom: '12px' }} {...props} />,
        strong: (props: any) => <strong style={{ fontWeight: 900 }} {...props} />,
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh", background: "var(--canvas-white)" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !demo) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh", background: "var(--canvas-white)", flexDirection: 'column', padding: '0 5%' }}>
        <Title level={2} style={{ color: 'var(--terracotta-clay)' }}>{error || "Demonstrator Not Found"}</Title>
        <Button className="afro-button" onClick={() => navigate("/demos")}>Back to Demos</Button>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--canvas-white)", minHeight: "100vh" }}>
      {/* Detail Hero */}
      <div 
        className="pattern-mudcloth"
        style={{
          padding: "120px 5% 60px 5%",
          borderBottom: "2px solid var(--onyx-black)",
          position: "relative"
        }}
      >
        <div className="container" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
            <Button 
              onClick={() => navigate("/demos")} 
              className="afro-button"
              icon={<ArrowLeftOutlined />}
            >
              Back
            </Button>
            <Tag 
              style={{ 
                margin: 0, 
                borderRadius: 0, 
                padding: '8px 16px',
                border: '2px solid var(--onyx-black)',
                background: demo.status === 'ACTIVE' ? 'var(--baobab-emerald)' : 'var(--ochre-yellow)',
                color: 'white',
                fontFamily: 'var(--font-accent)',
                fontSize: '12px',
                fontWeight: 900
              }}
            >
              {demo.status || "PROPOSED"}
            </Tag>
          </div>

          <Title
            level={1}
            className="reveal-up"
            style={{ 
              fontSize: "clamp(32px, 6vw, 80px)", 
              margin: "0 0 24px 0",
              color: "var(--onyx-black)",
              textTransform: 'uppercase'
            }}
          >
            {demo.title}
          </Title>

          {demo.city && (
            <div className="reveal-up" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <EnvironmentOutlined style={{ color: 'var(--terracotta-clay)', fontSize: '20px' }} />
              <span className="eyebrow" style={{ margin: 0 }}>{demo.city}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container section-py">
        <Row gutter={[64, 64]}>
          <Col xs={24} lg={16}>
            <article className="reveal-up">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={styles.markdown}
              >
                {demo.expandedView || demo.shortDescription}
              </ReactMarkdown>
            </article>
          </Col>

          <Col xs={24} lg={8}>
            <div className="reveal-up" style={{ position: 'sticky', top: '120px' }}>
              <div 
                className="geometric-card pattern-dots" 
                style={{ 
                  border: '3px solid var(--onyx-black)', 
                  padding: '40px',
                  background: 'var(--canvas-white)',
                  boxShadow: '8px 8px 0px var(--onyx-black)'
                }}
              >
                <div 
                  style={{ 
                    height: '6px', 
                    width: '100%', 
                    background: 'repeating-linear-gradient(to right, #0B6138 0, #0B6138 16px, #D15B35 16px, #D15B35 32px, #E2B142 32px, #E2B142 48px, #4D7A51 48px, #4D7A51 64px, #111111 64px, #111111 80px)',
                    marginBottom: '24px',
                    border: '1px solid var(--onyx-black)'
                  }} 
                />
                <span className="eyebrow" style={{ color: 'var(--baobab-emerald)' }}>Participation</span>
                <Title level={3} style={{ marginBottom: '24px', textTransform: 'uppercase', fontWeight: 900 }}>ENGAGE WITH THE DEMO</Title>
                <Paragraph style={{ marginBottom: '32px', fontSize: '16px' }}>
                  Join us in shaping the future of this demonstrator. We are looking for partners, investors, and participants.
                </Paragraph>
                <Button 
                  className="afro-button primary" 
                  style={{ width: '100%' }}
                  onClick={openEngagementModal}
                >
                  I AM INTERESTED
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Engagement Modal */}
      <Modal
        title={null}
        open={engagementModalVisible}
        onCancel={closeEngagementModal}
        footer={null}
        width={800}
        destroyOnClose
        className="afro-bauhaus-modal"
        centered
        bodyStyle={{ padding: 0 }}
      >
        <div 
          style={{ 
            padding: '40px', 
            border: '4px solid var(--onyx-black)',
            background: 'var(--canvas-white)',
            boxShadow: '12px 12px 0px var(--onyx-black)'
          }}
        >
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <span className="eyebrow" style={{ color: 'var(--baobab-emerald)' }}>Project Engagement</span>
            <Title level={2} style={{ margin: '4px 0 0 0', textTransform: 'uppercase', fontSize: '28px', fontWeight: 900 }}>
              {demo.title}
            </Title>
            <div style={{ height: '4px', width: '40px', background: 'var(--terracotta-clay)', margin: '16px auto 0 auto' }} />
          </div>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEngagementSubmit}
            initialValues={{ engagementType: selectedEngagementType }}
          >
            <Form.Item
              name="engagementType"
              label={<span className="eyebrow">Engagement Pathway</span>}
              rules={[{ required: true }]}
              style={{ marginBottom: '24px' }}
            >
              <Radio.Group style={{ width: "100%" }}>
                <Row gutter={[12, 12]}>
                  {engagementOptions.map((option) => (
                    <Col span={6} key={option.value}>
                      <div
                        onClick={() => handleEngagementTypeChange(option.value)}
                        style={{
                          border: `3px solid ${selectedEngagementType === option.value ? 'var(--baobab-emerald)' : 'var(--onyx-black)'}`,
                          padding: '16px 8px',
                          cursor: 'pointer',
                          background: selectedEngagementType === option.value ? 'var(--papyrus-off-white)' : 'white',
                          height: '100%',
                          textAlign: 'center',
                          boxShadow: selectedEngagementType === option.value ? '4px 4px 0px var(--baobab-emerald)' : 'none',
                          transition: 'all 0.1s ease'
                        }}
                      >
                        <div style={{ color: option.color, fontSize: '24px', marginBottom: '8px' }}>{option.icon}</div>
                        <Text strong style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--onyx-black)' }}>{option.label}</Text>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Radio.Group>
            </Form.Item>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '3px solid var(--onyx-black)' }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="contactName" label={<span className="eyebrow">Full Name</span>} rules={[{ required: true }]} style={{ marginBottom: '16px' }}>
                    <Input className="afro-input compact" placeholder="Full Name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="contactEmail" label={<span className="eyebrow">Email</span>} rules={[{ required: true, type: 'email' }]} style={{ marginBottom: '16px' }}>
                    <Input className="afro-input compact" placeholder="Email" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item 
                name="message" 
                label={<span className="eyebrow">Brief Intent</span>} 
                rules={[{ required: true }]}
                style={{ marginBottom: '24px' }}
              >
                <Input.TextArea rows={3} className="afro-input compact" placeholder="Describe your collaboration goals..." />
              </Form.Item>

              <div style={{ display: "flex", gap: "12px" }}>
                <Button 
                  className="afro-button primary" 
                  htmlType="submit" 
                  loading={engagementLoading}
                  style={{ flex: 2, height: '52px', fontSize: '14px' }}
                >
                  SUBMIT REQUEST
                </Button>
                <Button 
                  className="afro-button" 
                  onClick={closeEngagementModal}
                  style={{ flex: 1, height: '52px' }}
                >
                  CANCEL
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .afro-input {
          border: 3px solid var(--onyx-black) !important;
          border-radius: 0 !important;
          padding: 16px 20px !important;
          font-family: var(--font-body) !important;
          background: var(--canvas-white) !important;
          font-size: 16px !important;
        }
        .afro-input:focus {
          border-color: var(--baobab-emerald) !important;
          box-shadow: 4px 4px 0px var(--onyx-black) !important;
        }
        .afro-bauhaus-modal .ant-modal-content {
          border-radius: 0 !important;
          padding: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
        }
        .afro-bauhaus-modal .ant-modal-close {
          top: 24px;
          right: 24px;
          color: var(--onyx-black);
        }
      `}} />
    </div>
  );
};

export default SmartCityDemoDetail;
