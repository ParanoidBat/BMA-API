const User = require("../schemas/userSchema");

const createAdvance = async (req, res) => {
  try {
    User.findByIdAndUpdate(
      req.params.id,
      {
        hasAdvance: true,
        advance: req.body.advance,
      },
      (err) => {
        if (err) throw err;
      }
    );

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
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        advance: req.body.advance,
      },
      {
        runValidators: true,
        new: true,
      }
    );

    await user.save();

    res.json({
      data: true,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: couldn't update advance.",
    });
  }
};

const deleteAdvance = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      hasAdvance: false,
      advance: null,
    });

    res.json({
      data: true,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't delete advance.",
    });
  }
};

module.exports = {
  createAdvance,
  updateAdvance,
  deleteAdvance,
};
