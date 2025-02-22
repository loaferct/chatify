import axios from "axios";
import API_ENDPOINTS from "../../config/api"; // Import the API endpoints
import { message } from "antd"; // Use Ant Design's message component for feedback
import { getAccessToken } from "../authToken"; // Import getAccessToken function from authToken

export const AddFriend = async (friendUsername) => {
    try {
      const token = getAccessToken(); // Get the token using the imported function
  
      // Call the API to block the friend
      const response = await axios.post(API_ENDPOINTS.SEND_REQUEST.replace("{friend_username}", friendUsername), {}, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token manually in the headers
        },
      });
      message.success(`Request Sent Successfully: ${friendUsername}`);
      return response.data; // Return the response data, if needed
    } catch (err) {
      message.error("Failed to Send Request.");
      throw err;
    }
  };
  
