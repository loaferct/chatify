export const getAccessToken = () => {
return localStorage.getItem("auth_token");
};


export const setAccessToken = (token) => {
localStorage.setItem("auth_token", token);
};


export const removeAccessToken = () => {
localStorage.removeItem("auth_token");
};