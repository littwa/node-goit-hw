const express = require("express");
const userRouterAuth = express.Router();
const controllers = require("./controllers.users");

// console.log(111, controllers.multerMiddlware().single("avatar"));
userRouterAuth.post(
  "/auth/register",
  controllers.multerMiddlware().single("avatar"),
  controllers.validRegisterUser,
  controllers.imageMini,
  controllers.registerUser,
);

userRouterAuth.post("/auth/login", controllers.validLoginUser, controllers.loginUser);

userRouterAuth.post("/auth/logout", controllers.authorization, controllers.logoutUser);

userRouterAuth.get("/users/current", controllers.authorization, controllers.getCurrentUser);

module.exports = userRouterAuth;
