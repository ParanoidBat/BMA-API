import { gql } from "apollo-server-express";
// in user type, add advance
export const typeDefs = gql`
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
    id: ID
    date: String!
    timeIn: String
    timeOut: String
  }

  input AttendanceInput {
    id: ID
    date: String!
    timeIn: String
    timeOut: String
  }

  input UserInput {
    id: ID
    name: String!
    authID: String!
    attendanceCount: [Attendance]
    phone: String
    address: String
    salary: Int
    isAdmin: Boolean
  }

  type Query {
    getAllUsers: [User]
    getUser(id: ID): User
  }

  type Mutation {
    createUser(input: UserInput): User
    createAttendance(userID: ID): User
  }
`;
