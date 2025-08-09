
const Message = require("../Model/Schema");
const mongoose = require("mongoose");
const Payload = async (req, res) => {
  try {
    const payload = req.body;

    const change = payload?.metaData?.entry?.[0]?.changes?.[0]?.value;
    const contact = change?.contacts?.[0];
    const message = change?.messages?.[0];

    if (!contact || !message) {
      return res.status(400).json({ error: "Invalid payload format" });
    }

    const wa_id = contact.wa_id;
    const name = contact.profile?.name || "";
    const message_id = message.id;
    const timestamp = message.timestamp
      ? new Date(parseInt(message.timestamp) * 1000)
      : new Date();
    const text = message.text?.body || "";
    const from_me = false;
    const type = message.type;

    const exists = await Message.findOne({ message_id });
    if (exists) return res.status(409).json({ error: "Message already exists" });

    const newMessage = new Message({
      wa_id,
      name,
      message_id,
      timestamp,
      type,
      text,
      from_me,
      status: "sent"
    });

    await newMessage.save();

    const io = req.app.get("io");
    io.emit("new_message", newMessage);

    return res.status(200).json({ message: "Message saved", data: newMessage });

  } catch (error) {
    console.error("Payload processing error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};


const GetUsers = async (req, res) => {
  try {
    const users = await Message.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$wa_id",
          lastMessage: { $first: "$text" },
          lastTimestamp: { $first: "$timestamp" },
          name: { $first: "$name" }
        }
      },
      {
        $project: {
          wa_id: "$_id",
          name: 1,
          lastMessage: 1,
          lastTimestamp: 1,
          _id: 0
        }
      },
      { $sort: { lastTimestamp: -1 } }
    ]);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Server error" });
  }
};


const GetMessagesByWaId = async (req, res) => {
  const wa_id = req.params.wa_id;

  try {
    const messages = await Message.find({ wa_id }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Server error" });
  }
};


const SendMessage = async (req, res) => {
  try {
    const { wa_id, text } = req.body;

    if (!wa_id || !text) {
      return res.status(400).json({ error: "wa_id and text are required" });
    }

    // Assuming you have a User model with wa_id and name fields
    const user = await Message.findOne({ wa_id });

    const newMessage = new Message({
      wa_id,
      name: user?.name || '',         
      message_id: "local_" + Date.now(),
      timestamp: new Date(),
      type: "text",
      text,
      from_me: true,
      status: "sent",
    });

    await newMessage.save();

    const io = req.app.get("io");
    io.emit("new_message", newMessage);

    res.status(201).json({ message: "Message saved", data: newMessage });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Server error" });
  }
};


const UpdateMessageStatus = async (req, res) => {
  console.log("UpdateMessageStatus route called with body:", req.body);
  try {
    const { message_id, status } = req.body;

    if (!message_id || !status) {
      return res.status(400).json({ error: "message_id and status are required" });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(message_id);

    const filter = isObjectId
      ? { _id: message_id }
      : { message_id: message_id };

    const message = await Message.findOneAndUpdate(
      filter,
      { status: status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const io = req.app.get("io");
    io.emit("message_status_updated", message);

    res.status(200).json({ message: "Message status updated", data: message });
  } catch (err) {
    console.error("Error updating message status:", err);
    res.status(500).json({ error: "Server error" });
  }
};







module.exports = {
  Payload,
  GetUsers,
  GetMessagesByWaId,
  SendMessage,
  UpdateMessageStatus,
};
