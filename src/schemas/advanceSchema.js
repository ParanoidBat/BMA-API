const mongoose = require("mongoose");

const advanceSchema = new mongoose.Schema({
  amount: {
    type: Number,
    min: 0,
    required: true,
  },

  userName: {
    type: String,
    required: true,
  },
});

const Advances = mongoose.model("Advances", advanceSchema);

module.exports = Advances;
