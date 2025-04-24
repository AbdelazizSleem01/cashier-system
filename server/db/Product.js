import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  barcode: { type: String, unique: true },
}, {
  timestamps: true
});

productSchema.index({ name: "text", description: "text" });

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
