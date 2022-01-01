const Advance = require("../schemas/advanceSchema");

const createAdvance = async (req, res) => {
  try {
    const advance = new Advance(req.body);
    await advance.save();

    res.json({
      data: true,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't create advance.",
    });
  }
};

const updateAdvance = async (req, res) => {
  const { id } = req.params;

  try {
    const advance = await Advance.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    });

    res.json({
      data: advance,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: couldn't update advance.",
    });
  }
};

const deleteAdvance = async (req, res) => {
  const { id } = req.params;

  try {
    await Advance.findByIdAndDelete(id);

    res.json({
      data: true,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't delete advance.",
    });
  }
};

const getAdvancesList = async (req, res) => {
  try {
    const advances = await Advance.find();

    res.json({
      data: advances,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't get advances list.",
    });
  }
};

module.exports = {
  createAdvance,
  updateAdvance,
  deleteAdvance,
  getAdvancesList,
};
