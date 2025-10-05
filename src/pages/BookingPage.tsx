import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, User, CreditCard, Shield, Home, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  deposit: number;
  images: string[];
  type: string;
  landlordId: {
    name: string;
    verified: boolean;
    phone?: string;
  };
  amenities: string[];
}

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    checkInDate: '',
    duration: '6',
    message: '',
    agreeToTerms: false
  });
  
  const [bookingStatus, setBookingStatus] = useState<'form' | 'processing' | 'confirmed'>('form');
  const [bookingId, setBookingId] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/rooms/${id}`);
        if (response.ok) {
          const roomData = await response.json();
          
          // Map Room data to Property interface
          const propertyData: Property = {
            id: roomData._id || roomData.id,
            title: roomData.title,
            description: roomData.description,
            location: roomData.address,
            price: roomData.pricePerMonth,
            deposit: roomData.pricePerMonth, // Default to 1 month rent as security deposit
            images: roomData.images || [],
            type: roomData.roomType,
            landlordId: {
              name: roomData.landlord?.name || 'Property Owner',
              verified: roomData.landlord?.verified || false,
              phone: roomData.landlord?.phone
            },
            amenities: roomData.amenities || []
          };
          
          setProperty(propertyData);
        } else {
          console.error('Property not found:', response.status);
        }
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  const calculateTotal = () => {
    if (!property) return { monthlyRent: 0, totalRent: 0, securityDeposit: 0, total: 0 };
    
    const monthlyRent = property.price;
    const months = parseInt(bookingData.duration);
    const totalRent = monthlyRent * months;
    const securityDeposit = property.deposit;
    return { monthlyRent, totalRent, securityDeposit, total: totalRent + securityDeposit };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingData.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    if (!user?.verified && user?.role === 'student') {
      if (confirm('Your account is not verified. Would you like to verify now for better booking success?')) {
        navigate('/verify');
        return;
      }
    }

    setBookingStatus('processing');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: id,
          checkInDate: bookingData.checkInDate,
          duration: parseInt(bookingData.duration),
          message: bookingData.message
        }),
      });

      if (response.ok) {
        const booking = await response.json();
        setBookingId(booking._id);
        setBookingStatus('confirmed');
      } else {
        throw new Error('Booking failed');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Booking failed. Please try again.');
      setBookingStatus('form');
    }
  };

  const costs = calculateTotal();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/find-homes')}>
            Browse Properties
          </Button>
        </Card>
      </div>
    );
  }

  if (bookingStatus === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <div className="animate-spin w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Processing Your Booking</h2>
          <p className="text-gray-600">Please wait while we confirm your reservation...</p>
        </Card>
      </div>
    );
  }

  if (bookingStatus === 'confirmed') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Request Sent!</h1>
                <p className="text-gray-600">
                  Your booking request has been sent to the landlord. You'll receive a confirmation once it's approved.
                </p>
              </div>

              <Card className="bg-gray-50">
                <div className="text-left space-y-3">
                  <h3 className="font-semibold">Booking Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Property:</span>
                      <div className="font-medium">{property.title}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Check-in:</span>
                      <div className="font-medium">{new Date(bookingData.checkInDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <div className="font-medium">{bookingData.duration} months</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <div className="font-medium">₹{costs.total.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="bg-blue-50 p-4 rounded-lg text-left">
                <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• The landlord will review your booking request</li>
                  <li>• You'll receive an email notification about the status</li>
                  <li>• If approved, you'll receive payment instructions</li>
                  <li>• Connect with the landlord via chat for any questions</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate('/student-dashboard')}
                  className="flex-1"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/chat')}
                  className="flex-1"
                >
                  Message Landlord
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">Review your details and confirm your reservation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Summary */}
            <Card>
              <div className="flex items-start space-x-4">
                <img
                  src={property.images[0] || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'}
                  alt={property.title}
                  className="w-20 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{property.title}</h3>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </div>
                  <div className="text-lg font-bold text-pink-600 mt-1">
                    ₹{property.price.toLocaleString()}/month
                  </div>
                </div>
              </div>
            </Card>

            {/* Booking Details Form */}
            <form onSubmit={handleSubmit}>
              <Card>
                <h3 className="text-lg font-semibold mb-6">Booking Details</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Check-in Date"
                      type="date"
                      value={bookingData.checkInDate}
                      onChange={(e) => setBookingData(prev => ({ ...prev, checkInDate: e.target.value }))}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <select
                        value={bookingData.duration}
                        onChange={(e) => setBookingData(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        required
                      >
                        <option value="3">3 months</option>
                        <option value="6">6 months</option>
                        <option value="12">12 months</option>
                        <option value="24">24 months</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message to Landlord (Optional)
                    </label>
                    <textarea
                      value={bookingData.message}
                      onChange={(e) => setBookingData(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Tell the landlord about yourself, your move-in preferences, or any questions you have..."
                    />
                  </div>
                </div>
              </Card>

              {/* Tenant Information */}
              <Card>
                <h3 className="text-lg font-semibold mb-6">Your Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                        {user?.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Shield className={`h-5 w-5 mr-2 ${user?.verified ? 'text-green-500' : 'text-yellow-500'}`} />
                      <span className="text-sm">
                        {user?.verified ? 'Account Verified' : 'Account Verification Pending'}
                      </span>
                    </div>
                    {!user?.verified && (
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate('/verify')}
                      >
                        Verify Now
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Terms and Conditions */}
              <Card>
                <div className="space-y-4">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={bookingData.agreeToTerms}
                      onChange={(e) => setBookingData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded mt-1"
                      required
                    />
                    <div className="text-sm text-gray-700">
                      I agree to the{' '}
                      <button type="button" className="text-pink-600 hover:underline">
                        Terms and Conditions
                      </button>
                      {' '}and{' '}
                      <button type="button" className="text-pink-600 hover:underline">
                        Booking Policy
                      </button>
                      . I understand that this is a booking request and the final confirmation depends on landlord approval.
                    </div>
                  </label>
                </div>
              </Card>

              <Button type="submit" className="w-full" size="lg">
                Submit Booking Request
              </Button>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Monthly Rent</span>
                  <span className="font-medium">₹{costs.monthlyRent.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{bookingData.duration} months</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Rent</span>
                  <span className="font-medium">₹{costs.totalRent.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Security Deposit</span>
                  <span className="font-medium">₹{costs.securityDeposit.toLocaleString()}</span>
                </div>
                
                <hr className="border-gray-200" />
                
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-pink-600">₹{costs.total.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Payment Information</p>
                    <p>You'll receive payment instructions after the landlord approves your booking request.</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Landlord Info */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Landlord</h3>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium flex items-center">
                    {property.landlordId.name}
                    {property.landlordId.verified && (
                      <Shield className="h-4 w-4 text-green-500 ml-1" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Usually responds within an hour</div>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate('/chat')}>
                Message Landlord
              </Button>
            </Card>

            {/* Booking Tips */}
            <Card>
              <h3 className="font-semibold mb-3">Booking Tips</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  Complete your profile verification to increase booking success rate
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  Write a personal message to introduce yourself to the landlord
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  Be ready with required documents for faster approval
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;