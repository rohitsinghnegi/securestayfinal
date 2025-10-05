import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock,
  FileText,
  Play,
  BookOpen
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'account' | 'property' | 'verification' | 'booking' | 'technical'>('account');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [supportTicket, setSupportTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'technical'
  });

  const categories = [
    { id: 'account', label: 'Account & Billing', active: true },
    { id: 'property', label: 'Property Listings', active: false },
    { id: 'verification', label: 'Verification', active: true },
    { id: 'booking', label: 'Booking & Payments', active: false },
    { id: 'technical', label: 'Technical Support', active: false }
  ] as const;

  const faqs = [
    {
      id: '1',
      question: 'How do I verify my student status?',
      answer: 'To verify your student status, go to your profile settings and upload your college ID and Aadhaar card. Our AI system will verify your documents within 24-48 hours.',
      category: 'verification'
    },
    {
      id: '2',
      question: 'When will I receive my rent payment?',
      answer: 'Rent payments are processed monthly and typically reach your account within 2-3 business days after the tenant makes the payment.',
      category: 'account'
    },
    {
      id: '3',
      question: 'What happens if I need maintenance?',
      answer: 'You can submit a maintenance request through your dashboard. The landlord will be notified immediately and you can track the status of your request.',
      category: 'booking'
    },
    {
      id: '4',
      question: 'How do I list my property?',
      answer: 'Click on "List Your Property" in the header, fill out the property details form, upload photos, and set your pricing. Your listing will be reviewed and published within 24 hours.',
      category: 'property'
    },
    {
      id: '5',
      question: 'Is my personal information secure?',
      answer: 'Yes, we use bank-level encryption to protect your data. Personal information is only shared with verified landlords when you make a booking request.',
      category: 'account'
    }
  ] as const;

  const guides = [
    {
      id: '1',
      title: 'Listing Your First Property',
      description: 'Step-by-step guide to create your first property listing',
      type: 'guide',
      duration: '5 min read',
      url: '#'
    },
    {
      id: '2',
      title: 'Video: How to Verify Your Student Status',
      description: 'Watch this video to learn the verification process',
      type: 'video',
      duration: '3 min watch',
      url: '#'
    },
    {
      id: '3',
      title: 'Understanding Your Lease Agreement',
      description: 'Important things to know about your rental agreement',
      type: 'guide',
      duration: '8 min read',
      url: '#'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = faq.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleFAQToggle = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Support ticket submitted:', supportTicket);
    // Reset form
    setSupportTicket({
      subject: '',
      description: '',
      priority: 'medium',
      category: 'technical'
    });
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    console.log('Chat message:', chatMessage);
    setChatMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">How Can We Help You</h1>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs, troubleshooting..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-full focus:outline-none focus:border-pink-500 bg-white shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-800'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Contact Options */}
            <Card className="mt-6">
              <h3 className="font-semibold mb-4">Contact Support</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  support@securestays.com
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  1800-SAFE-STAY (Mon-Fri, 9 AM - 5 PM)
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Average response time: 2 hours
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* FAQ Section */}
            <Card>
              <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions (FAQs)</h2>
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => handleFAQToggle(faq.id)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      {expandedFAQ === faq.id ? (
                        <Minus className="h-5 w-5 text-pink-600" />
                      ) : (
                        <Plus className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
                {filteredFAQs.length === 0 && (
                  <div className="text-sm text-gray-500">No FAQs found for this category/search.</div>
                )}
              </div>
            </Card>

            {/* Guides and Tutorials */}
            <Card>
              <h2 className="text-xl font-semibold mb-6">Guides & Tutorials</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guides.map((guide) => (
                  <div key={guide.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {guide.type === 'video' ? (
                          <Play className="h-5 w-5 text-pink-600" />
                        ) : (
                          <BookOpen className="h-5 w-5 text-pink-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{guide.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{guide.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{guide.duration}</span>
                          <Button size="sm" variant="outline">
                            {guide.type === 'video' ? 'Watch' : 'Read'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Contact Form */}
            <Card>
              <h2 className="text-xl font-semibold mb-6">Contact Us</h2>
              <form onSubmit={handleSupportSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={supportTicket.category}
                      onChange={(e) => setSupportTicket(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing Question</option>
                      <option value="property">Property Listing</option>
                      <option value="verification">Verification</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={supportTicket.priority}
                      onChange={(e) => setSupportTicket(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Subject"
                  value={supportTicket.subject}
                  onChange={(e) => setSupportTicket(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                  <textarea
                    value={supportTicket.description}
                    onChange={(e) => setSupportTicket(prev => ({ ...prev, description: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Please provide as much detail as possible about your issue..."
                    required
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <Button type="submit" className="flex-1">
                    Submit Ticket
                  </Button>
                  <Button type="button" variant="outline" className="px-8">
                    <FileText className="h-4 w-4 mr-2" />
                    Attach File
                  </Button>
                </div>
              </form>
            </Card>

            {/* AI Chatbot */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">AI Assistant</h2>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">English</Button>
                  <Button size="sm" variant="ghost">हिंदी</Button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4 h-40 overflow-y-auto">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm max-w-xs">
                    <p className="text-sm">Hello! I'm your AI assistant. How can I help you today?</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleChatSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <Button type="submit">Send</Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;