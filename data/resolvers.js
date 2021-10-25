import { queryResolvers } from "./queryResolvers";
import { mutationResolvers } from "./mutationResolvers";

export const resolvers = {
  Query: queryResolvers,
  Mutation: mutationResolvers,
};
