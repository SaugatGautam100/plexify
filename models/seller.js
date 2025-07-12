import mongoose, { Schema, models } from "mongoose";

const sellerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    businessAddress: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: function() {
        // Password is required only for non-social logins
        return !this.socialLogin;
      },
    },
    avatar: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalSales: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    socialLogin: {
      type: Boolean,
      default: false,
    },
    businessType: {
      type: String,
      enum: ['individual', 'company', 'partnership'],
      default: 'individual',
    },
    taxId: {
      type: String,
      trim: true,
    },
    bankDetails: {
      accountNumber: String,
      routingNumber: String,
      accountHolderName: String,
      bankName: String,
    },
    orderHistory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }],
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    reviews: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    lastLogin: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    verificationDocuments: [{
      type: {
        type: String,
        enum: ['business_license', 'tax_certificate', 'identity_proof'],
      },
      url: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    storeSettings: {
      storeName: String,
      storeDescription: String,
      storePolicy: String,
      returnPolicy: String,
      shippingPolicy: String,
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for better query performance
sellerSchema.index({ email: 1 });
sellerSchema.index({ businessName: 1 });
sellerSchema.index({ isActive: 1, isVerified: 1 });
sellerSchema.index({ rating: -1 });

// Virtual for converting _id to id
sellerSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Virtual for average rating calculation
sellerSchema.virtual('averageRating').get(function() {
  if (this.reviews && this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / this.reviews.length).toFixed(1);
  }
  return 0;
});

// Ensure virtual fields are serialized
sellerSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Pre-save middleware to update login stats and rating
sellerSchema.pre('save', function(next) {
  if (this.isModified('lastLogin')) {
    this.loginCount += 1;
  }
  
  // Update rating based on reviews
  if (this.reviews && this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating = (sum / this.reviews.length);
  }
  
  next();
});

const Seller = models.Seller || mongoose.model("Seller", sellerSchema);
export default Seller;