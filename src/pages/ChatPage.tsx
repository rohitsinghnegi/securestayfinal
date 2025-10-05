import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Send, Search, MoreVertical, Phone, Video, ArrowLeft, 
  Image, Paperclip, Smile, Mic, CheckCheck, Users, 
  UserPlus, Wifi, WifiOff, Circle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: string;
}

interface OnlineUser {
  userId: string;
  name: string;
  role: string;
  socketId: string;
}

interface Message {
  _id: string;
  conversation: string;
  sender: User;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Conversation {
  _id: string;
  participants: User[];
  type: 'direct' | 'group';
  lastMessage?: Message;
  messageCount: number;
  unreadCount?: number;
  updatedAt: string;
}

interface ConnectionRequest {
  id?: string;
  fromUserId: string;
  fromUserName: string;
  fromUserRole: string;
  message: string;
}

interface TypingUser {
  userId: string;
  userName: string;
  role: string;
}

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real-time features
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize Socket.io connection
  const initializeSocket = () => {
    if (!user) return;

    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      
      // Authenticate user with server
      newSocket.emit('authenticate', {
        userId: user.id,
        userName: user.name,
        userRole: user.role
      });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle online users
    newSocket.on('online_users', (users: OnlineUser[]) => {
      // Deduplicate by userId
      const uniqueUsers = Array.from(
        new Map(users.map(u => [u.userId, u])).values()
      );
      setOnlineUsers(uniqueUsers);
    });

    newSocket.on('user_online', (userData: OnlineUser) => {
      setOnlineUsers(prev => {
        // Remove any existing entry for this user
        const filtered = prev.filter(u => u.userId !== userData.userId);
        return [...filtered, userData];
      });
    });

    newSocket.on('user_offline', (userData: { userId: string }) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== userData.userId));
    });

    // Handle real-time messages
    newSocket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      // Update conversations list
      fetchConversations();
    });

    // Handle typing indicators
    newSocket.on('user_typing', (data: TypingUser & { typing: boolean }) => {
      if (data.typing) {
        setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
      } else {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      }
    });

    // Handle connection requests
    newSocket.on('connection_request', (request: ConnectionRequest) => {
      console.log('📨 Received connection request:', request);
      
      // Use functional update to avoid stale closure
      setConnectionRequests(prev => {
        // Check if request already exists to avoid duplicates
        const exists = prev.some(r => r.fromUserId === request.fromUserId);
        if (exists) {
          console.log('⚠️ Duplicate request ignored');
          return prev;
        }
        
        const updated = [...prev, request];
        console.log('📋 Updated connection requests count:', updated.length);
        console.log('📋 Connection requests:', updated);
        return updated;
      });
    });

    newSocket.on('connection_accepted', async (data: { byUserId: string; byUserName: string; byUserRole: string }) => {
      console.log('🎉 Connection accepted:', data);
      alert(`${data.byUserName} accepted your connection request!`);
      
      // Automatically start a conversation
      console.log('🆕 Creating conversation with:', data.byUserId);
      await startConversation(data.byUserId, data.byUserRole, `Hi! Thanks for accepting my connection request.`);
      
      // Force refresh conversations
      console.log('🔄 Refreshing conversations after acceptance notification...');
      await fetchConversations();
      console.log('✅ Conversations refreshed');
    });

    newSocket.on('connection_rejected', (data: { byUserId: string; byUserName: string }) => {
      alert(`${data.byUserName} declined your connection request.`);
    });

    // Handle new conversation notifications
    newSocket.on('new_conversation_created', async (data: { conversationId: string; message: string }) => {
      console.log('🆕 New conversation created:', data);
      console.log('🔄 Refreshing conversations list...');
      // Refresh conversations to show the new one
      await fetchConversations();
      console.log('✅ Conversations refreshed');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  };

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      console.log('📥 Fetching conversations...');
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Fetched ${data.data?.length || 0} conversations:`, data.data);
        setConversations(data.data || []);
      } else {
        console.error('❌ Failed to fetch conversations:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
    }
  };

  // Fetch available users for connection
  const fetchAvailableUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const targetRole = user?.role === 'student' ? 'landlord' : 'student';
      
      console.log(`📥 Fetching available ${targetRole}s...`);
      const response = await fetch(`/api/chat/users/${targetRole}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Fetched ${data.data?.length || 0} available users:`, data.data);
        // Verify each user has an id field
        const usersWithId = (data.data || []).map((u: any) => {
          if (!u.id && u._id) {
            console.warn('⚠️ User missing id field, using _id:', u);
            return { ...u, id: u._id.toString() };
          }
          return u;
        });
        setAvailableUsers(usersWithId);
      }
    } catch (error) {
      console.error('❌ Error fetching available users:', error);
    }
  };

  // Fetch messages for active conversation
  const fetchMessages = async (conversationId: string) => {
    if (!conversationId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
        
        // Mark messages as read
        await fetch(`/api/chat/conversations/${conversationId}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send message with real-time support
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/conversations/${activeConversation._id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageContent,
          type: 'text'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.data]);
        
        // Send real-time message via Socket.io
        if (socket) {
          socket.emit('send_message', {
            conversationId: activeConversation._id,
            message: data.data
          });
        }
        
        // Update conversations list
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  // Start a new conversation
  const startConversation = async (participantId: string, participantType: string, initialMessage?: string) => {
    console.log('Starting conversation with:', { participantId, participantType, initialMessage });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/conversations/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId,
          participantType,
          initialMessage: initialMessage || ''
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Conversation started successfully:', data);
        
        // Set the active conversation
        setActiveConversation(data.data);
        
        // Refresh conversations list
        await fetchConversations();
        
        // Join the conversation room via socket
        if (socket && data.data._id) {
          socket.emit('join_conversation', data.data._id);
          console.log('✅ Joined conversation room:', data.data._id);
        }
        
        // Close modals
        setShowOnlineUsers(false);
        
        // Notify the other participant to refresh their conversation list
        if (socket && data.data.participants) {
          const otherParticipant = data.data.participants.find((p: any) => p.id !== user?.id);
          if (otherParticipant) {
            socket.emit('conversation_created', {
              conversationId: data.data._id,
              targetUserId: otherParticipant.id
            });
          }
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to start conversation:', errorData);
        alert('Failed to create conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  // Send connection request
  const sendConnectionRequest = (targetUserId: string, targetUserName: string) => {
    console.log('📤 Sending connection request to:', { targetUserId, targetUserName });
    console.log('🔌 Socket connected:', socket?.connected);
    console.log('🔌 Socket exists:', !!socket);
    console.log('👤 Current user:', user);
    
    const token = localStorage.getItem('token');
    // Always persist request; also try realtime if socket is connected
    fetch('/api/chat/requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ toUserId: targetUserId, message: `Hi ${targetUserName}! I'd like to connect with you for property discussions.` })
    }).then(() => {
      if (socket && socket.connected) {
        const requestData = {
          toUserId: targetUserId,
          message: `Hi ${targetUserName}! I'd like to connect with you for property discussions.`
        };
        console.log('📨 Emitting send_connection_request with:', requestData);
        socket.emit('send_connection_request', requestData);
      }
      alert(`Connection request sent to ${targetUserName}!`);
    }).catch(err => {
      console.error('❌ Failed to persist request', err);
      alert('Failed to send request');
    });
  };

  // Accept connection request (works even if requester is offline)
  const acceptConnectionRequest = async (request: ConnectionRequest) => {
    console.log('✅ Accepting connection request:', request);
    const token = localStorage.getItem('token');
    try {
      // If we have an id (persisted request), accept via API
      if (request.id) {
        const resp = await fetch(`/api/chat/requests/${request.id}/accept`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          // Set active conversation and refresh
          setActiveConversation(data.data);
          await fetchConversations();
        }
      } else {
        // Fallback: start conversation directly
        await startConversation(request.fromUserId, request.fromUserRole, 'Hi! I accepted your connection request. Let\'s chat!');
        await fetchConversations();
      }
      // Best-effort realtime notify requester
      if (socket) {
        socket.emit('accept_connection', { fromUserId: request.fromUserId });
      }
      setConnectionRequests(prev => prev.filter(r => r.fromUserId !== request.fromUserId));
    } catch (e) {
      console.error('❌ Failed to accept request:', e);
    }
  };

  // Reject connection request
  const rejectConnectionRequest = (request: ConnectionRequest) => {
    if (socket) {
      socket.emit('reject_connection', {
        fromUserId: request.fromUserId
      });
      
      // Remove from requests
      setConnectionRequests(prev => prev.filter(r => r.fromUserId !== request.fromUserId));
    }
  };

  // Handle typing
  const handleTyping = () => {
    if (socket && activeConversation) {
      socket.emit('typing', {
        conversationId: activeConversation._id
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', {
          conversationId: activeConversation._id
        });
      }, 1000);
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      handleTyping();
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize everything when component mounts
  useEffect(() => {
    if (user && !socket) {
      console.log('🔌 Initializing socket for user:', user.name);
      initializeSocket();
      fetchConversations();
      // fetch persisted pending requests so receiver sees them even if sender is offline
      const token = localStorage.getItem('token');
      fetch('/api/chat/requests', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(body => {
          if (body?.success && Array.isArray(body.data)) {
            setConnectionRequests(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const merged = [...prev];
              for (const req of body.data) {
                if (!existingIds.has(req.id)) merged.push({
                  id: req.id,
                  fromUserId: req.fromUserId,
                  fromUserName: req.fromUserName || 'User',
                  fromUserRole: req.fromUserRole,
                  message: req.message
                });
              }
              return merged;
            });
          }
        })
        .catch(() => {});
      fetchAvailableUsers();
    }

    return () => {
      if (socket) {
        console.log('🔌 Disconnecting socket');
        socket.disconnect();
      }
    };
  }, [user]); // Only run when user changes

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join conversation room when active conversation changes
  useEffect(() => {
    if (activeConversation && socket) {
      socket.emit('join_conversation', activeConversation._id);
      fetchMessages(activeConversation._id);
      
      return () => {
        socket.emit('leave_conversation', activeConversation._id);
      };
    }
  }, [activeConversation, socket]);

  const getOtherParticipant = (conversation: Conversation): User | null => {
    return conversation.participants.find(p => p.id !== user?.id) || null;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherParticipant(conv);
    return otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Log connection requests for debugging
  console.log('🔔 Connection requests count:', connectionRequests.length);
  console.log('📋 Connection requests:', connectionRequests);

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Connection Requests Modal */}
      {connectionRequests.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Connection Requests</h3>
            {connectionRequests.map((request) => (
              <div key={request.fromUserId} className="border-b border-gray-200 pb-4 mb-4 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{request.fromUserName}</p>
                    <p className="text-sm text-gray-600 capitalize">{request.fromUserRole}</p>
                    <p className="text-sm text-gray-500 mt-1">{request.message}</p>
                  </div>
                </div>
                <div className="flex space-x-2 mt-3">
                  <Button 
                    onClick={() => acceptConnectionRequest(request)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Accept
                  </Button>
                  <Button 
                    onClick={() => rejectConnectionRequest(request)}
                    variant="outline"
                    size="sm"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Online Users Modal */}
      {showOnlineUsers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Connect with {user?.role === 'student' ? 'Landlords' : 'Students'}
              </h3>
              <button 
                onClick={() => setShowOnlineUsers(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">Online Now</h4>
              {onlineUsers.filter(u => u.role !== user?.role).map((onlineUser) => (
                <div key={onlineUser.userId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {onlineUser.name.charAt(0).toUpperCase()}
                      </div>
                      <Circle className="w-3 h-3 text-green-500 fill-current absolute -bottom-1 -right-1" />
                    </div>
                    <div>
                      <p className="font-medium">{onlineUser.name}</p>
                      <p className="text-sm text-gray-600 capitalize">{onlineUser.role}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => sendConnectionRequest(onlineUser.userId, onlineUser.name)}
                    size="sm"
                  >
                    Connect
                  </Button>
                </div>
              ))}
              
              <h4 className="font-medium text-gray-600 mt-6">All Available</h4>
              {availableUsers.map((availableUser) => (
                <div key={availableUser.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {availableUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{availableUser.name}</p>
                      <p className="text-sm text-gray-600 capitalize">{availableUser.role}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => sendConnectionRequest(availableUser.id, availableUser.name)}
                    size="sm"
                    variant="outline"
                  >
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-gray-800">Chats</h1>
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowOnlineUsers(true)}
                className="p-2 hover:bg-gray-100 rounded-full relative"
                title="Connect with users"
              >
                <UserPlus className="w-5 h-5 text-gray-600" />
                {onlineUsers.filter(u => u.role !== user?.role).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {onlineUsers.filter(u => u.role !== user?.role).length}
                  </span>
                )}
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => {
            const otherUser = getOtherParticipant(conversation);
            return (
              <div
                key={conversation._id}
                onClick={() => {
                  console.log('💬 Switching to conversation:', conversation._id);
                  setActiveConversation(conversation);
                }}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  activeConversation?._id === conversation._id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {otherUser?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {otherUser?.name || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.updatedAt)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {conversation.lastMessage?.sender.id === user?.id ? 'You: ' : ''}
                      </span>
                      {/* {conversation.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-5 text-center">
                          {conversation.unreadCount}
                        </span>
                      )} */}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredConversations.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500">
              <p className="font-medium text-gray-700">No conversations yet</p>
              <p className="text-sm mt-2 mb-4">Connect with {user?.role === 'student' ? 'landlords' : 'students'} to start chatting</p>
              <button
                onClick={() => setShowOnlineUsers(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Find People to Connect
              </button>
            </div>
          )}
          
          {loading && (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm">Loading conversations...</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${activeConversation ? 'flex' : 'hidden md:flex'}`}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setActiveConversation(null)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {getOtherParticipant(activeConversation)?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {getOtherParticipant(activeConversation)?.name || 'Unknown User'}
                    </h2>
                    <p className="text-sm text-gray-500">Online</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Video className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((message, index) => {
                    const isCurrentUser = message.sender.id === user?.id;
                    const previousMessage = index > 0 ? messages[index - 1] : null;
                    const showSenderName = !isCurrentUser && (!previousMessage || previousMessage.sender.id !== message.sender.id);
                    const isConsecutive = previousMessage && previousMessage.sender.id === message.sender.id;
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}
                      >
                        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                          {/* Sender name for received messages - only show when sender changes */}
                          {showSenderName && (
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {message.sender.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <span className="text-xs font-medium text-gray-600">{message.sender.name}</span>
                            </div>
                          )}
                          
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              isCurrentUser
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                            } ${isConsecutive && !isCurrentUser ? 'rounded-tl-sm' : ''} ${isConsecutive && isCurrentUser ? 'rounded-tr-sm' : ''}`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center justify-end space-x-1 mt-1 ${
                              isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <span className="text-xs">{formatTime(message.createdAt)}</span>
                              {isCurrentUser && (
                                <CheckCheck className={`w-3 h-3 ${message.read ? 'text-blue-200' : ''}`} />
                              )}
                            </div>
                          </div>
                          
                          {/* Show "You" label for current user's first message in a group */}
                          {isCurrentUser && !isConsecutive && (
                            <div className="text-xs text-gray-500 mt-1 mr-2 text-right">
                              You
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {/* Typing indicators */}
                  {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-gray-200 rounded-2xl rounded-bl-none px-4 py-2 max-w-xs">
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">
                            {typingUsers[0].userName} is typing...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}

              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <Send className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Image className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sending}
                  />
                </div>
                
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Smile className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Mic className="w-5 h-5 text-gray-600" />
                </button>
                
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className={`p-3 rounded-full ${
                    newMessage.trim() && !sending
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  } transition-colors`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your Messages</h2>
              <p className="text-gray-500 mb-6">Select a conversation to start messaging</p>
              <Button onClick={() => setShowOnlineUsers(true)}>
                Start New Conversation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;