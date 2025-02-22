import axios from "axios";
import API_ENDPOINTS from "../config/api";
import { setAccessToken, removeAccessToken } from './authToken';

export const login = async ({ grant_type, username, password }) => {
  try {
    const formData = new URLSearchParams();
    formData.append("grant_type", grant_type);
    formData.append("username", username);
    formData.append("password", password);

    const response = await axios.post(API_ENDPOINTS.LOGIN, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });


    const token = response.data.access_token;
    if (token) {
      setAccessToken(token);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};



const handleLogout = () => {
  removeAccessToken();
  message.success("Logged out successfully.");
};

  

export const signup = async ({ username, email, password }) => {
  try {
    const response = await axios.post(API_ENDPOINTS.SIGNUP, {
      username,
      email,
      password,
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Registration successful:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Signup failed:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
    throw error;
  }
};
