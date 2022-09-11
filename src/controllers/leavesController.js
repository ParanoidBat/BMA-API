const LeavesRequest = require("../schemas/leavesRequestSchema");
const User = require("../schemas/userSchema");

/**
 * @apiDefine InternalSystem Internal Business Developer Access
 * Only used in the internal system
 */

/**
 * @api {get} /leave Get All Leaves
 * @apiName GetAllLeaves
 * @apiGroup Leaves
 *
 * @apiQuery {String} id Organization's ID
 * @apiQuery {String="Pending", "Accepted", "Rejected"} [status] The status of the leave request
 *
 * @apiSuccess {Object[]} data Array of leave objects
 * @apiSuccessExample {json} Success-Example:
 * {
 * data:
 * [{
 * _id: "sdfgerg435f4g"
 * userID: { _id, name },
 * orgID: "sdfds34refidkn23",
 * from: "2022-08-12",
 * to: "2022-08-15",
 * status: "Pending",
 * createdOn: "2022-08-11"
 * }]
 * }
 */
const getAllRequests = async (req, res) => {
  const { id, status } = req.query;
  try {
    let query;
    if (status)
      query = LeavesRequest.find({ orgID: id, status }).populate(
        "userID",
        "name"
      );
    else query = LeavesRequest.find({ orgID: id }).populate("userID", "name");

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

/**
 * @api {get} /leave/:id Get User's Leave Requests
 * @apiName GetUser'sLeaves
 * @apiGroup Leaves
 *
 * @apiParam {String} id User's ID
 *
 * @apiSuccess {Object[]} data Array of leave objects (Same as from 'Get All Leaves', except: 'userID' is {String}, not {Object})
 */
const getUserRequests = async (req, res) => {
  const { id } = req.params;

  try {
    const requests = await LeavesRequest.find({ userID: id });

    return res.json({
      data: requests,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Couldn't retrieve leave requests",
    });
  }
};

/**
 * @api {post} /leave Create New Leave Request
 * @apiName NewRequest
 * @apiGroup Leaves
 *
 * @apiBody {String} userID
 * @apiBody {String} orgID
 * @apiBody {String} from Leaves start from. Format: YYYY-MM-DD (2022-08-08). NOTE: Should be lower than 'to'
 * @apiBody {String} to Last day of leave.
 * @apiBody {String="Pending", "Accepted", "Rejected"} [status="Pending"] Status of the new request. Omit from the body if the status is Pending
 *
 * @apiSuccess {Object} data Request Object
 * @apiSuccessExample {json} Success-Example:
 * {
 * data:
 * [{
 * _id: "sdfgerg435f4g"
 * userID: { _id, name },
 * orgID: "sdfds34refidkn23",
 * from: "2022-08-12",
 * to: "2022-08-15",
 * status: "Pending",
 * createdOn: "2022-08-11"
 * }]
 * }
 */
const createRequest = async (req, res) => {
  try {
    const request = new LeavesRequest(req.body);
    await request.save();

    return res.json({
      data: request,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Couldn't create request.",
    });
  }
};

/**
 * @api {put} /leave/:id Update Leave Request
 * @apiName UpdateRequest
 * @apiGroup Leaves
 *
 * @apiParam {String} id Request ID
 * @apiBody {String="Pending", "Accepted", "Rejected"} [status] New status of the request
 *
 * @apiSuccess {Object} data Leave object, same as of 'Get All Leaves'
 */
const updateRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await LeavesRequest.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate("userID", "name");

    if (request.status === "Accepted") {
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

/**
 * @api {delete} /leave/:id Delete A Request
 * @apiName DeleteRequest
 * @apiGroup Leaves
 * @apiPermission InternalSystem
 * @apiParam {String} id Request ID
 * @apiSuccess {Boolean} data { data: true }
 */
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
  getUserRequests,
  createRequest,
  updateRequest,
  deleteRequest,
};
