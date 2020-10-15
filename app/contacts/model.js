const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ContactsSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  subscription: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free",
  },
  films: [{ name: { type: String, require: true }, genre: { type: String, required: true } }],
});

ContactsSchema.plugin(mongoosePaginate);

module.exports = model("Contacts", ContactsSchema);
