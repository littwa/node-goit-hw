const fs = require("fs");
const { promises: fsPromises } = fs;
const path = require("path");
const contactsPath = path.join(__dirname, "./db/contacts.json");

const listContacts = () => fsPromises.readFile(contactsPath, "utf-8");

const getContactById = async contactId =>
  JSON.parse(await fsPromises.readFile(contactsPath, "utf-8")).find(el => el.id === contactId);

async function removeContact(contactId) {
  const data = await fsPromises.readFile(contactsPath, "utf-8");
  const contactsObj = JSON.parse(data);
  const withoutContactId = contactsObj.filter(el => el.id !== Number(contactId));

  return contactsObj.length === withoutContactId.length
    ? true
    : await fsPromises.writeFile(contactsPath, JSON.stringify(withoutContactId));
}

async function addContact({ name, email, phone }) {
  const data = await fsPromises.readFile(contactsPath, "utf-8");
  const contactsObj = JSON.parse(data);
  const newId = contactsObj.reduce((acc, el) => (el.id > acc ? el.id : acc), 0) + 1;
  const newContact = { id: newId, name, email, phone };
  contactsObj.push(newContact);
  const newContactsJSON = JSON.stringify(contactsObj);

  await fsPromises.writeFile(contactsPath, newContactsJSON);
  return newContact;
}

async function updateContact(contactId, body) {
  const data = await fsPromises.readFile(contactsPath, "utf-8");
  const contactsObj = JSON.parse(data);

  for (let i = 0; i < contactsObj.length; i += 1) {
    if (contactsObj[i].id === Number(contactId)) {
      Object.keys(body).forEach(el => (contactsObj[i][el] = body[el]));
      await fsPromises.writeFile(contactsPath, JSON.stringify(contactsObj));
      return contactsObj[i];
    }
  }

  return false;
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
