const mongoose = require("mongoose");

transactionSchemaFunc = mongoose.Schema({
  usernumber: {
    type: String,
    // required: true,
  },
  paystackRef: {
    type: String,
    // required: true,
  },
  transactionstatus: {
    type: String,
    // required: true,
  },
  deliveryaddress: {
    type: String,
    required: true,
  },
  product: [
    {
      productname: String,
      productprice: Number,
      quantity: Number,
      total: Number,
    },
  ],
  user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "adminAccessSchema",
      required: true,
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Open",
  },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("transactionSchema", transactionSchemaFunc);
