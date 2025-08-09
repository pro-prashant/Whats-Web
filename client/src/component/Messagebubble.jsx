
import React from 'react';

const Messagebubble = ({ text, time, isSender }) => {
  return (
    <div className={`max-w-[60%] p-2 mb-2 shadow text-sm rounded-lg ${isSender ? 'bg-[#dcf8c6] ml-auto' : 'bg-white'}`}>
      {text}
      <div className="text-[10px] text-gray-500 text-right mt-1">{time}</div>
    </div>
  );
};

export default Messagebubble;
