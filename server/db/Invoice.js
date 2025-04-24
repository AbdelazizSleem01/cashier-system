import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },

  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      price: Number,
    },
  ],
  total: Number,
  createdAt: { type: Date, default: Date.now },
});

export const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
