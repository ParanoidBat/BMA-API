import express from "express";
import { ApolloServer } from "apollo-server-express";
import { resolvers } from "../data/resolvers.js";
import { typeDefs } from "../data/schema.js";

const server = new ApolloServer({ typeDefs, resolvers });
const app = express();
server.applyMiddleware({ app });

app.get("/", (req, res) => {
  res.send("Apollo GraphQL Express server is ready");
});

app.listen(process.env.PORT || 8080, () => {
  console.log(
    `Server is running at http://localhost:8080${server.graphqlPath}`
  );
});
