import { theme } from "antd";
const { useToken } = theme;

export const useThemeMode = () => {
  const { token } = useToken();

  // Your specific theme colors from theme.js
  const THEME_CONFIG = {
    light: {
      bgBase: "#f5f7fa", // lightGray
      bgContainer: "#ffffff", // lightGrayLight
      text: "#1a2332", // textPrimary
      navy: "#1a2332", // deepNavy
    },
    dark: {
      bgBase: "#1a2332", // deepNavy
      bgContainer: "#0f1621", // navyDark
      text: "#f8fafc", // textPrimaryDark
      navy: "#0f1621", // navyDark
    },
  };

  const isDarkMode =
    token.colorBgBase === THEME_CONFIG.dark.bgBase ||
    token.colorBgContainer === THEME_CONFIG.dark.bgContainer;

  const isLightMode =
    token.colorBgBase === THEME_CONFIG.light.bgBase ||
    token.colorBgContainer === THEME_CONFIG.light.bgContainer;

  return {
    isDarkMode,
    isLightMode,
    mode: isDarkMode ? "dark" : isLightMode ? "light" : "unknown",
    token,
  };
};
