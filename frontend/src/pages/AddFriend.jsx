import React from 'react';
import { Layout, Card } from 'antd'; // Import Card from Ant Design
import Sidebar from "../components/Sidebar/Sidebar"; // Import Sidebar component
import AddCard from "../components/AddFriends/AddCard"; // Import AddCard component

const { Sider, Content } = Layout;

const AddFriend = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar - 10% Width & Height */}
      <Sider width="4vw" style={{ backgroundColor: "#001529", height: "100vh" }}>
        <Sidebar />
      </Sider>

      {/* Content - 90% Width */}
      <Layout style={{ height: "100vh", width: "96vw" }}>
        <Content style={{ height: "100%", width: "100%", overflow: "hidden", backgroundColor: "#f0f2f5" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", padding: "20px"}}>
            {/* Ant Design Card - Full screen with padding and gray background */}
            <Card
              title="Add a Friend"        
              style={{
                width: "100%",  // Adjust width to leave some space around the card
                height: "100%", // Adjust height to leave space around the card
                borderRadius: "8px",
                padding: "0px", // Adjust padding for better spacing inside the card
                backgroundColor: "#ffffff",  // Card background color
                overflow: "hidden",
              }}
            >
              <AddCard /> {/* Imported AddCard component */}
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AddFriend;
