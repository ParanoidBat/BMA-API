const { gql } = require("apollo-server");
const inputTypes = require("./inputTypes");
const queryTypes = require("./queryTypes");
const mutationTypes = require("./mutationTypes");

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
  role: String
}

type Attendance {
  date: String!
  timeIn: String
  timeOut: String
}

type Advance {
  id: ID
  amount: Int
  userName: String
}
` +
  inputTypes +
  queryTypes +
  mutationTypes;

const typeDefs = gql`
  ${schema}
`;

module.exports = typeDefs;
