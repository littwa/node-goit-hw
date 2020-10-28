const express = require("express");
const userRouter = express.Router();
const controllers = require("./controllers.users");

userRouter.post(
  "/auth/register",
  controllers.multerMiddlware().single("avatar"),
  controllers.validRegisterUser,
  controllers.avatarGenerate,
  controllers.imageMini,
  controllers.registerUser,
);

userRouter.post("/auth/login", controllers.validLoginUser, controllers.loginUser);

userRouter.post("/auth/logout", controllers.authorization, controllers.logoutUser);

userRouter.get("/users/current", controllers.authorization, controllers.getCurrentUser);

userRouter.patch(
  "/users/avatars",
  controllers.authorization,
  controllers.multerMiddlware().single("avatar"),
  controllers.validUpdateUser,
  controllers.imageMini,
  controllers.updateUser,
);
userRouter.get("/auth/verify/:token", controllers.verificationUser);

module.exports = userRouter;
