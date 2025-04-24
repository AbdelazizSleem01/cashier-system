import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true }, // إضافة حقل رقم الفاتورة

  products: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export default Order;
