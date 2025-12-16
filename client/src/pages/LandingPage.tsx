import React, { useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
 } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Modal,
  Input,
  Button,
  Form,
  ConfigProvider,
  theme,
  Space,
  Spin,
  Drawer,
  Menu,
} from "antd";
import Lottie from "lottie-react";
import {
  ArrowRightOutlined,
  ToolOutlined,
  RobotOutlined,
  HeartOutlined,
  EyeOutlined,
  CustomerServiceOutlined,
  RocketOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import animationData from "../assets/animations/meditate_animation.json";
import lightLogo from "../assets/images/qsi_light_logo.png";
import darkLogo from "../assets/images/QSI.png";
import { useThemeMode } from "../hooks/useTheme";
import PilotsGrid from "../components/PilotsPagination";
import { LuAudioWaveform, LuFrame } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const { Title, Text, Paragraph, Link } = Typography;
const { useToken } = theme;

// Constants
const MODULES = [
  {
    key: "pilots",
    title: "QSI Concepts",
    description: "Culture engineered for the future.",
    icon: <RocketOutlined />,
  },
  {
    key: "infrastructure",
    title: "Smart Infrastructure",
    description: "Where intention becomes structure.",
    icon: <ToolOutlined />,
  },
  {
    key: "healing",
    title: "Healing & Therapy",
    description: "Fix the mind that builds.",
    icon: <HeartOutlined />,
  },
  {
    key: "vision",
    title: "Vision Space",
    description: "Turning vision into value.",
    icon: <EyeOutlined />,
  },
  {
    key: "frequency",
    title: "Frequency Scan",
    description: "Know your frequency.",
    icon: <LuAudioWaveform />,
  },
  {
    key: "frameworks",
    title: "QSI Frameworks",
    description: "Blueprints for a coherent continent.",
    icon: <LuFrame />,
  },
];

// const NAV_LINKS = ["About Us", "Contact Us"];
const NAV_LINKS = ["About Us"];

const MOBILE_BREAKPOINT = 768;

// Custom Hooks
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

const useScrollDetection = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isScrolled;
};

// Optimized Components
const ContactModal = React.memo(({ open, onCancel, onFinish }) => {
  const [form] = Form.useForm();
  const { token } = useToken();

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      onFinish(values);
      form.resetFields();
    } catch (error) {
      console.log("Validation failed:", error);
    }
  }, [form, onFinish]);

  const modalStyles = useMemo(
    () => ({
      content: {
        background: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary,
      },
    }),
    [token]
  );

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0, color: token.colorText }}>
          Engage QSI
        </Title>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Submit
        </Button>,
      ]}
      styles={modalStyles}
    >
      <Paragraph style={{ color: token.colorTextSecondary }}>
        Please provide your contact details to begin the process for Smart
        Infrastructure or Healing & Therapy.
      </Paragraph>
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter your name" }]}
        >
          <Input placeholder="Enter your name" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email or Phone"
          rules={[
            {
              required: true,
              message: "Please enter an email or phone number",
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
          <Input type="email" placeholder="Enter your email or phone number" />
        </Form.Item>
      </Form>
    </Modal>
  );
});

const CustomHeader = React.memo(() => {
  const { token } = useToken();
  const isScrolled = useScrollDetection();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const { width: windowWidth } = useWindowSize();
  const { mode } = useThemeMode();
  const navigate = useNavigate();

  const isMobile = windowWidth <= MOBILE_BREAKPOINT;

  const handleNavClick = useCallback(
    (link) => {
      if (link === "Modules" || link === "Pilots") {
        const sectionId = link.toLowerCase().replace(" ", "-");
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: "smooth" });
      } else {
        const sectionId = link.toLowerCase().replace(" ", "-");
        navigate(`/${sectionId}`);
      }
      setDrawerOpen(false);
    },
    [navigate]
  );

  const menuItems = useMemo(
    () =>
      NAV_LINKS.map((link) => ({
        key: link,
        label: (
          <div
            onClick={() => handleNavClick(link)}
            style={{
              padding: `${token.paddingXS}px 0`,
              color: token.colorText,
              fontSize: token.fontSizeLG,
              cursor: "pointer",
            }}
          >
            {link}
          </div>
        ),
      })),
    [token, handleNavClick]
  );

  const headerStyle = useMemo(
    () => ({
      position: "fixed",
      top: 0,
      width: "100%",
      zIndex: 1000,
      padding: `${token.paddingSM}px ${token.paddingMD}px`,
      backgroundColor: token.colorGreenBackground,
      backdropFilter: isScrolled ? "blur(8px)" : "none",
      transition: `all ${token.motionDurationMid} ${token.motionEaseInOut}`,
      borderBottom: isScrolled
        ? `1px solid ${token.colorBorderSecondary}`
        : "none",
      display: "flex",
      justifyContent: "center",
    }),
    [token, isScrolled]
  );

  return (
    <>
      <div style={headerStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            maxWidth: "1200px",
            height: "fit-content",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: token.marginXXS,
            }}
          >
            <img
              src={mode === "dark" ? lightLogo : darkLogo}
              style={{
                width: 25,
                height: 25,
              }}
              alt="QSI Logo"
            />
            <Text
              strong
              style={{ fontSize: token.fontSizeLG, color: token.colorText }}
            >
              QSI
            </Text>
            <Text style={{ fontSize: 12, color: token.colorPrimary }}>
              A Living Intelligence Framework
            </Text>
          </div>

          {!isMobile && (
            <Space size="large">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link}
                  onClick={() => handleNavClick(link)}
                  style={{
                    color: token.colorTextSecondary,
                    fontWeight: token.fontWeightMedium,
                    cursor: "pointer",
                  }}
                >
                  {link}
                </Link>
              ))}
            </Space>
          )}

          {isMobile && (
            <Button
              type="text"
              icon={drawerOpen ? <CloseOutlined /> : <MenuOutlined />}
              onClick={() => setDrawerOpen(!drawerOpen)}
              style={{
                color: token.colorText,
                border: "none",
                background: "transparent",
              }}
            />
          )}
        </div>
      </div>

      <Drawer
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: token.marginXS,
            }}
          >
            <img
              src={mode !== "light" ? lightLogo : darkLogo}
              style={{ width: 32 }}
              alt="QSI Platform Logo"
            />
            <Text
              strong
              style={{ color: token.colorText, fontSize: token.fontSizeLG }}
            >
              QSI
            </Text>
          </div>
        }
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        styles={{
          body: { padding: 0, background: token.colorBgContainer },
          header: {
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          },
        }}
        width={280}
      >
        <Menu
          mode="vertical"
          items={menuItems}
          style={{
            border: "none",
            background: "transparent",
            padding: `${token.padding}px 0`,
          }}
        />
      </Drawer>
    </>
  );
});

const HeroSection = React.memo(() => {
  const { token } = useToken();
  const lottieRef = useRef();
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth <= MOBILE_BREAKPOINT;

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(0.5);
    }
  }, []);

  return (
    <Row
      align="middle"
      gutter={[token.marginLG, token.marginLG]}
      style={{
        marginTop: 80,
        padding: isMobile ? token.padding : token.paddingLG,
        flexDirection: isMobile ? "column-reverse" : "row",
      }}
    >
      <Col xs={24} md={12}>
        <Title
          level={2}
          style={{
            fontSize: isMobile ? token.fontSizeHeading3 : "48px",
            fontWeight: token.fontWeightStrong,
            margin: `0 0 ${token.marginSM}px 0`,
            color: token.colorText,
            lineHeight: 1.2,
            textAlign: isMobile ? "center" : "left",
          }}
        >
          Explore the QSI Modules
        </Title>
        <Paragraph
          style={{
            fontSize: isMobile ? token.fontSize : token.fontSizeLG,
            color: token.colorTextSecondary,
            marginBottom: token.marginLG,
            textAlign: isMobile ? "center" : "left",
          }}
        >
          <ReactMarkdown>
            One interface. Three paths: **Smart Infrastructure**, **Healing &
            Therapy**, and **Vision Space**. Powered by one **Quantum Spiritual
            Intelligence** to bring coherence and alignment to your challenges.
          </ReactMarkdown>
        </Paragraph>
        <div style={{ textAlign: isMobile ? "center" : "left" }}>
          <a href="#modules">
            <Button
              type="primary"
              size="large"
              style={{
                background: token.colorPrimary,
                borderColor: token.colorPrimary,
                fontWeight: token.fontWeightStrong,
                height: 48,
                boxShadow: token.boxShadowSecondary,
              }}
            >
              Begin Your Solution
            </Button>
          </a>
        </div>
      </Col>
      <Col
        xs={24}
        md={12}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: isMobile ? 300 : 400,
            aspectRatio: "1 / 1",
          }}
        >
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop={true}
          />
        </div>
      </Col>
    </Row>
  );
});

const ServicesModulesSection = React.memo(
  ({ handleModuleClick, hoveredModule, setHoveredModule }) => {
    const { token } = useToken();
    const { width: windowWidth } = useWindowSize();
    const { mode } = useThemeMode();
    const isMobile = windowWidth <= MOBILE_BREAKPOINT;

    const getCardStyles = useCallback(
      (module) => ({
        background: token.colorBgBase,
        borderRadius: token.borderRadiusLG,
        cursor: "pointer",
        transition: `all 0.3s ease-in-out`,
        minHeight: 100,
        boxShadow:
          hoveredModule === module.key
            ? token.boxShadowSecondary
            : token.boxShadow,
        transform:
          hoveredModule === module.key
            ? "translateY(-4px) scale(1.02)"
            : "translateY(0) scale(1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        textAlign: "center",
        width: "100%",
        border:
          mode === "dark"
            ? `0.2px solid ${token.colorCardBorder}`
            : `1px solid ${token.colorCardBorder}`,
      }),
      [token, hoveredModule, mode]
    );

    return (
      <div
        id="modules"
        style={{
          padding: isMobile ? token.paddingXS : token.paddingLG,
          width: "100%",
          backgroundColor: token.navyLighter,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Row gutter={[token.margin, token.margin]}>
          {MODULES.map((module) => (
            <Col key={module.key} xs={24} sm={12} lg={8}>
              <Card
                onClick={() => handleModuleClick(module.key)}
                onMouseEnter={() => setHoveredModule(module.key)}
                onMouseLeave={() => setHoveredModule(null)}
                style={getCardStyles(module)}
                bodyStyle={{
                  padding: isMobile ? token.paddingSM : token.padding,
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "middle",
                  flexDirection: "column",
                }}
                bordered
                hoverable
              >
                <Row
                  gutter={[12, 12]}
                  justify="space-between"
                  align="middle"
                  style={{ padding: "0 12px" }}
                >
                  <Text
                    style={{
                      fontSize: isMobile ? 24 : 32,
                      color: token.colorText,
                    }}
                  >
                    {module.icon}
                  </Text>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    <Title
                      level={isMobile ? 5 : 4}
                      style={{ margin: 0, color: token.colorText }}
                    >
                      {module.title}
                    </Title>
                    <Paragraph
                      style={{
                        color: token.colorTextTertiary,
                        fontSize: isMobile ? token.fontSizeSM : token.fontSize,
                        margin: 0,
                      }}
                    >
                      {module.description}
                    </Paragraph>
                  </div>
                  <ArrowRightOutlined />
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }
);

// Main Component
const LandingPage: React.FC = () => {
  const [hoveredModule, setHoveredModule] = useState<any>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedModuleKey, setSelectedModuleKey] = useState<any>(null);
  const { token } = useToken();
  const navigate = useNavigate();
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth <= MOBILE_BREAKPOINT;
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleMouseMove = (e: React.FormEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleModuleClick = (moduleKey) => {
    switch (moduleKey) {
      case "infrastructure":
        // if (isAuthenticated) {
        // Logged-in: Bypass modal, pass user info
        navigate(`/chat/infrastructure`, {
          state: { contactInfo: { name: user?.name, email: user?.email } },
        });
        // } else {
        //   // Guest: Show modal
        //   setSelectedModuleKey(moduleKey);
        //   setModalOpen(true);
        // }
        break;

      case "healing":
        if (isAuthenticated) {
          // Logged-in: Bypass modal, pass user info
          navigate(`/chat/healing`, {
            state: { contactInfo: { name: user.name, email: user.email } },
          });
        } else {
          // Guest: Force login/register
          navigate("/login", {
            state: {
              from: location,
              message: "Please log in or register to access Healing & Therapy.",
            },
          });
        }
        break;

      case "vision":
        // Vision Space is accessible to all (but requires login for onboarding flow)
        navigate(`/chat/vision`);
        break;

      case "pilots":
        // Pilots list page is accessible to all
        navigate("/pilots");
        break;

      case "frameworks":
        // frequency is accessible to all (but requires login for onboarding flow)
        navigate(`/frameworks`);
        break;

      case "frequency":
        // frequency page is accessible to all
        navigate("/frequency");
        break;

      default:
        // Fallback for general modal open (e.g., from header)
        setSelectedModuleKey(null);
        setModalOpen(true);
    }
  };

  const handleModalFinish = (contactInfo) => {
    setModalOpen(false);
    if (selectedModuleKey) {
      // This is now only for GUEST + INFRASTRUCTURE
      navigate(`/chat/${selectedModuleKey}`, { state: { contactInfo } });
    } else {
      // Fallback for general quote requests (e.g., from Header or Hero CTA)
      console.log("General Proposal Request Submitted:", contactInfo);
      // You could add an API call here to submit a general inquiry
    }
    setSelectedModuleKey(null);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setSelectedModuleKey(null);
  };

  const backgroundGradient = useMemo(
    () =>
      `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${
        token.colorPrimary
      }20 20%, ${token.colorBgContainer} 60%),
     radial-gradient(circle at ${100 - mousePosition.x}% ${
        100 - mousePosition.y
      }%, ${token.colorSuccess}10 0%, ${token.colorBgContainer} 40%),
     ${token.colorBgContainer}`,
    [mousePosition, token]
  );

  return (
    <div
      style={{
        width: "100%",
        background: backgroundGradient,
        position: "relative",
        marginTop: isMobile ? "60px" : 0,
        minHeight: "100vh",
      }}
    >
      <CustomHeader />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: ` ${isMobile ? "12px" : "60px"} ${token.paddingLG}px`,
        }}
      >
        <ServicesModulesSection
          handleModuleClick={handleModuleClick}
          hoveredModule={hoveredModule}
          setHoveredModule={setHoveredModule}
        />
      </div>

      <ContactModal
        open={modalOpen}
        onCancel={handleModalCancel}
        onFinish={handleModalFinish}
      />

      <div style={{ textAlign: "center", paddingTop: "40px" }}>
        <Text
          style={{ color: token.colorTextTertiary, fontSize: token.fontSizeSM }}
        >
          © {new Date().getFullYear()} Pan-African Engineers
        </Text>
      </div>
    </div>
  );
};

export default LandingPage;
