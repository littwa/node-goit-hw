const fs = require("fs");
const Joi = require("joi");
const { promises: fsPromises } = fs;
const path = require("path");
const contactsPath = path.join(__dirname, "../db/contacts.json");

class Controllers {
  getUsers = async (req, res, next) => res.send(JSON.parse(await this.listContacts()));
  listContacts = async () => fsPromises.readFile(contactsPath, "utf-8");

  getUserId = async (req, res, next) => {
    let result = await this.getContactById(Number(req.params.contactId));
    res.send(result ? result : (res.status(404), '{"message": "Not found"}'));
  };
  getContactById = async contactId =>
    JSON.parse(await fsPromises.readFile(contactsPath, "utf-8")).find(el => el.id === contactId);

  postUser = async (req, res, next) => res.status(201).send(await this.addContact(req.body));
  addContact = async ({ name, email, phone }) => {
    const data = await fsPromises.readFile(contactsPath, "utf-8");
    const contactsObj = JSON.parse(data);
    const newId = contactsObj.reduce((acc, el) => (el.id > acc ? el.id : acc), 0) + 1;
    const newContact = { id: newId, name, email, phone };
    contactsObj.push(newContact);

    await fsPromises.writeFile(contactsPath, JSON.stringify(contactsObj));
    return newContact;
  };
  valid = async (req, res, next) => {
    const contactRul = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
    });

    let valid = contactRul.validate(req.body);

    return valid.error
      ? res.status(400).send('{"message": "missing required name field"}')
      : next();
  };

  removeContact = async contactId => {
    const data = await fsPromises.readFile(contactsPath, "utf-8");
    const contactsObj = JSON.parse(data);
    const withoutContactId = contactsObj.filter(el => el.id !== Number(contactId));

    return contactsObj.length === withoutContactId.length
      ? true
      : await fsPromises.writeFile(contactsPath, JSON.stringify(withoutContactId));
  };

  deleteUser = async (req, res, next) => {
    const result = await this.removeContact(req.params.contactId);

    result
      ? res.status(400).send('{"message": "Not found"}')
      : res.status(200).send('{"message": "contact deleted"}');
  };

  updateContact = async (contactId, body) => {
    const data = await fsPromises.readFile(contactsPath, "utf-8");
    let contactsObj = JSON.parse(data);

    const idx = contactsObj.findIndex(el => el.id === Number(contactId));
    contactsObj[idx] = { ...contactsObj[idx], ...body };
    await fsPromises.writeFile(contactsPath, JSON.stringify(contactsObj));
    return idx === -1 ? false : contactsObj[idx];
  };

  updaterUser = async (req, res, next) => {
    const result = await this.updateContact(req.params.contactId, req.body);
    result ? res.status(200).send(result) : res.status(404).send('{"message": "Not found"}');
  };
}

module.exports = new Controllers();
