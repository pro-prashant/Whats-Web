
import React, { useRef } from 'react';
import { Smile, Paperclip, Plus } from 'lucide-react';


  const Sendbox = () => {
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', file);
      // You can now handle uploading or previewing the file
    }
  };

  return (
    <div className="p-4 bg-[#f0f0f0] border-t border-gray-300 flex items-center gap-2">
      {/* Emoji Button */}
      <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition">
        <Smile size={20} />
      </button>
        
      {/* Message Input */}
      <input
        type="text"
        placeholder="Type a message"
        className="flex-1 p-4 rounded-full text-sm bg-white border border-gray-300 focus:outline-none"
      />

      {/* Attach File Button */}
      <button
        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
        onClick={handleFileClick}
      >
        <Paperclip size={20} />
      </button>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Plus Button (for more options, like stickers or gallery) */}
      <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition">
        <Plus size={20} />
      </button>

      {/* Send Button */}
      <button className="text-white bg-[#00a884] px-4 py-1 rounded-full text-sm hover:bg-[#01976e] transition">
        Send
      </button>
    </div>
  );
};

export default Sendbox;
