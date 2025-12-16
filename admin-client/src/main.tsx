// admin-client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConfigProvider, App as AntApp } from 'antd';
import { AuthProvider } from './context/AuthContext'; // <-- 1. Import
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <AntApp>
        <AuthProvider> 
          <App />
        </AuthProvider>
      </AntApp>
  </React.StrictMode>
);