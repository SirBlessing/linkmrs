import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema(
  {
    userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slug:           { type: String, required: true, unique: true, trim: true },
    shopName:       { type: String, required: true, trim: true },
    bio:            { type: String, default: 'Welcome to my shop!' },
    location:       { type: String, default: '' },
    currency:       { type: String, default: '₦' },
    whatsappNumber: { type: String, default: '' },
    logo:           { type: String, default: '' },

    plan:          { type: String, enum: ['free', 'premium'], default: 'free' },
    planExpiresAt: { type: Date,   default: null },
    productLimit:  { type: Number, default: 5 },   // free = 5, premium = 40
  },
  { timestamps: true }
);

shopSchema.virtual('isPremium').get(function () {
  return (
    this.plan === 'premium' &&
    this.planExpiresAt &&
    new Date(this.planExpiresAt) > new Date()
  );
});

shopSchema.set('toJSON',   { virtuals: true });
shopSchema.set('toObject', { virtuals: true });

export default mongoose.model('Shop', shopSchema);