import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema(
  {
    userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slug:           { type: String, required: true, unique: true, trim: true },
    shopName:       { type: String, required: true, trim: true },
    bio:            { type: String, default: 'Welcome to my shop!' },
    location:       { type: String, default: '' },
    currency:       { type: String, default: '$' },
    whatsappNumber: { type: String, default: '' },
    logo:           { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Shop', shopSchema);
