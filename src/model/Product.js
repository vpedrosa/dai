import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  text1: {
    type: String,
    required: true,
  },
  text2: {
    type: String,
    required: true,
  },
  priceText: {
    type: String,
    required: true,
  },
  priceEuros: {
    type: Number,
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
