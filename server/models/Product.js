import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    shopId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    name:        { type: String, required: true, trim: true },
    price:       { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    image:       { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
