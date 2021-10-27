const mongoose = require("mongoose");

// const env = process.env.NODE_ENV || "development";

const connectDB = () => {
  mongoose.connect(
    "mongodb+srv://paranoidbat:1MBsM%40dq@bma-cluster.taszz.mongodb.net/BMAdb?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  const db = mongoose.connection;
  db.on("error", () => {
    console.error("Error while connecting to DB");
  });
};

module.exports = connectDB;
