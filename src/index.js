if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const path = require("path");

const userRoutes = require("./routes/user");
const attendanceRoutes = require("./routes/attendance");
const reportRoutes = require("./routes/report");
const organizationRoutes = require("./routes/organization");
const loginRoute = require("./routes/login");
const signupRoute = require("./routes/signup");
const leavesRoute = require("./routes/leavesRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const commonRoutes = require("./routes/commonRoutes");
const adminRoutes = require("./routes/adminRoutes");

const authenticate = require("./middlewares/auth");
const authorize = require("./middlewares/adminAuthorize");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/user", authenticate, userRoutes);
app.use("/attendance", authenticate, attendanceRoutes);
app.use("/report", authenticate, reportRoutes);
app.use("/organization", authenticate, organizationRoutes);
app.use("/leave", authenticate, leavesRoute);
app.use("/login", loginRoute);
app.use("/signup", signupRoute);
app.use("/password", passwordRoutes);
app.use(commonRoutes);
app.use("/admin", [authenticate, authorize], adminRoutes);
app.use("/doc", express.static(path.join(__dirname, "../doc")));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on ${port}`));
