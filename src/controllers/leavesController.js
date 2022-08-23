const LeavesRequest = require("../schemas/leavesRequestSchema");
const User = require("../schemas/userSchema");

const getAllRequests = async (req, res) => {
  const { id, status } = req.query;
  try {
    let query;
    if (status) query = LeavesRequest.find({ orgID: id, status });
    else query = LeavesRequest.find({ orgID: id });

    const requests = await query;

    return res.json({
      data: requests,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Couldn't retrieve requests.",
    });
  }
};

const getRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await LeavesRequest.findOne({ userID: id });

    return res.json({
      data: request,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Couldn't retrieve request.",
    });
  }
};

const createRequest = async (req, res) => {
  try {
    const request = new LeavesRequest(req.body);
    await request.save();

    return res.json({
      data: true,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Couldn't create request.",
    });
  }
};

const updateRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await LeavesRequest.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (request.status == "Accepted") {
      await User.findByIdAndUpdate(request.userID, {
        $push: {
          leaves: {
            from: request.from,
            to: request.to,
          },
        },
      });
    }

    return res.json({
      data: request,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Couldn't update request.",
    });
  }
};

const deleteRequest = async (req, res) => {
  const { id } = req.params;

  try {
    await LeavesRequest.findByIdAndDelete(id);

    return res.json({
      data: true,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Couldn't delete request.",
    });
  }
};

module.exports = {
  getAllRequests,
  getRequest,
  createRequest,
  updateRequest,
  deleteRequest,
};
