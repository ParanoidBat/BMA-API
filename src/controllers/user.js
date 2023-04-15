const db = require("../../database");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const { findIndex, find } = require("lodash");

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
 *   id: 5,
 *   name: "Batman",
 *   finger_id: 0,
 *   organization_id: 5,
 *   phone: "03451481947",
 *   address: "19-B, Peshawar, Hawaii",
 *   salary: 50000,
 *   user_role: "Admin",
 *   advance: 0,
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
    const day = moment(obj.created).format("ddd");

    if (day !== days[index % workDays]) {
      const leave = find(userLeaves, (leaveObj) => {
        return (
          moment(obj.created).isSameOrAfter(
            moment(leaveObj.from_date, "YYYY-MM-DD")
          ) &&
          moment(obj.created).isSameOrBefore(
            moment(leaveObj.to_date, "YYYY-MM-DD")
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
 * @apiDescription Requires either email or phone
 *
 * @apiBody {String} name User's name
 * @apiBody {Number} finger_id User's finger ID as assigned by the BMA machine
 * @apiBody {String} organization_id Organization's ID the user belongs to
 * @apiBody {String} [email]
 * @apiBody {String} password
 * @apiBody {String} [phone]
 * @apiBody {String} [address]
 * @apiBody {Number} [salary=0]
 * @apiBody {String="Worker", "Admin", "Manager"} [user_role="Worker"] User's role in the organization
 * @apiUse User
 */
const createUser = async (req, res) => {
  const fields = req.body;
  const email = fields.email;
  const password = fields.password;

  try {
    delete fields.email;
    delete fields.password;

    const columns = Object.keys(fields);
    const values = Object.values(fields);

    const response = await db.queryOne(
      `INSERT INTO users(${columns.join(",")}) VALUES(${values
        .map((val) => `'${val}'`)
        .join(",")}) RETURNING *`
    );

    if (!response) {
      throw "User not made";
    }

    const user = response;

    if (password) {
      const password = await bcrypt.hash(fields.password, 10);

      await db.queryOne(
        `INSERT INTO credentials(email, password, user_id, phone)
        VALUES($1, $2, $3, $4)
        `,
        [email, password, user.id, user.phone]
      );
    }

    return res.json({
      data: user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Error: Couldn't create user.",
    });
  }
};

/**
 * @api {post} /user/create_from_device/ Create new user from device
 * @apiName CreateUserFromDevice
 * @apiGroup User
 *
 * @apiBody {String} name
 * @apiBody {Number} organization_id
 * @apiBody {Number} finger_id
 *
 * @apiSuccess {Object} data data set to true
 */
const createUserFromDevice = async (req, res) => {
  const { name, organization_id, finger_id } = req.body;

  try {
    const user = await db.queryOne(
      `INSERT INTO users(name, organization_id, finger_id)
      VALUES ($1, $2, $3)
      RETURNING id`,
      [name, organization_id, finger_id]
    );

    if (!user) {
      throw "User not created";
    }

    await db.queryOne(
      `UPDATE organization
      SET
      users = users || $1::INTEGER,
      users_count = users_count + 1
      WHERE id = $2`,
      [user.id, organization_id]
    );

    return res.json({
      data: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error: Couldn't create user",
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
 * @apiBody {String="Worker", "Admin", "Manager"} [user_role] User's role in the organization
 * @apiUse User
 */
const updateUser = async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  try {
    if (fields.salary !== undefined && parseInt(fields.salary) < 0) {
      fields.salary = 0;
    }

    const updates = Object.entries(fields)
      .map(([key, val]) => {
        return `${key} = '${val}'`;
      })
      .join(",");

    let response;
    if (updates) {
      response = await db.queryOne(
        `UPDATE users
        SET ${updates}
        WHERE id = $1
        RETURNING *`,
        [id]
      );
    }

    return res.json({ data: response });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Couldn't update user.",
    });
  }
};

/**
 * @api {put} /user/:fingerID/:orgID/ Update User With AuthID
 * @apiName UpdateUserWithAuthID
 * @apiGroup User
 * @apiDescription This endpoint is used exclusively for updating the user, after creating it from BMA machine.
 *
 * @apiParam {Number} fingerID Finger ID as given by the BMA machine
 * @apiParam {String} orgID
 * @apiBody {String} name
 * @apiBody {String} phone
 * @apiBody {String} [email]
 * @apiBody {String} password
 * @apiBody {String} [address]
 * @apiBody {Number} [salary]
 * @apiBody {String="Worker", "Admin", "Manager"} [user_role] User's role in the organization
 * @apiUse User
 */
const updateUserWithAuthID = async (req, res) => {
  const { fingerID, orgID } = req.params;
  const fields = req.body;
  const { email, password } = fields;

  delete fields.email;
  delete fields.password;

  try {
    let user;

    if (fields.salary !== undefined && parseInt(fields.salary) < 0) {
      fields.salary = 0;
    }

    const updates = Object.entries(fields)
      .map(([key, val]) => {
        return `${key} = '${val}'`;
      })
      .join(",");

    if (updates) {
      const response = await db.queryOne(
        `UPDATE users
        SET ${updates}
        WHERE finger_id = $1
        AND organization_id = $2
        RETURNING *`,
        [fingerID, orgID]
      );

      if (!response) {
        throw "User doesn't exist";
      }

      user = response;
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.query(
        `INSERT INTO credentials(email, password, user_id, phone)
        VALUES($1, $2, $3, $4)
        `,
        [email, hashedPassword, user.id, fields.phone]
      );
    }

    return res.json({ data: user });
  } catch (err) {
    console.error(err);
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
    await db.queryOne(
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
    const response = await db.queryOne(
      `SELECT *
      FROM users
      WHERE id = $1`,
      [id]
    );

    if (response) {
      return res.json({
        data: response,
      });
    } else throw "User Doesn't Exist";
  } catch (err) {
    console.error(err);
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
 * @apiSuccess {Object[]} data Array of user objects: containing 'id', 'name' and 'organization_id'
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
      data: response,
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
  const { userID, orgID } = req.params;

  try {
    var startOfMonth = moment().clone().startOf("month").format("YYYY-MM-DD");
    var today = moment().format("YYYY-MM-DD");
    var percentageAttendance = 0;

    const leavesPromise = db.query(
      `SELECT from_date, to_date
      FROM leave_request
      WHERE user_id = $1
      AND leave_status = 'Accepted'`,
      [userID]
    );
    const attendancePromise = db.query(
      `SELECT created
      FROM attendance
      WHERE user_id = $1
      AND created BETWEEN $2::date AND NOW()::date
      ORDER BY created`,
      [userID, startOfMonth]
    );
    const orgPromise = db.queryOne(
      `SELECT is_saturday_off
      FROM organization
      WHERE id = $1`,
      [orgID]
    );

    const [leavesRes, attendanceRes, orgRes] = await Promise.all([
      leavesPromise,
      attendancePromise,
      orgPromise,
    ]);

    if (attendanceRes.length) {
      const organization = orgRes;
      const diff = moment(today).diff(startOfMonth, "days") + 1;

      today = moment().format("YYYY-MM-ddd");
      startOfMonth = moment(startOfMonth, "YYYY-MM-DD").format("YYYY-MM-ddd");

      var workDays = diff - Math.floor(diff / 7);
      if (today.includes("Sun") || startOfMonth.includes("Sun")) workDays -= 1;
      if (
        organization.is_saturday_off &&
        (today.includes("Sat") || startOfMonth.includes("Sat"))
      )
        workDays -= 1;

      const leaves = calculateLeaves(
        leavesRes,
        organization.is_saturday_off,
        attendanceRes
      );
      percentageAttendance = Math.floor(
        ((attendanceRes.length + leaves) * 100) / workDays
      );
    }

    return res.json({
      data: percentageAttendance,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: `Error: Couldn't get user percentage attendance.`,
    });
  }
};

module.exports = {
  createUser,
  createUserFromDevice,
  updateUser,
  updateUserWithAuthID,
  deleteUser,
  getUser,
  getUsersList,
  getPercentageAttendance,
};
