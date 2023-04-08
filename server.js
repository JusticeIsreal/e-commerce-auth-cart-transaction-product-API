const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

app.use(bodyParser.json({ limit: "500000000mb" }));
app.use(bodyParser.urlencoded({ limit: "500000000mb", extended: true }));
// middleware
// app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// routes
const userAccess = require("./Route/userAuthRoute");
const transaction = require("./Route/transactionRoute");
app.use("/api/v1/userverification", userAccess);
app.use("/api/v1/transaction", transaction);

const connectDB = require("./Database/adminDB.js");
const connectAdminToDataBase = async () => {
  try {
    await connectDB(process.env.MONGODB_URL);
    app.listen(process.env.PORT, () => {
      console.log("app is listening on port 1234");
    });
  } catch (error) {
    console.log(error);
  }
};
connectAdminToDataBase();
