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

module.exports = {
  getPackages,
};
