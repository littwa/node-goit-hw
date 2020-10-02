const express = require("express");

const userRouter = express.Router();
const controllers = require("./controllers.js");

userRouter.get("/contacts", controllers.getUsers);

userRouter.get("/contacts/:contactId", controllers.getUserId);

userRouter.post("/contacts", controllers.valid, controllers.postUser);

userRouter.delete("/contacts/:contactId", controllers.deleteUser);

userRouter.patch("/contacts/:contactId", controllers.updaterUser);

module.exports = userRouter;
