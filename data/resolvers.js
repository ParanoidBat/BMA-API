const Advances = require("../db/schema/advanceSchema");
const queryResolvers = require("./queryResolvers");
const mutationResolvers = require("./mutationResolvers");

const resolvers = {
  Query: queryResolvers,
  Mutation: mutationResolvers,
  User: {
    advance: (user) => {
      return new Promise((resolve, reject) => {
        Advances.findOne({ userID: user._id }, (err, users) => {
          if (err) reject(err);
          else resolve(users);
        });
      });
    },
  },
};

module.exports = resolvers;
