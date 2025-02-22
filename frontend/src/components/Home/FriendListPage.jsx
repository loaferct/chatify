import React, { useEffect, useState } from "react";
import { Avatar, List, message, Card, Input, Typography } from "antd";
import { FriendList } from "../../api/Home/FriendList"; // Import the FriendList function

const { Title } = Typography;

const FriendListPage = ({ cardStyle, setSelectedFriend }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState(""); // State for search text
  const [selectedFriend, setSelectedFriendState] = useState(null); // Track selected friend

  const fetchFriendList = async () => {
    try {
      const friends = await FriendList(); // Call the function directly (it handles the token internally)
      setData(friends);
      message.success(`${friends.length} friends loaded!`);
    } catch (error) {
      setError("Failed to fetch friend list");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendList();
  }, []);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredData = data.filter((friend) =>
    friend.friend_username.toLowerCase().includes(searchText.toLowerCase())
  );

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("");
  };

  const handleFriendSelect = (friend) => {
    setSelectedFriend(friend.friend_username); // Pass selected friend to parent component
    setSelectedFriendState(friend.friend_username); // Track selected friend locally
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Card style={cardStyle} title="Friends">
      <Input
        placeholder="Search Friends"
        value={searchText}
        onChange={handleSearch}
        style={{ marginBottom: "5px" }}
      />
      
      <List
        dataSource={filteredData}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            onClick={() => handleFriendSelect(item)}
            style={{
              cursor: 'pointer',
              backgroundColor: selectedFriend === item.friend_username ? '#e6f7ff' : 'transparent', // Light blue if selected
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = selectedFriend === item.friend_username ? '#e6f7ff' : '#f0f0f0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedFriend === item.friend_username ? '#e6f7ff' : 'transparent'}
          >
            <List.Item.Meta
              avatar={<Avatar>{getInitials(item.friend_username)}</Avatar>}
              title={item.friend_username}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default FriendListPage;