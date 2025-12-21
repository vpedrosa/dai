// ./model/Producto.js
import mongoose from "mongoose";

const productoSchema = new mongoose.Schema({
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
  precioRebajado: {
    type: Number,
    default: 0,
  },
});

const Producto = mongoose.model("Producto", productoSchema);

export default Producto;
