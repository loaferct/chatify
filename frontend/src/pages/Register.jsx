import React from "react";
import RegisterForm from "../components/Register/RegisterForm";

const Register = () => {
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
      <RegisterForm />
    </div>
  );
};

export default Register;