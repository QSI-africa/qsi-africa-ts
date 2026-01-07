// admin-client/src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { theme } from 'antd';
import { fallbackLightTheme, fallbackDarkTheme } from './FallbackTheme';

// Try to import the main themes, fall back to basic ones if there's an error
let mainLightTheme, mainDarkTheme;

try {
  const mainThemes = require('../theme/theme');
  mainLightTheme = mainThemes.lightTheme;
  mainDarkTheme = mainThemes.darkTheme;
} catch (error) {
  console.warn('Could not load main themes, using fallback:', error);
  mainLightTheme = fallbackLightTheme;
  mainDarkTheme = fallbackDarkTheme;
}

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('qsi-theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('qsi-theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Use the main themes or fallback
  const themeConfig = isDarkMode ? mainDarkTheme : mainLightTheme;

  const value = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? 'dark' : 'light',
    themeConfig,
    token: themeConfig?.token || {}
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};