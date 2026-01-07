// admin-client/src/components/AdminLayout.jsx
import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Typography,
  Drawer,
  Grid,
  theme,
  Space,
} from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  HeartOutlined,
  BulbOutlined,
  RocketOutlined,
  MedicineBoxOutlined,
  MessageOutlined,
  UserOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";

const { useToken } = theme;
const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const { token } = useToken();

  // State for mobile drawer and sider collapse
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  // Determine if we're on mobile
  const isMobile = !screens.lg;
  const isTablet = !screens.xl && screens.md;

  // Auto-close drawer when route changes on mobile
  useEffect(() => {
    if (mobileDrawerVisible && isMobile) {
      setMobileDrawerVisible(false);
    }
  }, [location.pathname, isMobile]);

  // Auto-collapse sider on tablet/mobile
  useEffect(() => {
    if (isMobile) {
      setSiderCollapsed(true);
    } else if (isTablet) {
      setSiderCollapsed(false);
    } else {
      setSiderCollapsed(false);
    }
  }, [isMobile, isTablet]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Define all possible menu items
  const allMenuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: <Link to="/">Task Dashboard</Link>,
    },
    {
      key: "/healing-inquiries",
      icon: <HeartOutlined />,
      label: <Link to="/healing-inquiries">Healing Inquiries</Link>,
      roles: ["ADMIN", "SUPER_USER"],
    },
    {
      key: "/vision-submissions",
      icon: <BulbOutlined />,
      label: <Link to="/vision-submissions">Vision Submissions</Link>,
      roles: ["ADMIN", "SUPER_USER"],
    },

    // Grouping content management
    {
      key: "content-group",
      label: "Content Management",
      type: "group",
      roles: ["ADMIN", "SUPER_USER"],
    },
    {
      key: "/pilots",
      icon: <RocketOutlined />,
      label: <Link to="/pilots">Pilot Projects</Link>,
      roles: ["ADMIN", "SUPER_USER"],
    },
    {
      key: "/healing-packages",
      icon: <MedicineBoxOutlined />,
      label: <Link to="/healing-packages">Healing Packages</Link>,
      roles: ["ADMIN", "SUPER_USER"],
    },
    {
      key: "/healing-suggestions",
      icon: <MessageOutlined />,
      label: <Link to="/healing-suggestions">Healing Suggestions</Link>,
      roles: ["ADMIN", "SUPER_USER"],
    },
    {
      key: "/admin/suggestions",
      icon: <BulbOutlined />,
      label: <Link to="/admin/suggestions">Suggestion Management</Link>,
      roles: ["ADMIN", "SUPER_USER"],
    },
    {
        key: "financial-group",
        label: "Financials",
        type: "group",
        roles: ["ADMIN", "SUPER_USER"],
      },
      {
        key: "/invoicing",
        icon: <DollarCircleOutlined />,
        label: <Link to="/invoicing">Invoices & Quotes</Link>,
        roles: ["ADMIN", "SUPER_USER"],
      },
    {
      key: "admin-group",
      label: "Administration",
      type: "group",
      roles: ["ADMIN", "SUPER_USER"],
    },
    {
      key: "/users",
      icon: <TeamOutlined />,
      label: <Link to="/users">User Management</Link>,
      roles: ["ADMIN", "SUPER_USER"],
    },
    {
      key: "/clients",
      icon: <UserOutlined />,
      label: <Link to="/clients">Client Accounts</Link>,
      roles: ["ADMIN", "SUPER_USER"],
    },
    {
      key: "/pilot-enquiries",
      icon: <UserOutlined />,
      label: <Link to="/pilot-enquiries">Framework and Concept Enquiries</Link>,
      roles: ["ADMIN", "SUPER_USER"],
    },
  ];
  // Filter menu items based on the current user's role
  const filteredMenuItems = allMenuItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  // Mobile menu toggle
  const toggleMobileDrawer = () => {
    setMobileDrawerVisible(!mobileDrawerVisible);
  };

  // Sider component for desktop/tablet
  const DesktopSider = () => (
    <Sider
      breakpoint="lg"
      collapsedWidth={isMobile ? "0" : "80"}
      collapsible
      collapsed={siderCollapsed}
      onCollapse={setSiderCollapsed}
      trigger={null}
      style={{
        background: token.colorBgLayout,
        position: isMobile ? "fixed" : "sticky",
        top: 0,
        left: 0,
        height: "100vh",
        zIndex: 1000,
        boxShadow: token.boxShadowSecondary,
        borderRight: `1px solid ${token.colorBorder}`,
      }}
      width={250}
    >
      {/* Sider Header */}
      <div
        style={{
          padding: "8px 16px",
          textAlign: siderCollapsed ? "center" : "left",
          borderBottom: `1px solid ${token.colorBorder}`,
          background: token.colorBgLayout,
        }}
      >
        <Title
          level={4}
          style={{
            color: token.colorTextHeading,
            margin: 0,
            fontSize: siderCollapsed ? "16px" : "18px",
            lineHeight: "1.3",
            fontWeight: 600,
          }}
        >
          {siderCollapsed ? "QSI" : "QSI Admin"}
        </Title>
        {user && !siderCollapsed && (
          <Text
            style={{
              color: token.colorTextSecondary,
              fontSize: token.fontSizeSM,
              display: "block",
              marginTop: "4px",
              fontWeight: 500,
            }}
          >
            {user.role.replace(/_/g, " ")}
          </Text>
        )}
      </div>

      {/* Navigation Menu */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={filteredMenuItems}
        style={{
          background: token.colorBgLayout,
          border: "none",
          marginTop: "8px",
          padding: "8px 0",
        }}
        inlineIndent={16}
      />
    </Sider>
  );

  // Mobile drawer component
  const MobileDrawer = () => (
    <Drawer
      title={
        <div>
          <Title
            level={4}
            style={{
              color: token.colorTextHeading,
              margin: 0,
              fontWeight: 600,
            }}
          >
            QSI Admin
          </Title>
          {user && (
            <Text
              style={{
                color: token.colorTextSecondary,
                fontSize: token.fontSizeSM,
                fontWeight: 500,
              }}
            >
              {user.role.replace(/_/g, " ")}
            </Text>
          )}
        </div>
      }
      placement="left"
      onClose={toggleMobileDrawer}
      open={mobileDrawerVisible}
      styles={{
        body: {
          padding: 0,
          background: token.colorBgContainer,
        },
        header: {
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorder}`,
          padding: "16px 20px",
        },
      }}
      width={280}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={filteredMenuItems}
        style={{
          background: token.colorBgContainer,
          border: "none",
          marginTop: "8px",
          padding: "8px 0",
        }}
        onClick={toggleMobileDrawer}
      />
    </Drawer>
  );

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: token.colorBgLayout,
      }}
    >
      {/* Conditional rendering: Drawer for mobile, Sider for desktop/tablet */}
      {isMobile ? <MobileDrawer /> : <DesktopSider />}

      <Layout
        style={{
          marginLeft: isMobile ? 0 : siderCollapsed ? 80 : 0,
          transition: "margin-left 0.2s ease",
          background: token.colorBgLayout,
        }}
      >
        {/* Main Header */}
        <Header
          style={{
            padding: "0 24px",
            background: token.colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 999,
            borderBottom: `1px solid ${token.colorBorder}`,
            height: 64,
            lineHeight: "64px",
            boxShadow: token.boxShadow,
          }}
        >
          <Space align="center">
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={toggleMobileDrawer}
                style={{
                  color: token.colorText,
                  background: "transparent",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            )}
            <Text
              style={{
                color: token.colorText,
                fontSize: screens.xs ? token.fontSize : token.fontSizeLG,
                fontWeight: 500,
              }}
            >
              Welcome,{" "}
              <span style={{ color: token.colorPrimary, fontWeight: 600 }}>
                {user?.name || user?.email}
              </span>
            </Text>
          </Space>

          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            size={screens.xs ? "small" : "middle"}
            style={{
              fontWeight: token.fontWeightStrong,
            }}
          >
            {screens.xs ? "" : "Logout"}
          </Button>
        </Header>

        {/* Main Content Area */}
        <Content
          style={{
            padding: isMobile ? "16px" : "16px",
            minHeight: "calc(100vh - 64px - 24px)",
            // background: token.colorBgLayout,
          }}
        >
          <div
            style={{
              // background: token.colorBgContainer,
              minHeight: "calc(100vh - 64px - 48px)",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
