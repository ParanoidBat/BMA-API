const User = require("../schemas/userSchema");
const Organization = require("../schemas/organizationSchema");
const Attendance = require("../schemas/attendanceSchema");
const db = require("../../database");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const { findIndex, find } = require("lodash");

// TODO: Do the attendance stuff after updating the Attendance API

/**
 * @apiDefine InternalSystem Internal Business Developer Access
 * Only used in the internal system
 */

/**
 * @apiDefine User
 * @apiSuccess {Object} data User object
 * @apiSuccessExample {json} Success-Example:
 * {
 * data:
 * {
 *   _id: "dsfge56tgrhtyt0"
 *   name: "Batman",
 *   authID: 0,
 *   organizationID: "ft54657u6ythgf",
 *   phone: "03451481947",
 *   address: "19-B, Peshawar, Hawaii",
 *   salary: 50000,
 *   role: "Admin",
 *   advance: 0,
 *   leaves: []
 * }
 * }
 */

const calculateLeaves = (userLeaves, isSatOff, attendances) => {
  // Find holes in attendance, if a hole is accounted for in leaves; add into total leaves
  let leaves = 0;
  const workDays = isSatOff ? 5 : 6;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let index = findIndex(
    days,
    (day) => day === moment().clone().startOf("month").format("ddd")
  );
  if (index == -1) index = 0;

  attendances.forEach((obj) => {
    const day = moment(obj.date, "YYYY-MM-DD").format("ddd");

    if (day !== days[index % workDays]) {
      const leave = find(userLeaves, (leaveObj) => {
        return (
          moment(obj.date, "YYYY-MM-DD").isSameOrAfter(
            moment(leaveObj.from, "YYYY-MM-DD")
          ) &&
          moment(obj.date, "YYYY-MM-DD").isSameOrBefore(
            moment(leaveObj.to, "YYYY-MM-DD")
          )
        );
      });

      if (leave) leaves++;
    }

    index++;
  });

  return leaves;
};

/**
 * @api {post} /user/ Create New User
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiBody {String} name User's name
 * @apiBody {Number} authID User's finger ID as assigned by the BMA machine
 * @apiBody {String} organizationID Organization's ID the user belongs to
 * @apiBody {String} [email]
 * @apiBody {String} password
 * @apiBody {String} [phone]
 * @apiBody {String} [address]
 * @apiBody {Number} [salary=0]
 * @apiBody {String="Worker", "Admin", "Manager"} [role="Worker"] User's role in the organization
 * @apiUse User
 */
const createUser = async (req, res) => {
  const fields = req.body;
  // TODO: Default values are overriden by undefined, when a field doesn't exist. This can be fixed when making generic db query functions
  try {
    const response = await db.query(
      `INSERT INTO users(name, finger_id, organization_id, phone, address, salary, role)
      VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        fields.name,
        fields.finger_id,
        fields.organization_id,
        fields.phone,
        fields.address,
        fields.salary,
        fields.role,
      ]
    );

    if (!response.rowCount) {
      throw "User not made";
    }

    const user = response.rows[0];

    const password = await bcrypt.hash(fields.password, 10);

    const credsPromise = db.query(
      `INSERT INTO credentials(email, password, user_id, phone)
      VALUES($1, $2, $3, $4)
      `,
      [user.email, password, user.id, user.phone]
    );

    const orgPromise = db.query(
      `UPDATE organization
      SET
      users = users || $1::INTEGER,
      users_count = users_count + 1
      WHERE id = $2`,
      [user.id, user.organization_id]
    );

    await Promise.all([credsPromise, orgPromise]);

    return res.json({
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Couldn't create user.",
    });
  }
};

/**
 * @api {put} /user/:id Update User
 * @apiName UpdateUser
 * @apiGroup User
 *
 * @apiParam {String} id User's id
 * @apiBody {String} [name]
 * @apiBody {String} [phone]
 * @apiBody {String} [address]
 * @apiBody {Number} [salary]
 * @apiBody {String="Worker", "Admin", "Manager"} [role] User's role in the organization
 * @apiUse User
 */
const updateUser = async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  try {
    const updates = Object.entries(fields)
      .map(([key, val]) => {
        return `${key} = '${val}'`;
      })
      .join(",");

    let response;
    if (updates) {
      response = await db.query(
        `UPDATE users
          SET ${updates}
          WHERE id = $1
          RETURNING *`,
        [id]
      );
    }

    return res.json({ data: response.rows[0] });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Couldn't update user.",
    });
  }
};

/**
 * @api {put} /user/:authID/:orgID/ Update User With AuthID
 * @apiName UpdateUserWithAuthID
 * @apiGroup User
 *
 * @apiParam {Number} authID Finger ID as given by the BMA machine
 * @apiParam {String} orgID
 * @apiBody {String} [name]
 * @apiBody {String} [phone]
 * @apiBody {String} [address]
 * @apiBody {Number} [salary]
 * @apiBody {String="Worker", "Admin", "Manager"} [role] User's role in the organization
 * @apiUse User
 */
const updateUserWithAuthID = async (req, res) => {
  const { authID, orgID } = req.params;
  const fields = req.body;

  try {
    const updates = Object.entries(fields)
      .map(([key, val]) => {
        return `${key} = '${val}'`;
      })
      .join(",");

    let response;
    if (updates) {
      response = await db.query(
        `UPDATE users
          SET ${updates}
          WHERE finger_id = $1
          AND organization_id = $2
          RETURNING *`,
        [authID, orgID]
      );
    }

    return res.json({ data: response.rows[0] });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Couldn't update user.",
    });
  }
};

/**
 * @api {delete} /user/:id/ Delete User
 * @apiName DeleteUser
 * @apiGroup User
 *
 * @apiParam {String} id User's ID
 * @apiSuccess {Boolean} data { data: true }
 */
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(
      `DELETE FROM users
      WHERE id = $1`,
      [id]
    );

    return res.json({
      data: true,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Couldn't delete user.",
    });
  }
};

/**
 * @api {get} /user/:id Get User
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {String} id
 * @apiUse User
 */
const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await db.query(
      `SELECT *
      FROM users
      WHERE id = $1`,
      [id]
    );

    if (response.rowCount) {
      return res.json({
        data: response.rows[0],
      });
    } else throw "User Doesn't Exist";
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't get user.",
    });
  }
};

/**
 * @api {get} /user/ Get All Users List
 * @apiName GetAllUsers
 * @apiGroup User
 * @apiPermission InternalSystem
 * @apiDescription This returns all the users in the BMA system
 *
 * @apiQuery {Number} page
 * @apiSuccess {Object[]} data Array of user objects: containing '_id', 'name' and 'organization'
 * @apiSuccess {Number} page
 */
const getUsersList = async (req, res) => {
  try {
    const { page } = req.query;

    const response = await db.query(
      `SELECT id, name, organization_id
      FROM users
      ORDER BY name
      LIMIT 10
      OFFSET $1`,
      [(page - 1) * 10]
    );

    return res.json({
      data: response.rows,
      page,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Couldn't get users list.",
    });
  }
};

/**
 * @api {get} /user/percent_attendance/:userID/:orgID Get User's Attendance Percentage
 * @apiName UserPercentAttendance
 * @apiGroup User
 * @apiDescription The percentage is calculated for the current month
 *
 * @apiParam {String} userID
 * @apiParam {String} orgID
 * @apiSuccess {Number} data { data: 85 }
 */
const getPercentageAttendance = async (req, res) => {
  try {
    var startOfMonth = moment().clone().startOf("month").format("YYYY-MM-DD");
    var today = moment().format("YYYY-MM-DD");
    var percentageAttendance = 0;

    const [userLeaves, attendances, organization] = await Promise.all([
      User.findById(req.params.userID, "leaves").populate("leaves", "from to"),
      Attendance.find(
        {
          userID: req.params.userID,
          date: {
            $gte: startOfMonth,
            $lte: today,
          },
        },
        "date"
      ).sort({ date: 1 }),
      Organization.findById(req.params.orgID, "isSaturdayOff"),
    ]);

    if (attendances.length) {
      const diff = moment(today).diff(startOfMonth, "days") + 1;

      today = moment().format("YYYY-MM-ddd");
      startOfMonth = moment(startOfMonth, "YYYY-MM-DD").format("YYYY-MM-ddd");

      var workDays = diff - Math.floor(diff / 7);
      if (today.includes("Sun") || startOfMonth.includes("Sun")) workDays -= 1;
      if (
        organization.isSaturdayOff &&
        (today.includes("Sat") || startOfMonth.includes("Sat"))
      )
        workDays -= 1;

      const leaves = calculateLeaves(
        userLeaves.leaves,
        organization.isSaturdayOff,
        attendances
      );
      percentageAttendance = Math.floor(
        ((attendances.length + leaves) * 100) / workDays
      );
    }

    return res.json({
      data: percentageAttendance,
    });
  } catch (err) {
    return res.status(500).json({
      error: `Error: Couldn't get user percentage attendance.`,
    });
  }
};

/**
 * @api {post} /user/email Send Email
 * @apiName Email
 * @apiGroup User
 * @apiPermission InternalSystem
 *
 * @apiBody {String} [subject] Subject of the email
 * @apiBody {String} [text] Text body of the email
 * @apiBody {String} to Receiving email address
 *
 * @apiSuccess {Boolean} data { data: true }
 * @apiVersion 1.0.0
 */
const sendEmail = async (req, res) => {
  const { subject, text, to } = req.body;

  const options = {
    from: "waynetech010@gmail.com",
    to,
    subject,
    text,
  };

  try {
    return res.json({
      data: true,
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

module.exports = {
  createUser,
  updateUser,
  updateUserWithAuthID,
  deleteUser,
  getUser,
  getUsersList,
  getPercentageAttendance,
  sendEmail,
};
