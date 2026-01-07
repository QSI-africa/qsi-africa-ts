// theme.js - Enhanced Pan African Engineers Theme
import { theme } from "antd";

// Professional color palette inspired by Pan African Engineers branding
const colors = {
  // Primary colors
  deepNavy: "#1a2332",
  navyDark: "#0f1621",
  navyLight: "#242f42",
  navyLighter: "#2d3a4f",

  lightGray: "#f9f9faff",
  lightGrayDark: "#e8ecf0",
  lightGrayLight: "#ebebebff",
  lightGrayBorder: "#dce4ec",

  // Accent colors
  vibrantGreen: "#2ecc71",
  vibrantGreenHover: "#27ae60",
  vibrantGreenActive: "#229954",
  vibrantGreenLight: "#58d68d",
  vibrantGreenBg: "rgba(46, 204, 113, 0.1)",
  vibrantGreenBgHover: "rgba(46, 204, 113, 0.15)",

  // Semantic colors
  success: "#2ecc71",
  successLight: "#58d68d",
  successDark: "#229954",
  successBg: "rgba(46, 204, 113, 0.1)",

  warning: "#f39c12",
  warningLight: "#f8b739",
  warningDark: "#d68910",
  warningBg: "rgba(243, 156, 18, 0.1)",

  error: "#e74c3c",
  errorLight: "#ec7063",
  errorDark: "#c0392b",
  errorBg: "rgba(231, 76, 60, 0.1)",

  info: "#3498db",
  infoLight: "#5dade2",
  infoDark: "#2874a6",
  infoBg: "rgba(52, 152, 219, 0.1)",

  // Text colors - Light Mode
  textPrimary: "#1a2332",
  textSecondary: "#64748b",
  textTertiary: "#94a3b8",
  textQuaternary: "#cbd5e1",
  textDisabled: "#cbd5e1",
  textPlaceholder: "#94a3b8",

  // Text colors - Dark Mode
  textPrimaryDark: "#f8fafc",
  textSecondaryDark: "#cbd5e1",
  textTertiaryDark: "#94a3b8",
  textQuaternaryDark: "#64748b",
  textDisabledDark: "#475569",
  textPlaceholderDark: "#64748b",

  // Border colors
  borderLight: "rgba(0, 0, 0, 0.06)",
  borderLightHover: "rgba(0, 0, 0, 0.12)",
  borderLightActive: "rgba(0, 0, 0, 0.15)",
  borderDark: "rgba(255, 255, 255, 0.08)",
  borderDarkHover: "rgba(255, 255, 255, 0.16)",
  borderDarkActive: "rgba(255, 255, 255, 0.20)",
};

// Base design tokens
const baseTokens = {
  borderRadius: 12,
  borderRadiusSM: 8,
  borderRadiusLG: 16,
  borderRadiusXS: 6,

  fontSize: 14,
  fontSizeSM: 12,
  fontSizeLG: 16,
  fontSizeXL: 20,
  fontSizeHeading1: 38,
  fontSizeHeading2: 30,
  fontSizeHeading3: 24,
  fontSizeHeading4: 20,
  fontSizeHeading5: 16,

  lineHeight: 1.6,
  lineHeightSM: 1.5,
  lineHeightLG: 1.8,
  lineHeightHeading: 1.3,

  controlHeight: 40,
  controlHeightSM: 32,
  controlHeightLG: 48,
  controlHeightXS: 24,

  padding: 16,
  paddingSM: 12,
  paddingLG: 24,
  paddingXS: 8,
  paddingXXS: 4,

  margin: 16,
  marginSM: 12,
  marginLG: 24,
  marginXS: 8,
  marginXXS: 4,
};

// Elegant shadows
const shadows = {
  // Light mode shadows
  subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 0 rgba(0, 0, 0, 0.02)",
  small: "0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 6px 0 rgba(0, 0, 0, 0.03)",
  medium:
    "0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
  large:
    "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  xxl: "0 25px 50px -12px rgba(0, 0, 0, 0.12)",

  // Dark mode shadows
  subtleDark: "0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 3px 0 rgba(0, 0, 0, 0.15)",
  smallDark: "0 2px 4px 0 rgba(0, 0, 0, 0.25), 0 1px 6px 0 rgba(0, 0, 0, 0.2)",
  mediumDark:
    "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.25)",
  largeDark:
    "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.35)",
  xlDark:
    "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.45)",
  xxlDark: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
};

// Light theme configuration
export const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // Primary Colors
    colorPrimary: colors.vibrantGreen,
    colorPrimaryHover: colors.vibrantGreenHover,
    colorPrimaryActive: colors.vibrantGreenActive,
    colorPrimaryBg: colors.vibrantGreenBg,
    colorPrimaryBgHover: colors.vibrantGreenBgHover,
    colorPrimaryBorder: "rgba(46, 204, 113, 0.3)",
    colorPrimaryBorderHover: "rgba(46, 204, 113, 0.5)",
    colorPrimaryText: colors.vibrantGreen,
    colorPrimaryTextHover: colors.vibrantGreenHover,
    colorPrimaryTextActive: colors.vibrantGreenActive,
    colorGreenBackground: "rgba(209, 247, 224, 1)",
    colorCardBorder: colors.vibrantGreen,
    // Semantic Colors
    colorSuccess: colors.success,
    colorSuccessHover: colors.successLight,
    colorSuccessActive: colors.successDark,
    colorSuccessBg: colors.successBg,
    colorSuccessBgHover: "rgba(46, 204, 113, 0.15)",
    colorSuccessBorder: "rgba(46, 204, 113, 0.3)",
    colorSuccessBorderHover: "rgba(46, 204, 113, 0.5)",
    colorSuccessText: colors.success,
    colorSuccessTextHover: colors.successLight,
    colorSuccessTextActive: colors.successDark,

    colorWarning: colors.warning,
    colorWarningHover: colors.warningLight,
    colorWarningActive: colors.warningDark,
    colorWarningBg: colors.warningBg,
    colorWarningBgHover: "rgba(243, 156, 18, 0.15)",
    colorWarningBorder: "rgba(243, 156, 18, 0.3)",
    colorWarningBorderHover: "rgba(243, 156, 18, 0.5)",
    colorWarningText: colors.warning,
    colorWarningTextHover: colors.warningLight,
    colorWarningTextActive: colors.warningDark,

    colorError: colors.error,
    colorErrorHover: colors.errorLight,
    colorErrorActive: colors.errorDark,
    colorErrorBg: colors.errorBg,
    colorErrorBgHover: "rgba(231, 76, 60, 0.15)",
    colorErrorBorder: "rgba(231, 76, 60, 0.3)",
    colorErrorBorderHover: "rgba(231, 76, 60, 0.5)",
    colorErrorText: colors.error,
    colorErrorTextHover: colors.errorLight,
    colorErrorTextActive: colors.errorDark,

    colorInfo: colors.info,
    colorInfoHover: colors.infoLight,
    colorInfoActive: colors.infoDark,
    colorInfoBg: colors.infoBg,
    colorInfoBgHover: "rgba(52, 152, 219, 0.15)",
    colorInfoBorder: "rgba(52, 152, 219, 0.3)",
    colorInfoBorderHover: "rgba(52, 152, 219, 0.5)",
    colorInfoText: colors.info,
    colorInfoTextHover: colors.infoLight,
    colorInfoTextActive: colors.infoDark,

    colorLink: colors.vibrantGreen,
    colorLinkHover: colors.vibrantGreenHover,
    colorLinkActive: colors.vibrantGreenActive,

    // Background Colors
    colorBgBase: colors.lightGray,
    colorBgContainer: colors.lightGrayLight,
    colorBgElevated: colors.lightGrayLight,
    colorBgLayout: colors.lightGray,
    colorBgSpotlight: "rgba(0, 0, 0, 0.85)",
    colorBgMask: "rgba(0, 0, 0, 0.45)",
    colorBgBlur: "rgba(255, 255, 255, 0.7)",

    // Text Colors
    colorText: colors.textPrimary,
    colorTextBase: colors.textPrimary,
    colorTextSecondary: colors.textSecondary,
    colorTextTertiary: colors.textTertiary,
    colorTextQuaternary: colors.textQuaternary,
    colorTextDisabled: colors.textDisabled,
    colorTextPlaceholder: colors.textPlaceholder,
    colorTextHeading: colors.textPrimary,
    colorTextLabel: colors.textSecondary,
    colorTextDescription: colors.textTertiary,
    colorTextLightSolid: colors.lightGrayLight,

    // Border Colors
    colorBorder: colors.borderLight,
    colorBorderSecondary: "rgba(0, 0, 0, 0.04)",
    colorBorderBg: colors.lightGrayBorder,
    colorSplit: colors.borderLight,

    // Fill Colors
    colorFill: "rgba(0, 0, 0, 0.04)",
    colorFillSecondary: "rgba(0, 0, 0, 0.03)",
    colorFillTertiary: "rgba(0, 0, 0, 0.02)",
    colorFillQuaternary: "rgba(0, 0, 0, 0.01)",

    // Shadows
    boxShadow: shadows.subtle,
    boxShadowSecondary: shadows.medium,
    boxShadowTertiary: shadows.large,

    // Border Radius
    borderRadius: baseTokens.borderRadius,
    borderRadiusSM: baseTokens.borderRadiusSM,
    borderRadiusLG: baseTokens.borderRadiusLG,
    borderRadiusXS: baseTokens.borderRadiusXS,
    borderRadiusOuter: baseTokens.borderRadiusLG,

    // Font
    fontSize: baseTokens.fontSize,
    fontSizeSM: baseTokens.fontSizeSM,
    fontSizeLG: baseTokens.fontSizeLG,
    fontSizeXL: baseTokens.fontSizeXL,
    fontSizeHeading1: baseTokens.fontSizeHeading1,
    fontSizeHeading2: baseTokens.fontSizeHeading2,
    fontSizeHeading3: baseTokens.fontSizeHeading3,
    fontSizeHeading4: baseTokens.fontSizeHeading4,
    fontSizeHeading5: baseTokens.fontSizeHeading5,
    fontWeightStrong: 600,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",

    // Line Height
    lineHeight: baseTokens.lineHeight,
    lineHeightSM: baseTokens.lineHeightSM,
    lineHeightLG: baseTokens.lineHeightLG,
    lineHeightHeading1: 1.2,
    lineHeightHeading2: 1.3,
    lineHeightHeading3: 1.4,
    lineHeightHeading4: 1.5,
    lineHeightHeading5: baseTokens.lineHeight,

    // Control Heights
    controlHeight: baseTokens.controlHeight,
    controlHeightSM: baseTokens.controlHeightSM,
    controlHeightLG: baseTokens.controlHeightLG,
    controlHeightXS: baseTokens.controlHeightXS,

    // Padding & Margin
    padding: baseTokens.padding,
    paddingSM: baseTokens.paddingSM,
    paddingLG: baseTokens.paddingLG,
    paddingXS: baseTokens.paddingXS,
    paddingXXS: baseTokens.paddingXXS,
    paddingContentHorizontal: 16,
    paddingContentHorizontalSM: 12,
    paddingContentHorizontalLG: 24,
    paddingContentVertical: 12,
    paddingContentVerticalSM: 8,
    paddingContentVerticalLG: 16,

    margin: baseTokens.margin,
    marginSM: baseTokens.marginSM,
    marginLG: baseTokens.marginLG,
    marginXS: baseTokens.marginXS,
    marginXXS: baseTokens.marginXXS,

    // Motion
    motionDurationFast: "0.15s",
    motionDurationMid: "0.25s",
    motionDurationSlow: "0.35s",
    motionEaseInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    motionEaseOut: "cubic-bezier(0.0, 0, 0.2, 1)",
    motionEaseIn: "cubic-bezier(0.4, 0, 1, 1)",
    motionEaseInBack: "cubic-bezier(0.6, -0.28, 0.735, 0.045)",
    motionEaseOutBack: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    motionEaseInOutBack: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",

    // Opacity
    opacityLoading: 0.65,

    // Z-index
    zIndexBase: 0,
    zIndexPopupBase: 1000,
  },
  components: {
    // Button Component
    Button: {
      colorPrimary: colors.vibrantGreen,
      colorPrimaryHover: colors.vibrantGreenHover,
      colorPrimaryActive: colors.vibrantGreenActive,
      colorPrimaryBorder: colors.vibrantGreen,
      colorPrimaryBg: colors.vibrantGreen,
      primaryColor: colors.lightGrayLight,
      primaryShadow: "0 2px 0 rgba(46, 204, 113, 0.1)",

      controlHeight: baseTokens.controlHeight,
      controlHeightSM: baseTokens.controlHeightSM,
      controlHeightLG: baseTokens.controlHeightLG,

      borderRadius: 10,
      borderRadiusSM: 8,
      borderRadiusLG: 12,

      fontWeight: 500,
      fontWeightStrong: 600,

      defaultBorderColor: colors.borderLight,
      defaultBg: colors.lightGrayLight,
      defaultColor: colors.textPrimary,
      defaultShadow: shadows.subtle,
      defaultHoverBg: colors.lightGrayDark,
      defaultHoverColor: colors.textPrimary,
      defaultHoverBorderColor: colors.borderLightHover,
      defaultActiveBg: colors.lightGrayDark,
      defaultActiveColor: colors.textPrimary,
      defaultActiveBorderColor: colors.vibrantGreen,

      textHoverBg: "rgba(46, 204, 113, 0.08)",
      ghostBg: "transparent",
      ghostColor: colors.textSecondary,
      linkHoverBg: "transparent",

      dangerColor: colors.lightGrayLight,
      dangerBg: colors.error,
      dangerBorderColor: colors.error,
      dangerShadow: "0 2px 0 rgba(231, 76, 60, 0.1)",

      paddingContentHorizontal: 20,
      paddingContentHorizontalSM: 16,
      paddingContentHorizontalLG: 24,

      contentFontSize: baseTokens.fontSize,
      contentFontSizeSM: baseTokens.fontSizeSM,
      contentFontSizeLG: baseTokens.fontSizeLG,

      onlyIconSize: baseTokens.fontSizeLG,
      onlyIconSizeSM: baseTokens.fontSize,
      onlyIconSizeLG: baseTokens.fontSizeXL,
    },

    // Input Component
    Input: {
      colorBgContainer: colors.lightGrayLight,
      colorBorder: colors.borderLight,
      colorBorderHover: colors.borderLightHover,
      colorPrimaryHover: colors.vibrantGreen,
      colorPrimary: colors.vibrantGreen,
      colorTextPlaceholder: colors.textPlaceholder,
      colorText: colors.textPrimary,
      colorTextDisabled: colors.textDisabled,
      colorBgContainerDisabled: colors.lightGray,

      activeBorderColor: colors.vibrantGreen,
      activeShadow: "0 0 0 2px rgba(46, 204, 113, 0.1)",
      errorActiveShadow: "0 0 0 2px rgba(231, 76, 60, 0.1)",
      warningActiveShadow: "0 0 0 2px rgba(243, 156, 18, 0.1)",
      hoverBorderColor: colors.borderLightHover,

      controlHeight: baseTokens.controlHeight,
      controlHeightSM: baseTokens.controlHeightSM,
      controlHeightLG: baseTokens.controlHeightLG,

      borderRadius: 10,
      borderRadiusSM: 8,
      borderRadiusLG: 12,

      paddingBlock: 8,
      paddingBlockSM: 4,
      paddingBlockLG: 12,
      paddingInline: 12,
      paddingInlineSM: 8,
      paddingInlineLG: 16,

      fontSize: baseTokens.fontSize,
      fontSizeSM: baseTokens.fontSizeSM,
      fontSizeLG: baseTokens.fontSizeLG,

      lineHeight: baseTokens.lineHeight,
      lineHeightSM: baseTokens.lineHeightSM,
      lineHeightLG: baseTokens.lineHeightLG,

      addonBg: colors.lightGray,
      hoverBg: colors.lightGrayLight,
    },

    // Card Component
    Card: {
      colorBgContainer: colors.lightGrayLight,
      colorBorderSecondary: "transparent",
      colorTextHeading: colors.textPrimary,
      colorTextDescription: colors.textSecondary,

      borderRadiusLG: 16,
      borderRadius: 12,
      borderRadiusSM: 10,

      boxShadow: shadows.small,
      boxShadowHovered: shadows.medium,
      boxShadowTertiary: shadows.large,

      padding: 24,
      paddingSM: 16,
      paddingLG: 32,
      paddingXS: 12,

      headerFontSize: 16,
      headerFontSizeSM: 14,
      headerFontWeight: 600,
      headerHeight: 56,
      headerHeightSM: 48,

      actionsBg: "transparent",
      actionsLiMargin: "12px 0",

      tabsMarginBottom: -17,
      extraColor: colors.textSecondary,
    },

    // Table Component
    Table: {
      colorBgContainer: colors.lightGrayLight,
      colorBorderSecondary: "transparent",
      colorText: colors.textPrimary,
      colorTextHeading: colors.textSecondary,
      colorTextDescription: colors.textTertiary,

      borderRadius: 12,
      borderRadiusLG: 16,

      fontSize: baseTokens.fontSize,
      fontSizeSM: baseTokens.fontSizeSM,
      fontSizeLG: baseTokens.fontSizeLG,

      padding: 16,
      paddingContentVertical: 12,
      paddingContentVerticalSM: 8,
      paddingContentVerticalLG: 16,

      cellPaddingBlock: 12,
      cellPaddingBlockSM: 8,
      cellPaddingBlockLG: 16,
      cellPaddingInline: 16,
      cellPaddingInlineSM: 12,
      cellPaddingInlineLG: 20,

      headerBg: colors.lightGray,
      headerColor: colors.textSecondary,
      headerSplitColor: "transparent",
      headerSortActiveBg: colors.lightGrayDark,
      headerSortHoverBg: colors.lightGrayDark,
      headerSortActiveColor: colors.textPrimary,

      bodySortBg: "rgba(46, 204, 113, 0.02)",
      rowHoverBg: colors.lightGray,
      rowSelectedBg: "rgba(46, 204, 113, 0.05)",
      rowSelectedHoverBg: "rgba(46, 204, 113, 0.08)",
      rowExpandedBg: colors.lightGray,

      cellFontSize: baseTokens.fontSize,
      cellFontSizeSM: baseTokens.fontSizeSM,

      headerBorderRadius: 12,
      footerBg: colors.lightGray,
      footerColor: colors.textSecondary,

      filterDropdownBg: colors.lightGrayLight,
      filterDropdownMenuBg: colors.lightGrayLight,

      expandIconBg: colors.lightGrayLight,
      selectionColumnWidth: 32,
      stickyScrollBarBg: "rgba(0, 0, 0, 0.35)",
      stickyScrollBarBorderRadius: 100,
    },

    // Menu Component
    Menu: {
      colorBgContainer: colors.lightGrayLight,
      colorBgElevated: colors.lightGrayLight,
      colorItemBg: "transparent",
      colorItemBgHover: "rgba(46, 204, 113, 0.08)",
      colorItemBgActive: "rgba(46, 204, 113, 0.12)",
      colorItemBgSelected: "rgba(46, 204, 113, 0.1)",
      colorItemBgSelectedHorizontal: "rgba(46, 204, 113, 0.1)",

      colorItemText: colors.textSecondary,
      colorItemTextHover: colors.vibrantGreen,
      colorItemTextSelected: colors.vibrantGreen,
      colorItemTextActive: colors.vibrantGreenActive,
      colorItemTextDisabled: colors.textDisabled,

      colorActiveBarWidth: 0,
      colorActiveBarHeight: 0,
      colorActiveBarBorderSize: 0,

      itemBorderRadius: 8,
      subMenuItemBorderRadius: 8,
      itemMarginBlock: 4,
      itemMarginInline: 8,
      itemPaddingInline: 16,
      itemHeight: 40,

      collapsedWidth: 64,
      collapsedIconSize: 16,

      iconSize: 18,
      iconMarginInlineEnd: 10,

      colorSubItemBg: "transparent",

      groupTitleColor: colors.textTertiary,
      groupTitleFontSize: baseTokens.fontSizeSM,
      groupTitleLineHeight: baseTokens.lineHeightSM,

      horizontalItemBorderRadius: 8,
      horizontalItemHoverBg: "rgba(46, 204, 113, 0.08)",
      horizontalItemSelectedBg: "rgba(46, 204, 113, 0.1)",
      horizontalLineHeight: "46px",

      popupBg: colors.lightGrayLight,

      darkItemBg: colors.deepNavy,
      darkItemColor: colors.textSecondaryDark,
      darkItemHoverBg: "rgba(46, 204, 113, 0.12)",
      darkItemHoverColor: colors.textPrimaryDark,
      darkItemSelectedBg: "rgba(46, 204, 113, 0.15)",
      darkItemSelectedColor: colors.vibrantGreen,
      darkSubMenuItemBg: colors.navyDark,
    },

    // Layout Component
    Layout: {
      headerBg: colors.lightGrayLight,
      headerColor: colors.textPrimary,
      headerHeight: 64,
      headerPadding: "0 24px",
      headerLineHeight: "64px",

      footerBg: colors.lightGrayLight,
      footerPadding: "24px 24px",

      bodyBg: colors.lightGray,

      siderBg: colors.lightGrayLight,

      triggerBg: colors.lightGrayDark,
      triggerColor: colors.textPrimary,
      triggerHeight: 48,
      triggerLineHeight: "48px",

      zeroTriggerWidth: 48,
      zeroTriggerHeight: 48,

      lightSiderBg: colors.lightGrayLight,
      lightTriggerBg: colors.lightGrayDark,
      lightTriggerColor: colors.textPrimary,
    },

    // Modal Component
    Modal: {
      contentBg: colors.lightGrayLight,
      headerBg: colors.lightGrayLight,
      titleColor: colors.textPrimary,
      titleFontSize: 18,
      titleLineHeight: 1.5,

      borderRadiusLG: 16,

      boxShadow: shadows.xl,

      headerPadding: "20px 24px",
      headerMarginBottom: 8,
      headerBorderBottom: 0,
      headerCloseSize: 56,

      bodyPadding: "24px",

      footerPadding: "16px 24px",
      footerMarginTop: 0,
      footerBorderTop: 0,
      footerBorderRadius: "0 0 16px 16px",

      confirmBodyPadding: "32px 32px 24px",
      confirmIconMarginInlineEnd: 16,
      confirmBtnsMarginTop: 24,

      colorBgMask: "rgba(0, 0, 0, 0.45)",
      colorIconHover: colors.textSecondary,
      colorIcon: colors.textTertiary,
    },

    // Alert Component
    Alert: {
      colorInfoBg: "rgba(52, 152, 219, 0.08)",
      colorInfoBorder: "rgba(52, 152, 219, 0.2)",
      colorInfoText: colors.info,

      colorSuccessBg: "rgba(46, 204, 113, 0.08)",
      colorSuccessBorder: "rgba(46, 204, 113, 0.2)",
      colorSuccessText: colors.success,

      colorWarningBg: "rgba(243, 156, 18, 0.08)",
      colorWarningBorder: "rgba(243, 156, 18, 0.2)",
      colorWarningText: colors.warning,

      colorErrorBg: "rgba(231, 76, 60, 0.08)",
      colorErrorBorder: "rgba(231, 76, 60, 0.2)",
      colorErrorText: colors.error,

      borderRadiusLG: 12,
      borderRadius: 10,
      borderRadiusSM: 8,

      defaultPadding: "12px 16px",
      withDescriptionPadding: "16px 20px",
      withDescriptionIconSize: 24,

      fontSize: baseTokens.fontSize,
      lineHeight: baseTokens.lineHeight,

      iconSize: 16,
      closeIconSize: 14,
    },

    // Select Component
    Select: {
      colorBgContainer: colors.lightGrayLight,
      colorBorder: colors.borderLight,
      colorBgElevated: colors.lightGrayLight,
      colorTextPlaceholder: colors.textPlaceholder,
      colorText: colors.textPrimary,
      colorTextDisabled: colors.textDisabled,

      colorPrimaryHover: colors.vibrantGreen,
      colorPrimary: colors.vibrantGreen,

      optionSelectedBg: "rgba(46, 204, 113, 0.1)",
      optionSelectedColor: colors.vibrantGreen,
      optionActiveBg: "rgba(46, 204, 113, 0.08)",
      optionPadding: "8px 12px",
      optionFontSize: baseTokens.fontSize,
      optionLineHeight: baseTokens.lineHeight,
      optionHeight: 36,

      controlHeight: baseTokens.controlHeight,
      controlHeightSM: baseTokens.controlHeightSM,
      controlHeightLG: baseTokens.controlHeightLG,

      borderRadius: 10,
      borderRadiusSM: 8,
      borderRadiusLG: 12,

      selectorBg: colors.lightGrayLight,
      clearBg: colors.lightGrayLight,

      singleItemHeightLG: 40,

      multipleItemBg: "rgba(46, 204, 113, 0.1)",
      multipleItemBorderColor: "transparent",
      multipleItemHeight: 24,
      multipleItemHeightSM: 16,
      multipleItemHeightLG: 28,
      multipleItemBorderColorDisabled: "transparent",
      multipleItemColorDisabled: colors.textDisabled,
      multipleSelectorBgDisabled: colors.lightGray,

      showArrowPaddingInlineEnd: 28,
      fontSize: baseTokens.fontSize,
    },

    // Tabs Component
    Tabs: {
      itemColor: colors.textSecondary,
      itemHoverColor: colors.vibrantGreen,
      itemSelectedColor: colors.vibrantGreen,
      itemActiveColor: colors.vibrantGreenActive,

      inkBarColor: colors.vibrantGreen,

      cardBg: colors.lightGrayLight,
      cardGutter: 4,
      cardPadding: "12px 16px",
      cardPaddingSM: "8px 12px",
      cardPaddingLG: "16px 20px",
      cardHeight: 40,

      titleFontSize: baseTokens.fontSize,
      titleFontSizeLG: baseTokens.fontSizeLG,
      titleFontSizeSM: baseTokens.fontSizeSM,

      horizontalItemGutter: 32,
      horizontalItemPadding: "12px 0",
      horizontalItemPaddingSM: "8px 0",
      horizontalItemPaddingLG: "16px 0",
      horizontalMargin: "0 0 16px 0",

      verticalItemPadding: "8px 24px",
      verticalItemMargin: "4px 0",

      cardBorderRadius: 8,
    },

    // Progress Component
    Progress: {
      defaultColor: colors.vibrantGreen,
      remainingColor: "rgba(0, 0, 0, 0.06)",
      circleTextColor: colors.textPrimary,
      lineBorderRadius: 100,
      circleTextFontSize: "1em",
      circleIconFontSize: "1em",
    },

    // Tag Component
    Tag: {
      defaultBg: colors.lightGray,
      defaultColor: colors.textPrimary,
      borderRadiusSM: 6,
      fontSizeSM: baseTokens.fontSizeSM,
      lineHeightSM: baseTokens.lineHeightSM,
    },

    // Badge Component
    Badge: {
      indicatorHeight: 20,
      indicatorHeightSM: 16,
      dotSize: 6,
      textFontSize: baseTokens.fontSizeSM,
      textFontSizeSM: 10,
      textFontWeight: 500,
      statusSize: 6,
      colorBorderBg: colors.lightGrayLight,
    },

    // Switch Component
    Switch: {
      trackHeight: 22,
      trackHeightSM: 16,
      trackMinWidth: 44,
      trackMinWidthSM: 28,
      trackPadding: 2,
      innerMinMargin: 4,
      innerMaxMargin: 24,
      innerMinMarginSM: 3,
      innerMaxMarginSM: 18,
      handleSize: 18,
      handleSizeSM: 12,
      handleShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.2)",
      handleBg: colors.lightGrayLight,
      colorPrimary: colors.vibrantGreen,
      colorPrimaryHover: colors.vibrantGreenHover,
    },

    // Radio Component
    Radio: {
      colorPrimary: colors.vibrantGreen,
      colorPrimaryHover: colors.vibrantGreenHover,
      colorPrimaryActive: colors.vibrantGreenActive,
      dotSize: 8,
      dotColorDisabled: colors.textDisabled,
      buttonBg: colors.lightGrayLight,
      buttonCheckedBg: colors.lightGrayLight,
      buttonColor: colors.textPrimary,
      buttonPaddingInline: 16,
      buttonCheckedBgDisabled: colors.lightGray,
      buttonCheckedColorDisabled: colors.textDisabled,
      wrapperMarginInlineEnd: 8,
    },

    // Checkbox Component
    Checkbox: {
      colorPrimary: colors.vibrantGreen,
      colorPrimaryHover: colors.vibrantGreenHover,
      colorPrimaryActive: colors.vibrantGreenActive,
      colorBorder: colors.borderLight,
      colorBgContainer: colors.lightGrayLight,
      borderRadiusSM: 4,
      lineWidth: 1,
    },

    // Slider Component
    Slider: {
      colorPrimary: colors.vibrantGreen,
      colorPrimaryBorder: colors.vibrantGreen,
      colorPrimaryBorderHover: colors.vibrantGreenHover,
      dotBorderColor: colors.borderLight,
      dotActiveBorderColor: colors.vibrantGreen,
      trackBg: "rgba(0, 0, 0, 0.06)",
      trackHoverBg: "rgba(0, 0, 0, 0.1)",
      railBg: "rgba(0, 0, 0, 0.06)",
      railHoverBg: "rgba(0, 0, 0, 0.1)",
      handleColor: colors.vibrantGreen,
      handleActiveColor: colors.vibrantGreen,
      handleSize: 14,
      handleSizeHover: 16,
      handleLineWidth: 2,
      handleLineWidthHover: 4,
      borderRadius: baseTokens.borderRadius,
    },

    // Tooltip Component
    Tooltip: {
      colorBgSpotlight: "rgba(0, 0, 0, 0.85)",
      colorTextLightSolid: colors.lightGrayLight,
      borderRadius: 8,
      borderRadiusSM: 6,
      fontSize: baseTokens.fontSizeSM,
      lineHeight: baseTokens.lineHeightSM,
      paddingSM: "6px 8px",
      paddingXS: "4px 6px",
    },

    // Notification Component
    Notification: {
      width: 384,
      borderRadiusLG: 12,
      boxShadow: shadows.xl,
      padding: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      paddingContentHorizontal: 16,
      marginBottom: 16,
      marginEdge: 24,
    },

    // Dropdown Component
    Dropdown: {
      paddingBlock: 4,
      paddingXXS: 8,
      controlPaddingHorizontal: 12,
      borderRadiusLG: 12,
      borderRadiusSM: 8,
      borderRadiusOuter: 4,
      boxShadowSecondary: shadows.large,
      fontSize: baseTokens.fontSize,
      lineHeight: baseTokens.lineHeight,
      colorBgElevated: colors.lightGrayLight,
      colorText: colors.textPrimary,
    },

    // Pagination Component
    Pagination: {
      itemBg: colors.lightGrayLight,
      itemSize: 32,
      itemSizeSM: 24,
      itemActiveBg: colors.vibrantGreen,
      itemActiveColorDisabled: colors.textDisabled,
      itemActiveBgDisabled: colors.lightGray,
      itemLinkBg: colors.lightGrayLight,
      itemInputBg: colors.lightGrayLight,
      miniOptionsSizeChangerTop: 0,
      borderRadius: 8,
      fontSize: baseTokens.fontSize,
      fontSizeSM: baseTokens.fontSizeSM,
    },

    // DatePicker Component
    DatePicker: {
      cellHeight: 24,
      cellWidth: 36,
      textHeight: 40,
      withoutTimeCellHeight: 66,
      cellBorderRadius: 8,
      cellHoverBg: "rgba(46, 204, 113, 0.08)",
      cellActiveWithRangeBg: "rgba(46, 204, 113, 0.12)",
      cellHoverWithRangeBg: "rgba(46, 204, 113, 0.06)",
      cellRangeBorderColor: colors.vibrantGreen,
      cellBgDisabled: colors.lightGray,
      timeColumnWidth: 56,
      timeColumnHeight: 224,
      timeCellHeight: 28,
      cellWeekFontSize: baseTokens.fontSizeSM,
      activeBg: colors.vibrantGreen,
      activeBorderColor: colors.vibrantGreen,
      activeShadow: "0 0 0 2px rgba(46, 204, 113, 0.1)",
      cellActiveWithRangeBg: colors.vibrantGreenBg,
    },

    // Divider Component
    Divider: {
      colorSplit: colors.borderLight,
      colorText: colors.textTertiary,
      colorTextHeading: colors.textSecondary,
      orientMargin: 0.05,
      orientMarginPercent: 5,
      verticalMarginInline: 8,
      lineWidth: 1,
      fontSize: baseTokens.fontSize,
      fontSizeLG: baseTokens.fontSizeLG,
      fontSizeSM: baseTokens.fontSizeSM,
      textPaddingInline: "1em",
    },

    // Skeleton Component
    Skeleton: {
      color: colors.lightGray,
      colorGradientEnd: colors.lightGrayDark,
      borderRadiusSM: 4,
      blockRadius: 8,
      paragraphMarginTop: 28,
      paragraphLiMarginTop: 16,
      titleHeight: 16,
      titleMarginTop: 16,
    },

    // Spin Component
    Spin: {
      colorPrimary: colors.vibrantGreen,
      colorBgContainer: "rgba(0, 0, 0, 0.05)",
      contentHeight: 400,
      dotSize: 20,
      dotSizeSM: 14,
      dotSizeLG: 32,
    },

    // Steps Component
    Steps: {
      colorPrimary: colors.vibrantGreen,
      colorPrimaryBg: "rgba(46, 204, 113, 0.1)",
      colorPrimaryBorder: "rgba(46, 204, 113, 0.3)",
      iconSize: 32,
      iconSizeSM: 24,
      dotSize: 8,
      dotCurrentSize: 10,
      titleLineHeight: baseTokens.lineHeight,
      customIconSize: 32,
      customIconTop: 0,
      customIconFontSize: 24,
      iconTop: 0,
      iconFontSize: baseTokens.fontSize,
      navArrowColor: colors.textTertiary,
      navContentMaxWidth: "auto",
      descriptionMaxWidth: 140,
      waitIconColor: colors.textTertiary,
      waitIconBgColor: colors.lightGray,
      finishIconBgColor: colors.vibrantGreenBg,
      borderRadius: baseTokens.borderRadius,
    },

    // Collapse Component
    Collapse: {
      headerBg: colors.lightGrayLight,
      headerPadding: "12px 16px",
      contentBg: colors.lightGrayLight,
      contentPadding: "16px",
      borderRadiusLG: 12,
      colorBorder: "transparent",
      colorText: colors.textPrimary,
      colorTextHeading: colors.textPrimary,
      fontSize: baseTokens.fontSize,
      lineHeight: baseTokens.lineHeight,
      headerBorderRadius: 12,
    },

    // Timeline Component
    Timeline: {
      tailColor: colors.borderLight,
      tailWidth: 2,
      dotBorderWidth: 2,
      dotBg: colors.lightGrayLight,
      itemPaddingBottom: 20,
      dotSize: 10,
      dotColor: colors.vibrantGreen,
      fontSize: baseTokens.fontSize,
      lineHeight: baseTokens.lineHeight,
    },

    // Transfer Component
    Transfer: {
      headerHeight: 40,
      itemHeight: 32,
      itemPaddingBlock: 6,
      itemWhiteSpace: "nowrap",
      listHeight: 200,
      listWidth: 180,
      listWidthLG: 250,
      borderRadius: 8,
      colorBgContainer: colors.lightGrayLight,
      colorBorder: colors.borderLight,
      colorText: colors.textPrimary,
      colorTextDisabled: colors.textDisabled,
      headerBg: colors.lightGray,
      footerBg: colors.lightGray,
    },

    // Tree Component
    Tree: {
      titleHeight: 24,
      nodeHoverBg: "rgba(46, 204, 113, 0.08)",
      nodeSelectedBg: "rgba(46, 204, 113, 0.1)",
      directoryNodeSelectedBg: colors.vibrantGreenBg,
      directoryNodeSelectedColor: colors.vibrantGreen,
      colorBgContainer: colors.lightGrayLight,
      colorText: colors.textPrimary,
      colorPrimary: colors.vibrantGreen,
      borderRadius: 8,
    },

    // Upload Component
    Upload: {
      actionsColor: colors.textTertiary,
      borderRadius: 8,
      colorBorder: colors.borderLight,
      colorBorderHover: colors.borderLightHover,
      colorText: colors.textPrimary,
      colorTextHeading: colors.textPrimary,
      colorFillAlter: colors.lightGray,
      fontSize: baseTokens.fontSize,
      lineHeight: baseTokens.lineHeight,
    },

    // Avatar Component
    Avatar: {
      containerSize: 32,
      containerSizeLG: 40,
      containerSizeSM: 24,
      textFontSize: 18,
      textFontSizeLG: 24,
      textFontSizeSM: 14,
      borderRadius: 8,
      groupSpace: -8,
      groupOverlapping: -8,
      groupBorderColor: colors.lightGrayLight,
      colorBgContainer: colors.vibrantGreen,
      colorText: colors.lightGrayLight,
      colorTextPlaceholder: colors.lightGrayLight,
    },

    // Drawer Component
    Drawer: {
      footerPaddingBlock: 16,
      footerPaddingInline: 24,
      colorBgElevated: colors.lightGrayLight,
      colorBgMask: "rgba(0, 0, 0, 0.45)",
      borderRadiusLG: 16,
      padding: 24,
      paddingLG: 32,
      colorText: colors.textPrimary,
      colorIcon: colors.textTertiary,
      colorIconHover: colors.textSecondary,
    },

    // Form Component
    Form: {
      labelFontSize: baseTokens.fontSize,
      labelColor: colors.textSecondary,
      labelHeight: 32,
      labelColonMarginInlineStart: 2,
      labelColonMarginInlineEnd: 8,
      itemMarginBottom: 24,
      verticalLabelPadding: "0 0 8px",
      verticalLabelMargin: 0,
      fontSize: baseTokens.fontSize,
      lineHeight: baseTokens.lineHeight,
      labelRequiredMarkColor: colors.error,
      labelFontWeight: 400,
    },

    // Descriptions Component
    Descriptions: {
      labelBg: colors.lightGray,
      titleColor: colors.textPrimary,
      titleMarginBottom: 20,
      itemPaddingBottom: 16,
      itemPaddingEnd: 16,
      colonMarginRight: 8,
      colonMarginLeft: 2,
      contentColor: colors.textPrimary,
      extraColor: colors.textSecondary,
      fontSize: baseTokens.fontSize,
      lineHeight: baseTokens.lineHeight,
      titleFontSize: baseTokens.fontSizeLG,
    },

    // Result Component
    Result: {
      titleFontSize: 24,
      subtitleFontSize: baseTokens.fontSize,
      iconFontSize: 72,
      extraMargin: "24px 0 0 0",
      paddingLG: 48,
      paddingXL: 80,
      colorSuccess: colors.success,
      colorError: colors.error,
      colorWarning: colors.warning,
      colorInfo: colors.info,
    },

    // Statistic Component
    Statistic: {
      titleFontSize: baseTokens.fontSize,
      contentFontSize: 24,
      unitFontSize: baseTokens.fontSizeLG,
      contentFontWeight: 600,
    },

    // Popover Component
    Popover: {
      minWidth: 177,
      fontSize: baseTokens.fontSize,
      lineHeight: baseTokens.lineHeight,
      borderRadiusLG: 12,
      colorBgElevated: colors.lightGrayLight,
      colorText: colors.textPrimary,
      boxShadowSecondary: shadows.large,
    },

    // Message Component
    Message: {
      contentBg: colors.lightGrayLight,
      contentPadding: "10px 16px",
      borderRadiusLG: 10,
      boxShadow: shadows.medium,
    },

    // Anchor Component
    Anchor: {
      linkPaddingBlock: 4,
      linkPaddingInlineStart: 16,
      colorPrimary: colors.vibrantGreen,
      colorPrimaryHover: colors.vibrantGreenHover,
      colorSplit: colors.borderLight,
      fontSize: baseTokens.fontSize,
      lineHeight: baseTokens.lineHeight,
    },

    // Breadcrumb Component
    Breadcrumb: {
      fontSize: baseTokens.fontSize,
      lineHeight: baseTokens.lineHeight,
      iconFontSize: baseTokens.fontSize,
      linkColor: colors.textTertiary,
      linkHoverColor: colors.textPrimary,
      separatorColor: colors.textTertiary,
      separatorMargin: 8,
      itemColor: colors.textPrimary,
      lastItemColor: colors.textPrimary,
    },

    // Cascader Component
    Cascader: {
      controlWidth: 184,
      controlItemWidth: 111,
      dropdownHeight: 180,
      optionSelectedBg: "rgba(46, 204, 113, 0.1)",
      optionPadding: "8px 12px",
      menuBg: colors.lightGrayLight,
      borderRadius: 10,
    },

    // Rate Component
    Rate: {
      starColor: colors.warning,
      starSize: 20,
      starHoverScale: "scale(1.1)",
      starBg: colors.lightGray,
    },

    // Segmented Component
    Segmented: {
      itemColor: colors.textSecondary,
      itemHoverColor: colors.textPrimary,
      itemSelectedBg: colors.lightGrayLight,
      itemSelectedColor: colors.textPrimary,
      itemActiveBg: colors.lightGray,
      borderRadius: 10,
      borderRadiusSM: 8,
      borderRadiusLG: 12,
      trackBg: colors.lightGray,
      trackPadding: 2,
    },
  },
};

// Dark theme configuration
export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    // Primary Colors
    colorPrimary: colors.vibrantGreen,
    colorPrimaryHover: colors.vibrantGreenHover,
    colorPrimaryActive: colors.vibrantGreenActive,
    colorPrimaryBg: "rgba(46, 204, 113, 0.15)",
    colorPrimaryBgHover: "rgba(46, 204, 113, 0.2)",
    colorPrimaryBorder: "rgba(46, 204, 113, 0.3)",
    colorPrimaryBorderHover: "rgba(46, 204, 113, 0.5)",
    colorPrimaryText: colors.vibrantGreen,
    colorPrimaryTextHover: colors.vibrantGreenHover,
    colorPrimaryTextActive: colors.vibrantGreenActive,
    colorGreenBackground: "rgba(0, 4, 29, 1)",
    colorCardBorder: "rgba(46, 204, 113, 0.4)",

    // Semantic Colors
    colorSuccess: colors.success,
    colorSuccessHover: colors.successLight,
    colorSuccessActive: colors.successDark,
    colorSuccessBg: "rgba(46, 204, 113, 0.15)",
    colorSuccessBgHover: "rgba(46, 204, 113, 0.2)",
    colorSuccessBorder: "rgba(46, 204, 113, 0.3)",
    colorSuccessBorderHover: "rgba(46, 204, 113, 0.5)",
    colorSuccessText: colors.successLight,
    colorSuccessTextHover: colors.vibrantGreenLight,
    colorSuccessTextActive: colors.success,

    colorWarning: colors.warning,
    colorWarningHover: colors.warningLight,
    colorWarningActive: colors.warningDark,
    colorWarningBg: "rgba(243, 156, 18, 0.15)",
    colorWarningBgHover: "rgba(243, 156, 18, 0.2)",
    colorWarningBorder: "rgba(243, 156, 18, 0.3)",
    colorWarningBorderHover: "rgba(243, 156, 18, 0.5)",
    colorWarningText: colors.warningLight,
    colorWarningTextHover: "#fad174",
    colorWarningTextActive: colors.warning,

    colorError: colors.error,
    colorErrorHover: colors.errorLight,
    colorErrorActive: colors.errorDark,
    colorErrorBg: "rgba(231, 76, 60, 0.15)",
    colorErrorBgHover: "rgba(231, 76, 60, 0.2)",
    colorErrorBorder: "rgba(231, 76, 60, 0.3)",
    colorErrorBorderHover: "rgba(231, 76, 60, 0.5)",
    colorErrorText: colors.errorLight,
    colorErrorTextHover: "#f1948a",
    colorErrorTextActive: colors.error,

    colorInfo: colors.info,
    colorInfoHover: colors.infoLight,
    colorInfoActive: colors.infoDark,
    colorInfoBg: "rgba(52, 152, 219, 0.15)",
    colorInfoBgHover: "rgba(52, 152, 219, 0.2)",
    colorInfoBorder: "rgba(52, 152, 219, 0.3)",
    colorInfoBorderHover: "rgba(52, 152, 219, 0.5)",
    colorInfoText: colors.infoLight,
    colorInfoTextHover: "#85c1e9",
    colorInfoTextActive: colors.info,

    colorLink: colors.vibrantGreen,
    colorLinkHover: colors.vibrantGreenHover,
    colorLinkActive: colors.vibrantGreenActive,

    // Background Colors
    colorBgBase: colors.deepNavy,
    colorBgContainer: colors.navyDark,
    colorBgElevated: colors.navyLight,
    colorBgLayout: colors.deepNavy,
    colorBgSpotlight: "rgba(255, 255, 255, 0.85)",
    colorBgMask: "rgba(0, 0, 0, 0.6)",
    colorBgBlur: "rgba(26, 35, 50, 0.7)",

    // Text Colors
    colorText: colors.textPrimaryDark,
    colorTextBase: colors.textPrimaryDark,
    colorTextSecondary: colors.textSecondaryDark,
    colorTextTertiary: colors.textTertiaryDark,
    colorTextQuaternary: colors.textQuaternaryDark,
    colorTextDisabled: colors.textDisabledDark,
    colorTextPlaceholder: colors.textPlaceholderDark,
    colorTextHeading: colors.textPrimaryDark,
    colorTextLabel: colors.textSecondaryDark,
    colorTextDescription: colors.textTertiaryDark,
    colorTextLightSolid: colors.deepNavy,

    // Border Colors
    colorBorder: colors.borderDark,
    colorBorderSecondary: "rgba(255, 255, 255, 0.04)",
    colorBorderBg: "rgba(255, 255, 255, 0.1)",
    colorSplit: colors.borderDark,

    // Fill Colors
    colorFill: "rgba(255, 255, 255, 0.08)",
    colorFillSecondary: "rgba(255, 255, 255, 0.06)",
    colorFillTertiary: "rgba(255, 255, 255, 0.04)",
    colorFillQuaternary: "rgba(255, 255, 255, 0.02)",

    // Shadows
    boxShadow: shadows.subtleDark,
    boxShadowSecondary: shadows.mediumDark,
    boxShadowTertiary: shadows.largeDark,

    // Border Radius
    borderRadius: baseTokens.borderRadius,
    borderRadiusSM: baseTokens.borderRadiusSM,
    borderRadiusLG: baseTokens.borderRadiusLG,
    borderRadiusXS: baseTokens.borderRadiusXS,
    borderRadiusOuter: baseTokens.borderRadiusLG,

    // Font
    fontSize: baseTokens.fontSize,
    fontSizeSM: baseTokens.fontSizeSM,
    fontSizeLG: baseTokens.fontSizeLG,
    fontSizeXL: baseTokens.fontSizeXL,
    fontSizeHeading1: baseTokens.fontSizeHeading1,
    fontSizeHeading2: baseTokens.fontSizeHeading2,
    fontSizeHeading3: baseTokens.fontSizeHeading3,
    fontSizeHeading4: baseTokens.fontSizeHeading4,
    fontSizeHeading5: baseTokens.fontSizeHeading5,
    fontWeightStrong: 600,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",

    // Line Height
    lineHeight: baseTokens.lineHeight,
    lineHeightSM: baseTokens.lineHeightSM,
    lineHeightLG: baseTokens.lineHeightLG,
    lineHeightHeading1: 1.2,
    lineHeightHeading2: 1.3,
    lineHeightHeading3: 1.4,
    lineHeightHeading4: 1.5,
    lineHeightHeading5: baseTokens.lineHeight,

    // Control Heights
    controlHeight: baseTokens.controlHeight,
    controlHeightSM: baseTokens.controlHeightSM,
    controlHeightLG: baseTokens.controlHeightLG,
    controlHeightXS: baseTokens.controlHeightXS,

    // Padding & Margin
    padding: baseTokens.padding,
    paddingSM: baseTokens.paddingSM,
    paddingLG: baseTokens.paddingLG,
    paddingXS: baseTokens.paddingXS,
    paddingXXS: baseTokens.paddingXXS,
    paddingContentHorizontal: 16,
    paddingContentHorizontalSM: 12,
    paddingContentHorizontalLG: 24,
    paddingContentVertical: 12,
    paddingContentVerticalSM: 8,
    paddingContentVerticalLG: 16,

    margin: baseTokens.margin,
    marginSM: baseTokens.marginSM,
    marginLG: baseTokens.marginLG,
    marginXS: baseTokens.marginXS,
    marginXXS: baseTokens.marginXXS,

    // Motion
    motionDurationFast: "0.15s",
    motionDurationMid: "0.3s",
    motionDurationSlow: "0.4s",
    motionEaseInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    motionEaseOut: "cubic-bezier(0.0, 0, 0.2, 1)",
    motionEaseIn: "cubic-bezier(0.4, 0, 1, 1)",
    motionEaseInBack: "cubic-bezier(0.6, -0.28, 0.735, 0.045)",
    motionEaseOutBack: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    motionEaseInOutBack: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",

    // Opacity
    opacityLoading: 0.65,

    // Z-index
    zIndexBase: 0,
    zIndexPopupBase: 1000,
  },
  components: {
    // Button Component
    Button: {
      colorPrimary: colors.vibrantGreen,
      colorPrimaryHover: colors.vibrantGreenHover,
      colorPrimaryActive: colors.vibrantGreenActive,
      primaryColor: colors.deepNavy,
      primaryShadow: "0 2px 0 rgba(46, 204, 113, 0.15)",

      controlHeight: baseTokens.controlHeight,
      controlHeightSM: baseTokens.controlHeightSM,
      controlHeightLG: baseTokens.controlHeightLG,

      borderRadius: 10,
      borderRadiusSM: 8,
      borderRadiusLG: 12,

      fontWeight: 500,
      fontWeightStrong: 600,

      defaultBorderColor: colors.borderDark,
      defaultBg: colors.navyLight,
      defaultColor: colors.textPrimaryDark,
      defaultShadow: shadows.subtleDark,
      defaultHoverBg: "rgba(255, 255, 255, 0.08)",
      defaultHoverColor: colors.textPrimaryDark,
      defaultHoverBorderColor: colors.borderDarkHover,
      defaultActiveBg: "rgba(255, 255, 255, 0.12)",
      defaultActiveColor: colors.textPrimaryDark,
      defaultActiveBorderColor: colors.vibrantGreen,

      textHoverBg: "rgba(46, 204, 113, 0.12)",
      ghostBg: "transparent",
      ghostColor: colors.textSecondaryDark,
      linkHoverBg: "transparent",

      dangerColor: colors.deepNavy,
      dangerBg: colors.error,
      dangerBorderColor: colors.error,
      dangerShadow: "0 2px 0 rgba(231, 76, 60, 0.15)",

      paddingContentHorizontal: 20,
      paddingContentHorizontalSM: 16,
      paddingContentHorizontalLG: 24,

      contentFontSize: baseTokens.fontSize,
      contentFontSizeSM: baseTokens.fontSizeSM,
      contentFontSizeLG: baseTokens.fontSizeLG,

      onlyIconSize: baseTokens.fontSizeLG,
      onlyIconSizeSM: baseTokens.fontSize,
      onlyIconSizeLG: baseTokens.fontSizeXL,
    },

    // Input Component
    Input: {
      colorBgContainer: colors.navyLight,
      colorBorder: colors.borderDark,
      colorBorderHover: colors.borderDarkHover,
      colorPrimaryHover: colors.vibrantGreen,
      colorPrimary: colors.vibrantGreen,
      colorTextPlaceholder: colors.textPlaceholderDark,
      colorText: colors.textPrimaryDark,
      colorTextDisabled: colors.textDisabledDark,
      colorBgContainerDisabled: colors.navyDark,

      activeBorderColor: colors.vibrantGreen,
      activeShadow: "0 0 0 2px rgba(46, 204, 113, 0.15)",
      errorActiveShadow: "0 0 0 2px rgba(231, 76, 60, 0.15)",
      warningActiveShadow: "0 0 0 2px rgba(243, 156, 18, 0.15)",
      hoverBorderColor: colors.borderDarkHover,

      controlHeight: baseTokens.controlHeight,
      controlHeightSM: baseTokens.controlHeightSM,
      controlHeightLG: baseTokens.controlHeightLG,

      borderRadius: 10,
      borderRadiusSM: 8,
      borderRadiusLG: 12,

      paddingBlock: 8,
      paddingBlockSM: 4,
      paddingBlockLG: 12,
      paddingInline: 12,
      paddingInlineSM: 8,
      paddingInlineLG: 16,

      fontSize: baseTokens.fontSize,
      fontSizeSM: baseTokens.fontSizeSM,
      fontSizeLG: baseTokens.fontSizeLG,

      lineHeight: baseTokens.lineHeight,
      lineHeightSM: baseTokens.lineHeightSM,
      lineHeightLG: baseTokens.lineHeightLG,

      addonBg: colors.navyDark,
      hoverBg: colors.navyLight,
    },

    // Card Component
    Card: {
      colorBgContainer: colors.navyDark,
      colorBorderSecondary: "transparent",
      colorTextHeading: colors.textPrimaryDark,
      colorTextDescription: colors.textSecondaryDark,

      borderRadiusLG: 16,
      borderRadius: 12,
      borderRadiusSM: 10,

      boxShadow: shadows.smallDark,
      boxShadowHovered: shadows.mediumDark,
      boxShadowTertiary: shadows.largeDark,

      padding: 24,
      paddingSM: 16,
      paddingLG: 32,
      paddingXS: 12,

      headerFontSize: 16,
      headerFontSizeSM: 14,
      headerFontWeight: 600,
      headerHeight: 56,
      headerHeightSM: 48,

      actionsBg: "transparent",
      actionsLiMargin: "12px 0",

      tabsMarginBottom: -17,
      extraColor: colors.textSecondaryDark,
    },

    // Table Component
    Table: {
      colorBgContainer: colors.navyDark,
      colorBorderSecondary: "transparent",
      colorText: colors.textPrimaryDark,
      colorTextHeading: colors.textSecondaryDark,
      colorTextDescription: colors.textTertiaryDark,

      borderRadius: 12,
      borderRadiusLG: 16,

      fontSize: baseTokens.fontSize,
      fontSizeSM: baseTokens.fontSizeSM,
      fontSizeLG: baseTokens.fontSizeLG,

      padding: 16,
      paddingContentVertical: 12,
      paddingContentVerticalSM: 8,
      paddingContentVerticalLG: 16,

      cellPaddingBlock: 12,
      cellPaddingBlockSM: 8,
      cellPaddingBlockLG: 16,
      cellPaddingInline: 16,
      cellPaddingInlineSM: 12,
      cellPaddingInlineLG: 20,

      headerBg: colors.navyLight,
      headerColor: colors.textSecondaryDark,
      headerSplitColor: "transparent",
      headerSortActiveBg: "rgba(255, 255, 255, 0.08)",
      headerSortHoverBg: "rgba(255, 255, 255, 0.06)",
      headerSortActiveColor: colors.textPrimaryDark,

      bodySortBg: "rgba(46, 204, 113, 0.05)",
      rowHoverBg: colors.navyLight,
      rowSelectedBg: "rgba(46, 204, 113, 0.08)",
      rowSelectedHoverBg: "rgba(46, 204, 113, 0.12)",
      rowExpandedBg: colors.navyLight,

      cellFontSize: baseTokens.fontSize,
      cellFontSizeSM: baseTokens.fontSizeSM,

      headerBorderRadius: 12,
      footerBg: colors.navyLight,
      footerColor: colors.textSecondaryDark,

      filterDropdownBg: colors.navyDark,
      filterDropdownMenuBg: colors.navyDark,

      expandIconBg: colors.navyDark,
      selectionColumnWidth: 32,
      stickyScrollBarBg: "rgba(255, 255, 255, 0.3)",
      stickyScrollBarBorderRadius: 100,
    },

    // Menu Component
    Menu: {
      colorBgContainer: colors.navyDark,
      colorBgElevated: colors.navyDark,
      colorItemBg: "transparent",
      colorItemBgHover: "rgba(46, 204, 113, 0.12)",
      colorItemBgActive: "rgba(46, 204, 113, 0.15)",
      colorItemBgSelected: "rgba(46, 204, 113, 0.12)",
      colorItemBgSelectedHorizontal: "rgba(46, 204, 113, 0.12)",

      colorItemText: colors.textSecondaryDark,
      colorItemTextHover: colors.vibrantGreen,
      colorItemTextSelected: colors.vibrantGreen,
      colorItemTextActive: colors.vibrantGreenActive,
      colorItemTextDisabled: colors.textDisabledDark,

      colorActiveBarWidth: 0,
      colorActiveBarHeight: 0,
      colorActiveBarBorderSize: 0,

      itemBorderRadius: 8,
      subMenuItemBorderRadius: 8,
      itemMarginBlock: 4,
      itemMarginInline: 8,
      itemPaddingInline: 16,
      itemHeight: 40,

      collapsedWidth: 64,
      collapsedIconSize: 16,

      iconSize: 18,
      iconMarginInlineEnd: 10,

      colorSubItemBg: "transparent",

      groupTitleColor: colors.textTertiaryDark,
      groupTitleFontSize: baseTokens.fontSizeSM,
      groupTitleLineHeight: baseTokens.lineHeightSM,

      horizontalItemBorderRadius: 8,
      horizontalItemHoverBg: "rgba(46, 204, 113, 0.12)",
      horizontalItemSelectedBg: "rgba(46, 204, 113, 0.12)",
      horizontalLineHeight: "46px",

      popupBg: colors.navyDark,

      darkItemBg: colors.deepNavy,
      darkSubMenuItemBg: colors.navyDark,
    },

    // Layout Component
    Layout: {
      headerBg: colors.navyDark,
      headerColor: colors.textPrimaryDark,
      headerHeight: 64,
      headerPadding: "0 24px",
      headerLineHeight: "64px",

      footerBg: colors.navyDark,
      footerPadding: "24px 24px",

      bodyBg: colors.deepNavy,

      siderBg: colors.navyDark,

      triggerBg: colors.navyLight,
      triggerColor: colors.textPrimaryDark,
      triggerHeight: 48,
      triggerLineHeight: "48px",

      zeroTriggerWidth: 48,
      zeroTriggerHeight: 48,

      lightSiderBg: colors.navyDark,
      lightTriggerBg: colors.navyLight,
      lightTriggerColor: colors.textPrimaryDark,
    },

    // Modal Component
    Modal: {
      contentBg: colors.navyDark,
      headerBg: colors.navyDark,
      titleColor: colors.textPrimaryDark,
      titleFontSize: 18,
      titleLineHeight: 1.5,

      borderRadiusLG: 16,

      boxShadow: shadows.xlDark,

      headerPadding: "20px 24px",
      headerMarginBottom: 8,
      headerBorderBottom: 0,
      headerCloseSize: 56,

      bodyPadding: "24px",

      footerPadding: "16px 24px",
      footerMarginTop: 0,
      footerBorderTop: 0,
      footerBorderRadius: "0 0 16px 16px",

      confirmBodyPadding: "32px 32px 24px",
      confirmIconMarginInlineEnd: 16,
      confirmBtnsMarginTop: 24,

      colorBgMask: "rgba(0, 0, 0, 0.6)",
      colorIconHover: colors.textSecondaryDark,
      colorIcon: colors.textTertiaryDark,
    },

    // Alert Component
    Alert: {
      colorInfoBg: "rgba(52, 152, 219, 0.12)",
      colorInfoBorder: "rgba(52, 152, 219, 0.25)",
      colorInfoText: colors.infoLight,

      colorSuccessBg: "rgba(46, 204, 113, 0.12)",
      colorSuccessBorder: "rgba(46, 204, 113, 0.25)",
      colorSuccessText: colors.successLight,

      colorWarningBg: "rgba(243, 156, 18, 0.12)",
      colorWarningBorder: "rgba(243, 156, 18, 0.25)",
      colorWarningText: colors.warningLight,

      colorErrorBg: "rgba(231, 76, 60, 0.12)",
      colorErrorBorder: "rgba(231, 76, 60, 0.25)",
      colorErrorText: colors.errorLight,

      borderRadiusLG: 12,
      borderRadius: 10,
      borderRadiusSM: 8,

      defaultPadding: "12px 16px",
      withDescriptionPadding: "16px 20px",
      withDescriptionIconSize: 24,

      fontSize: baseTokens.fontSize,
      lineHeight: baseTokens.lineHeight,

      iconSize: 16,
      closeIconSize: 14,
    },

    // Select Component
    Select: {
      colorBgContainer: colors.navyLight,
      colorBorder: colors.borderDark,
      colorBgElevated: colors.navyDark,
      colorTextPlaceholder: colors.textPlaceholderDark,
      colorText: colors.textPrimaryDark,
      colorTextDisabled: colors.textDisabledDark,

      colorPrimaryHover: colors.vibrantGreen,
      colorPrimary: colors.vibrantGreen,

      optionSelectedBg: "rgba(46, 204, 113, 0.15)",
      optionSelectedColor: colors.vibrantGreen,
      optionActiveBg: "rgba(46, 204, 113, 0.12)",
      optionPadding: "8px 12px",
      optionFontSize: baseTokens.fontSize,
      optionLineHeight: baseTokens.lineHeight,
      optionHeight: 36,

      controlHeight: baseTokens.controlHeight,
      controlHeightSM: baseTokens.controlHeightSM,
      controlHeightLG: baseTokens.controlHeightLG,

      borderRadius: 10,
      borderRadiusSM: 8,
      borderRadiusLG: 12,

      selectorBg: colors.navyLight,
      clearBg: colors.navyLight,

      singleItemHeightLG: 40,

      multipleItemBg: "rgba(46, 204, 113, 0.15)",
      multipleItemBorderColor: "transparent",
      multipleItemHeight: 24,
      multipleItemHeightSM: 16,
      multipleItemHeightLG: 28,
      multipleItemBorderColorDisabled: "transparent",
      multipleItemColorDisabled: colors.textDisabledDark,
      multipleSelectorBgDisabled: colors.navyDark,

      showArrowPaddingInlineEnd: 28,
      fontSize: baseTokens.fontSize,
    },

    // Tabs Component
    Tabs: {
      itemColor: colors.textSecondaryDark,
      itemHoverColor: colors.vibrantGreen,
      itemSelectedColor: colors.vibrantGreen,
      itemActiveColor: colors.vibrantGreenActive,

      inkBarColor: colors.vibrantGreen,

      cardBg: colors.navyDark,
      cardGutter: 4,
      cardPadding: "12px 16px",
      cardPaddingSM: "8px 12px",
      cardPaddingLG: "16px 20px",
      cardHeight: 40,

      titleFontSize: baseTokens.fontSize,
      titleFontSizeLG: baseTokens.fontSizeLG,
      titleFontSizeSM: baseTokens.fontSizeSM,

      horizontalItemGutter: 32,
      horizontalItemPadding: "12px 0",
      horizontalItemPaddingSM: "8px 0",
      horizontalItemPaddingLG: "16px 0",
      horizontalMargin: "0 0 16px 0",

      verticalItemPadding: "8px 24px",
      verticalItemMargin: "4px 0",

      cardBorderRadius: 8,
    },

    // Progress Component
    Progress: {
      defaultColor: colors.vibrantGreen,
      remainingColor: "rgba(255, 255, 255, 0.1)",
      circleTextColor: colors.textPrimaryDark,
      lineBorderRadius: 100,
      circleTextFontSize: "1em",
      circleIconFontSize: "1em",
    },

    // Tag Component
    Tag: {
      defaultBg: colors.navyLight,
      defaultColor: colors.textPrimaryDark,
      borderRadiusSM: 6,
      fontSizeSM: baseTokens.fontSizeSM,
      lineHeightSM: baseTokens.lineHeightSM,
    },

    // Badge Component
    Badge: {
      indicatorHeight: 20,
      indicatorHeightSM: 16,
      dotSize: 6,
      textFontSize: baseTokens.fontSizeSM,
      textFontSizeSM: 10,
      textFontWeight: 500,
      statusSize: 6,
      colorBorderBg: colors.navyDark,
    },

    // Switch Component
    Switch: {
      trackHeight: 22,
      trackHeightSM: 16,
      trackMinWidth: 44,
      trackMinWidthSM: 28,
      trackPadding: 2,
      innerMinMargin: 4,
      innerMaxMargin: 24,
      innerMinMarginSM: 3,
      innerMaxMarginSM: 18,
      handleSize: 18,
      handleSizeSM: 12,
      handleShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.4)",
      handleBg: colors.textPrimaryDark,
      colorPrimary: colors.vibrantGreen,
      colorPrimaryHover: colors.vibrantGreenHover,
    },

    // Radio Component
    Radio: {
      colorPrimary: colors.vibrantGreen,
      colorPrimaryHover: colors.vibrantGreenHover,
      colorPrimaryActive: colors.vibrantGreenActive,
      dotSize: 8,
      dotColorDisabled: colors.textDisabledDark,
      buttonBg: colors.navyLight,
      buttonCheckedBg: colors.navyLight,
      buttonColor: colors.textPrimaryDark,
      buttonPaddingInline: 16,
      buttonCheckedBgDisabled: colors.navyDark,
      buttonCheckedColorDisabled: colors.textDisabledDark,
      wrapperMarginInlineEnd: 8,
    },

    // Checkbox Component
    Checkbox: {
      colorPrimary: colors.vibrantGreen,
      colorPrimaryHover: colors.vibrantGreenHover,
      colorPrimaryActive: colors.vibrantGreenActive,
      colorBorder: colors.borderDark,
      colorBgContainer: colors.navyLight,
      borderRadiusSM: 4,
      lineWidth: 1,
    },

    // Slider Component
    Slider: {
      colorPrimary: colors.vibrantGreen,
      colorPrimaryBorder: colors.vibrantGreen,
      colorPrimaryBorderHover: colors.vibrantGreenHover,
      dotBorderColor: colors.borderDark,
      dotActiveBorderColor: colors.vibrantGreen,
      trackBg: "rgba(255, 255, 255, 0.1)",
      trackHoverBg: "rgba(255, 255, 255, 0.15)",
      railBg: "rgba(255, 255, 255, 0.1)",
      railHoverBg: "rgba(255, 255, 255, 0.15)",
      handleColor: colors.vibrantGreen,
      handleActiveColor: colors.vibrantGreen,
      handleSize: 14,
      handleSizeHover: 16,
      handleLineWidth: 2,
      handleLineWidthHover: 4,
      borderRadius: baseTokens.borderRadius,
    },

    // Tooltip Component
    Tooltip: {
      colorBgSpotlight: "rgba(255, 255, 255, 0.95)",
      colorTextLightSolid: colors.deepNavy,
      borderRadius: 8,
      borderRadiusSM: 6,
      fontSize: baseTokens.fontSizeSM,
      lineHeight: baseTokens.lineHeightSM,
      paddingSM: "6px 8px",
      paddingXS: "4px 6px",
    },

    // Notification Component
    Notification: {
      width: 384,
      borderRadiusLG: 12,
      boxShadow: shadows.xlDark,
      padding: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      paddingContentHorizontal: 16,
      marginBottom: 16,
      marginEdge: 24,
    },

    // Dropdown Component
    Dropdown: {
      paddingBlock: 4,
      paddingXXS: 8,
      controlPaddingHorizontal: 12,
      borderRadiusLG: 12,
      borderRadiusSM: 8,
      borderRadiusOuter: 4,
      boxShadowSecondary: shadows.largeDark,
      fontSize: baseTokens.fontSize,
      lineHeight: baseTokens.lineHeight,
      colorBgElevated: colors.navyDark,
      colorText: colors.textPrimaryDark,
    },

    // Pagination Component
    Pagination: {
      itemBg: colors.navyLight,
      itemSize: 32,
      itemSizeSM: 24,
      itemActiveBg: colors.vibrantGreen,
      itemActiveColorDisabled: colors.textDisabledDark,
      itemActiveBgDisabled: colors.navyDark,
      itemLinkBg: colors.navyLight,
      itemInputBg: colors.navyLight,
      miniOptionsSizeChangerTop: 0,
      borderRadius: 8,
      fontSize: baseTokens.fontSize,
      fontSizeSM: baseTokens.fontSizeSM,
    },

    // DatePicker Component
    DatePicker: {
      cellHeight: 24,
      cellWidth: 36,
      textHeight: 40,
      withoutTimeCellHeight: 66,
      cellBorderRadius: 8,
      cellHoverBg: "rgba(46, 204, 113, 0.12)",
      cellActiveWithRangeBg: "rgba(46, 204, 113, 0.15)",
      cellHoverWithRangeBg: "rgba(46, 204, 113, 0.08)",
      cellRangeBorderColor: colors.vibrantGreen,
      cellBgDisabled: colors.navyDark,
      timeColumnWidth: 56,
      timeColumnHeight: 224,
      timeCellHeight: 28,
      cellWeekFontSize: baseTokens.fontSizeSM,
      activeBg: colors.vibrantGreen,
      activeBorderColor: colors.vibrantGreen,
      activeShadow: "0 0 0 2px rgba(46, 204, 113, 0.15)",
      cellActiveWithRangeBg: "rgba(46, 204, 113, 0.15)",
    },

    // Divider Component
    Divider: {
      colorSplit: colors.borderDark,
      colorText: colors.textTertiaryDark,
      colorTextHeading: colors.textSecondaryDark,
      orientMargin: 0.05,
      orientMarginPercent: 5,
      verticalMarginInline: 8,
      lineWidth: 1,
      fontSize: baseTokens.fontSize,
      fontSizeLG: baseTokens.fontSizeLG,
      fontSizeSM: baseTokens.fontSizeSM,
      textPaddingInline: "1em",
    },

    // Skeleton Component
    Skeleton: {
      color: colors.navyLight,
      colorGradientEnd: "rgba(255, 255, 255, 0.12)",
      borderRadiusSM: 4,
      blockRadius: 8,
      paragraphMarginTop: 28,
      paragraphLiMarginTop: 16,
      titleHeight: 16,
      titleMarginTop: 16,
    },

    // Spin Component
    Spin: {
      colorPrimary: colors.vibrantGreen,
      colorBgContainer: "rgba(255, 255, 255, 0.08)",
      contentHeight: 400,
      dotSize: 20,
      dotSizeSM: 14,
      dotSizeLG: 32,
    },

    // Steps Component
    Steps: {
      colorPrimary: colors.vibrantGreen,
      waitIconBgColor: colors.navyLight,
      finishIconBgColor: "rgba(46, 204, 113, 0.15)",
    },

    // Collapse Component
    Collapse: {
      headerBg: colors.navyDark,
      contentBg: colors.navyDark,
      colorBorder: "transparent",
      colorText: colors.textPrimaryDark,
      colorTextHeading: colors.textPrimaryDark,
    },

    // Timeline Component
    Timeline: {
      tailColor: colors.borderDark,
      dotBg: colors.navyDark,
      dotColor: colors.vibrantGreen,
    },

    // Transfer Component
    Transfer: {
      colorBgContainer: colors.navyDark,
      colorBorder: colors.borderDark,
      colorText: colors.textPrimaryDark,
      colorTextDisabled: colors.textDisabledDark,
      headerBg: colors.navyLight,
      footerBg: colors.navyLight,
    },

    // Tree Component
    Tree: {
      nodeHoverBg: "rgba(46, 204, 113, 0.12)",
      nodeSelectedBg: "rgba(46, 204, 113, 0.15)",
      directoryNodeSelectedBg: "rgba(46, 204, 113, 0.12)",
      directoryNodeSelectedColor: colors.vibrantGreen,
      colorBgContainer: colors.navyDark,
      colorText: colors.textPrimaryDark,
      colorPrimary: colors.vibrantGreen,
    },

    // Upload Component
    Upload: {
      actionsColor: colors.textTertiaryDark,
      colorBorder: colors.borderDark,
      colorBorderHover: colors.borderDarkHover,
      colorText: colors.textPrimaryDark,
      colorTextHeading: colors.textPrimaryDark,
      colorFillAlter: colors.navyLight,
    },

    // Avatar Component
    Avatar: {
      colorBgContainer: colors.vibrantGreen,
      colorText: colors.deepNavy,
      colorTextPlaceholder: colors.deepNavy,
      groupBorderColor: colors.navyDark,
    },

    // Drawer Component
    Drawer: {
      colorBgElevated: colors.navyDark,
      colorBgMask: "rgba(0, 0, 0, 0.6)",
      colorText: colors.textPrimaryDark,
      colorIcon: colors.textTertiaryDark,
      colorIconHover: colors.textSecondaryDark,
    },

    // Form Component
    Form: {
      labelColor: colors.textSecondaryDark,
      labelRequiredMarkColor: colors.errorLight,
    },

    // Descriptions Component
    Descriptions: {
      labelBg: colors.navyLight,
      titleColor: colors.textPrimaryDark,
      contentColor: colors.textPrimaryDark,
      extraColor: colors.textSecondaryDark,
    },

    // Popover Component
    Popover: {
      colorBgElevated: colors.navyDark,
      colorText: colors.textPrimaryDark,
      boxShadowSecondary: shadows.largeDark,
    },

    // Message Component
    Message: {
      contentBg: colors.navyDark,
      boxShadow: shadows.mediumDark,
    },

    // Anchor Component
    Anchor: {
      colorPrimary: colors.vibrantGreen,
      colorPrimaryHover: colors.vibrantGreenHover,
      colorSplit: colors.borderDark,
    },

    // Breadcrumb Component
    Breadcrumb: {
      linkColor: colors.textTertiaryDark,
      linkHoverColor: colors.textPrimaryDark,
      separatorColor: colors.textTertiaryDark,
      itemColor: colors.textPrimaryDark,
      lastItemColor: colors.textPrimaryDark,
    },

    // Cascader Component
    Cascader: {
      optionSelectedBg: "rgba(46, 204, 113, 0.15)",
      menuBg: colors.navyDark,
    },

    // Rate Component
    Rate: {
      starColor: colors.warning,
      starBg: colors.navyLight,
    },

    // Segmented Component
    Segmented: {
      itemColor: colors.textSecondaryDark,
      itemHoverColor: colors.textPrimaryDark,
      itemSelectedBg: colors.navyDark,
      itemSelectedColor: colors.textPrimaryDark,
      itemActiveBg: colors.navyLight,
      trackBg: colors.navyLight,
    },
  },
};

// Helper function to get theme based on mode
export const getTheme = (isDark = false) => {
  return isDark ? darkTheme : lightTheme;
};

// Default export (light theme)
export default lightTheme;
