import { Users, Attendances } from "../db/dbConnector.js";

export const queryResolvers = {
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
};
