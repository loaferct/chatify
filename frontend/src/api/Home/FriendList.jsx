import axios from "axios";
import API_ENDPOINTS from "../../config/api";
import { getAccessToken } from "../authToken";

export const FriendList = async () => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error("No token found. Please log in.");
    }

    const response = await axios.get(API_ENDPOINTS.FRIENDLIST, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
