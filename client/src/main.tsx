// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from './App';
import { ConfigProvider, App as AntApp } from "antd"; // Import AntApp
import "./index.css";
import { qsiTheme } from './components/theme/theme';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: virtual module provided by vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider theme={qsiTheme}>
      <AntApp> {/* Wrap your App here */}
        <App />
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>
);