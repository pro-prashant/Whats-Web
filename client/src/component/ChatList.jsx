import React, { useState } from 'react';
import { Search } from 'lucide-react';

const ChatList = ({ chats, onSelectChat }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = chats.filter((chat) => {
    const wa_id = chat?.wa_id || '';
    const name = chat?.name || '';
    return (
      wa_id.includes(searchTerm) ||
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col h-screen w-full bg-[#f0f2f5] border-r border-gray-300">
      {/* Search Bar */}
      <div className="p-3 bg-[#f6f6f6] border-b border-gray-300 shrink-0">
        <div className="flex items-center bg-white rounded-lg px-3 py-1 shadow-sm">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ml-2 py-2 text-sm w-full outline-none bg-transparent placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => {
            // Determine avatar letter fallback
            const avatarLetter = chat.name && chat.name.trim() !== ''
              ? chat.name.charAt(0).toUpperCase()
              : chat.wa_id && chat.wa_id.trim() !== ''
              ? chat.wa_id.charAt(0)
              : 'U';

            return (
              <div
                key={chat.wa_id}
                onClick={() => onSelectChat(chat)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelectChat(chat);
                }}
                className="flex items-center px-4 py-3 hover:bg-gray-200 transition cursor-pointer border-b border-gray-300 last:border-b-0"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white flex items-center justify-center font-semibold text-sm mr-3 shrink-0">
                  {avatarLetter}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900 text-sm truncate">
                      {chat.name && chat.name.trim() !== '' ? chat.name : chat.wa_id}
                    </h3>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                      {chat.lastTimestamp
                        ? new Date(chat.lastTimestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs truncate">{chat.wa_id}</p>
                  <p className="text-gray-600 text-xs truncate">
                    {chat.lastMessage || 'No message'}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-sm text-gray-500 mt-10">
            No chats found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
