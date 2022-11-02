const Organization = require("../schemas/organizationSchema");
const User = require("../schemas/userSchema");
const Credentials = require("../schemas/credentialsSchema");
const bcrypt = require("bcryptjs");

/**
 * @api {post} /signup/ Signup
 * @apiName Signup
 * @apiGroup Auth
 *
 * @apiBody {String} name User's name
 * @apiBody {String} [phone] User's phone
 * @apiBody {String} [address] User's address
 * @apiBody {String} email User's email
 * @apiBody {String} password User's account password
 * @apiBody {String} orgName Organization's name
 * @apiBody {String} orgAddress Organization's address
 * @apiBody {String} orgPhone Organization's phone
 * @apiBody {String} [orgEmail] Organization's email
 *
 * @apiSuccess {Object} data
 * @apiSuccessExample {json} Success-Example:
 * {data:{
 *   userID: "dsfsven324n",
 *   orgID: "afdshui3984y02"
 *   }
 * }
 */
const signup = async (req, res) => {
  const { orgName, orgAddress, orgPhone, orgEmail } = req.body;
  try {
    const organization = new Organization({
      name: orgName,
      address: orgAddress,
      phone: orgPhone,
      email: orgEmail,
    });
    await organization.save();

    const user = new User(req.body);
    user.organizationID = organization._id;
    await user.save();

    const credentials = new Credentials(req.body);
    credentials.user = user;
    credentials.password = await bcrypt.hash(credentials.password, 10);

    await credentials.save();

    return res.json({
      data: { userID: user._id, orgID: organization._id },
    });
  } catch (err) {
    return res.json({
      error: "Couldn't signup",
    });
  }
};

module.exports = signup;
