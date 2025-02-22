import React, { useState, useEffect, useRef } from 'react';
import { Typography, Avatar, Input } from 'antd';
import { UserOutlined, SendOutlined } from '@ant-design/icons';
import { fetchChatHistory } from '../../api/Message/messageapi'; // Import the function for fetching chat history
import { getAccessToken } from '../../api/authToken'; // Adjust the import for access token

const { Title } = Typography;

const MessageWindow = ({ selectedFriend }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  // Fetch chat history whenever selectedFriend changes
  useEffect(() => {
    const fetchChat = async () => {
      const chatHistory = await fetchChatHistory(selectedFriend); // Get chat history
      setMessages(chatHistory); // Update the state with fetched messages
    };

    fetchChat(); // Fetch the chat history when the component mounts or selectedFriend changes

    // Open WebSocket connection when selectedFriend changes
    const token = getAccessToken(); // Get access token
    if (token) {
      // Updated WebSocket URL to use ws://
      socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${selectedFriend}?token=${token}`);

      socketRef.current.onopen = () => {
        console.log("WebSocket connection opened.");
      };

      socketRef.current.onmessage = (event) => {
        const newMessage = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      };

      socketRef.current.onclose = () => {
        console.log("WebSocket connection closed.");
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    }

    // Cleanup WebSocket connection when component unmounts or selectedFriend changes
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [selectedFriend]);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Handle sending a message when the Send button is clicked
  const handleSendMessage = () => {
    if (message.trim() && socketRef.current) {
      const messageData = {
        content: message,
      };
      socketRef.current.send(JSON.stringify(messageData)); // Send message to WebSocket server
      setMessage(''); // Clear the input field after sending
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid #ddd' }}>
        <Avatar size={50} style={{ marginRight: '10px' }} icon={<UserOutlined />}>
          {selectedFriend ? getInitials(selectedFriend) : ''}
        </Avatar>
        {selectedFriend ? (
          <Title level={4} style={{ margin: 0 }}>{selectedFriend}</Title>
        ) : (
          <p>Select a friend to start chatting</p>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '15px', backgroundColor: '#f9f9f9', marginBottom: '10px' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              padding: '10px',
              backgroundColor: msg.sender_name === selectedFriend ? '#f1f1f1' : '#e6f7ff', // Light blue background like Ant Design's blue3
              borderRadius: '10px',
              marginBottom: '10px',
              alignSelf: msg.sender_name === selectedFriend ? 'flex-start' : 'flex-end',
            }}
          >
            <p>
              <strong>{msg.sender_name === selectedFriend ? selectedFriend : 'You'}:</strong> {msg.content}
            </p>
            <small>{new Date(msg.created_at).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px', display: 'flex', alignItems: 'center', borderTop: '1px solid #ddd' }}>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, marginRight: '10px' }}
          onPressEnter={handleSendMessage} // Optional: Send message when Enter is pressed
        />
        <SendOutlined
          style={{
            fontSize: '24px',
            color: message.trim() ? '#1890ff' : '#ccc',
            cursor: message.trim() ? 'pointer' : 'not-allowed',
          }}
          onClick={handleSendMessage} // Trigger message send when the button is clicked
        />
      </div>
    </div>
  );
};

export default MessageWindow;
