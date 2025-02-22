import React from "react";
import LoginForm from "../components/Login/LoginForm";

const Login = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f5f5f5",
      }}
    >
        <LoginForm />

    </div>
  );
};

export default Login;