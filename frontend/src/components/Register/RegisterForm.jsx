import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { signup } from "../../api/auth";
import { Link } from "react-router-dom";
import routes from "../../routes/routes";

const { Title, Text } = Typography;

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const data = await signup(values);
      message.success("Registration successful! Please log in.");
    } catch (error) {
      message.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <Card
      style={{
        width: 400,
        padding: 25,
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Title level={3} style={{ textAlign: "center" }}>
        Register
      </Title>
      <Form
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please enter your username!" }]}
        >
          <Input
            placeholder="Enter your username"
            style={{ fontSize: "16px", padding: "10px" }}
          />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Please enter your email!" }]}
        >
          <Input
            placeholder="Enter your email"
            style={{ fontSize: "16px", padding: "10px" }}
          />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please enter your password!" }]}
        >
          <Input.Password
            placeholder="Enter your password"
            style={{ fontSize: "16px", padding: "10px" }}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            block
            style={{ fontSize: "16px", padding: "10px" }}
            htmlType="submit"
            loading={loading}
          >
            Register
          </Button>
        </Form.Item>
      </Form>
      <Text style={{ display: "block", textAlign: "center", marginTop: "10px" }}>
        Already have an account?{" "}
        <a href={routes.login}>Sign up</a>
      </Text>
    </Card>
  );
};

export default RegisterForm;