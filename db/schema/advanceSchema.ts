const mongoose = require("mongoose");

export const advanceSchema = new mongoose.Schema({
  amount: {
    type: Number,
    min: 0,
  },

  userID: mongoose.Schema.Types.ObjectId,

  userName: String,
});
