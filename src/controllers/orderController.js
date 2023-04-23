const db = require("../../database");

/**
 * @api {post} /order/:id Create Order
 * @apiName CreateOrder
 * @apiGroup Order
 *
 * @apiParam {Number} id User's id
 * @apiBody {Number} quantity Quantity of units ordered
 * @apiBody {String} item Name of the item
 *
 * @apiSuccess {Boolean} data { data: true }
 */
const createOrder = async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  try {
    await db.queryOne(
      `INSERT INTO orders(user_id, quantity, item)
      VALUES ($1, $2, $3)`,
      [id, fields.quantity, "fp1"]
    );

    return res.json({ data: true });
  } catch (err) {
    console.error(err);
    return res.json({
      error: err.message,
    });
  }
};

/**
 * @api {get} /admin/order Get Pending Orders
 * @apiName GetPendingOrders
 * @apiGroup Admin
 *
 * @apiSuccess {Object} data Array of pending orders
 */
const getPendingOrders = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, quantity, item, created, address, phone
      FROM orders
      LEFT JOIN shipment
      ON orders.user_id = shipment.user_id
      WHERE status = 'Pending`
    );

    return res.json({
      data: result,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

/**
 * @api {put} /admin/order/:id Order Delivered
 * @apiName OrderDelivered
 * @apiGroup Admin
 *
 * @apiParam {Number} id Order id
 *
 * @apiSuccess {Object} data { data: true }
 */
const orderDelivered = async (req, res) => {
  try {
    await db.queryOne(
      `UPDATE orders
      SET order_status = 'Delivered'
      WHERE id = $1`,
      [req.params.id]
    );

    return res.json({ data: true });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getPendingOrders,
  orderDelivered,
};
