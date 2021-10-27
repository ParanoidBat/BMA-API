const Advances = require("../db/schema/advanceSchema");
const Users = require("../db/schema/userSchema");

const queryResolvers = {
  getAllUsers: (root, {}) => {
    return new Promise((resolve, reject) => {
      Users.find((err, users) => {
        if (err) reject(err);
        else resolve(users);
      });
    });
  },

  getUser: (root, { id }) => {
    return new Promise((resolve, reject) => {
      Users.findById(id, (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });
  },

  getAllAdvances: () => {
    return new Promise((resolve, reject) => {
      Advances.find((err, advances) => {
        if (err) reject(err);
        else resolve(advances);
      });
    });
  },
};

module.exports = queryResolvers;
