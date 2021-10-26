const mongoose = require("mongoose");
const { environment } = require("../config/config");
const { userSchema } = require("./schema/userSchema.ts");
const { attendanceSchema } = require("./schema/attendanceSchema.ts");
const { advanceSchema } = require("./schema/advanceSchema.ts");

const env = process.env.NODE_ENV || "development";

mongoose.connect(
  "mongodb+srv://paranoidbat:1MBsM%40dq@bma-cluster.taszz.mongodb.net/BMAdb?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

let db = mongoose.connection;
db.on("error", () => {
  console.error("Error while connecting to DB");
});

const Users = mongoose.model("Users", userSchema);
const Attendances = mongoose.model("Attendances", attendanceSchema);
const Advances = mongoose.model("Advances", advanceSchema);

export { Users, Attendances, Advances };
