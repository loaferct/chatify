import axios from "axios";
import API_ENDPOINTS from "../../config/api"; // Import the API endpoints
import { message } from "antd"; // Use Ant Design's message component for feedback
import { getAccessToken } from "../authToken"; // Import getAccessToken function from authToken

export const removeFriend = async (friendUsername) => {
  try {
    const token = getAccessToken(); // Get the token using the imported function

    // Call the API to delete the friend
    const response = await axios.delete(API_ENDPOINTS.DELETE_FRIEND.replace("{friend_username}", friendUsername), {
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token manually in the headers
      },
    });
    message.success(`Successfully removed friend: ${friendUsername}`);
    return response.data; // Return the response data, if needed
  } catch (err) {
    message.error("Failed to remove friend.");
    throw err;
  }
};

export const blockFriend = async (friendUsername) => {
  try {
    const token = getAccessToken(); // Get the token using the imported function

    // Call the API to block the friend
    const response = await axios.post(API_ENDPOINTS.BLOCK_FRIEND.replace("{friend_username}", friendUsername), {}, {
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token manually in the headers
      },
    });
    message.success(`Successfully blocked friend: ${friendUsername}`);
    return response.data; // Return the response data, if needed
  } catch (err) {
    message.error("Failed to block friend.");
    throw err;
  }
};

export const unblockFriend = async (friendUsername) => {
  try {
    const token = getAccessToken(); // Get the token using the imported function

    // Call the API to unblock the friend
    const response = await axios.post(API_ENDPOINTS.UNBLOCK_FRIEND.replace("{friend_username}", friendUsername), {}, {
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token manually in the headers
      },
    });
    message.success(`Successfully unblocked friend: ${friendUsername}`);
    return response.data; // Return the response data, if needed
  } catch (err) {
    message.error("Failed to unblock friend.");
    throw err;
  }
};
