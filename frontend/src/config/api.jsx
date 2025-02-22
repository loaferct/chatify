const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/token`,
  SIGNUP: `${API_BASE_URL}/auth/signup`,
  GET_USER: `${API_BASE_URL}/user`,
  UPDATE_PROFILE: `${API_BASE_URL}/user/update`,
  LOGOUT: `${API_BASE_URL}/logout`,
  FRIENDLIST: `${API_BASE_URL}/friends/friends`,
  BLOCK_FRIEND: `${API_BASE_URL}/friends/block_friend/{friend_username}`,
  DELETE_FRIEND: `${API_BASE_URL}/friends/delete_friend/{friend_username}`,
  PENDING_FRIEND: `${API_BASE_URL}/friends/pending_friends`,
  ACCEPT_REQUEST: `${API_BASE_URL}/friends/accept_friend/{friend_username}`,
  REJECT_REQUEST: `${API_BASE_URL}/friends/reject_friend/{friend_username}`,
  UNBLOCK_FRIEND: `${API_BASE_URL}/friends/unblock_friend/{friend_username}`,
  SEND_REQUEST: `${API_BASE_URL}/friends/add_friend/{friend_username}`,
  CHAT_HISTORY: `${API_BASE_URL}/message/chat-history`,
  FRIENDS_STORIES: `${API_BASE_URL}/stories/friends_stories`
};

export default API_ENDPOINTS;
