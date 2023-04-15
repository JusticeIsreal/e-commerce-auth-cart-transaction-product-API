const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchemaFunc = new Schema({
  user: [
    {
      type: Schema.Types.ObjectId,
      ref: "userSchema",
      required: true,
    },
  ],
  product: [
    {
      productname: String,
      productclass: String,
      productcategory: String,
      productdescription: String,
      productnumber: String,
      image: Array,
      productoldprice: Number,
      productprice: Number,
      quantity: Number,
      total: Number,
      clientnote: String,
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("cartSchema", cartSchemaFunc);
