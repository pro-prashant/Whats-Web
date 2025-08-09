
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  wa_id: {
    type: String,      // WhatsApp user ID
    required: true,
  },
  name: {
    type: String,      // Contact profile name (from payload)
    default: "",       // Optional
  },
  message_id: {
    type: String,      // Unique message ID (id or meta_msg_id)
    required: true,
    unique: true,
  },
  timestamp: {
    type: Date,        // Message timestamp
    required: true,
  },
  type: {
    type: String,      // Message type (text, image, etc.)
    required: true,
  },
  text: {
    type: String,      // Message body
    default: "",
  },
  from_me: {
    type: Boolean,     // true if sent from business, false if from user
    required: true,
  },
  status: {
    type: String,      // sent, delivered, read
    enum: ["sent", "delivered", "read"],
    default: "sent",
  }
}, { timestamps: true });

const Message = mongoose.models.message || mongoose.model("message", MessageSchema);
module.exports = Message;
