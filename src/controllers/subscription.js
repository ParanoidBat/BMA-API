const db = require("../../database");
const { find } = require("lodash");

const createSubscription = async (req, res) => {
  const { packages, id } = req.body;

  try {
    const products = Object.keys(packages)
      .map((key) => `'${key}'`)
      .join();

    const productsCount = await db.query(
      `SELECT count(product_name), product_name
      FROM org_products
      WHERE org_id = $1
      AND product_name IN (${products})
      GROUP BY 2`,
      [id]
    );

    const subItemValues = Object.entries(packages)
      .map(([key, val]) => {
        const obj = find(productsCount, (el) => el.product_name == key);
        return `('${key}', ${obj.count}, '${val.name}')`;
      })
      .join();

    const subItems = await db.query(
      `INSERT INTO subscription_item(product, quantity, package)
      VALUES ${subItemValues}
      RETURNING id`
    );

    const subItemsIDs = subItems.map((el) => el.id).join();

    const subscription = await db.queryOne(
      `INSERT INTO subscription(subscription_items, org_id)
      VALUES (ARRAY [${subItemsIDs}], $1)
      RETURNING id`,
      [id]
    );

    await db.queryOne(
      `UPDATE organization
      SET subscription = $1
      WHERE id = $2`,
      [subscription.id, id]
    );

    return res.json({ data: true });
  } catch (error) {
    console.error(error);
    return res.json({ error: error.message });
  }
};

module.exports = {
  createSubscription,
};
