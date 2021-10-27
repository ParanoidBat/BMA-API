const mongoose = require("mongoose");

const advanceSchema = new mongoose.Schema({
  amount: {
    type: Number,
    min: 0,
  },

  userID: mongoose.Schema.Types.ObjectId,

  userName: String,
});

const Advances = mongoose.model("Advances", advanceSchema);

module.exports = Advances;
