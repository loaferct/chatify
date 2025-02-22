import React, { useEffect, useState } from "react";
import { FriendList } from "../../api/Home/FriendList";
import { List, Avatar, Card, message, Button, Popover, Modal, Input } from "antd";
import { UserDeleteOutlined, StopOutlined } from "@ant-design/icons";
import { removeFriend, blockFriend, unblockFriend } from "../../api/Friends/friendActions";

export default function FriendCard() {
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFriend, setCurrentFriend] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFriendList = async () => {
      try {
        const data = await FriendList();
        setFriends(data);
        setFilteredFriends(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load friends list.");
        setLoading(false);
        message.error("Failed to load friends list.");
      }
    };
    fetchFriendList();
  }, []);

  useEffect(() => {
    setFilteredFriends(
      friends.filter(friend =>
        friend.friend_username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, friends]);

  const getAvatar = (username) => {
    return username
      .split(" ")
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  const showModal = (action, friendUsername) => {
    setCurrentFriend({ action, friendUsername });
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      if (currentFriend.action === "remove") {
        await removeFriend(currentFriend.friendUsername);
        setFriends(friends.filter(friend => friend.friend_username !== currentFriend.friendUsername));
      } else if (currentFriend.action === "block") {
        await blockFriend(currentFriend.friendUsername);
        setFriends(prev => prev.map(friend => friend.friend_username === currentFriend.friendUsername ? { ...friend, is_blocked: true } : friend));
      } else if (currentFriend.action === "unblock") {
        await unblockFriend(currentFriend.friendUsername);
        setFriends(prev => prev.map(friend => friend.friend_username === currentFriend.friendUsername ? { ...friend, is_blocked: false } : friend));
      }
    } catch (err) {
      console.log("Error processing action:", err);
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Input
        placeholder="Search friends..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "10px", width: "100%" }}
      />
      <List
        dataSource={filteredFriends}
        renderItem={(friend) => (
          <List.Item
            key={friend.id}
            style={{
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <List.Item.Meta
              avatar={<Avatar style={{ color: "white" }}>{getAvatar(friend.friend_username)}</Avatar>}
              title={friend.friend_username}
            />
            <div>
              <Popover content="Remove Friend" trigger="hover" placement="topRight">
                <Button
                  type="primary"
                  icon={<UserDeleteOutlined />}
                  onClick={() => showModal("remove", friend.friend_username)}
                  style={{
                    marginLeft: "10px",
                    border: "2px solid red",
                    color: "red",
                    backgroundColor: "white",
                    fontSize: "16px",
                    padding: "5px 15px",
                  }}
                />
              </Popover>
              <Popover content={friend.is_blocked ? "Unblock Friend" : "Block Friend"} trigger="hover" placement="topRight">
                <Button
                  type="primary"
                  icon={<StopOutlined />}
                  onClick={() => showModal(friend.is_blocked ? "unblock" : "block", friend.friend_username)}
                  style={{
                    marginLeft: "10px",
                    border: friend.is_blocked ? "2px solid green" : "2px solid red",
                    color: friend.is_blocked ? "green" : "red",
                    backgroundColor: "white",
                    fontSize: "16px",
                    padding: "5px 15px",
                  }}
                />
              </Popover>
            </div>
          </List.Item>
        )}
      />
      <Modal
        title={`Confirm ${currentFriend?.action === "remove" ? "Remove" : currentFriend?.action === "unblock" ? "Unblock" : "Block"} Friend`}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Yes"
        cancelText="No"
      >
        <p>
          Are you sure you want to {currentFriend?.action === "remove" ? "remove" : currentFriend?.action === "unblock" ? "unblock" : "block"} {currentFriend?.friendUsername}?
        </p>
      </Modal>
    </div>
  );
}
