import mongoose from 'mongoose';
import Room from './models/Room.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleProperties = [
  {
    title: "Spacious 2BHK near IIT Delhi Campus",
    description: "Beautiful fully furnished 2BHK apartment with modern amenities. Located just 2km from IIT Delhi campus. Perfect for students and working professionals.",
    address: "Hauz Khas, South Delhi",
    pricePerMonth: 25000,
    images: ["https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500"],
    roomType: "apartment",
    amenities: ["WiFi", "AC", "Furnished", "Kitchen", "Parking", "Security"],
    location: {
      city: "Delhi",
      state: "Delhi",
      pincode: "110016",
      coordinates: { lat: 28.5456, lng: 77.1923 }
    },
    size: {
      area: 950,
      bedrooms: 2,
      bathrooms: 2
    },
    features: ["furnished", "modern", "balcony"],
    nearbyPlaces: ["IIT Delhi", "Metro Station", "Shopping Mall", "Hauz Khas Market"],
    rating: 4.5,
    reviewCount: 23
  },
  {
    title: "Cozy Single Room in Student PG",
    description: "Comfortable single room in a well-maintained PG. Includes all meals, WiFi, and housekeeping. Suitable for students and working professionals.",
    address: "Vijay Nagar, Delhi",
    pricePerMonth: 8000,
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500"],
    roomType: "single",
    amenities: ["WiFi", "AC", "Furnished", "Laundry", "Security"],
    location: {
      city: "Delhi",
      state: "Delhi",
      pincode: "110009",
      coordinates: { lat: 28.6445, lng: 77.2167 }
    },
    size: {
      area: 120,
      bedrooms: 1,
      bathrooms: 1
    },
    features: ["furnished", "modern"],
    nearbyPlaces: ["Delhi University", "Rajouri Garden", "Metro Station"],
    rating: 4.2,
    reviewCount: 15
  },
  {
    title: "Budget Shared Room for Students",
    description: "Affordable shared accommodation perfect for students. Includes basic furniture and essential amenities. Close to college and market areas.",
    address: "Kamla Nagar, Delhi",
    pricePerMonth: 5000,
    images: ["https://images.unsplash.com/photo-1555854871-d5c0c35bca2f?w=500"],
    roomType: "shared",
    amenities: ["WiFi", "Furnished", "Laundry"],
    location: {
      city: "Delhi",
      state: "Delhi",
      pincode: "110007",
      coordinates: { lat: 28.6843, lng: 77.2105 }
    },
    size: {
      area: 150,
      bedrooms: 1,
      bathrooms: 1
    },
    features: ["furnished"],
    nearbyPlaces: ["Delhi University", "Kamla Nagar Market", "Metro Station"],
    rating: 3.9,
    reviewCount: 12
  },
  {
    title: "Modern Studio Apartment in CP",
    description: "Compact and stylish studio apartment with smart furniture. Perfect for singles or couples. All modern amenities included.",
    address: "Connaught Place, Delhi",
    pricePerMonth: 18000,
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500"],
    roomType: "studio",
    amenities: ["WiFi", "AC", "Furnished", "Kitchen", "Security"],
    location: {
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      coordinates: { lat: 28.6328, lng: 77.2197 }
    },
    size: {
      area: 400,
      bedrooms: 1,
      bathrooms: 1
    },
    features: ["modern", "furnished"],
    nearbyPlaces: ["Connaught Place", "Metro Station", "Shopping Areas"],
    rating: 4.3,
    reviewCount: 18
  },
  {
    title: "PG for Working Women - Saket",
    description: "Safe and secure PG accommodation exclusively for working women. Includes meals, WiFi, and all essential amenities.",
    address: "Saket, Delhi",
    pricePerMonth: 12000,
    images: ["https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=500"],
    roomType: "single",
    amenities: ["WiFi", "AC", "Furnished", "Laundry", "Security"],
    location: {
      city: "Delhi",
      state: "Delhi",
      pincode: "110017",
      coordinates: { lat: 28.5276, lng: 77.2183 }
    },
    size: {
      area: 140,
      bedrooms: 1,
      bathrooms: 1
    },
    features: ["furnished", "modern"],
    nearbyPlaces: ["Saket Metro", "Select Citywalk", "Hospital"],
    rating: 4.4,
    reviewCount: 27
  },
  {
    title: "1BHK near Mumbai University",
    description: "Compact 1BHK apartment located close to Mumbai University. Ideal for students and young professionals.",
    address: "Santacruz West, Mumbai",
    pricePerMonth: 22000,
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500"],
    roomType: "apartment",
    amenities: ["WiFi", "Furnished", "Kitchen", "Security"],
    location: {
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400054",
      coordinates: { lat: 19.0820, lng: 72.8354 }
    },
    size: {
      area: 450,
      bedrooms: 1,
      bathrooms: 1
    },
    features: ["furnished", "modern"],
    nearbyPlaces: ["Mumbai University", "Station", "Shopping Areas"],
    rating: 4.1,
    reviewCount: 14
  },
  {
    title: "Luxury Penthouse with Balcony",
    description: "Stunning penthouse with private balcony and city views. Premium amenities and luxurious interiors.",
    address: "Worli, Mumbai",
    pricePerMonth: 85000,
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500"],
    roomType: "apartment",
    amenities: ["WiFi", "AC", "Furnished", "Gym", "Pool", "Parking", "Security"],
    location: {
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400018",
      coordinates: { lat: 19.0176, lng: 72.8212 }
    },
    size: {
      area: 2200,
      bedrooms: 3,
      bathrooms: 3
    },
    features: ["luxury", "furnished", "modern", "balcony"],
    nearbyPlaces: ["Sea Face", "Business District", "Fine Dining"],
    rating: 4.9,
    reviewCount: 8
  },
  {
    title: "Student Hostel near Campus",
    description: "Well-maintained student hostel with study rooms and common areas. Perfect for college students.",
    address: "Kolkata University Area",
    pricePerMonth: 6000,
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500"],
    roomType: "shared",
    amenities: ["WiFi", "Furnished", "Laundry", "Security"],
    location: {
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700073",
      coordinates: { lat: 22.5726, lng: 88.3639 }
    },
    size: {
      area: 100,
      bedrooms: 1,
      bathrooms: 1
    },
    features: ["furnished"],
    nearbyPlaces: ["University", "Library", "Market"],
    rating: 4.0,
    reviewCount: 21
  },
  {
    title: "2BHK Flat in Bangalore Tech Park",
    description: "Modern 2BHK flat located near tech parks. Perfect for IT professionals with all modern amenities.",
    address: "Whitefield, Bangalore",
    pricePerMonth: 28000,
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"],
    roomType: "apartment",
    amenities: ["WiFi", "AC", "Furnished", "Gym", "Parking"],
    location: {
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560066",
      coordinates: { lat: 12.9716, lng: 77.5946 }
    },
    size: {
      area: 1100,
      bedrooms: 2,
      bathrooms: 2
    },
    features: ["modern", "furnished", "balcony"],
    nearbyPlaces: ["Tech Park", "Shopping Mall", "Metro Station"],
    rating: 4.6,
    reviewCount: 19
  },
  {
    title: "Economical Single Room in PG",
    description: "Budget-friendly single room with basic amenities. Ideal for students on tight budget.",
    address: "Rohini, Delhi",
    pricePerMonth: 7000,
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"],
    roomType: "single",
    amenities: ["WiFi", "Furnished", "Laundry"],
    location: {
      city: "Delhi",
      state: "Delhi",
      pincode: "110085",
      coordinates: { lat: 28.7392, lng: 77.0678 }
    },
    size: {
      area: 110,
      bedrooms: 1,
      bathrooms: 1
    },
    features: ["furnished"],
    nearbyPlaces: ["Metro Station", "Market", "College"],
    rating: 3.8,
    reviewCount: 11
  },
  {
    title: "3BHK Independent House with Garden",
    description: "Spacious independent house with garden. Perfect for families or group of students.",
    address: "Pune University Road",
    pricePerMonth: 35000,
    images: ["https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=500"],
    roomType: "house",
    amenities: ["Parking", "Security", "Furnished"],
    location: {
      city: "Pune",
      state: "Maharashtra",
      pincode: "411007",
      coordinates: { lat: 18.5204, lng: 73.8567 }
    },
    size: {
      area: 2000,
      bedrooms: 3,
      bathrooms: 3
    },
    features: ["garden", "furnished", "modern"],
    nearbyPlaces: ["Pune University", "Shopping Complex", "Hospital"],
    rating: 4.7,
    reviewCount: 9
  },
  {
    title: "Premium Single Room with AC",
    description: "Luxurious single room with premium amenities. Includes housekeeping and meal services.",
    address: "South Extension, Delhi",
    pricePerMonth: 15000,
    images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500"],
    roomType: "single",
    amenities: ["WiFi", "AC", "Furnished", "Laundry", "Security", "TV"],
    location: {
      city: "Delhi",
      state: "Delhi",
      pincode: "110049",
      coordinates: { lat: 28.5670, lng: 77.2161 }
    },
    size: {
      area: 180,
      bedrooms: 1,
      bathrooms: 1
    },
    features: ["luxury", "furnished", "modern"],
    nearbyPlaces: ["South Extension Market", "Metro Station", "Malls"],
    rating: 4.5,
    reviewCount: 16
  },
  {
    title: "2BHK near Hyderabad IT Corridor",
    description: "Modern 2BHK apartment in gated society. Close to IT companies and tech parks.",
    address: "Gachibowli, Hyderabad",
    pricePerMonth: 24000,
    images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500"],
    roomType: "apartment",
    amenities: ["WiFi", "AC", "Furnished", "Gym", "Pool", "Parking"],
    location: {
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500032",
      coordinates: { lat: 17.4401, lng: 78.3489 }
    },
    size: {
      area: 1050,
      bedrooms: 2,
      bathrooms: 2
    },
    features: ["modern", "furnished", "balcony"],
    nearbyPlaces: ["IT Park", "Shopping Mall", "Restaurants"],
    rating: 4.4,
    reviewCount: 22
  },
  {
    title: "Shared Room for Female Students",
    description: "Comfortable shared accommodation exclusively for female students. Safe and secure environment.",
    address: "Lajpat Nagar, Delhi",
    pricePerMonth: 4500,
    images: ["https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=500"],
    roomType: "shared",
    amenities: ["WiFi", "Furnished", "Laundry", "Security"],
    location: {
      city: "Delhi",
      state: "Delhi",
      pincode: "110024",
      coordinates: { lat: 28.5673, lng: 77.2433 }
    },
    size: {
      area: 130,
      bedrooms: 1,
      bathrooms: 1
    },
    features: ["furnished"],
    nearbyPlaces: ["College", "Market", "Metro Station"],
    rating: 4.2,
    reviewCount: 13
  },
  {
    title: "1BHK Studio with Sea View",
    description: "Compact studio apartment with sea view. Perfect for students and young professionals.",
    address: "Besant Nagar, Chennai",
    pricePerMonth: 16000,
    images: ["https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=500"],
    roomType: "studio",
    amenities: ["WiFi", "AC", "Furnished", "Kitchen"],
    location: {
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600090",
      coordinates: { lat: 13.0051, lng: 80.2662 }
    },
    size: {
      area: 380,
      bedrooms: 1,
      bathrooms: 1
    },
    features: ["sea-view", "furnished", "modern"],
    nearbyPlaces: ["Beach", "College", "Shopping Area"],
    rating: 4.3,
    reviewCount: 17
  },
  {
    title: "3BHK Luxury Apartment with Sea View",
    description: "Spacious 3BHK with modern interiors and premium amenities. Ideal for families.",
    address: "Juhu, Mumbai",
    pricePerMonth: 52000,
    images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500"],
    roomType: "apartment",
    amenities: ["WiFi", "AC", "Furnished", "Gym", "Pool", "Parking", "Security"],
    location: {
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400049",
      coordinates: { lat: 19.1077, lng: 72.8263 }
    },
    size: {
      area: 1650,
      bedrooms: 3,
      bathrooms: 3
    },
    features: ["luxury", "furnished", "modern", "sea-view"],
    nearbyPlaces: ["Juhu Beach", "Shopping", "Restaurants"],
    rating: 4.8,
    reviewCount: 25
  },
  {
    title: "Budget PG near College",
    description: "Economical PG accommodation with basic facilities. Perfect for college students.",
    address: "Malviya Nagar, Delhi",
    pricePerMonth: 5500,
    images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500"],
    roomType: "shared",
    amenities: ["WiFi", "Furnished", "Laundry"],
    location: {
      city: "Delhi",
      state: "Delhi",
      pincode: "110017",
      coordinates: { lat: 28.5323, lng: 77.2157 }
    },
    size: {
      area: 100,
      bedrooms: 1,
      bathrooms: 1
    },
    features: ["furnished"],
    nearbyPlaces: ["College", "Market", "Metro Station"],
    rating: 3.7,
    reviewCount: 14
  },
  {
    title: "2BHK near Ahmedabad University",
    description: "Comfortable 2BHK apartment located near university. Suitable for students and faculty.",
    address: "Navrangpura, Ahmedabad",
    pricePerMonth: 19000,
    images: ["https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=500"],
    roomType: "apartment",
    amenities: ["WiFi", "Furnished", "Kitchen", "Parking"],
    location: {
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380009",
      coordinates: { lat: 23.0225, lng: 72.5714 }
    },
    size: {
      area: 900,
      bedrooms: 2,
      bathrooms: 2
    },
    features: ["furnished", "modern"],
    nearbyPlaces: ["University", "Shopping", "Hospital"],
    rating: 4.1,
    reviewCount: 10
  },
  {
    title: "Premium Shared Accommodation",
    description: "High-end shared accommodation with premium amenities. Perfect for working professionals.",
    address: "Koramangala, Bangalore",
    pricePerMonth: 12000,
    images: ["https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=500"],
    roomType: "shared",
    amenities: ["WiFi", "AC", "Furnished", "Gym", "Laundry", "Security"],
    location: {
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560034",
      coordinates: { lat: 12.9279, lng: 77.6271 }
    },
    size: {
      area: 160,
      bedrooms: 1,
      bathrooms: 1
    },
    features: ["luxury", "furnished", "modern"],
    nearbyPlaces: ["Tech Parks", "Shopping", "Restaurants"],
    rating: 4.6,
    reviewCount: 20
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/securestay');
    console.log('Connected to MongoDB');

    // Clear existing rooms
    await Room.deleteMany({});
    console.log('Cleared existing rooms');

    // Create a sample landlord ID
    const sampleLandlordId = new mongoose.Types.ObjectId();

    // Helper function to calculate secure score (same logic as in roomController
    const calculateSecureScore = (amenities = [], location = {}, features = []) => {
      let connectivity = 50;
      let crimeRecord = 30;
      let services = 40;

      const connectivityAmenities = ['WiFi', 'Parking', 'TV'];
      const connectivityCount = amenities.filter(amenity => 
        connectivityAmenities.includes(amenity)
      ).length;
      connectivity += connectivityCount * 15;

      const serviceAmenities = ['Kitchen', 'Laundry', 'AC', 'Hot Water', 'Maintenance', 'Security'];
      const serviceCount = amenities.filter(amenity => 
        serviceAmenities.includes(amenity)
      ).length;
      services += serviceCount * 10;

      if (features.includes('modern')) {
        connectivity += 10;
        services += 10;
      }
      if (features.includes('luxury')) {
        connectivity += 15;
        services += 15;
      }
      if (features.includes('security')) {
        crimeRecord -= 10;
        services += 20;
      }

      const city = location.city?.toLowerCase() || '';
      if (city.includes('delhi') || city.includes('mumbai') || city.includes('bangalore')) {
        connectivity += 10;
        crimeRecord += 5;
      } else if (city.includes('indore') || city.includes('pune') || city.includes('hyderabad')) {
        connectivity += 5;
        crimeRecord -= 5;
      }

      connectivity = Math.min(100, Math.max(0, connectivity));
      crimeRecord = Math.min(100, Math.max(0, crimeRecord));
      services = Math.min(100, Math.max(0, services));

      const overall = Math.round((connectivity + (100 - crimeRecord) + services) / 3);

      return {
        connectivity: Math.round(connectivity),
        crimeRecord: Math.round(crimeRecord),
        services: Math.round(services),
        overall: Math.round(overall)
      };
    };

    // Add landlord ID, contact, and secure score to all properties
    const propertiesWithLandlord = sampleProperties.map(property => ({
      ...property,
      landlord: sampleLandlordId,
      available: true,
      contact: {
        phone: "+91-9876543210",
        email: "landlord@securestay.com"
      },
      rules: ["No smoking", "No pets", "No loud music after 10 PM"],
      secureSphere: calculateSecureScore(property.amenities, property.location, property.features)
    }));

    // Insert properties
    await Room.insertMany(propertiesWithLandlord);
    console.log('✅ Successfully seeded 20 properties into database');

    // Display summary
    const roomTypes = await Room.aggregate([
      { $group: { _id: '$roomType', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Property Summary:');
    roomTypes.forEach(rt => {
      console.log(`   ${rt._id}: ${rt.count} properties`);
    });

    const cities = await Room.aggregate([
      { $group: { _id: '$location.city', count: { $sum: 1 } } }
    ]);
    
    console.log('\n🏙️  Cities:');
    cities.forEach(city => {
      console.log(`   ${city._id}: ${city.count} properties`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();