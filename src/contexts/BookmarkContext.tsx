import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface Property {
  _id?: string;
  id?: string;
  title: string;
  location: string;
  price: number;
  images?: string[];
  image?: string;
  type?: string;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  amenities?: string[];
}

interface BookmarkContextType {
  bookmarks: Property[];
  toggleBookmark: (property: Property) => Promise<void>;
  isBookmarked: (propertyId: string) => boolean;
  loading: boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchBookmarks();
    else {
      setBookmarks([]);
      setLoading(false);
    }
  }, [user]);

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      
      const res = await fetch("http://localhost:5000/api/bookmarks/student", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setBookmarks(data);
        } else {
          console.warn("Bookmarks data is not an array:", data);
          setBookmarks([]);
        }
      } else {
        console.error("Failed to fetch bookmarks. Status:", res.status);
        setBookmarks([]);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (property: Property) => {
    if (!user) return;
    const propertyId = property._id || property.id;
    if (!propertyId) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ propertyId }),
      });

      if (res.ok) {
        setBookmarks((prev) => {
          const exists = prev.find((b) => (b._id || b.id) === propertyId);
          if (exists) return prev.filter((b) => (b._id || b.id) !== propertyId);
          else return [...prev, property];
        });
      } else console.error("Failed to toggle bookmark");
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const isBookmarked = (propertyId: string) => {
    return bookmarks.some((b) => (b._id || b.id) === propertyId);
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked, loading }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) throw new Error("useBookmarks must be used within BookmarkProvider");
  return context;
};
