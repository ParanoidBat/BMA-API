const db = require("../../database");

/**
 * @apiDefine InternalSystem Internal Business Developer Access
 * Only used in the internal system
 */

/**
 * @api {post} /organization/ Create New Organization
 * @apiName CreateOrganization
 * @apiGroup Organization
 *
 * @apiBody {String} name Name of the organization
 * @apiBody {String} address Address of the organization
 * @apiBody {String} phone Phone of the Organization
 * @apiBody {String} [email] Email address of the organization
 *
 * @apiSuccess {Object} data The organization object
 * @apiSuccessExample {json} Success-Example:
 * {
 *  id: 7,
 *  name: "BMA",
 *  address: "162, B3, Lake City, Lahore",
 *  phone: "03451481947",
 *  users_count: 0,
 *  is_saturday_off: false,
 *  users: null,
 *  created_on: "2023-02-01"
 * }
 */
const createOrganization = async (req, res) => {
  const fields = req.body;

  try {
    const organization = await db.query(
      `INSERT INTO organization(name, address, phone, email)
      VALUES($1, $2, $3, $4) RETURNING *`,
      [fields.name, fields.address, fields.phone, fields.email]
    );

    return res.json({
      data: organization.rows[0],
    });
  } catch (err) {
    return res.json({
      error: "Error: Couldn't create organization.",
    });
  }
};

/**
 * @api {get} /organization/ Get All Organizations
 * @apiName GetOrgsList
 * @apiGroup Organization
 * @apiPermission InternalSystem
 *
 * @apiQuery {Number} page Page number for the pagination. One page has 10 results.
 * @apiSuccess {Object[]} data Array of organizations. But only '_id', 'name' and 'address'
 * @apiSuccess {Number} page Current page number
 * @apiSuccessExample {json} Sucess-Example:
 * {
 * data:
 * [{
 *   id: 5,
 *   name: "BMA",
 *   address: "162, B3, Lake City, Lahore"
 * }],
 * page: 1
 * }
 */
const getOrganizationsList = async (req, res) => {
  try {
    const { page } = req.query;

    const organizations = await db.query(
      `SELECT id, name, address
      FROM organization
      ORDER BY id
      LIMIT 10
      OFFSET $1`,
      [(page - 1) * 10]
    );

    return res.json({
      data: organizations.rows,
      page,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      error: "Error: Couldn't retrieve organizations list.",
    });
  }
};

/**
 * @api {get} /organization/:id/ Get Organization
 * @apiName GetOrganization
 * @apiGroup Organization
 *
 * @apiParam {String} id Organiztion's ID
 * @apiSuccess {Object} data Organization object. Same as 'Create New Organization'
 */
const getOrganization = async (req, res) => {
  try {
    // const organization = await Organization.findById(req.params.id);
    const organization = await db.query(
      `SELECT *
      FROM organization
      WHERE id = $1`,
      [req.params.id]
    );

    if (organization.rowCount) {
      return res.json({
        data: organization.rows[0],
      });
    } else throw "Organization not found.";
  } catch (err) {
    return res.json({
      error: "Error: Couldn't get organization.",
    });
  }
};

/**
 * @api {delete} /organization/:id/ Delete An Organization
 * @apiName DeleteOrganization
 * @apiGroup Organization
 * @apiPermission InternalSystem
 *
 * @apiParam {String} id Organization's ID
 * @apiSuccess {Boolean} data { data: true }
 */
const deleteOrganization = async (req, res) => {
  try {
    const result = await db.query(
      `DELETE FROM organization
      WHERE id = $1`,
      [req.params.id]
    );

    return res.json({
      data: Boolean(result.rowCount),
    });
  } catch (err) {
    return res.json({
      error: "Error: Couldn't delete organization.",
    });
  }
};

/**
 * @api {put} /organization/:id Update An Organization
 * @apiName UpdateOrganization
 * @apiGroup Organization
 *
 * @apiParam {String} id Organization's ID
 * @apiBody {String} name
 * @apiBody {String} address
 * @apiBody {String} phone
 * @apiBody {String} email
 * @apiBody {String} is_saturday_off
 * @apiSuccess {Boolean} data { data: true }
 *
 * @apiVersion 1.0.0
 */
const updateOrganization = async (req, res) => {
  try {
    const fields = req.body;

    const updates = Object.entries(fields)
      .map(([key, val]) => {
        return `${key} = '${val}'`;
      })
      .join(",");

    if (updates) {
      await db.query(
        `UPDATE organization
        SET ${updates}
        WHERE id = $1`,
        [req.params.id]
      );
    }

    return res.json({
      data: true,
    });
  } catch (err) {
    return res.json({
      error: "Error: Couldn't update organization.",
    });
  }
};

/**
 * @api {get} /organization/:id/users Get Organization's Users
 * @apiName GetOrgUsers
 * @apiGroup Organization
 *
 * @apiParam {String} id Organization's ID
 * @apiQuery {Number} page Page number for pagination. One page has 10 results
 * @apiSuccess {Object[]} data Array of user objects; containing _id, name and salary
 * @apiSuccess {Number} page Current page number
 * @apiSuccess {Number} count Total number of users in organization. Except the admin
 * @apiSuccessExample {json} Sucess-Example:
 * {
 * data:
 * [{
 *   id,
 *   name,
 *   salary
 * }],
 * page: 1,
 * count: 56
 * }
 */
const getOrganizationUsersList = async (req, res) => {
  try {
    const { page } = req.query;

    const totalUsersPromise = db.query(
      `SELECT ARRAY_LENGTH(users, 1) AS count
      FROM organization
      WHERE id = $1`,
      [req.params.id]
    );

    const usersPromise = db.query(
      `SELECT id, name, salary
      FROM users
      WHERE id IN (
        SELECT UNNEST(users)
        FROM organization
        WHERE id = $1
      )
      ORDER BY id
      LIMIT 10
      OFFSET $2`,
      [req.params.id, (page - 1) * 10]
    );

    const [users, count] = await Promise.all([usersPromise, totalUsersPromise]);

    return res.json({
      data: users.rows,
      page,
      count: count.rows[0].count,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Couldn't get users list.",
    });
  }
};

module.exports = {
  createOrganization,
  getOrganizationsList,
  getOrganizationUsersList,
  getOrganization,
  updateOrganization,
  deleteOrganization,
};
