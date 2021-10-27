const inputTypes = `
  input AttendanceInput {
  userID: ID!
  date: String!
  timeIn: String
  timeOut: String
}

input UserInput {
  name: String!
  authID: Int!
  phone: String
  address: String
  salary: Int
  isAdmin: Boolean
}

input UpdateUserInput {
  name: String
  authID: Int
  attendanceCount: [AttendanceInput]
  phone: String
  address: String
  salary: Int
  advance: AdvanceInput
  isAdmin: Boolean
}

input AdvanceInput {
  amount: Int!
  userID: ID!
  userName: String!
}

input UpdateAdvanceInput {
  amount: Int
  userID: ID
  userName: String
}
`;

module.exports = inputTypes;
