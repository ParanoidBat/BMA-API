const queryTypes = `
  type Query {
  getAllUsers: [User]
  getUser(id: ID): User
  getAllAdvances: [Advance]
}`;

module.exports = queryTypes;
