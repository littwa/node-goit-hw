const modelContact = require("./model");
const Joi = require("joi");
const {
  Types: { ObjectId },
} = require("mongoose");
const { object } = require("joi");

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

  addFilms = async (req, res, next) => {
    const withFilms = await modelContact.findByIdAndUpdate(
      req.params.contactId,
      { $push: { films: req.body } },
      { new: true },
    );
    return !withFilms ? res.status(400).send("Bad") : res.status(202).send(withFilms.films);
  };

  deleteFilms = async (req, res, next) => {
    const withoutFilm = await modelContact.findByIdAndUpdate(
      req.params.contactId,
      { $pull: { films: { _id: req.body.filmsId } } },
      { new: true },
    );
    return !withoutFilm ? res.status(400).send("Barada") : res.status(200).send(withoutFilm.films);
  };

  validId = (req, res, next) =>
    !ObjectId.isValid(req.params.contactId) ? res.status(400).send("Invalid id!") : next();

  validFilms = (req, res, next) => {
    const validator = Joi.object({
      name: Joi.string().required(),
      genre: Joi.string().required(),
    });
    const { error } = validator.validate(req.body);
    return error ? res.status(400).send(error.message) : next();
  };

  validFilmsDel = (req, res, next) => {
    const validator = Joi.object({
      filmsId: Joi.string().required(),
    });
    const { error } = validator.validate(req.body);
    return error ? res.status(400).send(error.message) : next();
  };
}
module.exports = new Controllers();
