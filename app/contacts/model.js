const { Schema, model } = require("mongoose");

const ContactsSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
});

module.exports = model("Contacts", ContactsSchema);
