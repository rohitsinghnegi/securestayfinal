import React from "react";
import { useBookmarks } from "../contexts/BookmarkContext";
import { useNavigate } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";

const BookmarksPage: React.FC = () => {
  const { bookmarks, loading } = useBookmarks();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No saved properties yet</h2>
          <p className="text-gray-600 mb-6">Start exploring properties and save your favorites!</p>
          <button
            onClick={() => navigate('/find-homes')}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition"
          >
            Explore Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Saved Properties ({bookmarks.length})</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((property) => {
            const propertyId = property.id || property._id;
            return (
              <PropertyCard
                key={propertyId}
                property={property}
                onClick={() => navigate(`/property/${propertyId}`)}
                onMessage={() => navigate('/chat')}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BookmarksPage;
