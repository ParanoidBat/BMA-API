const { ApolloServer } = require("apollo-server");
const resolvers = require("../data/resolvers.js");
const typeDefs = require("../data/schema.js");
const connectDB = require("../db/dbConnector.js");

connectDB();

const server = new ApolloServer({ typeDefs, resolvers });

// app.get("/", (req, res) => {
//   res.send("Apollo GraphQL Express server is ready");
// });

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Server is running at ${url}`);
});
