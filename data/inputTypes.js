export const inputTypes = `
  input AttendanceInput {
  userID: ID!
  date: String!
  timeIn: String
  timeOut: String
}

input UserInput {
  id: ID
  name: String!
  authID: String!
  attendanceCount: [AttendanceInput]
  phone: String
  address: String
  salary: Int
  isAdmin: Boolean
}
`;
