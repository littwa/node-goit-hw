const fs = require("fs");
const path = require("path");
const contactsPath = path.join(__dirname, "./db/contacts.json");

function listContacts() {
  fs.readFile(contactsPath, "utf-8", (err, data) => {
    console.table(JSON.parse(data));
  });
}

function getContactById(contactId) {
  fs.readFile(contactsPath, "utf-8", (err, data) => {
    let contactsObj = JSON.parse(data);
    let findEl = contactsObj.find(el => el.id === contactId);
    console.table(findEl);
  });
}

function removeContact(contactId) {
  fs.readFile(contactsPath, "utf-8", (err, data) => {
    let contactsObj = JSON.parse(data);
    let withoutContactId = contactsObj.filter(el => el.id !== contactId);

    if (contactsObj.length === withoutContactId.length) {
      console.log("NO contactId-" + contactId);
      return;
    }
    let newContactsJSON = JSON.stringify(withoutContactId);

    fs.writeFile(contactsPath, newContactsJSON, err => {
      if (err) {
        console.log(err);
        return;
      }
      console.log("Contacts with id: " + contactId + " has been successfully removed!");
      console.table(withoutContactId);
    });
  });
}

function addContact(name, email, phone) {
  fs.readFile(contactsPath, "utf-8", (err, data) => {
    let contactsObj = JSON.parse(data);
    let newId = contactsObj.reduce((acc, el) => (el.id > acc ? el.id : acc), 0) + 1;

    let newContact = { id: newId, name, email, phone };
    contactsObj.push(newContact);

    let newContactsJSON = JSON.stringify(contactsObj);

    fs.writeFile(contactsPath, newContactsJSON, err => {
      if (err) {
        console.log(err);
        return;
      }
      console.log("Contact with id: " + newId + " has been successfully added!");
      console.table(contactsObj);
    });
  });
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};
