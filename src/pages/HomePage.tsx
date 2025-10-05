import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Shield, Search, Home as HomeIcon, Star, 
  CheckCircle, Zap, Users, TrendingUp, Award, MapPin, Heart, Sparkles
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import PropertyCard from '../components/PropertyCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [counters, setCounters] = useState({ properties: 0, students: 0, cities: 0 });
  const API_BASE_URL: string =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
    'http://localhost:5000';

  const featuredProperties = [
    {
      id: '1',
      title: 'Spacious Shared Room',
      price: 7500,
      location: 'Near Delhi University',
      image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.8,
      reviewCount: 24,
      verified: true,
      amenities: ['wifi', 'parking', 'kitchen']
    },
    {
      id: '2',
      title: 'Cozy Studio near Park',
      price: 12000,
      location: 'Mumbai Central',
      image: 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.6,
      reviewCount: 18,
      verified: true,
      amenities: ['wifi', 'kitchen']
    },
    {
      id: '3',
      title: 'Modern 1 BHK Apartment',
      price: 15000,
      location: 'Bangalore IT Hub',
      image: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.9,
      reviewCount: 32,
      verified: true,
      amenities: ['wifi', 'parking', 'kitchen']
    }
  ];

  // Animated counters
  useEffect(() => {
    const targets = { properties: 10000, students: 50000, cities: 25 };
    const duration = 2000;
    const steps = 60;
    const increment = {
      properties: targets.properties / steps,
      students: targets.students / steps,
      cities: targets.cities / steps
    };

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setCounters({
        properties: Math.min(Math.floor(increment.properties * currentStep), targets.properties),
        students: Math.min(Math.floor(increment.students * currentStep), targets.students),
        cities: Math.min(Math.floor(increment.cities * currentStep), targets.cities)
      });
      
      if (currentStep >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const handleSearch = (query: string, filters: any) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.city) params.append('city', filters.city);
    if (filters.roomType) params.append('roomType', filters.roomType);
    if (filters.amenities?.length > 0) {
      filters.amenities.forEach((amenity: string) => params.append('amenities', amenity));
    }
    navigate(`/find-homes?${params.toString()}`);
  };

  const handlePhotoSearch = (photo: File, filters: any) => {
    navigate('/find-homes');
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleMessage = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section with Animated Background */}
      <section className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-white/10 rounded-full -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-white/10 rounded-full -bottom-48 -right-48 animate-pulse delay-1000"></div>
          <div className="absolute w-64 h-64 bg-purple-300/20 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">AI-Powered Student Housing Platform</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              Find Your Perfect
              <span className="block text-yellow-300">Student Home</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed">
              Verified properties with AI assistance. Connecting students with trusted landlords across India.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => navigate('/find-homes')}
                className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all group text-lg"
              >
                Explore Properties
                <ChevronRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 border-2 border-white bg-transparent text-white font-semibold rounded-lg hover:bg-white hover:text-purple-600 shadow-xl transition-all text-lg"
              >
                List Your Property
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-12 transform hover:scale-[1.02] transition-transform">
            <SearchBar onSearch={handleSearch} onPhotoSearch={handlePhotoSearch} />
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {counters.properties.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium">Verified Properties</div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-4xl font-bold text-pink-600 mb-2">
                {counters.students.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium">Happy Students</div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {counters.cities}+
              </div>
              <div className="text-gray-600 font-medium">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How SecureStays Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Finding your perfect student accommodation has never been easier
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                color: 'pink',
                title: 'Search Smart',
                description: 'Use our AI-powered search to find properties matching your budget, location, and preferences in seconds.',
                step: '01'
              },
              {
                icon: Shield,
                color: 'purple',
                title: 'Verified & Safe',
                description: 'Every property and landlord is thoroughly verified. Student IDs checked, documents validated for your safety.',
                step: '02'
              },
              {
                icon: HomeIcon,
                color: 'orange',
                title: 'Book Instantly',
                description: 'Chat with landlords, schedule visits, and book your perfect home. Simple, secure, and hassle-free.',
                step: '03'
              }
            ].map((item, index) => (
              <Card 
                key={index} 
                className="relative text-center p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-purple-200 group"
              >
                <div className="absolute -top-4 -right-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                  {item.step}
                </div>
                <div className={`w-20 h-20 bg-${item.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`h-10 w-10 text-${item.color}-600`} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Students Love SecureStays
            </h2>
            <p className="text-xl text-gray-600">
              Built specifically for the student community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'Instant Matches', desc: 'AI finds your perfect room' },
              { icon: CheckCircle, title: 'Verified Listings', desc: 'All properties authenticated' },
              { icon: Users, title: 'Live Chat', desc: 'Connect with landlords instantly' },
              { icon: Award, title: 'Genuine Reviews', desc: 'Real feedback from students' }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Properties</h2>
              <p className="text-gray-600">Hand-picked accommodations for students</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/find-homes')}
              className="group"
            >
              View All
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <div key={property.id} className="transform hover:scale-105 transition-transform">
                <PropertyCard
                  property={property}
                  onClick={() => handlePropertyClick(property.id)}
                  onMessage={handleMessage}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {<section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Students Say About Us
            </h2>
            <p className="text-xl text-gray-600">
              Real experiences from real students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Palak Rajput',
                university: 'SKITM',
                image: `${API_BASE_URL}/photo/219837195215e60ed13db422a03dd6a9.jpg`,
                text: 'Found my perfect room within days! The verification process made me feel completely secure. Highly recommended!'
              },
              {
                name: 'Madhawn Arya',
                university: 'Vikrant University',
                image: `${API_BASE_URL}/photo/44edb41246d62fe48180a3057f158280.jpg`,
                text: 'Amazing platform! The landlord was verified, rent was fair, and the booking process was incredibly smooth.'
              },
              {
                name: 'Rohit Negi',
                university: 'SKITM',
                image: `${API_BASE_URL}/photo/bb0d67914d2802ba88fd1ee1e7129e8c.jpg`,
                text: 'Love the AI chatbot and real-time chat features. Made finding accommodation near my college so easy!'
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-white border-gray-200 hover:shadow-2xl transition-all p-8">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full mr-4 ring-4 ring-purple-500/30"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.university}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed">"{testimonial.text}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section> }
      {/* <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold mb-4">
        What Students Say About Us
      </h2>
      <p className="text-xl text-gray-400">
        Real experiences from real students
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <Card key={index} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors p-8">
          <div className="flex items-center mb-6">
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-16 h-16 rounded-full mr-4 border-4 border-purple-500"
            />
            <div>
              <p className="font-bold text-white">{testimonial.name}</p>
              <p className="text-sm text-gray-400">{testimonial.university}</p>
            </div>
          </div>
          <div className="flex mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4">
              <Star className="text-white" />
            </div>
            <p className="text-white">{testimonial.rating}</p>
          </div>
          <p className="text-white">{testimonial.text}</p>
        </Card>
      ))}
    </div>
  </div>
</section> */}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Find Your Perfect Stay?
          </h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Join over 50,000 students who have found their ideal accommodation through SecureStays. Start your search today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-purple-600 font-bold rounded-lg shadow-xl transform hover:scale-105 transition-all text-lg"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/find-homes')}
              className="px-8 py-4 border-2 border-white bg-transparent text-white font-bold rounded-lg hover:bg-white hover:text-purple-600 transition-all text-lg"
            >
              Browse Properties
            </button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default HomePage;