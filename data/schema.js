import { gql } from "apollo-server-express";
import { inputTypes } from "./inputTypes";
import { queryTypes } from "./queryTypes";
import { mutationTypes } from "./mutationTypes";

// in user type, add advance

const schema =
  `
  type User {
  id: ID
  name: String!
  authID: String!
  attendanceCount: [Attendance]
  phone: String
  address: String
  salary: Int
  isAdmin: Boolean
}

type Attendance {
  date: String!
  timeIn: String
  timeOut: String
}
` +
  inputTypes +
  queryTypes +
  mutationTypes;

export const typeDefs = gql`
  ${schema}
`;
