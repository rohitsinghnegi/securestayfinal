import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, ArrowRight, Home, Bot, User as UserIcon, Sparkles, MessageSquare } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface PropertySuggestion {
  id: string;
  title: string;
  price: number;
  location: string;
  roomType: string;
  amenities: string[];
  description: string;
  images: string[];
  address: string;
  features: string[];
  nearbyPlaces: string[];
  link: string;
}

interface ChatResponse {
  success: boolean;
  message: string;
  properties?: PropertySuggestion[];
  propertiesCount?: number;
  isFallback?: boolean;
}

const Chatbot: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi, I am your SecureStays Assistant! 👋\n\nI'm here to help you find the perfect student accommodation. Whether you're looking for budget-friendly rooms, premium apartments, or have specific requirements like WiFi, parking, or proximity to your university - just ask me!\n\nYou can also ask me about rental agreements, safety tips, or anything related to student housing. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [suggestedProperties, setSuggestedProperties] = useState<PropertySuggestion[]>([]);
  const recognitionRef = useRef<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    "Show me properties under ₹10,000",
    "Find studio apartments in Indore",
    "Properties with WiFi and parking",
    "Rooms near universities"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, suggestedProperties]);

  // Setup SpeechRecognition
  useEffect(() => {
    const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setInputMessage(prev => (prev ? prev + ' ' : '') + transcript.trim());
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      try {
        recognitionRef.current.start();
      } catch {
        // ignore double start errors
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSuggestedProperties([]); // Clear previous properties

    // Typing indicator on
    setIsTyping(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse error response as JSON:', jsonError);
          throw new Error(`HTTP ${response.status}: Server returned non-JSON response`);
        }
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to get response from AI`);
      }

      const data: ChatResponse = await response.json();
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Set suggested properties if available
      if (data.properties && data.properties.length > 0) {
        setSuggestedProperties(data.properties);
      }
    } catch (error) {
      console.error('Error sending message to AI:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error processing your request. Please try again or rephrase your question.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center">
                  SecureStays AI Assistant
                  <Sparkles className="h-4 w-4 ml-2 text-purple-500" />
                </h1>
                <p className="text-sm text-gray-500">Powered by Google Gemini</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Messages */}
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`flex items-start space-x-3 max-w-3xl ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    msg.type === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                      : 'bg-gradient-to-br from-pink-500 to-purple-600'
                  }`}>
                    {msg.type === 'user' ? (
                      <UserIcon className="h-5 w-5 text-white" />
                    ) : (
                      <Bot className="h-5 w-5 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex-1 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block rounded-2xl px-5 py-3 ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        : 'bg-white shadow-md border border-gray-100 text-gray-800'
                    }`}>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-xs mt-2 ${
                        msg.type === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-start space-x-3 max-w-3xl">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-white shadow-md border border-gray-100 rounded-2xl px-5 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Property Suggestions */}
            {suggestedProperties.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
                  Recommended Properties
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestedProperties.map((property) => (
                    <div 
                      key={property.id} 
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100"
                      onClick={() => navigate(property.link)}
                    >
                      <div className="relative h-48">
                        <img 
                          src={property.images[0] || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=500'} 
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-md">
                          <span className="text-sm font-bold text-purple-600">₹{property.price.toLocaleString()}/mo</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 mb-2 line-clamp-1">{property.title}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{property.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{property.location}</span>
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full capitalize">
                            {property.roomType}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-md"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here... (Press Enter to send)"
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 resize-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                rows={1}
                style={{ minHeight: '50px', maxHeight: '120px' }}
              />
            </div>

            {/* Voice Button */}
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-full transition-all duration-200 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              title="Voice input"
            >
              <Mic className={`h-5 w-5 ${isRecording ? 'text-white' : 'text-gray-700'}`} />
            </button>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className={`p-3 rounded-full transition-all duration-200 ${
                inputMessage.trim() && !isTyping
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 cursor-not-allowed'
              }`}
            >
              <Send className={`h-5 w-5 ${inputMessage.trim() && !isTyping ? 'text-white' : 'text-gray-400'}`} />
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-3 text-center">
            Powered by Google Gemini AI • Your conversations are secure and private
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;