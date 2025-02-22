import axios from "axios";
import API_ENDPOINTS from "../../config/api";
import { getAccessToken } from "../authToken";

// Function to get pending friends
export const getPendingFriends = async () => {
  const accessToken = getAccessToken();

  try {
    const response = await axios.get(API_ENDPOINTS.PENDING_FRIEND, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching pending friends:", error);
    throw error;
  }
};

// Function to accept a friend request
export const acceptFriendRequest = async (friend_username) => {
  const accessToken = getAccessToken();
  const url = API_ENDPOINTS.ACCEPT_REQUEST.replace("{friend_username}", friend_username);

  try {
    const response = await axios.post(url, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error accepting friend request for ${friend_username}:`, error);
    throw error;
  }
};

// Function to reject a friend request
export const rejectFriendRequest = async (friend_username) => {
  const accessToken = getAccessToken();
  const url = API_ENDPOINTS.REJECT_REQUEST.replace("{friend_username}", friend_username);

  try {
    const response = await axios.post(url, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error rejecting friend request for ${friend_username}:`, error);
    throw error;
  }
};
