// admin-client/src/context/FallbackTheme.js
import { theme } from 'antd';

export const fallbackLightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#7e57c2',
    colorBgBase: '#ffffff',
    colorBgContainer: '#f5f5f5',
    colorText: '#333333',
    colorTextSecondary: '#666666',
    colorBorder: '#d9d9d9',
    borderRadius: 8,
  }
};

export const fallbackDarkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#b085f5',
    colorBgBase: '#0f0f23',
    colorBgContainer: '#1a1a2e',
    colorText: '#e0e0e0',
    colorTextSecondary: '#a0a0a0',
    colorBorder: '#303050',
    borderRadius: 8,
  }
};