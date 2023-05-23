const db = require("../../database");

const createProduct = async (req, res) => {
  const { name, model, tagline, description, price } = req.body;

  try {
    await db.queryOne(
      `INSERT INTO product(name, model, tagline, description, price)
      VALUES($1, $2, $3, $4, $5)`,
      [name, model, tagline, description, price]
    );

    return res.json({ data: true });
  } catch (error) {
    console.error(error);
    return res.json({
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
};
