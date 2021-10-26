export const mutationTypes = `
  type Mutation {
  createUser(input: UserInput): User
  updateUser(input: UpdateUserInput, id: ID): User
  deleteUser(id: ID): Boolean
  addAttendance(input: AttendanceInput): Attendance
  createAdvance(input: AdvanceInput): Advance
}`;
