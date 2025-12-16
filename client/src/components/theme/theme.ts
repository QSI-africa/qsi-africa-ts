// QSI Platform - Ant Design Theme Configuration
// Based on "A Living Intelligence Framework"
import { theme } from "antd";

export const qsiTheme = {
  token: {
    // Color Palette - Enhanced contrast while maintaining brand colors
    colorPrimary: "#8b5cf6", // Violet glow accent (unchanged)
    colorSuccess: "#10b981", // Emerald (from healing gradient)
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    colorInfo: "#6366f1", // Indigo (from healing gradient)

    // Text colors - Enhanced readability
    colorText: "#ffffff", // White text
    colorTextSecondary: "rgba(255, 255, 255, 0.85)", // Increased contrast
    colorTextTertiary: "rgba(255, 255, 255, 0.65)", // Increased contrast

    // Background colors - Lighter shades for better contrast
    colorBgBase: "#0a0a0a", // Lighter black background
    // colorBgContainer: "#1a1a1a", // Enhanced contrast
    colorBgElevated: "#242424", // Lighter elevated surfaces
    colorBgLayout: "#0f0f0f", // Slightly lighter layout background

    // Border colors - More visible
    colorBorder: "rgba(139, 92, 246, 0.4)", // Enhanced violet border
    colorBorderSecondary: "rgba(255, 255, 255, 0.2)", // More visible borders

    // Typography (unchanged)
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 16,
    fontSizeHeading1: 48,
    fontSizeHeading2: 36,
    fontSizeHeading3: 28,
    fontSizeHeading4: 22,
    fontSizeHeading5: 18,
    lineHeight: 1.6,
    lineHeightHeading1: 1.2,
    lineHeightHeading2: 1.3,

    // Motion - Slow, grounded, intentional (unchanged)
    motionUnit: 0.15,
    motionBase: 0.3,
    motionEaseInOut: "cubic-bezier(0.645, 0.045, 0.355, 1)",
    motionEaseOut: "cubic-bezier(0.215, 0.61, 0.355, 1)",
    motionEaseIn: "cubic-bezier(0.55, 0.055, 0.675, 0.19)",

    // Layout - Clean, spacious (unchanged)
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 4,
    controlHeight: 44,
    controlHeightLG: 52,
    controlHeightSM: 36,

    // Spacing - Calm, intentional (unchanged)
    padding: 16,
    paddingLG: 24,
    paddingXL: 32,
    paddingSM: 12,
    paddingXS: 8,
    margin: 16,
    marginLG: 24,
    marginXL: 32,

    // Effects - Enhanced visibility
    boxShadow: "0 4px 24px rgba(139, 92, 246, 0.25)", // More prominent
    boxShadowSecondary: "0 2px 12px rgba(0, 0, 0, 0.6)", // Enhanced depth
  },

  components: {
    // Button - Enhanced contrast
    Button: {
      colorPrimary: "#8b5cf6",
      colorPrimaryHover: "#a78bfa",
      colorPrimaryActive: "#7c3aed",
      primaryShadow: "0 4px 20px rgba(139, 92, 246, 0.5)", // More prominent glow
      defaultBg: "rgba(255, 255, 255, 0.08)", // Enhanced visibility
      defaultBorderColor: "rgba(139, 92, 246, 0.4)", // More visible borders
      defaultColor: "#ffffff",
      fontWeight: 500,
      controlHeight: 44,
    },

    // Input - Better contrast
    Input: {
      colorBgContainer: "rgba(255, 255, 255, 0.06)", // Enhanced visibility
      colorBorder: "rgba(255, 255, 255, 0.15)", // More visible borders
      colorBorderHover: "rgba(139, 92, 246, 0.6)", // Enhanced hover state
      activeBorderColor: "#8b5cf6",
      activeShadow: "0 0 0 3px rgba(139, 92, 246, 0.25)", // More prominent focus
      paddingBlock: 12,
      paddingInline: 16,
    },

    // Card - Better contrast while maintaining subtlety
    Card: {
      colorBgContainer: "rgba(255, 255, 255, 0.04)", // Slightly enhanced
      colorBorderSecondary: "rgba(139, 92, 246, 0.2)", // More visible borders
      boxShadow: "0 2px 20px rgba(0, 0, 0, 0.5)", // Enhanced depth
      paddingLG: 24,
    },

    // Modal - Enhanced visibility
    Modal: {
      // contentBg: "#1a1a1a", // Better contrast
      // headerBg: "#1a1a1a", // Better contrast
      // footerBg: "#1a1a1a", // Better contrast
      boxShadow: "0 8px 48px rgba(139, 92, 246, 0.3)", // More prominent
    },

    // Typography - Enhanced readability (unchanged colors as they were already good)
    Typography: {
      colorText: "#ffffff",
      colorTextSecondary: "rgba(255, 255, 255, 0.85)", // Enhanced contrast
      colorTextDisabled: "rgba(255, 255, 255, 0.4)", // Slightly more visible
      fontSizeHeading1: 48,
      fontWeightStrong: 600,
    },

    // Menu - Better visibility while maintaining subtlety
    Menu: {
      colorBgContainer: "transparent",
      colorItemBg: "transparent",
      colorItemBgHover: "rgba(139, 92, 246, 0.15)", // Enhanced hover
      colorItemBgSelected: "rgba(139, 92, 246, 0.2)", // Enhanced selection
      colorItemText: "#ffffff",
      colorItemTextHover: "#a78bfa",
      colorItemTextSelected: "#8b5cf6",
    },

    // Layout - Enhanced contrast
    Layout: {
      colorBgHeader: "#0f0f0f", // Slightly lighter
      colorBgBody: "#0f0f0f", // Slightly lighter
      colorBgTrigger: "rgba(255, 255, 255, 0.08)", // Enhanced visibility
    },

    // Divider - More visible
    Divider: {
      colorSplit: "rgba(139, 92, 246, 0.25)", // Enhanced visibility
    },

    // Tag - Better contrast
    Tag: {
      defaultBg: "rgba(139, 92, 246, 0.15)", // Enhanced visibility
      defaultColor: "#a78bfa",
    },

    // Progress - Better visibility
    Progress: {
      colorText: "#ffffff",
      remainingColor: "rgba(255, 255, 255, 0.15)", // Enhanced visibility
    },

    // Notification - Better contrast
    Notification: {
      colorBgElevated: "#242424", // Better contrast
      boxShadow: "0 4px 24px rgba(139, 92, 246, 0.4)", // More prominent
    },
  },

  // Algorithm for dark mode optimization
  algorithm: theme.darkAlgorithm,
};
