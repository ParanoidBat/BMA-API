const db = require("../../database");
const bcrypt = require("bcryptjs");

/**
 * @api {post} /signup/ Signup
 * @apiName Signup
 * @apiGroup Auth
 *
 * @apiBody {String} name User's name
 * @apiBody {String} [phone] User's phone
 * @apiBody {String} [address] User's address
 * @apiBody {Number} finger_id User's finger id, as displayed on the finger scanner device
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
 *   userID: 5,
 *   orgID: 4
 *   }
 * }
 */
const signup = async (req, res) => {
  const fields = req.body;
  let organizationRes;

  try {
    organizationRes = await db.query(
      `INSERT INTO organization(name, address, phone, email)
      VALUES($1, $2, $3, $4) RETURNING id`,
      [fields.orgName, fields.orgAddress, fields.orgPhone, fields.orgEmail]
    );

    const userRes = await db.query(
      `INSERT INTO users(name, finger_id, organization_id, phone, address, salary, user_role)
      VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        fields.name,
        fields.finger_id,
        organizationRes.rows[0].id,
        fields.phone,
        fields.address,
        fields.salary,
        fields.user_role,
      ]
    );

    const password = await bcrypt.hash(fields.password, 10);

    await db.query(
      `INSERT INTO credentials(email, password, user_id, phone)
      VALUES($1, $2, $3, $4)`,
      [fields.email, password, userRes.rows[0].id, fields.phone]
    );

    return res.json({
      data: { userID: userRes.rows[0].id, orgID: organizationRes.rows[0].id },
    });
  } catch (err) {
    console.error(err);

    if (organizationRes) {
      await db.query(
        `DELETE FROM organization
        WHERE id = $1`,
        [organizationRes.rows[0].id]
      );
    }

    return res.json({
      error: "Couldn't signup",
    });
  }
};

module.exports = signup;
