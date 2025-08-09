import React, { useState, useEffect } from 'react';
import ChatList from '../component/ChatList';
import ChatWindow from '../component/ChatWindow';
import axios from 'axios';
import { API_URL } from '../utils'; // e.g. "http://localhost:8000/whats"
import { socket } from '../socket';
import { Menu } from 'lucide-react';

const Home = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [showChatList, setShowChatList] = useState(false);

  // Fetch chat users once
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get(`${API_URL}/getuser`);
        setChats(res.data);
        console.log("Fetched chats:", res.data);
      } catch (err) {
        console.error("❌ Failed to load chat users:", err);
      }
    };
    fetchChats();
  }, []);

  // Fetch messages when selectedChat changes
  useEffect(() => {
    if (!selectedChat?.wa_id) return;

    const fetchMessages = async (wa_id) => {
      try {
        const res = await axios.get(`${API_URL}/messages/${wa_id}`);
        const messagesWithNames = res.data.map((msg) => ({
          ...msg,
          name: msg.name && msg.name.trim() !== '' ? msg.name : selectedChat.name || '',
        }));
        setMessages(messagesWithNames);
        console.log("Fetched messages:", messagesWithNames);
      } catch (err) {
        console.error("❌ Failed to load messages:", err);
      }
    };

    fetchMessages(selectedChat.wa_id);
  }, [selectedChat]);

  // Update chat last message preview
  const updateChatLastMessage = (wa_id, lastMessage, lastTimestamp, name = '') => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.wa_id === wa_id
          ? {
              ...chat,
              lastMessage,
              lastTimestamp,
              name: name.trim() !== '' ? name : chat.name,
            }
          : chat
      )
    );
  };

  // Socket listener for new incoming messages
  useEffect(() => {
    const handleNewMessage = (message) => {
      const messageWithName = {
        ...message,
        name: message.name && message.name.trim() !== '' ? message.name : selectedChat?.name || '',
      };

      if (messageWithName.wa_id === selectedChat?.wa_id) {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === messageWithName.id)) return prev;
          return [...prev, messageWithName];
        });
      }
      updateChatLastMessage(messageWithName.wa_id, messageWithName.text, messageWithName.timestamp, messageWithName.name);
    };

    socket.on("new_message", handleNewMessage);
    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [selectedChat]);

  // Update message status both locally and backend (only for real IDs)
  const handleUpdateMessageStatus = async (id, newStatus) => {
    console.log(`Attempting to update status for message ID: ${id} to "${newStatus}"`);

    // Optimistic UI update
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, status: newStatus } : msg))
    );

    // Skip API call if ID is a temporary local one
    if (typeof id === 'string' && id.startsWith('local_')) {
      console.log("Skipping API call for temporary local message ID:", id);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/update-message-status`, {
        message_id: id,
        status: newStatus,
      });
      console.log("Status update response:", response.data);
    } catch (error) {
      console.error("❌ Failed to update message status:", error.response?.data || error.message);
    }
  };

  // Send message with optimistic UI + backend save + status update
  const handleSendMessage = async (newMessage) => {
    if (!selectedChat?.wa_id || !newMessage?.text) return;

    const tempId = "local_" + Date.now();

    const outgoingMsg = {
      id: tempId,
      wa_id: selectedChat.wa_id,
      name: selectedChat.name || '',
      text: newMessage.text,
      from_me: true,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    // Add temp message immediately
    setMessages((prev) => {
      if (prev.some((msg) => msg.id === outgoingMsg.id)) return prev;
      return [...prev, outgoingMsg];
    });

    updateChatLastMessage(selectedChat.wa_id, outgoingMsg.text, outgoingMsg.timestamp, outgoingMsg.name);

    try {
      const response = await axios.post(`${API_URL}/send-message`, {
        wa_id: selectedChat.wa_id,
        text: newMessage.text,
      });

      const savedMessage = {
        ...response.data.data,
        id: response.data.data._id,
        name: selectedChat.name || '',
      };

      console.log("Message saved by backend:", savedMessage);

      // Replace temp message with backend saved message
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? savedMessage : msg))
      );

      // Update message status using real backend ID
      setTimeout(() => {
        console.log("Updating status to 'delivered' for ID:", savedMessage.id);
        handleUpdateMessageStatus(savedMessage.id, 'delivered');
      }, 1000);

      setTimeout(() => {
        console.log("Updating status to 'read' for ID:", savedMessage.id);
        handleUpdateMessageStatus(savedMessage.id, 'read');
      }, 3000);
    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
  };

  const toggleChatList = () => setShowChatList((prev) => !prev);

  return (
    <div className="flex h-screen w-screen relative bg-gray-50">
      {/* Hamburger menu button for mobile */}
      <button
        onClick={toggleChatList}
        className="fixed top-4 left-4 z-50 p-2 rounded bg-white shadow md:hidden"
        aria-label="Toggle Chat List"
      >
        <Menu size={24} />
      </button>

      {/* Chat List Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 bg-white border-r border-gray-300 z-40
          transform transition-transform duration-300 ease-in-out
          ${showChatList ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:flex
          md:w-80 overflow-y-auto flex-shrink-0
        `}
      >
        <ChatList
          chats={chats}
          onSelectChat={(chat) => {
            setSelectedChat(chat);
            setShowChatList(false);
          }}
        />
      </div>

      {/* Overlay behind chat list on mobile */}
      {showChatList && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setShowChatList(false)}
        />
      )}

      {/* Chat Window */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#f3f4f6' }}>
        <ChatWindow
          chat={selectedChat}
          messages={messages}
          onSendMessage={handleSendMessage}
          onUpdateMessageStatus={handleUpdateMessageStatus}
        />
      </div>
    </div>
  );
};

export default Home;
