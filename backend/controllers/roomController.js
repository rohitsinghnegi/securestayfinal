import Room from '../models/Room.js';
import User from '../models/User.js';

// GET /api/rooms - Search and filter rooms
export const getRooms = async (req, res) => {
  try {
    const {
      search,
      minPrice,
      maxPrice,
      city,
      state,
      roomType,
      amenities,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { available: true };

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.pricePerMonth = {};
      if (minPrice) filter.pricePerMonth.$gte = parseInt(minPrice);
      if (maxPrice) filter.pricePerMonth.$lte = parseInt(maxPrice);
    }

    // Location filter
    if (city) {
      filter['location.city'] = new RegExp(city, 'i');
    }
    if (state) {
      filter['location.state'] = new RegExp(state, 'i');
    }

    // Room type filter
    if (roomType) {
      filter.roomType = roomType;
    }

    // Amenities filter
    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
      filter.amenities = { $in: amenitiesArray };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const rooms = await Room.find(filter)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Room.countDocuments(filter);

    res.json({
      success: true,
      data: rooms,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalResults: total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      },
      filters: {
        search,
        minPrice,
        maxPrice,
        city,
        state,
        roomType,
        amenities
      }
    });

  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rooms',
      details: error.message
    });
  }
};

// GET /api/rooms/:id - Get single room details with SecureSphere data
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('landlord', 'name email phone verified')
      .lean();

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    // Ensure secureSphere data exists with default values if not present
    if (!room.secureSphere) {
      room.secureSphere = {
        connectivity: 0,
        crimeRecord: 0,
        services: 0,
        overall: 0
      };
    }

    res.json(room);

  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch room details',
      details: error.message
    });
  }
};

// POST /api/rooms/search-by-photo - Photo-based search
export const searchByPhoto = async (req, res) => {
  try {
    // For now, return all available properties
    const rooms = await Room.find({ available: true })
      .limit(20)
      .lean();

    res.json({
      success: true,
      data: rooms,
      message: 'Photo search completed (demo mode)'
    });

  } catch (error) {
    console.error('Error in photo search:', error);
    res.status(500).json({
      success: false,
      error: 'Photo search failed',
      details: error.message
    });
  }
};

// Helper function to calculate automatic secure score
const calculateSecureScore = (amenities = [], location = {}, features = []) => {
  let connectivity = 50; // Base connectivity score
  let crimeRecord = 30; // Base crime record (lower is better)
  let services = 40; // Base services score

  // Calculate connectivity based on amenities
  const connectivityAmenities = ['WiFi', 'Parking', 'TV'];
  const connectivityCount = amenities.filter(amenity => 
    connectivityAmenities.includes(amenity)
  ).length;
  connectivity += connectivityCount * 15; // +15 for each connectivity amenity

  // Calculate services based on amenities
  const serviceAmenities = ['Kitchen', 'Laundry', 'AC', 'Hot Water', 'Maintenance', 'Security'];
  const serviceCount = amenities.filter(amenity => 
    serviceAmenities.includes(amenity)
  ).length;
  services += serviceCount * 10; // +10 for each service amenity

  // Adjust based on features
  if (features.includes('modern')) {
    connectivity += 10;
    services += 10;
  }
  if (features.includes('luxury')) {
    connectivity += 15;
    services += 15;
  }
  if (features.includes('security')) {
    crimeRecord -= 10; // Lower crime record score (better)
    services += 20;
  }

  // Adjust based on location (city-based adjustments)
  const city = location.city?.toLowerCase() || '';
  if (city.includes('delhi') || city.includes('mumbai') || city.includes('bangalore')) {
    connectivity += 10; // Major cities have better connectivity
    crimeRecord += 5; // But slightly higher crime
  } else if (city.includes('indore') || city.includes('pune') || city.includes('hyderabad')) {
    connectivity += 5;
    crimeRecord -= 5; // Tier-2 cities often safer
  }

  // Ensure scores are within bounds
  connectivity = Math.min(100, Math.max(0, connectivity));
  crimeRecord = Math.min(100, Math.max(0, crimeRecord));
  services = Math.min(100, Math.max(0, services));

  // Calculate overall score (crime record is inverted - lower is better)
  const overall = Math.round((connectivity + (100 - crimeRecord) + services) / 3);

  return {
    connectivity: Math.round(connectivity),
    crimeRecord: Math.round(crimeRecord),
    services: Math.round(services),
    overall: Math.round(overall)
  };
};

// POST /api/rooms - Create new room
export const createRoom = async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      pricePerMonth,
      images,
      roomType,
      amenities,
      location,
      size,
      features,
      nearbyPlaces,
      contact,
      rules,
      secureSphere
    } = req.body;

    // Check if user is landlord
    if (req.user.role !== 'landlord') {
      return res.status(403).json({
        success: false,
        error: 'Only landlords can create properties'
      });
    }

    // Calculate automatic secure score if not provided
    const calculatedSecureSphere = secureSphere || calculateSecureScore(amenities, location, features);

    const room = new Room({
      title,
      description,
      address,
      pricePerMonth,
      images,
      roomType,
      amenities,
      location,
      size,
      features,
      nearbyPlaces,
      contact,
      rules,
      secureSphere: calculatedSecureSphere,
      landlord: req.user.id
    });

    await room.save();

    res.status(201).json({
      success: true,
      data: room,
      message: 'Property listed successfully with automatic secure score'
    });

  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create property',
      details: error.message
    });
  }
};

// GET /api/rooms/cities/list - Get list of available cities
export const getCities = async (req, res) => {
  try {
    const cities = await Room.distinct('location.city', { available: true });
    res.json({
      success: true,
      data: cities.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cities'
    });
  }
};

// PUT /api/rooms/:id/securesphere - Update SecureSphere data (Landlord only)
export const updateSecureSphere = async (req, res) => {
  try {
    const { connectivity, crimeRecord, services } = req.body;
    
    // Calculate overall score (you can adjust this formula as needed)
    const overall = Math.round((connectivity + (100 - crimeRecord) + services) / 3);
    
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    // Check if user is the landlord of this property
    if (req.user.role !== 'landlord' || room.landlord.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only the property owner can update SecureSphere data'
      });
    }

    room.secureSphere = {
      connectivity: Math.max(0, Math.min(100, connectivity || 0)),
      crimeRecord: Math.max(0, Math.min(100, crimeRecord || 0)),
      services: Math.max(0, Math.min(100, services || 0)),
      overall
    };

    await room.save();

    res.json({
      success: true,
      data: room.secureSphere,
      message: 'SecureSphere data updated successfully'
    });

  } catch (error) {
    console.error('Error updating SecureSphere data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update SecureSphere data',
      details: error.message
    });
  }
};

// DELETE /api/rooms/:id - Delete a room (Landlord owner only)
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    // Only the landlord who owns the room can delete it
    if (req.user.role !== 'landlord' || room.landlord.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only the property owner can delete this room'
      });
    }

    await room.deleteOne();

    return res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete room',
      details: error.message
    });
  }
};