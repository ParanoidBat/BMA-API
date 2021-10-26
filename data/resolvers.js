import { Advances } from "../db/dbConnector.js";
import { queryResolvers } from "./queryResolvers";
import { mutationResolvers } from "./mutationResolvers";

export const resolvers = {
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
