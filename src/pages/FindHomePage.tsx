import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Users, Bath, Bed, Wifi, Car, Utensils, Dumbbell, SlidersHorizontal, Snowflake, Shield, Tv, Coffee, RefreshCw } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Types
interface Location {
  city: string;
  state: string;
  pincode: string;
}

interface Size {
  area: number;
  bedrooms: number;
  bathrooms: number;
}

interface Landlord {
  _id: string;
  name: string;
  email: string;
}

type RoomType = 'single' | 'shared' | 'studio' | 'apartment' | 'house';
type Amenity = 'WiFi' | 'Parking' | 'Kitchen' | 'Gym' | 'AC' | 'Laundry' | 'Pool' | 'Security' | 'TV' | 'Furnished';

interface Property {
  _id: string;
  title: string;
  pricePerMonth: number;
  address: string;
  images: string[];
  rating: number;
  reviewCount: number;
  available: boolean;
  amenities: Amenity[];
  roomType: RoomType;
  location: Location;
  landlord: Landlord;
  description: string;
  size: Size;
  features: string[];
  nearbyPlaces: string[];
}

interface Filters {
  search: string;
  minPrice: string;
  maxPrice: string;
  city: string;
  roomType: RoomType | '';
  amenities: Amenity[];
}

const FindHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    minPrice: '',
    maxPrice: '',
    city: '',
    roomType: '',
    amenities: []
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch properties from backend API - ONLY REAL DATA
  const fetchPropertiesFromAPI = async (filterParams: Filters = filters) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      // Add all filters to query params
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value && value !== '') {
          if (Array.isArray(value) && value.length > 0) {
            value.forEach(v => queryParams.append(key, v));
          } else if (!Array.isArray(value)) {
            queryParams.append(key, value.toString());
          }
        }
      });

      // Use proxyed API path
      const apiUrl = `/api/rooms?${queryParams.toString()}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setProperties(data.data);
      } else {
        setProperties([]);
      }
      
    } catch (err: any) {
      console.error('Failed to fetch properties:', err);
      setError(`Failed to load properties: ${err.message}`);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch properties on component mount
  useEffect(() => {
    fetchPropertiesFromAPI();
  }, []);

  // Handle search from SearchBar component
  const handleSearch = (query: string, searchFilters: any = {}) => {
    const combinedFilters = { 
      ...filters, 
      ...searchFilters, 
      search: query 
    };
    setFilters(combinedFilters);
    fetchPropertiesFromAPI(combinedFilters);
  };

  // Handle photo search
  const handlePhotoSearch = async (photo: File, searchFilters: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('photo', photo);
      
      if (searchFilters.minPrice) formData.append('minPrice', searchFilters.minPrice);
      if (searchFilters.maxPrice) formData.append('maxPrice', searchFilters.maxPrice);
      if (searchFilters.city) formData.append('location', searchFilters.city);

      const response = await fetch('http://localhost:5000/api/rooms/search-by-photo', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Photo search failed');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setProperties(data.data);
      } else {
        throw new Error('Invalid response from photo search');
      }
      
    } catch (err) {
      console.error('Photo search failed:', err);
      setError('Photo search is currently unavailable. Please try text search instead.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    fetchPropertiesFromAPI(filters);
  };

  const handleFilterChange = (key: keyof Filters, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAmenityToggle = (amenity: Amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      minPrice: '',
      maxPrice: '',
      city: '',
      roomType: '',
      amenities: []
    };
    setFilters(clearedFilters);
    fetchPropertiesFromAPI(clearedFilters);
  };

  const getAmenityIcon = (amenity: Amenity) => {
    const icons = {
      'WiFi': <Wifi className="w-4 h-4" />,
      'Parking': <Car className="w-4 h-4" />,
      'Kitchen': <Utensils className="w-4 h-4" />,
      'Gym': <Dumbbell className="w-4 h-4" />,
      'AC': <Snowflake className="w-4 h-4" />,
      'Laundry': <span className="text-sm">🧺</span>,
      'Pool': <span className="text-sm">🏊</span>,
      'Security': <Shield className="w-4 h-4" />,
      'TV': <Tv className="w-4 h-4" />,
      'Furnished': <span className="text-sm">🛋️</span>
    };
    return icons[amenity] || <Coffee className="w-4 h-4" />;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handlePropertyClick = (id: string) => {
    navigate(`/property/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Home
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {properties.length > 0 
              ? `Discover ${properties.length} real properties listed by landlords`
              : 'Browse real properties listed by verified landlords'
            }
          </p>
          
          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-4xl mx-auto">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-red-800 font-medium flex items-center gap-2">
                    <span>🚫 Connection Issue</span>
                  </p>
                  <p className="text-red-700 text-sm mt-2">{error}</p>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Button 
                    size="sm" 
                    onClick={() => fetchPropertiesFromAPI()}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <Card className="p-6 mb-8" hover={false}>
          <SearchBar 
            onSearch={handleSearch} 
            onPhotoSearch={handlePhotoSearch} 
            showFilters={false}
          />
          
          {/* Advanced Filters Toggle */}
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type
                  </label>
                  <select
                    value={filters.roomType}
                    onChange={(e) => handleFilterChange('roomType', e.target.value as RoomType | '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="single">Single Room</option>
                    <option value="shared">Shared Room</option>
                    <option value="studio">Studio</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                  </select>
                </div>
              </div>

              {/* Amenities Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Amenities
                </label>
                <div className="flex flex-wrap gap-3">
                  {(['WiFi', 'AC', 'Parking', 'Kitchen', 'Laundry', 'Gym', 'Pool', 'Security', 'TV', 'Furnished'] as Amenity[]).map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                        filters.amenities.includes(amenity)
                          ? 'bg-pink-100 border-pink-500 text-pink-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm">{getAmenityIcon(amenity)}</span>
                      <span className="text-sm">{amenity}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
                <Button onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            <p className="ml-4 text-gray-600">Loading real properties from landlords...</p>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map(property => (
              <Card 
                key={property._id} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                hover={true}
                padding="none"
              >
                {/* Property Image */}
                <div className="relative overflow-hidden border-b-2 border-gray-200">
                  <div className="w-full h-48 overflow-hidden bg-gray-100">
                    <img
                      src={property.images && property.images[0] ? property.images[0] : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onClick={() => handlePropertyClick(property._id)}
                    />
                  </div>
                  {property.available && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                      ✓ Available
                    </div>
                  )}
                </div>

                {/* Property Details */}
                <div className="p-4 bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">
                        {property.rating || 'New'}
                      </span>
                      {property.reviewCount > 0 && (
                        <span className="text-sm text-gray-500">({property.reviewCount})</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {property.location?.city || 'City'}, {property.location?.state || 'State'}
                    </span>
                  </div>

                  {/* Property Features */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{property.size?.bedrooms || 1} bed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      <span>{property.size?.bathrooms || 1} bath</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="capitalize">{property.roomType || 'room'}</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  {property.amenities && property.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {property.amenities.slice(0, 3).map(amenity => (
                        <span
                          key={amenity}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          <span className="text-xs">{getAmenityIcon(amenity)}</span>
                          {amenity}
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{property.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(property.pricePerMonth)}
                    </span>
                    <span className="text-gray-600 text-sm">/month</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-3 border-t border-gray-100 mt-4">
                    <Button 
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePropertyClick(property._id)}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm"
                      variant="secondary"
                      className="flex items-center space-x-1"
                      onClick={() => navigate(`/property/${property._id}/securesphere`)}
                    >
                      <Shield className="h-4 w-4" />
                      <span>SecureSphere</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : !loading && !error ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Properties Available
            </h3>
            <p className="text-gray-600 mb-4">
              No properties are currently listed by landlords. Check back later or contact us to list your property.
            </p>
            <Button onClick={() => fetchPropertiesFromAPI()}>
              Refresh
            </Button>
          </div>
        ) : null}

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-blue-100 p-4 rounded-lg shadow-lg max-w-sm border border-blue-300">
            <h4 className="font-bold mb-2 text-blue-900">Debug Info:</h4>
            <p className="text-sm text-blue-800">Properties: {properties.length}</p>
            <p className="text-sm text-blue-800">Status: {error ? '❌ Error' : '✅ Connected'}</p>
            <p className="text-sm text-blue-800">Loading: {loading ? 'Yes' : 'No'}</p>
            <button 
              onClick={() => fetchPropertiesFromAPI()} 
              className="mt-2 w-full px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindHomePage;