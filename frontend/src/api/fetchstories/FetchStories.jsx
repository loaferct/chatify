import axios from "axios";
import API_ENDPOINTS from "../../config/api"; // Assuming your API endpoints are stored in a config file
import { getAccessToken } from "../authToken"; 

// Function to fetch stories
export const fetchStories = async () => {
  try {
    const token = getAccessToken(); // Get the access token
    
    if (!token) {
      throw new Error("No token found. Please log in.");
    }

    const response = await axios.get(API_ENDPOINTS.FRIENDS_STORIES, {
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the header
      },
    });

    return response.data; // Return the fetched data
  } catch (error) {
    throw error; // Rethrow the error for handling in the component
  }
};
