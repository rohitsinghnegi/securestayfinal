import React, { useState } from 'react';
import { Search, MapPin, Filter, Camera, X } from 'lucide-react';
import Button from './ui/Button';

interface SearchBarProps {
  onSearch: (query: string, filters: any) => void;
  onPhotoSearch?: (photo: File, filters: any) => void;
  showFilters?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onPhotoSearch, showFilters = true }) => {
  const [query, setQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    roomType: '',
    city: '',
    amenities: [] as string[]
  });

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handlePhotoSearch = () => {
    if (selectedPhoto && onPhotoSearch) {
      onPhotoSearch(selectedPhoto, filters);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Photo Preview */}
      {photoPreview && (
        <div className="mb-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={photoPreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Photo selected for search</p>
                <p className="text-xs text-gray-500">{selectedPhoto?.name}</p>
              </div>
            </div>
            <button
              onClick={removePhoto}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center bg-white rounded-full shadow-lg border-2 border-gray-100 focus-within:border-pink-500 transition-colors">
        <div className="flex-1 flex items-center px-6 py-4">
          <MapPin className="h-5 w-5 text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search by location, university, or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
        
        {/* Photo Upload Button */}
        <label className="px-4 py-4 text-gray-500 hover:text-pink-600 transition-colors border-l border-gray-200 cursor-pointer">
          <Camera className="h-5 w-5" />
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </label>
        
        {showFilters && (
          <button
            onClick={() => setShowFilterModal(!showFilterModal)}
            className="px-4 py-4 text-gray-500 hover:text-pink-600 transition-colors border-l border-gray-200"
          >
            <Filter className="h-5 w-5" />
          </button>
        )}
        
        <Button 
          onClick={selectedPhoto ? handlePhotoSearch : handleSearch} 
          className="m-2 rounded-full px-6"
        >
          {selectedPhoto ? (
            <>
              <Camera className="h-5 w-5 mr-2" />
              Search by Photo
            </>
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>

      {showFilterModal && (
        <div className="mt-4 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
              <input
                type="number"
                placeholder="₹5,000"
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <input
                type="number"
                placeholder="₹20,000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                placeholder="Mumbai, Delhi, Bangalore..."
                value={filters.city}
                onChange={(e) => setFilters({...filters, city: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
              <select
                value={filters.roomType}
                onChange={(e) => setFilters({...filters, roomType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Any</option>
                <option value="single">Single Room</option>
                <option value="shared">Shared Room</option>
                <option value="studio">Studio</option>
                <option value="apartment">1 BHK</option>
                <option value="house">House</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {['WiFi', 'Parking', 'Kitchen', 'Laundry', 'AC', 'Furnished', 'Gym', 'Pool'].map(amenity => (
                  <label key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({...filters, amenities: [...filters.amenities, amenity]});
                        } else {
                          setFilters({...filters, amenities: filters.amenities.filter(a => a !== amenity)});
                        }
                      }}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;