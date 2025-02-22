import React from "react";
import { Layout, Menu, Tooltip } from "antd";
import { MessageOutlined, UserAddOutlined, TeamOutlined, LogoutOutlined, ClockCircleOutlined, BookOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import routes from "../../routes/routes"; // Assuming your routes object is in a file named routes.js
import { removeAccessToken } from "../../api/authToken"; // Your token removal function

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const location = useLocation(); // Get the current location (current route)

  const handleMenuClick = (key) => {
    switch (key) {
      case "1":
        navigate(routes.home);
        break;
      case "2":
        navigate(routes.friends);
        break;
      case "3":
        navigate(routes.pending);
        break;
      case "4":
        navigate(routes.add_friends);
        break;
      case "6":
        navigate(routes.story); // Navigate to stories page
        break;
      case "5":
        handleLogout(); // Call the logout handler
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    removeAccessToken(); // Clear access token
    navigate(routes.login); // Navigate to login page after logout
  };

  // Set the selected key based on the current location
  const getSelectedKey = () => {
    switch (location.pathname) {
      case routes.home:
        return "1";
      case routes.friends:
        return "2";
      case routes.pending:
        return "3";
      case routes.add_friends:
        return "4";
      case routes.story:
        return "6"; // Set selected key for stories
      default:
        return "1"; // Default to "1" if no match
    }
  };

  return (
    <Sider
      width="4vw"
      style={{
        backgroundColor: "white",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between", // Space items with logout at the bottom
        alignItems: "center",
        paddingTop: "20px", // Added padding at the top
        paddingBottom: "20px", // Added padding at the bottom
      }}
    >
      <Menu
        theme="light"
        mode="vertical"
        selectedKeys={[getSelectedKey()]} // Set the selected key dynamically based on the current route
        style={{ width: "100%", borderRight: 0, textAlign: "center", flexGrow: 1 }}
        onClick={({ key }) => handleMenuClick(key)} // Handle menu click
      >
        <Menu.Item key="1">
          <Tooltip title="Message" placement="left">
            <MessageOutlined style={{ fontSize: "24px" }} />
          </Tooltip>
        </Menu.Item>
        <Menu.Item key="2">
          <Tooltip title="Friends" placement="left">
            <TeamOutlined style={{ fontSize: "24px" }} />
          </Tooltip>
        </Menu.Item>
        <Menu.Item key="3">
          <Tooltip title="Pending" placement="left">
            <ClockCircleOutlined style={{ fontSize: "24px" }} />
          </Tooltip>
        </Menu.Item>
        <Menu.Item key="4">
          <Tooltip title="Add Friends" placement="left">
            <UserAddOutlined style={{ fontSize: "24px" }} />
          </Tooltip>
        </Menu.Item>
        {/* Add the new "Stories" menu item */}
        <Menu.Item key="6">
          <Tooltip title="Stories" placement="left">
            <BookOutlined style={{ fontSize: "24px" }} />
          </Tooltip>
        </Menu.Item>
      </Menu>

      {/* Logout menu */}
      <Menu theme="light" mode="vertical" style={{ width: "100%", borderRight: 0, textAlign: "center" }}>
        <Menu.Item key="5" style={{ color: "red", marginBottom: "10px" }} onClick={() => handleLogout()}>
          <Tooltip title="Logout" placement="left">
            <LogoutOutlined style={{ fontSize: "24px", color: "red" }} />
          </Tooltip>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
