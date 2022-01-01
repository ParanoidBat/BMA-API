const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/user");
const advanceRoutes = require("./routes/advance");
const attendanceRoutes = require("./routes/attendance");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(
  "mongodb+srv://paranoidbat:1MBsM%40dq@bma-cluster.taszz.mongodb.net/BMAdb?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error"));
db.once("open", () => console.log("DB Connected"));

app.use("/user", userRoutes);
app.use("/advance", advanceRoutes);
app.use("/attendance", attendanceRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on ${port}`));
