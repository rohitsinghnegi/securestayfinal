import React from 'react';
import { Heart, Star, MapPin, Wifi, Car, Utensils, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBookmarks } from '../contexts/BookmarkContext';
import Card from './ui/Card';
import Button from './ui/Button';

interface Property {
  id?: string;
  _id?: string;
  title: string;
  price: number;
  location: string;
  image?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  amenities?: string[];
}

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  onMessage: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onClick, 
  onMessage 
}) => {
  const navigate = useNavigate();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const propertyId = property.id || property._id || '';
  const bookmarked = isBookmarked(propertyId);
  const imageUrl = property.image || property.images?.[0] || '/placeholder.png';

  const amenityIcons = {
    wifi: <Wifi className="h-4 w-4" />,
    WiFi: <Wifi className="h-4 w-4" />,
    parking: <Car className="h-4 w-4" />,
    Parking: <Car className="h-4 w-4" />,
    kitchen: <Utensils className="h-4 w-4" />,
    Kitchen: <Utensils className="h-4 w-4" />
  };

  return (
    <Card hover className="group cursor-pointer overflow-hidden" padding="none">
      <div onClick={onClick}>
        <div className="relative overflow-hidden border-b-2 border-gray-200">
          <div className="w-full h-48 overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.png';
              }}
            />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(property);
            }}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-all hover:shadow-xl"
          >
            <Heart 
              className={`h-5 w-5 ${
                bookmarked ? 'text-pink-600 fill-current' : 'text-gray-400'
              }`} 
            />
          </button>
          {property.verified && (
            <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
              ✓ Verified
            </div>
          )}
        </div>

        <div className="p-4 space-y-3 bg-white">
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-2">
              {property.title}
            </h3>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{property.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{property.rating || 0}</span>
              <span className="text-sm text-gray-500">({property.reviewCount || 0})</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">₹{property.price.toLocaleString()}</div>
              <div className="text-sm text-gray-500">per month</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-500">
            {(property.amenities || []).slice(0, 3).map((amenity, idx) => (
              <div key={`${amenity}-${idx}`} className="flex items-center text-xs">
                {amenityIcons[amenity as keyof typeof amenityIcons] || amenity}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex space-x-2 px-4 pb-4 bg-white">
        <Button 
          onClick={onClick} 
          className="flex-1" 
          size="sm"
        >
          View Details
        </Button>
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/property/${propertyId}/securesphere`);
          }}
          variant="secondary" 
          size="sm"
          className="flex items-center space-x-1"
        >
          <Shield className="h-4 w-4" />
          <span>SecureSphere</span>
        </Button>
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onMessage();
          }}
          variant="outline" 
          size="sm"
        >
          Message
        </Button>
      </div>
    </Card>
  );
};

export default PropertyCard;