import React, { useState } from "react";
import { Layout } from "antd";
import Sidebar from "../components/Sidebar/Sidebar"; // Import the Sidebar component
import FriendListPage from "../components/Home/FriendListPage";
import MessageWindow from "../components/Home/MessageWindow";

const { Sider, Content } = Layout;

const Home = () => {
  const [selectedFriend, setSelectedFriend] = useState(null); // State to hold the selected friend's username

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar - 10% Width & Height */}
      <Sider width="4vw" style={{ backgroundColor: "#001529", height: "100vh" }}>
        <Sidebar />
      </Sider>

      {/* Content - 90% Width */}
      <Layout style={{ height: "100vh", width: "96vw" }}>
        <Content style={{ height: "100%", width: "100%", overflow: "hidden", padding: "20px" }}>
          <div style={{ display: "flex", width: "100%", height: "100%", gap: "10px" }}>
            {/* Friend List - 20% Width & Height */}
            <div style={{ width: "20%", height: "100%", backgroundColor: "white", borderRadius: "8px" }}>
              <FriendListPage setSelectedFriend={setSelectedFriend} />
            </div>

            {/* Message Window - 70% Width & Height */}
            <div
              style={{
                width: "80%",
                height: "100%",
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <MessageWindow selectedFriend={selectedFriend} />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;
