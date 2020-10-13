const express = require("express");

const userRouter = express.Router();
const controllers = require("./controllers.js");
const controllersUsers = require("../users/controllers.users");

userRouter.get("/contacts", controllers.getContacts);

userRouter.post("/contacts", controllers.postContact);

userRouter.get(
  "/contacts/:contactId",
  controllersUsers.authorization,
  controllers.validId,
  controllers.getContactId,
);

userRouter.delete(
  "/contacts/:contactId",
  controllersUsers.authorization,
  controllers.validId,
  controllers.deleteContact,
);

userRouter.patch(
  "/contacts/:contactId",
  controllersUsers.authorization,
  controllers.validId,
  controllers.updaterContact,
);

userRouter.patch(
  "/contacts/add/films/:contactId",
  controllersUsers.authorization,
  controllers.validId,
  controllers.validFilms,
  controllers.addFilms,
);

userRouter.patch(
  "/contacts/del/films/:contactId",
  controllersUsers.authorization,
  controllers.validId,
  controllers.validFilmsDel,
  controllers.deleteFilms,
);

module.exports = userRouter;
