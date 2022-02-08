const Organization = require("../schemas/organizationSchema");
const User = require("../schemas/userSchema");

const createOrganization = async (req, res) => {
  try {
    const organization = new Organization(req.body);

    await organization.save();

    res.json({
      data: organization,
    });
  } catch (err) {
    res.json({
      error: "Error: Couldn't create orgnaization.",
    });
  }
};

const getOrganizationsList = async (req, res) => {
  try {
    const organizations = await Organization.find({}, "_id name address");

    res.json({
      data: organizations,
    });
  } catch (err) {
    res.json({
      error: "Error: Couldn't retrieve organizations list.",
    });
  }
};

const getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (organization != null) {
      res.json({
        data: organization,
      });
    } else throw "Organization not found.";
  } catch (err) {
    res.json({
      error: "Error: Couldn't get organization.",
    });
  }
};

const deleteOrganization = async (req, res) => {
  try {
    await Organization.findByIdAndDelete(req.params.id);

    res.json({
      data: true,
    });
  } catch (err) {
    res.json({
      error: "Error: Couldn't delete organization.",
    });
  }
};

const updateOrganization = async (req, res) => {
  try {
    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      req.body
    );

    await organization.save();

    res.json({
      data: true,
    });
  } catch (err) {
    res.json({
      error: "Error: Couldn't update organization.",
    });
  }
};

const getOrganizationUsersList = async (req, res) => {
  try {
    const users = await User.find(
      { organizationID: req.params.id },
      "_id name salary hasAdvance"
    ).sort({
      name: 1,
    });

    res.json({
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't get users list.",
    });
  }
};

module.exports = {
  createOrganization,
  getOrganizationsList,
  getOrganizationUsersList,
  getOrganization,
  updateOrganization,
  deleteOrganization,
};
