import React, { useState } from "react";
import { Input, Button, Card } from "antd";
import { AddFriend } from "../../api/AddFriends/AddFriends";

export default function AddCard() {
  const [searchTerm, setSearchTerm] = useState("");

  // Handle button click to call AddFriend with the search term
  const handleAddClick = async () => {
    if (searchTerm) {
      try {
        await AddFriend(searchTerm); // Call AddFriend with the search term
      } catch (err) {
        console.error("Error adding friend:", err);
      }
    } else {
      message.error("Please enter a username.");
    }
  };

  return (
    <Card
      style={{
        borderRadius: "8px",
        padding: "15px",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        gap: "10px", // Space between search bar and button
      }}
    >
      {/* Search Bar */}
      <Input
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          flex: 1, // Makes the search bar take up available space
          borderRadius: "5px",
          fontSize: "16px",
          padding: "8px",
        }}
      />

      {/* Button */}
      <Button
        type="primary"
        onClick={handleAddClick} // Trigger the function on button click
        style={{
          border: "2px solid blue",
          color: "white",
          backgroundColor: "blue",
          fontSize: "16px",
          padding: "5px 15px",
          borderRadius: "5px",
        }}
      >
        Add
      </Button>
    </Card>
  );
}
