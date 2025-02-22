import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import routes from "../../routes/routes";

const { Title, Text } = Typography;

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const data = await login({
        grant_type: "password",
        username: values.username,
        password: values.password,
      });

      message.success("Login Successful.");
      navigate(routes.home);
    } catch (error) {
      message.error("Login Failed!");
    }
    setLoading(false);
  };

  return (
    <Card style={{ width: 400, padding: 25, borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
      <Title level={3} style={{ textAlign: "center" }}>Login</Title>
      <Form layout="vertical" onFinish={handleLogin}>
        <Form.Item label="Username" name="username" rules={[{ required: true, message: "Please enter your Username!" }]}>
          <Input placeholder="Enter your Username" style={{ fontSize: "16px", padding: "10px" }} />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please enter your password!" }]}>
          <Input.Password placeholder="Enter your password" style={{ fontSize: "16px", padding: "10px" }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" block style={{ fontSize: "16px", padding: "10px" }} htmlType="submit" loading={loading}>
            Login
          </Button>
        </Form.Item>
      </Form>
      <Text style={{ display: "block", textAlign: "center", marginTop: "10px" }}>
        Don't have an account? <a href={routes.register}>Sign up</a>
      </Text>
    </Card>
  );
};

export default LoginForm;
