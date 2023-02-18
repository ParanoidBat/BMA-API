const db = require("../../database");

/**
 * @api {post} /attendance/ Check In
 * @apiName CheckIn
 * @apiGroup Attendance
 *
 * @apiBody {Number} authID User's finger ID
 * @apiBody {String} organizationID Organization's ID the user belongs to
 * @apiBody {String} date Date of the checkin. Format: YYYY-MM-DD
 * @apiBody {String} timeIn The checkin time. Format: hh:mm:ss
 *
 * @apiDescription
 * Examples on date and time:
 * date: 2022-08-15
 * time: 05:15:16
 *
 * @apiSuccess {Boolean} data { data: true }
 */
const checkin = async (req, res) => {
  const { authID, organizationID, date, checkIn } = req.body;

  try {
    const userRes = await db.query(
      `SELECT id, name
      FROM users
      WHERE organization_id = $1
      AND finger_id = $2`,
      [organizationID, authID]
    );

    if (!userRes.rowCount) {
      throw "No such user";
    }

    const user = userRes.rows[0];

    const uniqueAttendanceString = `${user.id}${date}`;

    await db.query(
      `INSERT INTO attendance(unique_attendance_string, created, finger_id, user_name, user_id, organization_id, check_in)
      VALUES($1, $2, $3, $4, $5, $6, $7)`,
      [
        uniqueAttendanceString,
        date,
        authID,
        user.name,
        user.id,
        organizationID,
        checkIn,
      ]
    );

    return res.json({
      data: true,
    });
  } catch (err) {
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
  const { authID, date, organizationID, checkOut } = req.body;

  try {
    await db.query(
      `UPDATE attendance
      SET check_out = $1
      WHERE organization_id = $2
      AND finger_id = $3
      AND created = $4`,
      [checkOut, organizationID, authID, date]
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
