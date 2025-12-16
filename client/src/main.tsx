// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from './App';
import { ConfigProvider, App as AntApp } from "antd"; // Import AntApp
import "./index.css";
import { qsiTheme } from './components/theme/theme';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider theme={qsiTheme}>
      <AntApp> {/* Wrap your App here */}
        <App />
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>
);