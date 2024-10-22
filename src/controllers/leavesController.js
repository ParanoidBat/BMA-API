const db = require("../../database");

/**
 * @apiDefine InternalSystem Internal Business Developer Access
 * Only used in the internal system
 */

/**
 * @api {get} /leave Get All Leaves
 * @apiName GetAllLeaves
 * @apiGroup Leaves
 *
 * @apiQuery {Number} id Organization's ID
 * @apiQuery {String="Pending", "Accepted", "Rejected"} [status] The status of the leave request
 *
 * @apiSuccess {Object[]} data Array of leave objects
 * @apiSuccessExample {json} Success-Example:
 * {
 * data:
 * [{
 * id: 1
 * user_id: 3,
 * organization_id: 4,
 * from_date: "2022-08-12",
 * to_date: "2022-08-15",
 * leave_status: "Pending",
 * created_on: "2022-08-11",
 * name: "Batman",
 * reason: "Out of Gotham"
 * }]
 * }
 */
const getAllRequests = async (req, res) => {
  const { id, status } = req.query;

  try {
    let query;
    if (status) {
      query = `SELECT r.*, u.name
              FROM leave_request r
              JOIN users u ON r.organization_id = ${id}
                AND r.user_id = u.id
                AND leave_status = '${status}'`;
    } else {
      query = `SELECT r.*, u.name
      FROM leave_request r
      JOIN users u ON r.organization_id = ${id}
        AND r.user_id = u.id`;
    }

    const requests = await db.query(query);

    return res.json({
      data: requests,
    });
  } catch (err) {
    console.error(err);
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
 * @apiParam {Number} id User's ID
 *
 * @apiSuccess {Object[]} data Array of leave objects ( Same as from 'Get All Leaves' )
 */
const getUserRequests = async (req, res) => {
  try {
    const response = await db.query(
      `SELECT *
      FROM leave_request
      WHERE user_id = $1`,
      [req.params.id]
    );

    return res.json({
      data: response,
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
 * @apiBody {Number} userID
 * @apiBody {Number} orgID
 * @apiBody {String} from Leaves start from. Format: YYYY-MM-DD (2022-08-08). NOTE: Should be lower than 'to'
 * @apiBody {String} to Last day of leave.
 * @apiBody {String} [reason] A description of the reason of leave
 *
 * @apiSuccess {Object} data Request Object
 * @apiSuccessExample {json} Success-Example:
 * {
 * data:
 * [{
 * id: 1
 * user_id: 2,
 * organization_id: 3,
 * from_date: "2022-08-12",
 * to_date: "2022-08-15",
 * leave_status: "Pending",
 * created_on: "2022-08-11",
 * reason: "Out sick"
 * }]
 * }
 */
const createRequest = async (req, res) => {
  const { userID, orgID, from, to, reason } = req.body;

  try {
    const response = await db.queryOne(
      `INSERT INTO leave_request(user_id, organization_id, from_date, to_date, reason)
      VALUES($1, $2, $3, $4, $5)
      RETURNING *`,
      [userID, orgID, from, to, reason]
    );

    return res.json({
      data: response,
    });
  } catch (err) {
    console.error(err);
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
 * @apiBody {String="Pending", "Accepted", "Rejected"} status New status of the request
 *
 * @apiSuccess {Object} data Leave object, same as of 'Get All Leaves'
 */
const updateRequest = async (req, res) => {
  const { id } = req.params;
  const { status, reject_reason } = req.body;

  try {
    const response = await db.queryOne(
      `UPDATE leave_request
      SET leave_status = $1,
      reject_reason = $2
      WHERE id = $3
      RETURNING *`,
      [status, reject_reason, id]
    );

    return res.json({
      data: response,
    });
  } catch (err) {
    console.error(err);
    return res.json({
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
    await db.query(
      `DELETE FROM leave_request
      WHERE id = $1`,
      [id]
    );

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
