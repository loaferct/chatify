import React, { useEffect, useState } from "react";
import { getPendingFriends, acceptFriendRequest, rejectFriendRequest } from "../../api/Pending/PendingApi"; // Import API functions
import { List, Card, Button, message } from "antd"; // Ant Design components
import dayjs from "dayjs"; // For formatting the date
import relativeTime from "dayjs/plugin/relativeTime"; // Import the relativeTime plugin

dayjs.extend(relativeTime); // Extend dayjs with relativeTime

export default function PendingCard() {
  const [pendingFriends, setPendingFriends] = useState([]); // Store pending friends
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error state

  useEffect(() => {
    const fetchPendingFriends = async () => {
      try {
        const data = await getPendingFriends(); // Fetch the pending friends
        setPendingFriends(data); // Set the response data to state
      } catch (err) {
        setError("Failed to load pending friends.");
      } finally {
        setLoading(false); // Stop loading in all cases
      }
    };

    fetchPendingFriends(); // Fetch data when the component mounts
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading message while data is being fetched
  }

  if (error) {
    return <div>{error}</div>; // Show error message if there was an issue
  }

  const handleAccept = async (friendUsername) => {
    try {
      await acceptFriendRequest(friendUsername);
      message.success(`Accepted friend request from ${friendUsername}`);

      // Remove the accepted friend from the pending list
      setPendingFriends((prevFriends) =>
        prevFriends.filter((friend) => friend.friend_username !== friendUsername)
      );
    } catch (error) {
      message.error(`Failed to accept request from ${friendUsername}`);
    }
  };

  const handleReject = async (friendUsername) => {
    try {
      await rejectFriendRequest(friendUsername);
      message.success(`Rejected friend request from ${friendUsername}`);

      // Remove the rejected friend from the pending list
      setPendingFriends((prevFriends) =>
        prevFriends.filter((friend) => friend.friend_username !== friendUsername)
      );
    } catch (error) {
      message.error(`Failed to reject request from ${friendUsername}`);
    }
  };

  return (
    <List
      grid={{
        gutter: 16,
        md: 4,
        lg: 4,
        xl: 4,
        xxl: 4,
      }}
      dataSource={pendingFriends} // Use the fetched data
      renderItem={(friend) => (
        <List.Item key={friend.friend_username}>
          <Card
            title={friend.friend_username} // Use friend_username as the title
            extra={dayjs(friend.created_at).fromNow()} // Show the time in a relative format
          >
            <div style={{ display: "flex" }}>
              <Button
                onClick={() => handleAccept(friend.friend_username)}
                type="primary"
                style={{ flex: 1, marginRight: "4px" }} // Button takes 50% width and adds some margin
              >
                Accept
              </Button>
              <Button
                onClick={() => handleReject(friend.friend_username)}
                type="danger"
                style={{ flex: 1, marginLeft: "4px" }} // Button takes 50% width and adds some margin
              >
                Reject
              </Button>
            </div>
          </Card>
        </List.Item>
      )}
    />
  );
}
