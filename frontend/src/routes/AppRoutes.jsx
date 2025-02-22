import React from "react";
import { Routes, Route } from "react-router-dom";
import routes from "./routes";
import LoginPage from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import Friend from "../pages/Friend";
import Pending from "../pages/Pending";
import AddFriend from "../pages/AddFriend";
import Story from "../pages/Story";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={routes.login} element={<LoginPage />} />
      <Route path={routes.register} element={<Register />} />
      <Route path={routes.home} element={<Home />} />
      <Route path={routes.friends} element={<Friend />} />
      <Route path={routes.pending} element={<Pending />} />
      <Route path={routes.add_friends} element={<AddFriend />} />
      <Route path={routes.story} element={<Story />} />
    </Routes>
  );
};

export default AppRoutes;
