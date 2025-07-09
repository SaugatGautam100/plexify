import mongoose, { Schema, models } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    images: [{
      type: String,
      required: true,
    }],
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
    },
    brand: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    features: [{
      type: String,
    }],
    specifications: {
      type: Map,
      of: String,
    },
    tags: [{
      type: String,
    }],
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerName: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for better query performance
productSchema.index({ category: 1, inStock: 1 });
productSchema.index({ sellerId: 1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

// Virtual for converting _id to id
productSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Product = models.Product || mongoose.model("Product", productSchema);
export default Product;