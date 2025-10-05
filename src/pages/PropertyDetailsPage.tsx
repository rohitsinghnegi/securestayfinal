import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBookmarks } from '../contexts/BookmarkContext';
import { 
  Heart, 
  Star, 
  MapPin, 
  Wifi, 
  Car, 
  Utensils, 
  Bath,
  Bed,
  Shield,
  MessageCircle,
  Phone,
  Share2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Snowflake,
  Map
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real property data from backend
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError('Property ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/rooms/${id}`);
        
        if (!response.ok) {
          throw new Error('Property not found');
        }

        const data = await response.json();
        console.log('Fetched property:', data);
        
        // Map backend data to the format used in the component
        const roomData = data.data || data;
        
        // Map amenities to icons
        const amenityIconMap: any = {
          'WiFi': Wifi,
          'Parking': Car,
          'Kitchen': Utensils,
          'Furnished': Bed,
          'AC': Snowflake,
          'Laundry': Bath,
        };

        const mappedProperty = {
          id: roomData._id,
          title: roomData.title,
          price: roomData.pricePerMonth,
          address: roomData.address,
          location: roomData.address || `${roomData.location?.city || ''}, ${roomData.location?.state || ''}`,
          locationData: {
            coordinates: roomData.location?.coordinates || null,
            city: roomData.location?.city || '',
            state: roomData.location?.state || ''
          },
          description: roomData.description || 'No description available.',
          images: roomData.images && roomData.images.length > 0 
            ? roomData.images 
            : ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200'],
          rating: roomData.rating || 4.5,
          reviewCount: roomData.reviewCount || 0,
          verified: roomData.available !== false,
          landlord: {
            name: roomData.landlord?.name || 'Property Owner',
            image: roomData.landlord?.profilePicture || 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150',
            phone: roomData.contact?.phone || roomData.landlord?.phone || '+91 XXXXXXXXXX',
            verified: true,
            responseTime: 'Usually responds within a day'
          },
          amenities: (roomData.amenities || []).map((amenity: string) => ({
            icon: amenityIconMap[amenity] || Wifi,
            label: amenity,
            available: true
          })),
          details: {
            roomType: roomData.roomType || 'Room',
            maxOccupancy: roomData.size?.bedrooms || 2,
            deposit: roomData.pricePerMonth ? roomData.pricePerMonth * 2 : 15000,
            billsIncluded: ['Maintenance'],
            availableFrom: roomData.createdAt || new Date().toISOString()
          },
          rules: roomData.rules || [
            'Please maintain cleanliness',
            'Respect other tenants',
            'Follow house rules'
          ],
          nearbyPlaces: (roomData.nearbyPlaces || []).map((place: string, index: number) => ({
            name: place,
            distance: `${(index + 1) * 0.5} km`,
            type: 'Location'
          })),
          size: roomData.size || { area: 0, bedrooms: 1, bathrooms: 1 },
          features: roomData.features || []
        };

        setProperty(mappedProperty);
      } catch (err: any) {
        console.error('Error fetching property:', err);
        setError(err.message || 'Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Reviews - can be fetched from backend later
  const reviews: any[] = [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
            <p className="text-gray-600">{error || 'The property you are looking for does not exist.'}</p>
          </div>
          <Button onClick={() => navigate('/find-homes')}>
            Back to Search
          </Button>
        </Card>
      </div>
    );
  }

  const bookmarked = isBookmarked(property.id);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const handleBookmark = () => {
    toggleBookmark({
      id: property.id,
      title: property.title,
      price: property.price,
      location: property.location,
      image: property.images[0],
      rating: property.rating,
      verified: property.verified
    });
  };

  const handleMessage = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/chat');
  };

  const handleBook = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/booking/${property.id}`);
  };

  const handleViewOnMap = () => {
    const { address, locationData } = property;
    let destination = address || property.location;
    
    // If coordinates are available, use them for more precise location
    if (locationData?.coordinates?.lat && locationData?.coordinates?.lng) {
      destination = `${locationData.coordinates.lat},${locationData.coordinates.lng}`;
    }
    
    // Create Google Maps URL with directions from user's current location
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    
    // Open in new tab
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Search
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBookmark}
              className={bookmarked ? 'text-pink-600' : ''}
            >
              <Heart className={`h-4 w-4 mr-2 ${bookmarked ? 'fill-current' : ''}`} />
              {bookmarked ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card padding="sm">
              <div className="relative">
                <img
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {property.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
                {property.verified && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    Verified
                  </div>
                )}
              </div>
            </Card>

            {/* Property Info */}
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center justify-between text-gray-600 mb-2">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleViewOnMap}
                      className="flex items-center space-x-1 ml-2"
                    >
                      <Map className="h-4 w-4" />
                      <span>View on Map</span>
                    </Button>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                    <span className="font-medium mr-1">{property.rating}</span>
                    <span className="text-gray-600">({property.reviewCount} reviews)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">₹{property.price.toLocaleString()}</div>
                  <div className="text-gray-600">per month</div>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{property.description}</p>

              {/* Property Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Room Type</div>
                  <div className="font-medium capitalize">{property.details.roomType}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                  <div className="font-medium">{property.size?.bedrooms || property.details.maxOccupancy}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                  <div className="font-medium">{property.size?.bathrooms || 1}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Area</div>
                  <div className="font-medium">{property.size?.area || 'N/A'} {property.size?.area ? 'sq ft' : ''}</div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Security Deposit</div>
                  <div className="font-medium text-blue-900">₹{property.details.deposit.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Available From</div>
                  <div className="font-medium text-blue-900">{new Date(property.details.availableFrom).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Monthly Rent</div>
                  <div className="font-medium text-blue-900">₹{property.price.toLocaleString()}</div>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className={`flex items-center p-2 rounded-lg ${
                        amenity.available 
                          ? 'bg-green-50 text-green-800' 
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      <amenity.icon className="h-4 w-4 mr-2" />
                      <span className="text-sm">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bills Included */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Bills Included</h3>
                <div className="flex flex-wrap gap-2">
                  {property.details.billsIncluded.map((bill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {bill}
                    </span>
                  ))}
                </div>
              </div>

              {/* House Rules */}
              <div>
                <h3 className="text-lg font-semibold mb-3">House Rules</h3>
                <ul className="space-y-2">
                  {property.rules.map((rule, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-pink-500 rounded-full mr-3" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Nearby Places */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Nearby Places</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.nearbyPlaces.map((place, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{place.name}</div>
                      <div className="text-sm text-gray-600">{place.type}</div>
                    </div>
                    <div className="text-sm text-gray-700">{place.distance}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Reviews */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Reviews ({reviews.length})</h3>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <img
                          src={review.avatar}
                          alt={review.user}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium">{review.user}</div>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(review.date).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No reviews yet. Be the first to review this property!</p>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-24">
              <div className="text-center mb-6">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  ₹{property.price.toLocaleString()}/month
                </div>
                <div className="text-sm text-gray-600">
                  + ₹{property.details.deposit.toLocaleString()} security deposit
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <Button onClick={handleBook} className="w-full" size="lg">
                  Book Now
                </Button>
                <Button 
                  onClick={handleMessage} 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Landlord
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600">
                You won't be charged until you confirm your booking
              </div>
            </Card>

            {/* Landlord Info */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Landlord</h3>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={property.landlord.image}
                  alt={property.landlord.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-medium flex items-center">
                    {property.landlord.name}
                    {property.landlord.verified && (
                      <Shield className="h-4 w-4 text-green-500 ml-1" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{property.landlord.responseTime}</div>
                </div>
              </div>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleMessage}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => window.open(`tel:${property.landlord.phone}`)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </Card>

            {/* Report Property */}
            <Card>
              <h3 className="text-lg font-semibold mb-2">Found an issue?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Report any problems with this listing to help keep our community safe.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-red-600 border-red-600 hover:bg-red-50"
              >
                Report Property
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;