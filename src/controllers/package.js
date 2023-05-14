const db = require("../../database");

const getPackages = async (req, res) => {
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

const applyPackage = async (req, res) => {
  const { package, id } = req.body;

  try {
    await db.queryOne(
      `UPDATE users
      SET package = $1
      WHERE id = $2`,
      [package, id]
    );

    return res.json({ data: true });
  } catch (error) {
    console.error(error);
    return res.json({ error: error.message });
  }
};

module.exports = {
  getPackages,
  applyPackage,
};
