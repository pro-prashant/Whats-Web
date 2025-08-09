import { Plus } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const generateMessageId = () =>
  `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

const ChatWindow = ({ chat, messages, onSendMessage, onUpdateMessageStatus }) => {
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!chat || !chat.wa_id) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#e5ddd5] text-gray-600 text-center p-4">
        Select a chat to start messaging
      </div>
    );
  }

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && !selectedFile) return;

    const localId = generateMessageId();
    const newMessage = {
      id: localId,
      text: inputMessage.trim(),
      file: selectedFile,
      sender: "You",
      from_me: true,
      status: "sent",
      timestamp: new Date().toISOString(),
    };

    onSendMessage(newMessage);
    setTimeout(() => onUpdateMessageStatus(localId, "delivered"), 1000);
    setTimeout(() => onUpdateMessageStatus(localId, "read"), 3000);

    setInputMessage("");
    setSelectedFile(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return "✓";
      case "delivered":
        return "✓✓";
      case "read":
        return "✓✓🔵";
      default:
        return "";
    }
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    const day = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${day}, ${time}`;
  };

  const avatarLetter =
    chat.name?.charAt(0)?.toUpperCase() || chat.wa_id?.charAt(0);

  return (
    <div className="flex-1 flex flex-col bg-[#e5ddd5] h-screen w-full">
      {/* Header */}
      <div className="p-4 bg-[#f0f2f5] border-b border-gray-300 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {avatarLetter}
        </div>
        <div className="truncate">
          <div className="font-semibold truncate">
            {chat.name || "Unknown User"}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {chat.number || chat.wa_id}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 sm:p-4 space-y-3 overflow-y-auto">
        {messages.map((msg, index) => {
          const isSender = msg.sender === "You" || msg.from_me === true;

          return (
            <div
              key={index}
              className={`flex flex-col ${
                isSender ? "items-end" : "items-start"
              }`}
            >
              {msg.file && (
                <img
                  src={
                    typeof msg.file === "string"
                      ? msg.file
                      : URL.createObjectURL(msg.file)
                  }
                  alt="sent"
                  className="max-w-xs rounded mb-1"
                />
              )}
              <div
                className={`p-3 rounded-lg shadow max-w-[90%] sm:max-w-[70%] ${
                  isSender ? "bg-[#d9fdd3] text-right" : "bg-[#fefefe] text-left"
                }`}
              >
                <div className="text-sm break-words">
                  {msg.text || msg.message}
                </div>
                <div className="text-[11px] text-gray-500 mt-1 flex justify-end items-center gap-1">
                  <span>🕒 {formatDateTime(msg.timestamp)}</span>
                  {isSender && <span>{getStatusIcon(msg.status)}</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Sendbox */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 px-3 py-2 bg-white border-t border-gray-300 w-full"
      >
        <button type="button" className="text-xl text-gray-600">
          😊
        </button>

        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message"
          className="flex-1 p-2 rounded-full border border-gray-300 outline-none 
          bg-transparent placeholder:text-gray-500"
        />

        <button
          type="submit"
          className="bg-[#00a884] text-white px-4 py-2 rounded-full hover:bg-[#01976e] shrink-0"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
