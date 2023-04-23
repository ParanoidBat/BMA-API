const db = require("../../database");

/**
 * @api {get} /shipment/:id
 * @apiName GetShipmentDetails
 * @apiGroup Shipment
 * @apiParam {String} id User's id
 *
 * @apiSuccess {Object} data
 * @apiSuccessExample {json} Example:
 * {
 * data: {
 * user_id: 1,
 * address: "34-D, Johar Town, Lahore",
 * phone: "123456789",
 * email: "any@lel.com"
 * }
 * }
 */
const getDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.queryOne(
      `SELECT *
      FROM shipment
      WHERE user_id = $1`,
      [id]
    );

    return res.json({
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      error: error.message,
    });
  }
};

/**
 * @api {post} /shipment/:id
 * @apiName CreateOrUpdateDetails
 * @apiGroup Shipment
 *
 * @apiParam {String} id User's id
 * @apiBody {String} address
 * @apiBody {String} phone
 * @apiBody {String} [email]
 *
 * @apiSuccess {Object} data
 */
const createOrUpdateDetails = async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  const updates = Object.entries(fields)
    .map(([key, val]) => {
      return `${key} = '${val}'`;
    })
    .join(",");

  try {
    const details = await db.queryOne(
      `INSERT INTO shipment(user_id, address, phone, email)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT(user_id) DO
      UPDATE SET ${updates}
      WHERE shipment.user_id = $1
      RETURNING *`,
      [id, fields.address, fields.phone, fields.email]
    );

    return res.json({
      data: details,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      error: error.message,
    });
  }
};

module.exports = {
  getDetails,
  createOrUpdateDetails,
};
