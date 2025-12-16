// admin-client/src/components/ThemeToggle.jsx
import React from "react";
import { Button, Switch, Space, Tooltip } from "antd";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = ({ type = "switch", size = "default" }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  if (type === "switch") {
    return (
      <Tooltip title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}>
        <Switch
          checked={isDarkMode}
          onChange={toggleTheme}
          checkedChildren={<BulbFilled />}
          unCheckedChildren={<BulbOutlined />}
          size={size}
        />
      </Tooltip>
    );
  }

  if (type === "button") {
    return (
      <Tooltip title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}>
        <Button
          type="text"
          icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
          onClick={toggleTheme}
          size={size}
          style={{
            color: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      </Tooltip>
    );
  }

  return null;
};

export default ThemeToggle;
