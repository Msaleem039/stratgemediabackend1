import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  button: {
    type: String,
    default: "BOOK NOW",
  },
  image: {
    type: String,
    required: false,
  },
  inclusions: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

const Product = mongoose.model("Product", productSchema);

export default Product;
