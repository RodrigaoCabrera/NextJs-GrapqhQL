const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  exist: {
    type: Number,
    require: true,
  },
  price: {
    type: Number,
    required: true,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
});
module.exports = mongoose.model("Product", productSchema);
