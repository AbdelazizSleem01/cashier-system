// models/PurchaseInvoice.js
import mongoose from 'mongoose';

const PurchaseInvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  supplier: {
    name: { type: String, required: true },
    phone: { type: String },
    address: { type: String }
  },
  products: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  creatorName: { type: String, required: true },
  creatorId: { type: String, required: true },
  paymentMethod: { type: String, enum: ['نقدي', 'آجل', 'تحويل بنكي'], default: 'نقدي' },
  notes: { type: String },
  status: { type: String, enum: ['مسودة', 'مكتمل', 'ملغى'], default: 'مسودة' }
}, { timestamps: true });

const PurchaseInvoice = mongoose.models.PurchaseInvoice || mongoose.model('PurchaseInvoice', PurchaseInvoiceSchema);
export default PurchaseInvoice;