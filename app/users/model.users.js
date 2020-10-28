const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  email: String,
  password: String,
  avatarURL: String,
  subscription: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free",
  },
  token: String,
  status: {
    type: String,
    required: true,
    enum: ["Verified", "Not Verified"],
    default: "Not Verified",
  },
  verificationToken: String,
});

module.exports = model("Users", UserSchema);
