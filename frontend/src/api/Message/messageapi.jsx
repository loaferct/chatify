import axios from "axios";
import API_ENDPOINTS from "../../config/api"; // Assuming API endpoints are managed here
import { getAccessToken } from "../authToken";

export const fetchChatHistory = async (selectedFriend) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error("No token found. Please log in.");
    }

    const response = await axios.get(`${API_ENDPOINTS.CHAT_HISTORY}/${selectedFriend}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data; // Return the chat history fetched from the API
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error; // Rethrow the error for further handling
  }
};
