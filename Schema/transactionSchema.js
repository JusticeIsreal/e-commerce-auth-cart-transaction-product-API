const mongoose = require("mongoose");

transactionSchemaFunc = mongoose.Schema({
  adminnote: {
    type: String,
    // required: true,
  },
  paystackRef: {
    type: String,
    // required: true,
  },
  transactionstatus: {
    type: String,
    default: "Pending",
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
      clientnote: String,
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
    default: "Processing",
  },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("transactionSchema", transactionSchemaFunc);
