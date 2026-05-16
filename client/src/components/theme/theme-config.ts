import { ThemeConfig, theme } from "antd";

/**
 * WhatsApp-Web Inspired Smart Infrastructure Platform
 * Theme Configuration (Dark-first, Gold-accented)
 */
export const lightTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm, // Enforce dark algorithm as primary
  token: {
    // Primary Brand Colors
    colorPrimary: "#D4AF37", // Accent Gold
    colorInfo: "#D4AF37",
    colorSuccess: "#198754", // Success Green
    colorWarning: "#F59E0B",
    colorError: "#EF4444",
    
    // Backgrounds
    colorBgContainer: "#111827", // Secondary Surface
    colorBgElevated: "#1F2937",
    colorBgLayout: "#0B0F19", // Primary Background
    
    // Text
    colorText: "#F9FAFB",
    colorTextSecondary: "#9CA3AF",
    colorTextTertiary: "#6B7280",
    
    // Borders
    colorBorder: "rgba(255, 255, 255, 0.06)",
    colorBorderSecondary: "rgba(255, 255, 255, 0.04)",
    
    // Layout
    borderRadius: 14,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    
    // Shadows
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  components: {
    Button: {
      borderRadius: 14,
      controlHeight: 40,
      fontWeight: 600,
      colorPrimary: "#D4AF37",
      colorTextLightSolid: "#000000", // Dark text on gold buttons
      colorBgContainer: "rgba(255, 255, 255, 0.06)",
    },
    Input: {
      borderRadius: 12,
      colorBgContainer: "#0B0F19",
      colorBorder: "rgba(255, 255, 255, 0.06)",
      activeBorderColor: "#D4AF37",
      hoverBorderColor: "rgba(212, 175, 55, 0.5)",
    },
    Card: {
      borderRadius: 20,
      colorBgContainer: "#111827",
      colorBorderSecondary: "rgba(255, 255, 255, 0.06)",
      boxShadowTertiary: "none",
    },
    Layout: {
      headerBg: "#0B0F19",
      bodyBg: "#0B0F19",
      triggerBg: "#111827",
    },
    Menu: {
      colorItemBgSelected: "rgba(212, 175, 55, 0.12)",
      colorItemTextSelected: "#D4AF37",
      colorItemText: "#9CA3AF",
      colorItemTextHover: "#F9FAFB",
      colorActiveBarHeight: 0,
    },
    Modal: {
      colorBgElevated: "#111827",
      borderRadiusLG: 24,
    },
    Typography: {
      colorTextHeading: "#F9FAFB",
      colorText: "#F9FAFB",
      colorTextDescription: "#9CA3AF",
    },
    Tabs: {
      colorText: "#9CA3AF",
      colorTextSelected: "#D4AF37",
      colorBorderSecondary: "rgba(255, 255, 255, 0.06)",
      inkBarColor: "#D4AF37",
    }
  },
};
