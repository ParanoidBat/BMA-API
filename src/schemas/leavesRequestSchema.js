const mongoose = require("mongoose");
const moment = require("moment");

const leavesRequestSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orgID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending",
  },
  createdOn: {
    type: String,
    default: moment().format("YYYY-MM-DD"),
  },
});

const LeavesRequest = mongoose.model("LeavesRequest", leavesRequestSchema);

module.exports = LeavesRequest;
