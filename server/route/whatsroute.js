
const express = require("express");
const {Payload,GetUsers,GetMessagesByWaId,SendMessage, UpdateMessageStatus,}= require("../controller/whatcontroller");
const router = express.Router();  // ✅ not express.Router()()

router.post("/webhook",Payload);
router.get("/getuser",GetUsers);
router.get("/messages/:wa_id", GetMessagesByWaId);
router.post("/send-message", SendMessage);
router.post("/update-message-status", UpdateMessageStatus);

module.exports = router;  // ✅ Make sure this is present
