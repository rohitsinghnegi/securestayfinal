import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Users, Bath, Bed, Wifi, Car, Utensils, Dumbbell } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';

const FindHome = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    city: '',
    roomType: '',
    amenities: []
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch properties on component mount
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (filterParams = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filterParams).toString();
      const response = await fetch(`/api/rooms?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setProperties(data.data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProperties(filters);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      minPrice: '',
      maxPrice: '',
      city: '',
      roomType: '',
      amenities: []
    });
    fetchProperties();
  };

  const getAmenityIcon = (amenity) => {
    const icons = {
      'WiFi': <Wifi className="w-4 h-4" />,
      'Parking': <Car className="w-4 h-4" />,
      'Kitchen': <Utensils className="w-4 h-4" />,
      'Gym': <Dumbbell className="w-4 h-4" />,
    };
    return icons[amenity] || <Star className="w-4 h-4" />;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
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
            Discover 20+ carefully selected properties with verified amenities and transparent pricing
          </p>
        </div>

        {/* Search Bar */}
        <Card className="p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by location, property name, or amenities..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="whitespace-nowrap"
              >
                Filters
              </Button>
              <Button type="submit" className="whitespace-nowrap">
                Search
              </Button>
            </div>
          </form>

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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price
                  </label>
                  <input
                    type="number"
                    placeholder="Min price"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price
                  </label>
                  <input
                    type="number"
                    placeholder="Max price"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type
                  </label>
                  <select
                    value={filters.roomType}
                    onChange={(e) => handleFilterChange('roomType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
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
                  {['WiFi', 'AC', 'Parking', 'Kitchen', 'Laundry', 'Gym', 'Pool'].map(amenity => (
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
                      {getAmenityIcon(amenity)}
                      <span>{amenity}</span>
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
                  Clear All
                </Button>
                <Button onClick={handleSearch}>
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
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map(property => (
              <Card key={property._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Property Image */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={property.images[0] || '/default-property.jpg'}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">
                        {property.rating}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{property.location.city}, {property.location.state}</span>
                  </div>

                  {/* Property Features */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{property.size.bedrooms} bed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      <span>{property.size.bathrooms} bath</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="capitalize">{property.roomType}</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {property.amenities.slice(0, 3).map(amenity => (
                      <span
                        key={amenity}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {getAmenityIcon(amenity)}
                        {amenity}
                      </span>
                    ))}
                    {property.amenities.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{property.amenities.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(property.pricePerMonth)}
                      </span>
                      <span className="text-gray-600 text-sm">/month</span>
                    </div>
                    <Button size="sm" onClick={() => navigate(`/property/${property._id}`)}>
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && properties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all properties.
            </p>
            <Button onClick={clearFilters}>
              Browse All Properties
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindHome;