import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, Home, Calendar, DollarSign, Star, MessageCircle, BarChart3, Edit2, Trash2, Image as ImageIcon, Filter
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

interface PropertyItem {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  pricePerMonth: number; // Changed to match backend
  address: string;
  roomType: string;
  amenities: string[];
  images: string[];
  location: {
    city: string;
    state: string;
    pincode: string;
  };
  size: {
    area: number;
    bedrooms: number;
    bathrooms: number;
  };
  features: string[];
  nearbyPlaces: string[];
  available?: boolean;
}

const LandlordDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Properties state
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Earnings state
  const [earnings, setEarnings] = useState({
    thisMonth: 0,
    lastMonth: 0,
    total: 0,
    pending: 0
  });

  // Messages state
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  // Add/Edit modal state
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const emptyForm = { 
    title: '', 
    description: '', 
    pricePerMonth: '', 
    address: '', 
    roomType: '', 
    amenities: [] as string[], 
    images: [] as string[],
    city: '',
    state: '',
    pincode: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    features: [] as string[],
    nearbyPlaces: [] as string[]
  };
  
  const [newProperty, setNewProperty] = useState<typeof emptyForm>(emptyForm);

  // Filters & sorting
  const [filterQuery, setFilterQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [sortBy, setSortBy] = useState<'rent-asc' | 'rent-desc' | 'title-asc'>('rent-asc');

  // Fetch properties from backend
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/rooms', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched properties:', data);
        setProperties(data.data || data.rooms || []);
      } else {
        console.error('Failed to fetch properties:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookings from backend
  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bookings/landlord', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data || []);
      } else {
        console.error('Failed to fetch bookings:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Fetch earnings from backend
  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/landlord', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Calculate earnings from payment data
        const now = new Date();
        const thisMonth = data.filter((p: any) => {
          const date = new Date(p.paidDate || p.createdAt);
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        
        const lastMonth = data.filter((p: any) => {
          const date = new Date(p.paidDate || p.createdAt);
          const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
          return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
        }).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        
        const total = data.filter((p: any) => p.status === 'paid')
          .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        
        const pending = data.filter((p: any) => p.status === 'pending')
          .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        
        setEarnings({ thisMonth, lastMonth, total, pending });
      }
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    }
  };

  // Fetch messages from backend
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentMessages(data.slice(0, 5) || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  // Redirect non-landlords and fetch all data
  useEffect(() => {
    if (!user || user.role !== 'landlord') {
      navigate('/');
    } else {
      fetchProperties();
      fetchBookings();
      fetchEarnings();
      fetchMessages();
    }
  }, [user, navigate]);

  // Read URL parameters to set active tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'properties', 'bookings', 'earnings', 'messages'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const stats = {
    totalProperties: properties.length,
    activeBookings: bookings.filter(b => b.status === 'confirmed').length,
    totalEarnings: earnings.total,
    averageRating: 4.7
  };

  const TabButton = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative flex items-center px-4 py-2 rounded-lg transition-all ${
        activeTab === id
          ? 'bg-pink-100 text-pink-600 border border-pink-200 shadow-sm'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      } hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-pink-400`}
      aria-pressed={activeTab === id}
    >
      <Icon className="h-4 w-4 mr-2" /> {label}
      <span
        className={`pointer-events-none absolute -bottom-1 left-3 right-3 h-0.5 rounded bg-pink-600 transition-all duration-300 ${
          activeTab === id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
        }`}
      />
    </button>
  );

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!newProperty.title.trim()) errs.title = 'Title is required';
    if (!newProperty.address.trim()) errs.address = 'Address is required';
    if (!newProperty.pricePerMonth || Number(newProperty.pricePerMonth) <= 0) errs.pricePerMonth = 'Enter a valid price';
    if (!newProperty.description.trim()) errs.description = 'Description is required';
    if (!newProperty.roomType) errs.roomType = 'Room type is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddOrEditProperty = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      // Prepare the data in the format your backend expects
      const propertyData = {
        title: newProperty.title.trim(),
        description: newProperty.description.trim(),
        pricePerMonth: Number(newProperty.pricePerMonth),
        address: newProperty.address.trim(),
        roomType: newProperty.roomType,
        amenities: newProperty.amenities,
        images: newProperty.images,
        location: {
          city: newProperty.city,
          state: newProperty.state,
          pincode: newProperty.pincode
        },
        size: {
          area: Number(newProperty.area) || 0,
          bedrooms: Number(newProperty.bedrooms) || 1,
          bathrooms: Number(newProperty.bathrooms) || 1
        },
        features: newProperty.features,
        nearbyPlaces: newProperty.nearbyPlaces,
        available: true
      };

      console.log('Sending property data:', propertyData);

      const url = editingId ? `/api/rooms/${editingId}` : '/api/rooms';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(propertyData)
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (response.ok) {
        const savedProperty = responseData.data;
        
        if (editingId) {
          setProperties(prev => prev.map(p => 
            p._id === editingId ? savedProperty : p
          ));
        } else {
          setProperties(prev => [savedProperty, ...prev]);
        }

        setShowAddProperty(false);
        setEditingId(null);
        setNewProperty(emptyForm);
        setFormErrors({});
        
        // Refresh the properties list
        fetchProperties();
      } else {
        setFormErrors({ submit: responseData.error || responseData.message || 'Failed to save property' });
      }
    } catch (error) {
      console.error('Failed to save property:', error);
      setFormErrors({ submit: 'Failed to save property. Please check your connection.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setNewProperty(emptyForm);
    setFormErrors({});
    setShowAddProperty(true);
  };

  const handleOpenEdit = (prop: PropertyItem) => {
    setEditingId(prop._id || null);
    setNewProperty({
      title: prop.title,
      description: prop.description,
      pricePerMonth: String(prop.pricePerMonth),
      address: prop.address,
      roomType: prop.roomType,
      amenities: [...prop.amenities],
      images: [...prop.images],
      city: prop.location?.city || '',
      state: prop.location?.state || '',
      pincode: prop.location?.pincode || '',
      area: String(prop.size?.area || ''),
      bedrooms: String(prop.size?.bedrooms || ''),
      bathrooms: String(prop.size?.bathrooms || ''),
      features: [...prop.features],
      nearbyPlaces: [...prop.nearbyPlaces]
    });
    setFormErrors({});
    setShowAddProperty(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/rooms/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setProperties(prev => prev.filter(p => p._id !== id));
        // Refresh the list
        fetchProperties();
      } else {
        console.error('Failed to delete property');
      }
    } catch (error) {
      console.error('Failed to delete property:', error);
    }
  };

  const handleAmenityChange = (amenity: string) => {
    setNewProperty(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleFeatureChange = (feature: string) => {
    setNewProperty(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleNearbyPlaceChange = (place: string) => {
    setNewProperty(prev => ({
      ...prev,
      nearbyPlaces: prev.nearbyPlaces.includes(place)
        ? prev.nearbyPlaces.filter(p => p !== place)
        : [...prev.nearbyPlaces, place]
    }));
  };

  const handleImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload/property-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.images) {
          // Convert relative URLs to absolute URLs for display
          const absoluteUrls = data.images.map((img: string) => `http://localhost:5000${img}`);
          setNewProperty(prev => ({ ...prev, images: [...prev.images, ...absoluteUrls] }));
        }
      } else {
        alert('Failed to upload images. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please check your connection.');
    }
  };

  const filteredSorted = useMemo(() => {
    let list = properties.filter(p => {
      const q = filterQuery.toLowerCase();
      const matchesQ = p.title.toLowerCase().includes(q) || p.address.toLowerCase().includes(q);
      const matchesLoc = filterLocation ? p.address.toLowerCase().includes(filterLocation.toLowerCase()) : true;
      return matchesQ && matchesLoc;
    });
    if (sortBy === 'rent-asc') list = list.sort((a,b) => a.pricePerMonth - b.pricePerMonth);
    if (sortBy === 'rent-desc') list = list.sort((a,b) => b.pricePerMonth - a.pricePerMonth);
    if (sortBy === 'title-asc') list = list.sort((a,b) => a.title.localeCompare(b.title));
    return list;
  }, [properties, filterQuery, filterLocation, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Landlord Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}!</p>
          </div>
          <Button onClick={handleOpenAdd} className="shadow-md hover:shadow-lg">
            <Plus className="h-4 w-4 mr-2" /> Add Property
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
              </div>
              <Home className="h-8 w-8 text-pink-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <TabButton id="overview" label="Overview" icon={BarChart3} />
            <TabButton id="properties" label="My Properties" icon={Home} />
            <TabButton id="bookings" label="Bookings" icon={Calendar} />
            <TabButton id="earnings" label="Earnings" icon={DollarSign} />
            <TabButton id="messages" label="Messages" icon={MessageCircle} />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="animate-fade-in">
              <h3 className="text-lg font-semibold mb-4">Recent Properties</h3>
              {properties.slice(0, 3).map(property => (
                <div key={property._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{property.title}</p>
                    <p className="text-sm text-gray-600">{property.location?.city}</p>
                  </div>
                  <p className="font-semibold text-pink-600">₹{property.pricePerMonth}/month</p>
                </div>
              ))}
              {properties.length === 0 && (
                <p className="text-gray-500 text-center py-4">No properties listed yet</p>
              )}
            </Card>
            <Card className="animate-fade-in">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Properties Listed</span>
                  <span className="font-semibold">{properties.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Properties</span>
                  <span className="font-semibold">{properties.filter(p => p.available !== false).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Rent</span>
                  <span className="font-semibold">
                    {properties.length > 0 
                      ? `₹${Math.round(properties.reduce((sum, p) => sum + p.pricePerMonth, 0) / properties.length)}` 
                      : '₹0'
                    }
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="space-y-4">
            {/* Filter & Sort Bar */}
            <Card className="p-4 animate-slide-up">
              <div className="flex flex-col md:flex-row md:items-end gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input 
                    value={filterQuery} 
                    onChange={(e) => setFilterQuery(e.target.value)} 
                    placeholder="Search by title or location" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input 
                    value={filterLocation} 
                    onChange={(e) => setFilterLocation(e.target.value)} 
                    placeholder="Filter by location" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as any)} 
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="rent-asc">Rent: Low to High</option>
                    <option value="rent-desc">Rent: High to Low</option>
                    <option value="title-asc">Title: A-Z</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => { setFilterQuery(''); setFilterLocation(''); setSortBy('rent-asc'); }}>
                    <Filter className="h-4 w-4 mr-2" /> Reset
                  </Button>
                  <Button onClick={handleOpenAdd}><Plus className="h-4 w-4 mr-2" /> Add</Button>
                </div>
              </div>
            </Card>

            {/* Properties Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                <p className="ml-4 text-gray-600">Loading properties...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSorted.map((p) => (
                  <div key={p._id} className="group rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all animate-pop-in">
                    <div className="relative">
                      <img src={p.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'} alt={p.title} className="w-full h-40 object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">{p.title}</h3>
                      <p className="text-sm text-gray-600">{p.address}</p>
                      <p className="mt-1 font-medium">₹{p.pricePerMonth.toLocaleString()}/month</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.amenities.slice(0, 3).map(amenity => (
                          <span key={amenity} className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">{amenity}</span>
                        ))}
                        {p.amenities.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">+{p.amenities.length - 3}</span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <Button variant="outline" size="sm" onClick={() => handleOpenEdit(p)}>
                          <Edit2 className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(p._id || '')}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredSorted.length === 0 && (
                  <Card className="p-6 text-center text-sm text-gray-500 col-span-full">
                    {properties.length === 0 ? 'No properties listed yet. Click "Add Property" to get started!' : 'No properties match your filters.'}
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <Card>
              <h3 className="text-lg font-semibold mb-4">Booking Requests</h3>
              {bookingsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                  <p className="ml-4 text-gray-600">Loading bookings...</p>
                </div>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {booking.propertyId?.title || 'Property'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Tenant: {booking.studentId?.name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Check-in: {new Date(booking.checkInDate).toLocaleDateString()}
                            {booking.checkOutDate && ` - Check-out: ${new Date(booking.checkOutDate).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h4>
                  <p className="text-gray-600">Booking requests will appear here when students book your properties</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="space-y-6">
            {/* Earnings Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">₹{earnings.thisMonth.toLocaleString()}</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Last Month</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">₹{earnings.lastMonth.toLocaleString()}</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">₹{earnings.total.toLocaleString()}</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">₹{earnings.pending.toLocaleString()}</p>
                </div>
              </Card>
            </div>

            {/* Earnings Details */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Earnings Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Current Month Earnings</p>
                    <p className="text-sm text-gray-600">Payments received this month</p>
                  </div>
                  <p className="text-xl font-bold text-green-600">₹{earnings.thisMonth.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Pending Payments</p>
                    <p className="text-sm text-gray-600">Awaiting payment from tenants</p>
                  </div>
                  <p className="text-xl font-bold text-yellow-600">₹{earnings.pending.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Lifetime Earnings</p>
                    <p className="text-sm text-gray-600">Total amount earned</p>
                  </div>
                  <p className="text-xl font-bold text-blue-600">₹{earnings.total.toLocaleString()}</p>
                </div>
                {earnings.thisMonth > earnings.lastMonth && (
                  <div className="p-4 bg-green-50 border-l-4 border-green-500">
                    <p className="text-green-800 font-medium">
                      📈 Great news! Your earnings increased by ₹{(earnings.thisMonth - earnings.lastMonth).toLocaleString()} this month!
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'messages' && (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Recent Messages</h3>
              <Button onClick={() => navigate('/chat')}>View All Chats</Button>
            </div>
            {recentMessages.length > 0 ? (
              <div className="space-y-4">
                {recentMessages.map((conversation) => (
                  <div 
                    key={conversation._id} 
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate('/chat')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {conversation.participants?.find((p: any) => p._id !== user?.id)?.name || 'Student'}
                          </h4>
                          {conversation.unreadCount > 0 && (
                            <span className="px-2 py-1 bg-pink-600 text-white text-xs rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {conversation.lastMessage?.text || 'No messages yet'}
                        </p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {conversation.lastMessage?.createdAt && 
                          new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h4>
                <p className="text-gray-600">Your tenant messages will appear here</p>
                <Button onClick={() => navigate('/chat')} className="mt-4">
                  Start Messaging
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Add/Edit Property Modal */}
        <Modal 
          isOpen={showAddProperty} 
          onClose={() => { if (!isSubmitting) setShowAddProperty(false); }} 
          title={editingId ? 'Edit Property' : 'Add New Property'} 
          size="lg"
        >
          <form onSubmit={(e) => { e.preventDefault(); handleAddOrEditProperty(); }} className="space-y-4">
            {formErrors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{formErrors.submit}</p>
              </div>
            )}

            <Input 
              label="Property Title" 
              value={newProperty.title} 
              onChange={(e) => setNewProperty({...newProperty, title: e.target.value})} 
              error={formErrors.title} 
              required 
            />
            
            <Input 
              label="Address" 
              value={newProperty.address} 
              onChange={(e) => setNewProperty({...newProperty, address: e.target.value})} 
              error={formErrors.address} 
              required 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="City" value={newProperty.city} onChange={(e) => setNewProperty({...newProperty, city: e.target.value})} />
              <Input label="State" value={newProperty.state} onChange={(e) => setNewProperty({...newProperty, state: e.target.value})} />
              <Input label="Pincode" value={newProperty.pincode} onChange={(e) => setNewProperty({...newProperty, pincode: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Monthly Rent (₹)" 
                type="number" 
                value={newProperty.pricePerMonth} 
                onChange={(e) => setNewProperty({...newProperty, pricePerMonth: e.target.value})} 
                error={formErrors.pricePerMonth} 
                required 
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <select 
                  value={newProperty.roomType} 
                  onChange={(e) => setNewProperty({...newProperty, roomType: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" 
                  required
                >
                  <option value="">Select room type</option>
                  <option value="single">Single Room</option>
                  <option value="shared">Shared Room</option>
                  <option value="studio">Studio</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                </select>
                {formErrors.roomType && <p className="text-sm text-red-600 mt-1">{formErrors.roomType}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                value={newProperty.description} 
                onChange={(e) => setNewProperty({...newProperty, description: e.target.value})} 
                rows={4} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" 
                placeholder="Describe your property..." 
              />
              {formErrors.description && <p className="text-sm text-red-600 mt-1">{formErrors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Area (sq ft)" type="number" value={newProperty.area} onChange={(e) => setNewProperty({...newProperty, area: e.target.value})} />
              <Input label="Bedrooms" type="number" value={newProperty.bedrooms} onChange={(e) => setNewProperty({...newProperty, bedrooms: e.target.value})} />
              <Input label="Bathrooms" type="number" value={newProperty.bathrooms} onChange={(e) => setNewProperty({...newProperty, bathrooms: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['WiFi','Parking','Kitchen','Laundry','AC','Furnished','Gym','Pool'].map(amenity => (
                  <label key={amenity} className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={newProperty.amenities.includes(amenity)} 
                      onChange={() => handleAmenityChange(amenity)} 
                      className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" 
                    />
                    <span className="ml-2 text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['furnished','semi-furnished','unfurnished','modern','luxury','garden','balcony'].map(feature => (
                  <label key={feature} className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={newProperty.features.includes(feature)} 
                      onChange={() => handleFeatureChange(feature)} 
                      className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" 
                    />
                    <span className="ml-2 text-sm">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nearby Places</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['University','Hospital','Shopping Mall','Metro Station','Railway Station','Airport','Park','Temple'].map(place => (
                  <label key={place} className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={newProperty.nearbyPlaces.includes(place)} 
                      onChange={() => handleNearbyPlaceChange(place)} 
                      className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" 
                    />
                    <span className="ml-2 text-sm">{place}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <ImageIcon className="h-4 w-4 mr-2" /> Upload Images
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImages(e.target.files)} />
                </label>
                <span className="text-xs text-gray-500">You can select multiple files</span>
              </div>
              {newProperty.images.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {newProperty.images.map((src, idx) => (
                    <div key={idx} className="relative group">
                      <img src={src} alt={`preview-${idx}`} className="w-full h-20 object-cover rounded-lg border" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => !isSubmitting && setShowAddProperty(false)} 
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                loading={isSubmitting}
              >
                {editingId ? 'Save Changes' : 'Add Property'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default LandlordDashboard;