const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchemaFunc = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "adminAccessSchema",
    required: true,
  },
  products: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CartSchema", cartSchemaFunc);
