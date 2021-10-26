import { gql } from "apollo-server-express";
import { inputTypes } from "./inputTypes";
import { queryTypes } from "./queryTypes";
import { mutationTypes } from "./mutationTypes";

const schema =
  `
  type User {
  id: ID
  name: String!
  authID: Int!
  attendanceCount: [Attendance]
  phone: String
  address: String
  salary: Int
  advance: Advance
  isAdmin: Boolean
}

type Attendance {
  date: String!
  timeIn: String
  timeOut: String
}

type Advance {
  id: ID
  amount: Int
  userID: ID
  userName: String
}
` +
  inputTypes +
  queryTypes +
  mutationTypes;

export const typeDefs = gql`
  ${schema}
`;
