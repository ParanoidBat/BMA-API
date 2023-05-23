const db = require("../../database");

const createOrgProduct = async (req, res) => {
  const { org_id, product_name, product_mac } = req.body;

  try {
    await db.queryOne(
      `INSERT INTO org_products(org_id, product_name, product_mac)
      VALUES($1, $2, $3)`,
      [org_id, product_name, product_mac]
    );

    return res.json({ data: true });
  } catch (error) {
    console.error(error);
    return res.json({ error: error.message });
  }
};

module.exports = {
  createOrgProduct,
};
