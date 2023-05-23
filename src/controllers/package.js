const db = require("../../database");

const getAllPackages = async (req, res) => {
  try {
    const packages = await db.query(
      `SELECT id, price, interval
      FROM package`
    );

    return res.json({ data: packages });
  } catch (error) {
    console.error(error);
    return res.json({ error: error.message });
  }
};

const getRelevantPackages = async (req, res) => {
  const { org_id } = req.params;

  try {
    const result = await db.query(
      `SELECT *
      FROM package
      WHERE product_name IN (
        SELECT DISTINCT product_name
        FROM org_products
        WHERE org_id = $1
      )
      ORDER BY interval_in_number
      `,
      [org_id]
    );

    const packages = {};
    result.forEach((el) => {
      const product_name = el.product_name;
      delete el.product_name;

      if (!packages[product_name]) {
        Object.assign(packages, {
          [product_name]: [el],
        });
      } else {
        packages[product_name].push(el);
      }
    });

    return res.json({
      data: packages,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      error: error.message,
    });
  }
};

const createPackage = async (req, res) => {
  const { name, product_name, interval, interval_in_number, price } = req.body;

  try {
    const package = await db.queryOne(
      `INSERT INTO package VALUES($1, $2, $3, $4, $5)
      RETURNING *`,
      [name, product_name, interval, interval_in_number, price]
    );

    return res.json({ data: package });
  } catch (error) {
    console.error(error);
    return res.json({ erorr: error.message });
  }
};

module.exports = {
  getRelevantPackages,
  getAllPackages,
  createPackage,
};
