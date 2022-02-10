const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/user");
const advanceRoutes = require("./routes/advance");
const attendanceRoutes = require("./routes/attendance");
const reportRoutes = require("./routes/report");
const organizationRoutes = require("./routes/organization");
const loginRoute = require("./routes/login");

const authenticate = require("./middlewares/auth");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error"));
db.once("open", () => console.log("DB Connected"));

app.use("/user", userRoutes);
app.use("/advance", advanceRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/report", reportRoutes);
app.use("/organization", organizationRoutes);
app.use("/login", loginRoute);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on ${port}`));
