const db = require("../../database");

/**
 * @api {post} /attendance/ Check In
 * @apiName CheckIn
 * @apiGroup Attendance
 *
 * @apiBody {Number} finger_id User's finger ID
 * @apiBody {String} organization_id Organization's ID the user belongs to
 * @apiBody {String} date Date of the checkin. Format: YYYY-MM-DD
 * @apiBody {String} check_in The checkin time. Format: hh:mm:ss
 *
 * @apiDescription
 * Examples on date and time:
 * date: 2022-08-15
 * time: 05:15:16
 *
 * @apiSuccess {Boolean} data { data: true }
 */
const checkin = async (req, res) => {
  const { finger_id, date, check_in } = req.body;
  const organization_id = parseInt(req.body.organization_id);

  try {
    const userRes = await db.queryOne(
      `SELECT id, name
      FROM users
      WHERE organization_id = $1
      AND finger_id = $2`,
      [organization_id, finger_id]
    );

    if (!userRes) {
      throw "No such user";
    }

    const user = userRes;

    const uniqueAttendanceString = `${user.id}${date}`;

    await db.query(
      `INSERT INTO attendance(unique_attendance_string, created, finger_id, user_name, user_id, organization_id, check_in)
      VALUES($1, $2, $3, $4, $5, $6, $7)`,
      [
        uniqueAttendanceString,
        date,
        finger_id,
        user.name,
        user.id,
        organization_id,
        check_in,
      ]
    );

    return res.json({
      data: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Error: Attendance couldn't be added.",
    });
  }
};

/**
 * @api {post} /attendance/checkout Check Out
 * @apiName Checkout
 * @apiGroup Attendance
 *
 * @apiBody {Number} authID
 * @apiBody {String} date
 * @apiBody {String} organizationID
 * @apiBody {String} timeOut
 *
 * @apiSuccess {Boolean} data { data: true }
 */
const checkout = async (req, res) => {
  // Doesn't matter if checked out on same day or not.
  const { finger_id, date, check_out } = req.body;
  const organization_id = parseInt(req.body.organization_id);

  try {
    await db.queryOne(
      `UPDATE attendance
      SET check_out = $1
      WHERE organization_id = $2
      AND finger_id = $3
      AND created = $4`,
      [check_out, organization_id, finger_id, date]
    );

    return res.json({
      data: true,
    });
  } catch (err) {
    return res.json({
      error: "Couldn't checkout.",
    });
  }
};

module.exports = {
  checkin,
  checkout,
};
