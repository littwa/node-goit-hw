const express = require("express");
const userRouterAuth = express.Router();
const controllers = require("./controllers.users");

userRouterAuth.post("/auth/register", controllers.validRegisterUser, controllers.registerUser);

userRouterAuth.post("/auth/login", controllers.validLoginUser, controllers.loginUser);

userRouterAuth.post("/auth/logout", controllers.authorization, controllers.logoutUser);

userRouterAuth.get("/users/current", controllers.authorization, controllers.getCurrentUser);

module.exports = userRouterAuth;
