const modelContact = require("./model");
const {
  Types: { ObjectId },
} = require("mongoose");

class Controllers {
  getContacts = async (req, res, next) => {
    try {
      const contacts = await modelContact.find();
      return res.status(200).send(contacts);
    } catch (err) {
      next(err.message);
    }
  };

  postContact = async (req, res, next) => {
    try {
      const contact = await modelContact.create(req.body);
      return res.status(201).send(contact);
    } catch (err) {
      res.status(400);
      next(err.message);
    }
  };

  getContactId = async (req, res, next) => {
    try {
      const { contactId } = req.params;

      const contact = await modelContact.findById(contactId);

      if (!contact) {
        return res.status(404).send(`NO contact ById: ${contactId}`);
      }

      return res.status(200).send(contact);
    } catch (err) {
      res.status(400);
      next(err.message);
    }
  };
  deleteContact = async (req, res, next) => {
    try {
      const { contactId } = req.params;
      const deletedContact = await modelContact.findByIdAndDelete(contactId);
      if (!deletedContact) {
        return res.status(404).send(`NO contact ById: ${contactId}`);
      }
      return res.status(200).send(`Contact ById: ${contactId} has been successfully deleted!`);
    } catch (err) {
      next(err.message);
    }
  };

  updaterContact = async (req, res, next) => {
    try {
      const { contactId } = req.params;
      const updatedContact = await modelContact.findByIdAndUpdate(
        contactId,
        {
          $set: req.body,
        },
        {
          new: true,
          useFindAndModify: false,
        },
      );

      return !updatedContact
        ? res.status(400).send("Bad Request to update")
        : res.status(202).send(updatedContact);
    } catch (error) {
      next(error.message);
    }
  };

  validId = (req, res, next) =>
    !ObjectId.isValid(req.params.contactId) ? res.status(400).send("Invalid id!") : next();
}
module.exports = new Controllers();
