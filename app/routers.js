const express = require("express");
const Joi = require("joi");
const userRouter = express.Router();
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require("../contacts.js");

userRouter.get("/contacts", async (req, res, next) => res.send(JSON.parse(await listContacts())));

userRouter.get("/contacts/:contactId", async (req, res, next) => {
  let result = await getContactById(Number(req.params.contactId));
  res.send(result ? result : (res.status(404), '{"message": "Not found"}'));
});

userRouter.post("/contacts", async (req, res, next) => {
  const contactRul = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
  });

  let valid = contactRul.validate(req.body);

  valid.error
    ? res.status(400).send('{"message": "missing required name field"}')
    : res.status(201).send(await addContact(req.body));
});

userRouter.delete("/contacts/:contactId", async (req, res, next) => {
  const result = await removeContact(req.params.contactId);

  result
    ? res.status(400).send('{"message": "Not found"}')
    : res.status(200).send('{"message": "contact deleted"}');
});

userRouter.patch("/contacts/:contactId", async (req, res, next) => {
  const result = await updateContact(req.params.contactId, req.body);
  result ? res.status(200).send(result) : res.status(404).send('{"message": "Not found"}');
});

module.exports = userRouter;
