import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from './models/Room.js';
import User from './models/User.js';

dotenv.config({ path: './backend.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/securestay';

// Indore property data with variety
const indoreProperties = [
  {
    title: "Luxurious 2BHK Apartment near Vijay Nagar",
    description: "Spacious and well-furnished apartment perfect for students and working professionals. Located in the heart of Vijay Nagar with easy access to malls, restaurants, and public transport.",
    address: "Scheme 54, Vijay Nagar, Indore",
    pricePerMonth: 12000,
    roomType: "apartment",
    amenities: ["WiFi", "Parking", "Kitchen", "AC", "Furnished", "Security"],
    photoFolder: "1",
    size: { area: 900, bedrooms: 2, bathrooms: 2 },
    features: ["furnished", "modern", "balcony"],
    nearbyPlaces: ["DAVV University", "C21 Mall", "Metro Station"],
    rules: ["No smoking", "No pets", "Visitors allowed till 10 PM"]
  },
  {
    title: "Cozy Single Room in Palasia",
    description: "Perfect single room for students near IIM Indore. Clean, secure, and affordable with all basic amenities.",
    address: "Old Palasia, Indore",
    pricePerMonth: 6500,
    roomType: "single",
    amenities: ["WiFi", "Kitchen", "Laundry", "Security"],
    photoFolder: "2",
    size: { area: 200, bedrooms: 1, bathrooms: 1 },
    features: ["semi-furnished", "balcony"],
    nearbyPlaces: ["IIM Indore", "Treasure Island Mall", "Apollo Hospital"],
    rules: ["No smoking", "Keep common areas clean"]
  },
  {
    title: "Modern Studio near Vijay Nagar Square",
    description: "Fully furnished studio apartment with modern amenities. Perfect for working professionals and students.",
    address: "AB Road, Vijay Nagar, Indore",
    pricePerMonth: 9500,
    roomType: "studio",
    amenities: ["WiFi", "Parking", "AC", "Furnished", "Kitchen"],
    photoFolder: "3",
    size: { area: 400, bedrooms: 1, bathrooms: 1 },
    features: ["furnished", "modern", "luxury"],
    nearbyPlaces: ["Vijay Nagar Square", "Sapna Sangeeta Mall", "Railway Station"],
    rules: ["No smoking", "No parties", "Quiet hours after 11 PM"]
  },
  {
    title: "Spacious Shared Room near SGSITS",
    description: "Budget-friendly shared accommodation for students. Located near SGSITS college with good connectivity.",
    address: "Rau, Indore",
    pricePerMonth: 4500,
    roomType: "shared",
    amenities: ["WiFi", "Kitchen", "Laundry"],
    photoFolder: "4",
    size: { area: 250, bedrooms: 1, bathrooms: 1 },
    features: ["semi-furnished"],
    nearbyPlaces: ["SGSITS", "Smart City", "Bus Stand"],
    rules: ["No smoking", "Respect other tenants"]
  },
  {
    title: "Premium 3BHK House in Vijay Nagar",
    description: "Large independent house with garden, perfect for families or group of students. Peaceful neighborhood with modern amenities.",
    address: "Scheme 78, Vijay Nagar, Indore",
    pricePerMonth: 18000,
    roomType: "house",
    amenities: ["WiFi", "Parking", "Kitchen", "AC", "Furnished", "Gym", "Security"],
    photoFolder: "5",
    size: { area: 1500, bedrooms: 3, bathrooms: 3 },
    features: ["furnished", "garden", "modern", "luxury"],
    nearbyPlaces: ["Orbit Mall", "DAVV University", "Big Bazaar"],
    rules: ["No smoking inside", "Keep garden maintained", "Pets allowed"]
  },
  {
    title: "Budget Room near Prestige Institute",
    description: "Affordable single room for students pursuing courses at Prestige Institute. Clean and well-maintained.",
    address: "Aerodrome Road, Indore",
    pricePerMonth: 5500,
    roomType: "single",
    amenities: ["WiFi", "Kitchen", "Security"],
    photoFolder: "6",
    size: { area: 180, bedrooms: 1, bathrooms: 1 },
    features: ["semi-furnished"],
    nearbyPlaces: ["Prestige Institute", "Airport", "Saket Square"],
    rules: ["No smoking", "Maintain cleanliness"]
  },
  {
    title: "Elegant 2BHK near Brilliant Convention Centre",
    description: "Well-designed apartment with modern interiors. Perfect for working professionals and small families.",
    address: "MR 10, Indore",
    pricePerMonth: 11000,
    roomType: "apartment",
    amenities: ["WiFi", "Parking", "Kitchen", "AC", "Furnished"],
    photoFolder: "7",
    size: { area: 850, bedrooms: 2, bathrooms: 2 },
    features: ["furnished", "modern"],
    nearbyPlaces: ["Brilliant Convention", "Central Mall", "Star Square"],
    rules: ["No smoking", "No loud music after 10 PM"]
  },
  {
    title: "Comfortable Shared Room in Palasia",
    description: "Economical shared accommodation near commercial hub. Great for students on a budget.",
    address: "New Palasia, Indore",
    pricePerMonth: 4000,
    roomType: "shared",
    amenities: ["WiFi", "Kitchen", "Laundry"],
    photoFolder: "8",
    size: { area: 220, bedrooms: 1, bathrooms: 1 },
    features: ["semi-furnished"],
    nearbyPlaces: ["Treasure Island", "56 Dukan", "Metro Multiplex"],
    rules: ["Respect roommates", "No smoking"]
  },
  {
    title: "Stylish Studio Apartment in Scheme 54",
    description: "Contemporary studio with all modern amenities. Perfect for young professionals and students.",
    address: "Scheme 54, Indore",
    pricePerMonth: 8500,
    roomType: "studio",
    amenities: ["WiFi", "AC", "Kitchen", "Parking", "Furnished"],
    photoFolder: "9",
    size: { area: 350, bedrooms: 1, bathrooms: 1 },
    features: ["furnished", "modern"],
    nearbyPlaces: ["C21 Mall", "DAVV", "Phoenix Citadel"],
    rules: ["No pets", "No smoking"]
  },
  {
    title: "Spacious 2BHK near Devi Ahilya University",
    description: "Large apartment ideal for students. Walking distance to DAVV campus with all necessary amenities.",
    address: "Khandwa Road, Indore",
    pricePerMonth: 10500,
    roomType: "apartment",
    amenities: ["WiFi", "Parking", "Kitchen", "Furnished", "Security"],
    photoFolder: "10",
    size: { area: 800, bedrooms: 2, bathrooms: 2 },
    features: ["furnished", "balcony"],
    nearbyPlaces: ["DAVV University", "Meghdoot Garden", "Bus Stand"],
    rules: ["No smoking", "Visitors allowed till 9 PM"]
  },
  {
    title: "Affordable Single Room near Bombay Hospital",
    description: "Clean and secure single room accommodation near Bombay Hospital. Suitable for medical students and interns.",
    address: "Vijay Nagar, Indore",
    pricePerMonth: 6000,
    roomType: "single",
    amenities: ["WiFi", "Kitchen", "Security", "Laundry"],
    photoFolder: "11",
    size: { area: 190, bedrooms: 1, bathrooms: 1 },
    features: ["semi-furnished"],
    nearbyPlaces: ["Bombay Hospital", "Phoenix Mall", "MGM Medical College"],
    rules: ["Maintain hygiene", "No smoking"]
  },
  {
    title: "Modern 3BHK House in Scheme 78",
    description: "Beautiful independent house with all modern amenities. Perfect for families or group of working professionals.",
    address: "Scheme 78, Vijay Nagar, Indore",
    pricePerMonth: 19000,
    roomType: "house",
    amenities: ["WiFi", "Parking", "Kitchen", "AC", "Furnished", "Pool", "Security"],
    photoFolder: "12",
    size: { area: 1600, bedrooms: 3, bathrooms: 3 },
    features: ["furnished", "luxury", "garden", "modern"],
    nearbyPlaces: ["Orbit Mall", "DB City", "Radisson Blu"],
    rules: ["No smoking inside", "Pets allowed with deposit"]
  },
  {
    title: "Cozy Room near IIM Indore",
    description: "Perfect for MBA students. Walking distance to IIM Indore campus with peaceful environment.",
    address: "Rau-Pithampur Road, Indore",
    pricePerMonth: 7000,
    roomType: "single",
    amenities: ["WiFi", "Kitchen", "Laundry", "Security"],
    photoFolder: "13",
    size: { area: 200, bedrooms: 1, bathrooms: 1 },
    features: ["semi-furnished", "balcony"],
    nearbyPlaces: ["IIM Indore", "Rau Market", "Smart City"],
    rules: ["Study-friendly environment", "No loud noise"]
  },
  {
    title: "Premium Studio near Treasure Island",
    description: "Luxurious studio apartment with premium fittings. Ideal for working professionals.",
    address: "MG Road, Indore",
    pricePerMonth: 10000,
    roomType: "studio",
    amenities: ["WiFi", "AC", "Kitchen", "Parking", "Furnished", "Gym"],
    photoFolder: "14",
    size: { area: 450, bedrooms: 1, bathrooms: 1 },
    features: ["furnished", "luxury", "modern"],
    nearbyPlaces: ["Treasure Island Mall", "Holkar Stadium", "Sayaji Hotel"],
    rules: ["No smoking", "No pets"]
  },
  {
    title: "Budget Shared Accommodation near SVVV",
    description: "Economical shared room perfect for students of SVVV University. Safe and clean environment.",
    address: "Gram Baroli, Indore",
    pricePerMonth: 3500,
    roomType: "shared",
    amenities: ["WiFi", "Kitchen", "Security"],
    photoFolder: "15",
    size: { area: 200, bedrooms: 1, bathrooms: 1 },
    features: ["semi-furnished"],
    nearbyPlaces: ["SVVV University", "Super Corridor", "IT Park"],
    rules: ["Respect others", "No smoking"]
  },
  {
    title: "Elegant 2BHK Apartment in Bicholi Mardana",
    description: "Well-maintained apartment with modern amenities. Great connectivity to IT companies and educational institutions.",
    address: "Bicholi Mardana, Indore",
    pricePerMonth: 9000,
    roomType: "apartment",
    amenities: ["WiFi", "Parking", "Kitchen", "Furnished", "Security"],
    photoFolder: "16",
    size: { area: 750, bedrooms: 2, bathrooms: 2 },
    features: ["furnished", "modern"],
    nearbyPlaces: ["IT Park", "Infosys", "Tech Mahindra"],
    rules: ["No smoking", "Maintain cleanliness"]
  },
  {
    title: "Spacious Room near Central Mall",
    description: "Large single room in prime location. Perfect for students and working professionals.",
    address: "RNT Marg, Indore",
    pricePerMonth: 7500,
    roomType: "single",
    amenities: ["WiFi", "Kitchen", "AC", "Parking", "Security"],
    photoFolder: "17",
    size: { area: 220, bedrooms: 1, bathrooms: 1 },
    features: ["furnished", "balcony"],
    nearbyPlaces: ["Central Mall", "Sarafa Bazaar", "Rajwada"],
    rules: ["No smoking", "Visitors allowed till 10 PM"]
  },
  {
    title: "Modern Studio near Sapna Sangeeta",
    description: "Contemporary studio apartment with all amenities. Excellent location with easy access to markets and transport.",
    address: "AB Road, Indore",
    pricePerMonth: 8000,
    roomType: "studio",
    amenities: ["WiFi", "AC", "Kitchen", "Furnished", "Parking"],
    photoFolder: "18",
    size: { area: 380, bedrooms: 1, bathrooms: 1 },
    features: ["furnished", "modern"],
    nearbyPlaces: ["Sapna Sangeeta", "Railway Station", "City Center"],
    rules: ["No pets", "No smoking"]
  },
  {
    title: "Family House near Chhappan Dukan",
    description: "Beautiful 3BHK house in posh locality. Perfect for families or group of professionals.",
    address: "New Palasia, Indore",
    pricePerMonth: 16000,
    roomType: "house",
    amenities: ["WiFi", "Parking", "Kitchen", "AC", "Furnished", "Security"],
    photoFolder: "19",
    size: { area: 1400, bedrooms: 3, bathrooms: 2 },
    features: ["furnished", "garden", "modern"],
    nearbyPlaces: ["Chhappan Dukan", "Treasure Island", "IIM Indore"],
    rules: ["No smoking inside", "Maintain garden"]
  }
];

// Helper function to get all images from a folder
// Using actual folder structure from backend/photo
function getImagesFromFolder(folderNumber) {
  const baseUrl = 'http://localhost:5000/photo';
  const basePath = `${baseUrl}/${folderNumber}`;
  
  // Actual image files from each folder
  const folderImages = {
    '1': [
      '643989885O-1757256578729.jpg',
      '643989897O-1757256578755.jpg',
      '643989899O-1757256578729.jpg',
      '643989901O-1757256578757.jpg',
      '643989929O-1757256578802.jpg',
      '643989941O-1757256580167.jpg',
      '643989961O-1757256580096.jpg'
    ],
    '2': [
      '639008289O-1756196191025.jpg',
      '639008299O-1756196191074.jpg',
      '639008301O-1756196192652.jpg'
    ],
    '3': [
      '653826011O-1759088479301.jpg',
      '653826013O-1759088479243.jpg',
      '653826015O-1759088479274.jpg'
    ],
    '4': [
      '647158349O-1757866830002.jpg',
      '647158363O-1757866829991.jpg',
      '647158379O-1757866829887.jpg'
    ],
    '5': [
      '654964837O-1759311893957.jpg'
    ],
    '6': [
      '650969553O-1758542665325.jpg',
      '650969577O-1758542665343.jpg',
      '650972167O-1758542849756.jpg'
    ],
    '7': [
      '651101757O-1758570104540.jpg',
      '651101765O-1758570104586.jpg'
    ],
    '8': [
      '651800597O-1758705607414.jpg',
      '651800605O-1758705607611.jpg',
      '651800621O-1758705608946.jpg',
      '651800625O-1758705613374.jpg'
    ],
    '9': [
      '651560449O-1758652945695.jpg',
      '651560467O-1758652945784.jpg',
      '651560499O-1758652945917.jpg',
      '651560625O-1758652989316.jpg'
    ],
    '10': [
      '651562219O-1758653610523.jpg',
      '651562221O-1758653610715.jpg',
      '651562239O-1758653635268.jpg',
      '651562241O-1758653634750.jpg',
      '651562245O-1758653635451.jpg',
      '651562251O-1758653635489.jpg'
    ],
    '11': [
      '650454159O-1758442179152.jpg',
      '650454609O-1758442246334.jpg',
      '650454819O-1758442266159.jpg',
      '650455467O-1758442364729.jpg'
    ],
    '12': [
      '654824365O-1759298058488.jpg',
      '654824479O-1759298074855.jpg',
      '654824883O-1759298110551.jpg',
      '654824967O-1759298127506.jpg',
      '654825219O-1759298144504.jpg'
    ],
    '13': [
      '636713691O-1755781738819.jpg',
      '636713733O-1755781743681.jpg',
      '636713753O-1755781743499.jpg',
      '636713769O-1755781741999.jpg',
      '636717599O-1755782155179.jpg'
    ],
    '14': [
      '630952945O-1754822231028.jpg',
      '630952947O-1754822235175.jpg',
      '630952949O-1754822232497.jpg'
    ],
    '15': [
      '652730755O-1758873565619.jpg',
      '652730759O-1758873565885.jpg',
      '652730765O-1758873565841.jpg',
      '653602191O-1759043838745.jpg'
    ],
    '16': [
      '652055623O-1758735546746.jpg',
      '652055627O-1758735546777.jpg',
      '652055629O-1758735546871.jpg',
      '652055633O-1758735546861.jpg'
    ],
    '17': [
      '651955113O-1758722109319.jpg',
      '651955119O-1758722141450.jpg',
      '651955121O-1758722123001.jpg',
      'fmhf1sbi.jpg'
    ],
    '18': [
      '581937279O-1755656416013.jpg',
      '581937335O-1755658627110.jpg',
      '581937659O-1755656382155.jpg',
      '581937827O-1755655258798.jpg',
      '581937993O-1755659909700.jpg'
    ],
    '19': [
      '650458901O-1758442860261.jpg',
      '650458915O-1758442861170.jpg',
      '650458923O-1758442858969.jpg'
    ],
    '20': [
      '654964837O-1759311893957.jpg'
    ]
  };
  
  // For folders 2-9 that weren't fully listed, use generic pattern
  if (!folderImages[folderNumber]) {
    return [`${basePath}/image1.jpg`, `${basePath}/image2.jpg`, `${basePath}/image3.jpg`];
  }
  
  const files = folderImages[folderNumber];
  return files.map(file => `${basePath}/${file}`);
}

async function seedIndoreProperties() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a landlord user or create one
    let landlord = await User.findOne({ role: 'landlord' });
    
    if (!landlord) {
      console.log('No landlord found, creating default landlord...');
      landlord = await User.create({
        username: 'indore_landlord',
        name: 'Indore Properties Owner',
        email: 'landlord.indore@securestay.com',
        password: 'landlord123', // This will be hashed automatically by the pre-save hook
        role: 'landlord',
        phone: '+91 9876543210',
        verified: true
      });
      console.log('Default landlord created');
    }

    console.log(`Using landlord: ${landlord.name} (${landlord._id})`);
    
    // Delete existing Indore properties (optional - comment out if you want to keep existing)
    // await Room.deleteMany({ 'location.city': 'Indore' });
    // console.log('Cleared existing Indore properties');

    console.log(`Creating ${indoreProperties.length} properties in Indore...`);

    // Helper function to calculate secure score
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

    for (const propertyData of indoreProperties) {
      const images = getImagesFromFolder(propertyData.photoFolder);
      
      const property = new Room({
        title: propertyData.title,
        description: propertyData.description,
        address: propertyData.address,
        pricePerMonth: propertyData.pricePerMonth,
        images: images,
        landlord: landlord._id,
        available: true,
        roomType: propertyData.roomType,
        amenities: propertyData.amenities,
        location: {
          city: 'Indore',
          state: 'Madhya Pradesh',
          pincode: '452001'
        },
        size: propertyData.size,
        features: propertyData.features,
        nearbyPlaces: propertyData.nearbyPlaces,
        rules: propertyData.rules,
        rating: Math.floor(Math.random() * 2) + 4, // Random rating between 4-5
        reviewCount: Math.floor(Math.random() * 20) + 5, // Random reviews 5-24
        contact: {
          phone: landlord.phone,
          email: landlord.email
        },
        secureSphere: calculateSecureScore(propertyData.amenities, { city: 'Indore' }, propertyData.features)
      });

      await property.save();
      console.log(`✓ Created: ${property.title}`);
    }

    console.log('\n✅ Successfully created 20 properties in Indore!');
    console.log('\nSummary:');
    console.log(`- Location: Indore, Madhya Pradesh`);
    console.log(`- Total Properties: ${indoreProperties.length}`);
    console.log(`- Price Range: ₹3,500 - ₹19,000 per month`);
    console.log(`- Room Types: Single, Shared, Studio, Apartment, House`);

  } catch (error) {
    console.error('❌ Error seeding properties:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seed function
seedIndoreProperties();

