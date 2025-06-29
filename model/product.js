import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Add this if you want to enforce title
    trim: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true, // Recommended to make it required
    trim: true,
  },
  image: {
    type: String,
    required: true, // Recommended to make image required
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
