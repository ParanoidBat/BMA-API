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
  role: String
}

input UpdateUserInput {
  name: String
  authID: Int
  attendanceCount: [AttendanceInput]
  phone: String
  address: String
  salary: Int
  advance: AdvanceInput
  role: String
}

input AdvanceInput {
  amount: Int!
  userID: ID!
}

input UpdateAdvanceInput {
  amount: Int
  userID: ID
}
`;

module.exports = inputTypes;
