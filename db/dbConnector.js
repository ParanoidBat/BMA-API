const mongoose = require("mongoose");
const { environment } = require("../config/config");
const { friendSchema } = require("./schema/friendSchema.ts");
const { seriesSchema } = require("./schema/seriesSchema.ts");
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

const Friends = mongoose.model("Friends", friendSchema);
const Series = mongoose.model("Series", seriesSchema);

export { Friends, Series };
