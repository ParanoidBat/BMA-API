const moment = require("moment");
const db = require("../../database");

/*
 * 1 is added to moment.diff() results to include the present in the calculations
 */

/**
 * @apiDefine Report
 * @apiSuccess {Object[]} data
 * @apiSuccess {Number} percentageAttendance Percentage of users that checked in
 * @apiSuccess {Number} page Current pagination number
 * @apiSuccess {Number} count Total attendances. ( Attendance objects )
 * @apiSuccessExample {json} Success-Example:
 * {
 * data:
 * [{
 *   created: "2022-08-08",
 *   check_in: "07:02:56",
 *   check_out: "02:30:45",
 *   user_name: "Batman"
 * }],
 * percentageAttendance: 75,
 * page: 1,
 * count: 26
 * }
 */

const getReportsQueryPromises = (startDate, id, page) => {
  const reportPromise = db.query(
    `SELECT created, check_in, check_out, user_name
    FROM attendance
    WHERE organization_id = $1
    AND created > $2::date
    AND created <= NOW()::date
    ORDER BY created
    LIMIT 10
    OFFSET $3`,
    [id, startDate, (page - 1) * 10]
  );
  const countPromise = db.queryOne(
    `SELECT COUNT(*)
    FROM attendance
    WHERE organization_id = $1
    AND created > $2::date
    AND created <= NOW()::date`,
    [id, startDate]
  );
  const orgPromise = db.queryOne(
    `SELECT users_count, is_saturday_off
    FROM organization
    WHERE id = $1`,
    [id]
  );

  return [reportPromise, countPromise, orgPromise];
};

/**
 * @api {get} /report/today/:id/ Get Today's Report
 * @apiName TodayReport
 * @apiGroup Report
 *
 * @apiParam id Organization's ID
 * @apiSuccess {Object[]} data Attendance List, containing 'created', 'check_in', 'check_out' and 'user_name'
 * @apiSuccess {String} totalAttendance Ratio of current attendance. Ex: 12/30
 */
const getTodayReport = async (req, res) => {
  const { id } = req.params;

  try {
    const reportPromise = db.query(
      `SELECT user_name, created, check_in, check_out
      FROM attendance
      WHERE created = NOW()::date
      AND organization_id = $1`,
      [id]
    );

    const orgPromise = db.queryOne(
      `SELECT users_count
      FROM organization
      WHERE id = $1`,
      [id]
    );

    const [reportRes, orgRes] = await Promise.all([reportPromise, orgPromise]);

    return res.json({
      data: reportRes,
      totalAttendance: `${reportRes.length}/${orgRes.users_count}`,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Couldn't generate daily report.",
    });
  }
};

/**
 * @api {get} /report/weekly/:id/ Get Weekly Report
 * @apiName WeeklyReport
 * @apiGroup Report
 *
 * @apiParam {String} id Organization's ID
 * @apiQuery {Number} page Page number for pagination. 10 results per page.
 * @apiUse Report
 */
const getWeeklyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page);

    const startOfWeek = moment().clone().startOf("week").format("YYYY-MM-DD");
    const today = moment().format("YYYY-MM-DD");
    let percentageAttendance = 0;

    const [reportPromise, countPromise, orgPromise] = getReportsQueryPromises(
      startOfWeek,
      id,
      page
    );

    const [reportRes, countRes, orgRes] = await Promise.all([
      reportPromise,
      countPromise,
      orgPromise,
    ]);

    if (reportRes.length) {
      const organization = orgRes;
      var count = countRes.count;

      const diff =
        moment(today).diff(startOfWeek, "days") +
        (organization.is_saturday_off ? 0 : 1);

      percentageAttendance = Math.floor(
        (count * 100) / (organization.users_count * diff)
      );
    }

    return res.json({
      data: reportRes,
      percentageAttendance,
      page,
      count,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Couldn't generate weekly report.",
    });
  }
};

/**
 * @api {get} /report/monthly/:id/ Get Monthly Report
 * @apiName Monthly Report
 * @apiGroup Report
 *
 * @apiParam {String} id Organization's ID
 * @apiQuery {Number} page Page number for pagination. 10 results per page.
 * @apiUse Report
 */
const getMonthlyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page);

    var startOfMonth = moment().clone().startOf("month").format("YYYY-MM-DD");
    var today = moment().format("YYYY-MM-DD");
    var percentageAttendance = 0;

    const [reportPromise, countPromise, orgPromise] = getReportsQueryPromises(
      startOfMonth,
      id,
      page
    );

    const [reportRes, countRes, orgRes] = await Promise.all([
      reportPromise,
      countPromise,
      orgPromise,
    ]);

    if (reportRes.length) {
      const organization = orgRes;
      var count = countRes.count;

      const diff = moment(today).diff(startOfMonth, "days") + 1;

      today = moment().format("YYYY-MM-ddd");
      startOfMonth = moment(startOfMonth, "YYYY-MM-DD").format("YYYY-MM-ddd");

      let workDays = diff - Math.floor(diff / 7);
      if (today.includes("Sun") || startOfMonth.includes("Sun")) workDays -= 1;
      if (
        organization.is_saturday_off &&
        (today.includes("Sat") || startOfMonth.includes("Sat"))
      )
        workDays -= 1;

      percentageAttendance = Math.floor(
        (count * 100) / (workDays * organization.users_count)
      );
    }

    return res.json({
      data: reportRes,
      percentageAttendance,
      page,
      count,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Couldn't generate monthly report.",
    });
  }
};

/**
 * @api {get} /report/three/:id/ Get Three Month Report
 * @apiName ThreeMonthReport
 * @apiGroup Report
 *
 * @apiParam {String} id Organization's ID
 * @apiQuery {Number} page Page number for pagination. 10 results per page.
 * @apiUse Report
 */
const getThreeMonthsReport = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page);

    var last3Months = moment()
      .clone()
      .subtract(3, "months")
      .startOf("month")
      .format("YYYY-MM-DD");

    var today = moment().format("YYYY-MM-DD");
    var percentageAttendance = 0;

    const [reportPromise, countPromise, orgPromise] = getReportsQueryPromises(
      last3Months,
      id,
      page
    );

    const [reportRes, countRes, orgRes] = await Promise.all([
      reportPromise,
      countPromise,
      orgPromise,
    ]);

    if (reportRes.length) {
      const organization = orgRes;
      var count = countRes.count;
      const diff = moment(today).diff(last3Months, "days") + 1;

      today = moment().format("YYYY-MM-ddd");
      last3Months = moment(last3Months, "YYYY-MM-DD").format("YYYY-MM-ddd");

      var workDays = diff - Math.floor(diff / 7);
      if (today.includes("Sun") || last3Months.includes("Sun")) workDays -= 1;
      if (
        organization.is_saturday_off &&
        (today.includes("Sat") || last3Months.includes("Sat"))
      )
        workDays -= 1;

      percentageAttendance = Math.floor(
        (count * 100) / (workDays * organization.users_count)
      );
    }

    return res.json({
      data: reportRes,
      percentageAttendance,
      page,
      count,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Couldn't generate 3 months report.",
    });
  }
};

/**
 * @api {get} /report/user/:orgID/:userID/ Get User's Report
 * @apiName UserReport
 * @apiGroup Report
 *
 * @apiDescription NOTE: Unlike in example success response given, you won't receive the 'userName'
 * @apiParam {String} orgID
 * @apiParam {String} userID
 * @apiQuery {Number} page 10 results per page
 * @apiUse Report
 */
const getUserReport = async (req, res) => {
  try {
    const { orgID, userID } = req.params;
    const page = parseInt(req.query.page);

    var startOfMonth = moment().clone().startOf("month").format("YYYY-MM-DD");
    var today = moment().format("YYYY-MM-DD");
    var percentageAttendance = 0;

    const reportPromise = db.query(
      `SELECT created, check_in, check_out
      FROM attendance
      WHERE user_id = $1
      AND created > $2::date
      AND created <= NOW()::date
      ORDER BY created
      LIMIT 10
      OFFSET $3`,
      [userID, startOfMonth, (page - 1) * 10]
    );
    const countPromise = db.queryOne(
      `SELECT COUNT(*)
      FROM attendance
      WHERE user_id = $1
      AND created > $2::date
      AND created <= NOW()::date`,
      [userID, startOfMonth]
    );
    const orgPromise = db.queryOne(
      `SELECT is_saturday_off
      FROM organization
      WHERE id = $1`,
      [orgID]
    );

    const [reportRes, countRes, orgRes] = await Promise.all([
      reportPromise,
      countPromise,
      orgPromise,
    ]);

    if (reportRes.length) {
      const organization = orgRes;
      var count = countRes.count;
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

      percentageAttendance = Math.floor((count * 100) / workDays);
    }

    return res.json({
      data: reportRes,
      percentageAttendance,
      page,
      count,
    });
  } catch (err) {
    return res.status(500).json({
      error: `Error: Couldn't generate report for user.`,
    });
  }
};

/**
 * @api {post} /report/user/:orgID/:userID Get User's Report In A Range
 * @apiName RangedUserReport
 * @apiGroup Report
 * @apiDescription NOTE: Unlike in example success response given, you won't receive the 'userName'
 *
 * @apiParam {String} orgID
 * @apiParam {String} userID
 * @apiQuery {Number} page 10 results per page
 * @apiBody {String} from Range starting from. Format YYYY-MM-DD (2022-08-08)
 * @apiBody {String} to Range uptill.
 * @apiUse Report
 */
const getFilteredUserReport = async (req, res) => {
  try {
    var { from, to } = req.body;
    const page = parseInt(req.query.page);

    const { userID, orgID } = req.params;
    var percentageAttendance = 0;

    from = moment(from, "YYYY-MM-DD").format("YYYY-MM-DD");
    to = moment(to, "YYYY-MM-DD").format("YYYY-MM-DD");

    if (moment(from).isAfter(to)) [from, to] = [to, from];

    const reportPromise = db.query(
      `SELECT created, check_in, check_out, unique_attendance_string AS uas
      FROM attendance
      WHERE user_id = $1
      AND created BETWEEN $2::date AND $3::date
      ORDER BY created
      LIMIT 10
      OFFSET $4`,
      [userID, from, to, (page - 1) * 10]
    );
    const countPromise = db.queryOne(
      `SELECT COUNT(*)
      FROM attendance
      WHERE user_id = $1
      AND created BETWEEN $2::date AND $3::date`,
      [userID, from, to]
    );
    const orgPromise = db.queryOne(
      `SELECT is_saturday_off
      FROM organization
      WHERE id = $1`,
      [orgID]
    );

    const [reportRes, countRes, orgRes] = await Promise.all([
      reportPromise,
      countPromise,
      orgPromise,
    ]);

    if (reportRes.length) {
      const organization = orgRes;
      var count = countRes.count;
      var diff = from == to ? 0 : moment(to).diff(from, "days") + 1;
      var workDays = diff - Math.floor(diff / 7);

      to = moment(to, "YYYY-MM-DD").format("YYYY-MM-ddd");
      from = moment(from, "YYYY-MM-DD").format("YYYY-MM-ddd");

      if (workDays) {
        if (to.includes("Sun") || from.includes("Sun")) workDays -= 1;
        if (
          organization.is_saturday_off &&
          (to.includes("Sat") || from.includes("Sat"))
        )
          workDays -= 1;

        try {
          percentageAttendance = Math.floor((count * 100) / workDays);
        } catch (err) {
          throw err;
        }
      }
    }

    return res.json({
      data: reportRes,
      percentageAttendance,
      page,
      count,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: `Error: Couldn't generate report for user.`,
    });
  }
};

/**
 * @api {post} /report/custom/:id Get Custom Report
 * @apiName Custom Report
 * @apiGroup Report
 *
 * @apiParam {String} id Organization's ID
 * @apiQuery {Number} page 10 results per page
 * @apiBody {String} from Date range starting from. Format YYYY-MM-DD
 * @apiBody {String} to Date range uptill.
 * @apiUse Report
 */
const getCustomReport = async (req, res) => {
  try {
    var { from, to } = req.body;
    const page = parseInt(req.query.page);

    const { id } = req.params;
    var percentageAttendance = 0;

    from = moment(from, "YYYY-MM-DD").format("YYYY-MM-DD");
    to = moment(to, "YYYY-MM-DD").format("YYYY-MM-DD");

    if (moment(from).isAfter(to)) [from, to] = [to, from];

    const reportPromise = db.query(
      `SELECT created, check_in, check_out, user_name
      FROM attendance
      WHERE organization_id = $1
      AND created BETWEEN $2::date AND $3::date
      ORDER BY created
      LIMIT 10
      OFFSET $4`,
      [id, from, to, (page - 1) * 10]
    );
    const countPromise = db.queryOne(
      `SELECT COUNT(*)
      FROM attendance
      WHERE organization_id = $1
      AND created BETWEEN $2::date AND $3::date`,
      [id, from, to]
    );
    const orgPromise = db.queryOne(
      `SELECT users_count, is_saturday_off
      FROM organization
      WHERE id = $1`,
      [id]
    );

    const [reportRes, countRes, orgRes] = await Promise.all([
      reportPromise,
      countPromise,
      orgPromise,
    ]);

    if (reportRes.length) {
      const organization = orgRes;
      var count = countRes.count;
      var diff = from == to ? 0 : moment(to).diff(from, "days") + 1;
      var workDays = diff - Math.floor(diff / 7);

      to = moment(to, "YYYY-MM-DD").format("YYYY-MM-ddd");
      from = moment(from, "YYYY-MM-DD").format("YYYY-MM-ddd");

      if (workDays) {
        if (to.includes("Sun") || from.includes("Sun")) workDays -= 1;
        if (
          organization.is_saturday_off &&
          (to.includes("Sat") || from.includes("Sat"))
        )
          workDays -= 1;

        try {
          percentageAttendance = Math.floor(
            (count * 100) / (workDays * organization.users_count)
          );
        } catch (err) {
          throw err;
        }
      }
    }

    return res.json({
      data: reportRes,
      percentageAttendance,
      page,
      count,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Couldn't generate report.",
    });
  }
};

module.exports = {
  getTodayReport,
  getWeeklyReport,
  getMonthlyReport,
  getThreeMonthsReport,
  getUserReport,
  getFilteredUserReport,
  getCustomReport,
};
