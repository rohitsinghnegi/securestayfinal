import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  translated?: string;
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
}

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (chatId: string, content: string, senderId: string, receiverId: string) => void;
  createChat: (participantId: string) => Chat;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  const sendMessage = (chatId: string, content: string, senderId: string, receiverId: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId,
      receiverId,
      content,
      timestamp: new Date()
    };

    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, messages: [...chat.messages, newMessage], lastMessage: newMessage }
        : chat
    ));
  };

  const createChat = (participantId: string): Chat => {
    const newChat: Chat = {
      id: Date.now().toString(),
      participants: ['current-user', participantId],
      messages: []
    };

    setChats(prev => [...prev, newChat]);
    return newChat;
  };

  return (
    <ChatContext.Provider value={{ chats, activeChat, setActiveChat, sendMessage, createChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};