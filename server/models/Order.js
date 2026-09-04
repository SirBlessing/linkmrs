import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name:      { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity:  { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    shopId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    items:         [lineItemSchema],
    total:         { type: Number, required: true },
    currency:      { type: String, default: '$' },
    customerName:  { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    note:          { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
