const mongoose = require("mongoose");

const credentialsSchema = new mongoose.Schema({
  email: {
    type: String,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    unique: true,
    lowercase: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Credentials = mongoose.model("Credentials", credentialsSchema);

module.exports = Credentials;
