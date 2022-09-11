const Organization = require("../schemas/organizationSchema");
const User = require("../schemas/userSchema");

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
 * _id: "dvfsge4t3rwfdgf",
 * name: "BMA",
 * address: "162, B3, Lake City, Lahore",
 * phone: "03451481947",
 * usersCount: 0,
 * isSaturdayOff: false,
 * users: [User],
 * dailyAttendance: [Attendance]
 * }
 */
const createOrganization = async (req, res) => {
  try {
    const organization = new Organization(req.body);

    await organization.save();

    return res.json({
      data: organization,
    });
  } catch (err) {
    return res.json({
      error: "Error: Couldn't create orgnaization.",
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
 *   _id: "dfg34t45tgfdy5",
 *   name: "BMA",
 *   address: "162, B3, Lake City, Lahore"
 * }],
 * page: 1
 * }
 */
const getOrganizationsList = async (req, res) => {
  try {
    const { page } = req.query;

    const organizations = await Organization.find({}, "_id name address")
      .limit(10)
      .skip((page - 1) * 10);

    return res.json({
      data: organizations,
      page,
    });
  } catch (err) {
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
    const organization = await Organization.findById(req.params.id);

    if (organization != null) {
      return res.json({
        data: organization,
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
    await Organization.findByIdAndDelete(req.params.id);

    return res.json({
      data: true,
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
 * @apiBody {String} isSaturdayOff
 * @apiSuccess {Boolean} data { data: true }
 *
 * @apiVersion 1.0.0
 */
const updateOrganization = async (req, res) => {
  try {
    Organization.findByIdAndUpdate(req.params.id, req.body, (err) => {
      if (err) throw err;
    });

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
 *   _id,
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

    const [users, count] = await Promise.all([
      User.find({ organizationID: req.params.id }, "_id name salary")
        .sort({
          name: 1,
        })
        .limit(10)
        .skip((page - 1) * 10),
      User.find(
        {
          organizationID: req.params.id,
        },
        "_id"
      ).countDocuments(),
    ]);

    return res.json({
      data: users,
      page,
      count,
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
