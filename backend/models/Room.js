import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  pricePerMonth: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String
  }],
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  roomType: {
    type: String,
    enum: ['single', 'shared', 'studio', 'apartment', 'house'],
    required: true
  },
  amenities: [{
    type: String,
    enum: ['WiFi', 'Parking', 'Kitchen', 'Laundry', 'AC', 'Furnished', 'Gym', 'Pool', 'Security', 'TV', 'Hot Water', 'Maintenance']
  }],
  location: {
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  secureSphere: {
    connectivity: { type: Number, default: 0, min: 0, max: 100 },
    crimeRecord: { type: Number, default: 0, min: 0, max: 100 },
    services: { type: Number, default: 0, min: 0, max: 100 },
    overall: { type: Number, default: 0, min: 0, max: 100 }
  },
  size: {
    area: {
      type: Number,
      required: true
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 1
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 1
    }
  },
  features: [{
    type: String,
    enum: ['furnished', 'semi-furnished', 'unfurnished', 'modern', 'luxury', 'garden', 'balcony', 'pet-friendly', 'smoke-free', 'sea-view', 'mountain-view']
  }],
  nearbyPlaces: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  contact: {
    phone: String,
    email: String
  },
  rules: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

roomSchema.index({ 
  title: 'text', 
  description: 'text', 
  address: 'text',
  'location.city': 'text'
});

roomSchema.index({ 'location.city': 1, pricePerMonth: 1 });
roomSchema.index({ roomType: 1, available: 1 });

export default mongoose.model('Room', roomSchema);