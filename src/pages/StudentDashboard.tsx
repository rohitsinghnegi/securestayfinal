import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBookmarks } from '../contexts/BookmarkContext';
import { Link, useNavigate } from "react-router-dom";
import { 
  CreditCard, 
  FileText, 
  Heart, 
  MessageCircle, 
  Wrench,
  Calendar,
  TrendingUp,
  User,
  Shield
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PropertyCard from '../components/PropertyCard';

interface Payment {
  id: string;
  amount: number;
  type: string;
  status: string;
  dueDate: string;
  paidDate?: string;
  description: string;
}

interface Booking {
  id: string;
  propertyId: {
    title: string;
    location: string;
  };
  checkInDate: string;
  status: string;
}

interface Maintenance {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { bookmarks } = useBookmarks();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected' | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch verification status
        const verificationResp = await fetch(`${API_BASE_URL}/api/verification/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (verificationResp.ok) {
          const verificationData = await verificationResp.json();
          setVerificationStatus(verificationData.verification?.status || null);
        }

        // Fetch payments
        const paymentsResp = await fetch(`${API_BASE_URL}/api/payments/student`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (paymentsResp.ok) {
          const paymentsData = await paymentsResp.json();
          setPayments(paymentsData.map((payment: any) => ({
            id: payment._id,
            amount: payment.amount,
            type: payment.type,
            status: payment.status,
            dueDate: payment.dueDate,
            paidDate: payment.paidDate,
            description: `${payment.type.charAt(0).toUpperCase() + payment.type.slice(1)} Payment`
          })));
        }

        // Fetch bookings
        const bookingsResp = await fetch(`${API_BASE_URL}/api/bookings/student`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (bookingsResp.ok) {
          const bookingsData = await bookingsResp.json();
          setBookings(bookingsData.map((booking: any) => ({
            id: booking._id,
            propertyId: booking.propertyId,
            checkInDate: booking.checkInDate,
            status: booking.status
          })));
        }

        // Fetch maintenance requests
        const maintenanceResp = await fetch(`${API_BASE_URL}/api/maintenance/student`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (maintenanceResp.ok) {
          const maintenanceData = await maintenanceResp.json();
          setMaintenanceRequests(maintenanceData.map((req: any) => ({
            id: req._id,
            title: req.title,
            description: req.description,
            status: req.status,
            createdAt: req.createdAt
          })));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'student') {
      fetchDashboardData();
    }
  }, [user]);

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
      <Icon className="h-4 w-4 mr-2" />
      {label}
      <span
        className={`pointer-events-none absolute -bottom-1 left-3 right-3 h-0.5 rounded bg-pink-600 transition-all duration-300 ${
          activeTab === id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
        }`}
      />
    </button>
  );

  const handleSubmitMaintenance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const maintenanceData = {
      propertyId: bookings[0]?.propertyId?._id, // Use first booking's property
      title: formData.get('title'),
      description: formData.get('description'),
      type: formData.get('type')
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(maintenanceData),
      });

      if (response.ok) {
        alert('Maintenance request submitted successfully!');
        // Refresh maintenance requests
        const maintenanceResp = await fetch(`${API_BASE_URL}/api/maintenance/student`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (maintenanceResp.ok) {
          const maintenanceData = await maintenanceResp.json();
          setMaintenanceRequests(maintenanceData.map((req: any) => ({
            id: req._id,
            title: req.title,
            description: req.description,
            status: req.status,
            createdAt: req.createdAt
          })));
        }
      }
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Verification Status */}
        {!user?.verified && (
          <Card className="mb-8 border-l-4 border-yellow-500 bg-yellow-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-yellow-800">
                  {verificationStatus === 'rejected' ? 'Verification Rejected' : 
                   verificationStatus === 'pending' ? 'Verification Pending' : 'Verification Required'}
                </h3>
                <p className="text-yellow-700 text-sm">
                  {verificationStatus === 'rejected' && 'Please review your documents and resubmit your verification.'}
                  {verificationStatus === 'pending' && 'We are reviewing your documents. This usually takes 24-48 hours.'}
                  {(!verificationStatus || verificationStatus === null) && 'Complete your verification to unlock all features and gain landlord trust.'}
                </p>
              </div>
              <Button 
                onClick={() => navigate('/verify')} 
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {verificationStatus === 'pending' ? 'View Status' : 'Verify Now'}
              </Button>
            </div>
          </Card>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <TabButton id="overview" label="Overview" icon={TrendingUp} />
            <TabButton id="bookings" label="My Bookings" icon={Calendar} />
            <TabButton id="payments" label="Payments" icon={CreditCard} />
            <TabButton id="bookmarks" label="Saved Properties" icon={Heart} />
            <TabButton id="securesphere" label="SecureSphere" icon={Shield} />
            <TabButton id="maintenance" label="Maintenance" icon={Wrench} />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Due Card */}
            <Card className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Payment Due</h3>
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="mb-6">
                <div className="text-3xl font-bold mb-2">
                  ₹{payments.find(p => p.status === 'pending')?.amount.toLocaleString() || '0'}
                </div>
                <div className="text-pink-100">
                  Due: {payments.find(p => p.status === 'pending')?.dueDate ? 
                    new Date(payments.find(p => p.status === 'pending')!.dueDate).toLocaleDateString() : 'No pending payments'}
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full bg-white text-pink-600 border-white hover:bg-gray-50"
                onClick={() => setActiveTab('payments')}
              >
                Pay Now
              </Button>
            </Card>

            {/* Payment History */}
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Payments</h3>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="space-y-3">
                {payments.slice(0, 4).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <div className="font-medium">
                        {new Date(payment.paidDate || payment.dueDate).toLocaleDateString()} - {payment.description}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">₹{payment.amount.toLocaleString()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payment.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status === 'paid' ? '✓ Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
                {payments.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No payment history found
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="cursor-pointer hover:shadow-lg transition-shadow h-full" onClick={() => setActiveTab('bookings')}>
                <Card className="text-center h-full">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold mb-2">My Lease</h3>
                  <Button variant="ghost" size="sm">View & Download</Button>
                </Card>
              </div>

              <div className="cursor-pointer hover:shadow-lg transition-shadow h-full" onClick={() => setActiveTab('maintenance')}>
                <Card className="text-center h-full">
                  <Wrench className="h-12 w-12 mx-auto mb-4 text-orange-600" />
                  <h3 className="font-semibold mb-2">Maintenance Requests</h3>
                  <Button variant="ghost" size="sm">Submit a Request</Button>
                </Card>
              </div>

              <div className="cursor-pointer hover:shadow-lg transition-shadow h-full" onClick={() => setActiveTab('bookmarks')}>
                <Card className="text-center h-full">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-pink-600" />
                  <h3 className="font-semibold mb-2">Saved Properties</h3>
                  <div className="text-2xl font-bold text-pink-600 mt-4">
                    {bookmarks.length}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">Properties saved</div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <h3 className="text-lg font-semibold mb-4">Payment History</h3>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{payment.description}</div>
                      <div className="text-sm text-gray-600">
                        {payment.paidDate 
                          ? `Paid on ${new Date(payment.paidDate).toLocaleDateString()}`
                          : `Due on ${new Date(payment.dueDate).toLocaleDateString()}`
                        }
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{payment.amount.toLocaleString()}</div>
                      <div className={`text-sm px-2 py-1 rounded-full ${
                        payment.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status === 'paid' ? 'Paid' : 'Pending'}
                      </div>
                    </div>
                  </div>
                ))}
                {payments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No payment history found
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4">Upcoming Payments</h3>
              {payments.filter(p => p.status === 'pending').length > 0 ? (
                payments.filter(p => p.status === 'pending').map((payment) => (
                  <div key={payment.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{payment.description}</div>
                        <div className="text-sm text-gray-600">
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">₹{payment.amount.toLocaleString()}</div>
                        <Button size="sm" className="mt-2">Pay Now</Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No upcoming payments
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'bookings' && (
          <Card>
            <h3 className="text-lg font-semibold mb-6">My Bookings</h3>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{booking.propertyId.title}</h4>
                        <p className="text-sm text-gray-600">
                          Check-in: {new Date(booking.checkInDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">{booking.propertyId.location}</p>
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
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h4>
                <p className="text-gray-600 mb-4">Start exploring properties to make your first booking</p>
                <Button onClick={() => navigate('/find-homes')}>
                  Find Properties
                </Button>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'bookmarks' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Saved Properties ({bookmarks.length})</h3>
              <Button onClick={() => navigate('/find-homes')} variant="outline">
                Find More Properties
              </Button>
            </div>
            {bookmarks.length > 0 ? (
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
            ) : (
              <Card className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No saved properties</h4>
                <p className="text-gray-600 mb-4">Save properties you like to view them later</p>
                <Button onClick={() => navigate('/find-homes')}>
                  Explore Properties
                </Button>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'securesphere' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-pink-600" />
                  SecureSphere - Property Security Scores
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  View security scores for your saved and booked properties
                </p>
              </div>
            </div>

            {/* Booked Properties Security */}
            {bookings.length > 0 && (
              <div className="mb-8">
                <h4 className="text-md font-semibold mb-4 text-gray-800">My Booked Properties</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookings.map((booking) => {
                    const propertyId = booking.propertyId._id || booking.id;
                    return (
                      <Card key={booking.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => navigate(`/property/${propertyId}/securesphere`)}>
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900 truncate">{booking.propertyId.title}</h5>
                          <Shield className="h-5 w-5 text-pink-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{booking.propertyId.location}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Overall Score</span>
                            <span className="font-bold text-pink-600">Loading...</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-pink-600 h-2 rounded-full animate-pulse" style={{width: '0%'}}></div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/property/${propertyId}/securesphere`);
                          }}
                        >
                          View Security Details
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Saved Properties Security */}
            {bookmarks.length > 0 && (
              <div className="mb-8">
                <h4 className="text-md font-semibold mb-4 text-gray-800">Saved Properties</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookmarks.map((property) => {
                    const propertyId = property.id || property._id;
                    return (
                      <Card key={propertyId} className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => navigate(`/property/${propertyId}/securesphere`)}>
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900 truncate">{property.title}</h5>
                          <Shield className="h-5 w-5 text-pink-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{property.location}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Overall Score</span>
                            <span className="font-bold text-pink-600">Loading...</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-pink-600 h-2 rounded-full animate-pulse" style={{width: '0%'}}></div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/property/${propertyId}/securesphere`);
                          }}
                        >
                          View Security Details
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {bookings.length === 0 && bookmarks.length === 0 && (
              <Card className="text-center py-12">
                <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Properties to Analyze</h4>
                <p className="text-gray-600 mb-4">
                  Save or book properties to view their SecureSphere security scores
                </p>
                <Button onClick={() => navigate('/find-homes')}>
                  Explore Properties
                </Button>
              </Card>
            )}

            {/* Info Card */}
            <Card className="bg-blue-50 border border-blue-200 mt-8">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">About SecureSphere</h4>
                  <p className="text-blue-800 text-sm">
                    SecureSphere provides security scores based on three key factors:
                  </p>
                  <ul className="text-blue-800 text-sm mt-2 space-y-1">
                    <li>• <strong>Connectivity:</strong> Internet, transport, and communication access</li>
                    <li>• <strong>Crime Record:</strong> Safety statistics for the area (lower is better)</li>
                    <li>• <strong>Essential Services:</strong> Hospitals, police stations, and emergency services nearby</li>
                  </ul>
                  <p className="text-blue-800 text-sm mt-3">
                    Each property also includes emergency SOS contacts for immediate assistance.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Maintenance Requests</h3>
                <Button size="sm" onClick={() => document.getElementById('maintenance-form')?.scrollIntoView()}>
                  New Request
                </Button>
              </div>
              <div className="space-y-4">
                {maintenanceRequests.map((request) => (
                  <div key={request.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{request.title}</h4>
                        <p className="text-sm text-gray-600">{request.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        request.status === 'resolved' 
                          ? 'bg-green-100 text-green-800' 
                          : request.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))}
                {maintenanceRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No maintenance requests yet
                  </div>
                )}
              </div>
            </Card>

            <Card id="maintenance-form">
              <h3 className="text-lg font-semibold mb-4">Submit New Request</h3>
              <form onSubmit={handleSubmitMaintenance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                  <select 
                    name="type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  >
                    <option value="">Select issue type</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="AC/Heating">AC/Heating</option>
                    <option value="Internet/WiFi">Internet/WiFi</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Brief title of the issue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    name="description"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Describe the issue in detail..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Submit Request
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;